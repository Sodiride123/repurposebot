"""RepurposeBot FastAPI backend server."""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

from ai_client import generate_content, log_ai_config
from url_fetcher import fetch_url

# ── Config ──────────────────────────────────────────────────────────
APP_DIR = Path(__file__).parent
GENERATED_DIR = APP_DIR / "generated"
GENERATED_DIR.mkdir(exist_ok=True)
PORT = 3001

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("repurposebot")
log_ai_config()

# ── FastAPI app ─────────────────────────────────────────────────────
app = FastAPI(title="RepurposeBot API", version="1.0.0")


# ── Health check ────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


# ── URL fetching ────────────────────────────────────────────────────
@app.post("/api/fetch-url")
async def api_fetch_url(request: Request):
    body = await request.json()
    url = body.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    logger.info(f"Fetching URL: {url}")
    result = await fetch_url(url)
    if result.get("error"):
        return JSONResponse(
            content={"error": result["error"], "text": "", "title": "", "word_count": 0},
        )
    return result


# ── File extraction (PDF) ──────────────────────────────────────────
@app.post("/api/extract-file")
async def api_extract_file(file: UploadFile = File(...)):
    """Extract text from uploaded files. Primarily for PDF support."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    content = await file.read()

    if ext == "pdf":
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=content, filetype="pdf")
            pages_text = []
            for page in doc:
                pages_text.append(page.get_text())
            doc.close()
            text = "\n\n".join(pages_text).strip()
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise HTTPException(status_code=422, detail=f"Could not extract text from PDF: {e}")
    elif ext in ("txt", "md"):
        text = content.decode("utf-8", errors="replace").strip()
    elif ext in ("html", "htm"):
        from url_fetcher import extract_text_from_html

        text = extract_text_from_html(content.decode("utf-8", errors="replace"))
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")

    if not text or len(text) < 50:
        raise HTTPException(status_code=422, detail="Could not extract enough text from file")

    words = text.split()
    return {"text": text, "word_count": len(words), "filename": file.filename}


# ── Content generation (SSE) ───────────────────────────────────────
@app.post("/api/generate")
async def api_generate(request: Request):
    body = await request.json()
    text = body.get("text", "").strip()
    tone = body.get("tone", "auto").strip()
    source_url = body.get("source_url", "")

    if not text or len(text) < 50:
        raise HTTPException(status_code=400, detail="Text must be at least 50 characters")

    # Truncate very long texts to avoid AI timeout (prompt also truncates, but save on transfer)
    if len(text) > 15000:
        text = text[:15000] + "\n\n[Content truncated for processing]"
        logger.info(f"Truncated input text to 15000 chars")

    async def event_stream():
        # Step 1: Analyzing
        yield {
            "event": "progress",
            "data": json.dumps({"step": "analyzing", "message": "Analyzing tone & key messages..."}),
        }
        await asyncio.sleep(0.1)

        # Step 2: Generating
        yield {
            "event": "progress",
            "data": json.dumps({"step": "generating", "message": "Generating all 5 formats with AI..."}),
        }

        start_time = time.time()
        result = await generate_content(text, tone)
        elapsed = time.time() - start_time
        logger.info(f"AI generation took {elapsed:.1f}s")

        if not result["success"]:
            yield {
                "event": "error",
                "data": json.dumps({"message": result["error"]}),
            }
            return

        content_data = result["data"]

        # Step 3: Save to file library
        yield {
            "event": "progress",
            "data": json.dumps({"step": "saving", "message": "Saving to file library..."}),
        }

        file_id = _save_generation(content_data, source_url, text)

        # Step 4: Send result
        yield {
            "event": "result",
            "data": json.dumps(content_data),
        }

        yield {
            "event": "done",
            "data": json.dumps({
                "file_id": file_id,
                "duration_ms": result["duration_ms"],
                "model": result["model"],
            }),
        }

    return EventSourceResponse(event_stream())


# ── File library ────────────────────────────────────────────────────
@app.get("/api/library")
async def api_library():
    entries = []
    if not GENERATED_DIR.exists():
        return entries

    for d in sorted(GENERATED_DIR.iterdir(), reverse=True):
        if not d.is_dir():
            continue
        meta_path = d / "metadata.json"
        if not meta_path.exists():
            continue
        try:
            meta = json.loads(meta_path.read_text())
            meta["id"] = d.name
            entries.append(meta)
        except Exception:
            continue

    return entries


@app.get("/api/library/{file_id}")
async def api_library_detail(file_id: str):
    gen_dir = GENERATED_DIR / file_id
    results_path = gen_dir / "results.json"
    if not results_path.exists():
        raise HTTPException(status_code=404, detail="Generation not found")

    return json.loads(results_path.read_text())


@app.get("/api/download/{file_id}/{format_name}")
async def api_download(file_id: str, format_name: str):
    gen_dir = GENERATED_DIR / file_id

    if format_name == "all":
        file_path = gen_dir / "all_formats.txt"
    else:
        file_path = gen_dir / f"{format_name}.txt"

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type="text/plain",
    )


@app.delete("/api/library/{file_id}")
async def api_library_delete(file_id: str):
    """Delete a generation from the library."""
    import shutil

    gen_dir = GENERATED_DIR / file_id
    if not gen_dir.exists() or not gen_dir.is_dir():
        raise HTTPException(status_code=404, detail="Generation not found")

    shutil.rmtree(gen_dir)
    logger.info(f"Deleted generation {file_id}")
    return {"status": "deleted", "id": file_id}


# ── File saving helpers ─────────────────────────────────────────────
def _save_generation(data: dict, source_url: str, original_text: str) -> str:
    """Save generated content to the file library. Returns the file_id."""
    file_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    gen_dir = GENERATED_DIR / file_id
    gen_dir.mkdir(parents=True, exist_ok=True)

    analysis = data.get("analysis", {})
    title = data.get("email", {}).get("title", "Untitled")

    # Metadata
    meta = {
        "title": title,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_url": source_url,
        "word_count": analysis.get("wordCount", 0),
        "tone": data.get("tone", "auto"),
        "formats": ["linkedin", "twitter", "email", "podcast", "instagram"],
    }
    (gen_dir / "metadata.json").write_text(json.dumps(meta, indent=2))

    # Full results
    (gen_dir / "results.json").write_text(json.dumps(data, indent=2))

    # Individual format files
    _save_linkedin(gen_dir, data.get("linkedin", []))
    _save_twitter(gen_dir, data.get("twitter", []))
    _save_email(gen_dir, data.get("email", {}))
    _save_podcast(gen_dir, data.get("podcast", {}))
    _save_instagram(gen_dir, data.get("instagram", []))
    _save_all_formats(gen_dir, data)

    logger.info(f"Saved generation {file_id}: {title}")
    return file_id


def _save_linkedin(gen_dir: Path, slides: list):
    lines = ["LINKEDIN CAROUSEL", "Generated by RepurposeBot", ""]
    for s in slides:
        lines.append(f"SLIDE {s.get('slideNum', '?')}")
        lines.append("-" * 30)
        if s.get("title"):
            lines.append(s["title"])
        if s.get("subtitle"):
            lines.append(s["subtitle"])
        if s.get("body"):
            lines.append(s["body"])
        lines.append("")
    (gen_dir / "linkedin.txt").write_text("\n".join(lines))


def _save_twitter(gen_dir: Path, tweets: list):
    lines = ["TWITTER / X THREAD", "Generated by RepurposeBot", ""]
    for t in tweets:
        lines.append(f"Tweet {t.get('num', '?')}/{len(tweets)}")
        lines.append("-" * 28)
        lines.append(t.get("text", ""))
        lines.append("")
    (gen_dir / "twitter.txt").write_text("\n".join(lines))


def _save_email(gen_dir: Path, email: dict):
    lines = [
        "EMAIL NEWSLETTER",
        "Generated by RepurposeBot",
        "",
        f"Subject: {email.get('subject', '')}",
        "",
        email.get("greeting", ""),
        "",
        email.get("intro", ""),
        "",
        "Key Takeaways:",
    ]
    for insight in email.get("mainInsights", []):
        lines.append(f"  - {insight}")
    if email.get("highlight"):
        lines.extend(["", f'"{email["highlight"]}"'])
    lines.extend(["", f"CTA: {email.get('cta', '')}"])
    (gen_dir / "email.txt").write_text("\n".join(lines))


def _save_podcast(gen_dir: Path, podcast: dict):
    lines = [
        podcast.get("title", "PODCAST SCRIPT"),
        f"Estimated Duration: ~{podcast.get('episodeDuration', 15)} minutes",
        "Generated by RepurposeBot",
        "",
    ]
    for seg in podcast.get("segments", []):
        lines.append(f"{seg.get('label', 'SEGMENT')} (~{seg.get('duration', '?')})")
        lines.append("-" * 38)
        if seg.get("stageDir"):
            lines.append(seg["stageDir"])
            lines.append("")
        lines.append(seg.get("text", ""))
        lines.append("")
    (gen_dir / "podcast.txt").write_text("\n".join(lines))


def _save_instagram(gen_dir: Path, captions: list):
    lines = ["INSTAGRAM CAPTIONS", "Generated by RepurposeBot", ""]
    for cap in captions:
        lines.append(f"--- VARIANT {cap.get('variant', '?')}: {cap.get('style', '')} ---")
        lines.append("")
        lines.append(cap.get("text", ""))
        lines.append("")
        lines.append("=" * 38)
        lines.append("")
    (gen_dir / "instagram.txt").write_text("\n".join(lines))


def _save_all_formats(gen_dir: Path, data: dict):
    parts = [
        f"REPURPOSEBOT - COMPLETE CONTENT PACKAGE",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
    ]
    # Read individual files and combine
    for fmt in ("linkedin", "twitter", "email", "podcast", "instagram"):
        fmt_path = gen_dir / f"{fmt}.txt"
        if fmt_path.exists():
            parts.append("=" * 50)
            parts.append(fmt_path.read_text())
            parts.append("")

    (gen_dir / "all_formats.txt").write_text("\n".join(parts))


# ── Static files (must be last) ────────────────────────────────────
app.mount("/", StaticFiles(directory=str(APP_DIR), html=True), name="static")


# ── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info(f"Starting RepurposeBot backend on port {PORT}")
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
        log_level="info",
    )

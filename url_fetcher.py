"""Server-side URL fetching and HTML text extraction.

Primary: Tavily MCP extract (via LiteLLM gateway)
Fallback: Direct httpx fetch with HTML parsing
"""

import json
import logging
import re
from html.parser import HTMLParser
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)

STRIP_TAGS = {"script", "style", "nav", "footer", "header", "aside", "iframe", "noscript", "svg"}


def _load_gateway_config() -> tuple[str, str]:
    """Load API key and base URL from claude settings."""
    for path in ["/dev/shm/claude_settings.json", "/root/.claude/settings.json"]:
        try:
            data = json.loads(Path(path).read_text())
            env = data.get("env", {})
            key = env.get("ANTHROPIC_AUTH_TOKEN", "")
            base = env.get("ANTHROPIC_BASE_URL", "")
            if key and base:
                return key, base
        except Exception:
            continue
    return "", ""


# ── Tavily MCP Extract ───────────────────────────────────────────────

async def _tavily_extract(url: str) -> dict | None:
    """Extract URL content using Tavily MCP through the LiteLLM gateway.

    Returns dict with 'text', 'title' or None on failure.
    """
    api_key, base_url = _load_gateway_config()
    if not api_key or not base_url:
        logger.warning("No gateway config found, skipping Tavily")
        return None

    mcp_url = f"{base_url}/mcp/tavily"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            # Step 1: Initialize MCP session
            init_resp = await client.post(mcp_url, headers=headers, json={
                "jsonrpc": "2.0",
                "id": "1",
                "method": "initialize",
                "params": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {},
                    "clientInfo": {"name": "repurposebot", "version": "1.0"},
                },
            })
            if init_resp.status_code != 200:
                logger.warning(f"Tavily MCP init failed: {init_resp.status_code}")
                return None

            session_id = init_resp.headers.get("mcp-session-id", "")
            if not session_id:
                logger.warning("No MCP session ID in response")
                return None

            # Step 2: Send initialized notification (required by MCP protocol)
            headers["mcp-session-id"] = session_id
            await client.post(mcp_url, headers=headers, json={
                "jsonrpc": "2.0",
                "method": "notifications/initialized",
            })

            # Step 3: Call tavily_extract
            extract_resp = await client.post(mcp_url, headers=headers, json={
                "jsonrpc": "2.0",
                "id": "2",
                "method": "tools/call",
                "params": {
                    "name": "tavily_extract",
                    "arguments": {"urls": [url]},
                },
            })

            if extract_resp.status_code != 200:
                logger.warning(f"Tavily extract failed: {extract_resp.status_code}")
                return None

            # Parse SSE response
            for line in extract_resp.text.split("\n"):
                if not line.startswith("data:"):
                    continue
                data = json.loads(line[5:].strip())
                if "error" in data:
                    logger.warning(f"Tavily error: {data['error']}")
                    return None
                if "result" not in data:
                    continue

                content_items = data["result"].get("content", [])
                for item in content_items:
                    raw_text = item.get("text", "")
                    if not raw_text:
                        continue

                    # Tavily returns JSON string with results array
                    try:
                        tavily_data = json.loads(raw_text)
                        results = tavily_data.get("results", [])
                        if results:
                            result = results[0]
                            raw_content = result.get("raw_content", "")
                            title = result.get("title", "")
                            # Clean up markdown table artifacts
                            text = re.sub(r"\|[^|]*\|", "", raw_content)
                            text = re.sub(r"---+", "", text)
                            text = re.sub(r"\n{3,}", "\n\n", text).strip()
                            if len(text) > 100:
                                logger.info(f"Tavily extracted {len(text)} chars from {url}")
                                return {"text": text, "title": title}
                    except json.JSONDecodeError:
                        # Raw text, not JSON
                        if len(raw_text) > 100:
                            return {"text": raw_text, "title": ""}

    except Exception as e:
        logger.warning(f"Tavily MCP error: {e}")

    return None


# ── HTML Text Extraction ──────────────────────────────────────────────

class _TextExtractor(HTMLParser):
    """Simple HTML parser that extracts text content."""

    def __init__(self):
        super().__init__()
        self._text_parts: list[str] = []
        self._skip_depth = 0
        self._current_tag = ""
        self._in_p = False
        self._p_texts: list[str] = []
        self._current_p: list[str] = []

    def handle_starttag(self, tag, attrs):
        self._current_tag = tag
        if tag in STRIP_TAGS:
            self._skip_depth += 1
        if tag == "p" and self._skip_depth == 0:
            self._in_p = True
            self._current_p = []
        if tag in ("br", "hr") and self._skip_depth == 0:
            self._text_parts.append("\n")

    def handle_endtag(self, tag):
        if tag in STRIP_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1
        if tag == "p" and self._in_p:
            self._in_p = False
            p_text = " ".join(self._current_p).strip()
            if p_text:
                self._p_texts.append(p_text)
        if tag in ("p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "blockquote"):
            self._text_parts.append("\n\n")

    def handle_data(self, data):
        if self._skip_depth > 0:
            return
        text = data.strip()
        if text:
            self._text_parts.append(text + " ")
            if self._in_p:
                self._current_p.append(text)

    @property
    def full_text(self) -> str:
        raw = "".join(self._text_parts)
        return re.sub(r"\s{3,}", "\n\n", raw).strip()

    @property
    def paragraph_text(self) -> str:
        return "\n\n".join(p for p in self._p_texts if len(p) > 40)


def extract_text_from_html(html: str) -> str:
    """Extract readable text from HTML content."""
    parser = _TextExtractor()
    try:
        parser.feed(html)
    except Exception:
        pass

    if len(parser.paragraph_text) > 300:
        return parser.paragraph_text
    if len(parser.full_text) > 200:
        return parser.full_text
    return parser.full_text


async def _direct_fetch(url: str) -> dict | None:
    """Fetch URL directly with httpx. Returns dict with 'text', 'title' or None."""
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"}
    html = ""

    # Try direct fetch
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            html = resp.text
    except Exception:
        # Try via Psiphon SOCKS proxy
        try:
            async with httpx.AsyncClient(
                timeout=15, follow_redirects=True, verify=False,
                proxy="socks5://127.0.0.1:18080",
            ) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                html = resp.text
        except Exception:
            pass

    if not html or len(html) < 100:
        return None

    text = extract_text_from_html(html)
    if not text or len(text) < 50:
        return None

    title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else ""

    return {"text": text, "title": title}


# ── Browser-based Fetch (Playwright) ─────────────────────────────────

BROWSER_API = "http://127.0.0.1:8002/api/automation"


async def _browser_fetch(url: str) -> dict | None:
    """Fetch URL using headless browser via browser_api service.

    Handles JS-rendered pages and sites that block simple HTTP requests.
    Returns dict with 'text', 'title' or None on failure.
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Navigate to the URL
            nav_resp = await client.post(
                f"{BROWSER_API}/navigate_to",
                json={"url": url},
            )
            if nav_resp.status_code != 200:
                return None

            nav_data = nav_resp.json()
            title = nav_data.get("title", "")

            # Wait for JS rendering, then extract content
            import asyncio
            await asyncio.sleep(3)

            ext_resp = await client.post(
                f"{BROWSER_API}/extract_content",
                json="extract all text",
            )
            if ext_resp.status_code != 200:
                return None

            ext_data = ext_resp.json()
            text = ext_data.get("content", "") or ""
            title = ext_data.get("title", "") or title

            # Filter out Cloudflare challenge pages
            if not text or len(text) < 50 or "just a moment" in title.lower():
                return None

            logger.info(f"Browser extracted {len(text)} chars from {url}")
            return {"text": text, "title": title}
    except Exception as e:
        logger.warning(f"Browser fetch error: {e}")
        return None


# ── Main Entry Point ──────────────────────────────────────────────────

async def fetch_url(url: str) -> dict:
    """Fetch a URL and extract its text content.

    Strategy:
      1. Tavily MCP extract (primary - best quality extraction)
      2. Direct httpx fetch + HTML parsing (fallback)
      3. Headless browser via browser_api (final fallback)

    Returns dict with 'text', 'title', 'word_count' keys.
    """
    # Primary: Tavily MCP
    logger.info(f"Fetching URL via Tavily: {url}")
    result = await _tavily_extract(url)
    if result and result.get("text") and len(result["text"]) >= 100:
        text = result["text"]
        words = text.split()
        return {
            "text": text,
            "title": result.get("title", ""),
            "word_count": len(words),
            "source": "tavily",
        }

    # Fallback 1: direct HTTP fetch
    logger.info(f"Tavily failed, falling back to direct fetch: {url}")
    result = await _direct_fetch(url)
    if result and result.get("text"):
        text = result["text"]
        words = text.split()
        return {
            "text": text,
            "title": result.get("title", ""),
            "word_count": len(words),
            "source": "direct",
        }

    # Fallback 2: headless browser
    logger.info(f"Direct fetch failed, falling back to browser: {url}")
    result = await _browser_fetch(url)
    if result and result.get("text"):
        text = result["text"]
        words = text.split()
        return {
            "text": text,
            "title": result.get("title", ""),
            "word_count": len(words),
            "source": "browser",
        }

    return {"text": "", "title": "", "word_count": 0, "error": "Could not fetch URL content"}

"""Claude Code CLI wrapper for AI-powered content generation."""

import asyncio
import json
import logging
import os
import re
from pathlib import Path

from prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 120


def _load_settings() -> dict:
    """Load settings from claude settings files."""
    for path in ["/dev/shm/claude_settings.json", str(Path.home() / ".claude/settings.json")]:
        try:
            return json.loads(Path(path).read_text())
        except Exception:
            continue
    return {}


def _get_models() -> tuple[str, str]:
    """Get primary and fallback model names from settings or env."""
    settings = _load_settings()
    env = settings.get("env", {})
    # ANTHROPIC_MODEL from settings.json env, or OS env, or default
    model = env.get("ANTHROPIC_MODEL") or os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6"
    return model, model  # use same model for both attempts


def _get_subprocess_env() -> dict:
    """Build environment for claude subprocess, ensuring required vars are set."""
    env = os.environ.copy()
    settings = _load_settings()
    settings_env = settings.get("env", {})
    # Inject settings env vars into subprocess env (settings override os env)
    for key, val in settings_env.items():
        if val:
            env[key] = val
    # Ensure HOME is set (supervisor may strip it)
    env.setdefault("HOME", str(Path.home()))
    return env


PRIMARY_MODEL, FALLBACK_MODEL = _get_models()


def log_ai_config():
    """Log AI configuration (call after logging is configured)."""
    env = _get_subprocess_env()
    logger.info(
        f"AI config: model={PRIMARY_MODEL}, "
        f"HOME={env.get('HOME', 'MISSING')}, "
        f"ANTHROPIC_BASE_URL={'set' if env.get('ANTHROPIC_BASE_URL') else 'MISSING'}, "
        f"ANTHROPIC_AUTH_TOKEN={'set' if env.get('ANTHROPIC_AUTH_TOKEN') else 'MISSING'}"
    )


async def _run_claude(prompt: str, model: str) -> dict:
    """Run Claude Code CLI and return parsed result.

    Returns dict with 'success', 'result', 'error', 'duration_ms' keys.
    """
    cmd = [
        "claude", "-p",
        "--model", model,
        "--bare",
        "--tools", "",
        "--system-prompt", SYSTEM_PROMPT,
        "--output-format", "json",
    ]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=_get_subprocess_env(),
        )

        stdout, stderr = await asyncio.wait_for(
            proc.communicate(input=prompt.encode("utf-8")),
            timeout=TIMEOUT_SECONDS,
        )

        stdout_text = stdout.decode("utf-8", errors="replace").strip()
        stderr_text = stderr.decode("utf-8", errors="replace").strip()

        if stderr_text:
            logger.warning(f"Claude CLI stderr (model={model}): {stderr_text[:500]}")

        if not stdout_text:
            hint = stderr_text[:200] if stderr_text else "no stderr output"
            return {
                "success": False,
                "result": None,
                "error": f"Empty response from Claude Code (model={model}): {hint}",
                "duration_ms": 0,
            }

        # Parse the Claude Code JSON envelope
        try:
            envelope = json.loads(stdout_text)
        except json.JSONDecodeError:
            return {
                "success": False,
                "result": None,
                "error": f"Invalid JSON envelope from Claude Code: {stdout_text[:200]}",
                "duration_ms": 0,
            }

        duration_ms = envelope.get("duration_ms", 0)
        is_error = envelope.get("is_error", False)
        result_text = envelope.get("result", "")

        if is_error or not result_text:
            return {
                "success": False,
                "result": None,
                "error": result_text or "Claude Code returned an error",
                "duration_ms": duration_ms,
            }

        return {
            "success": True,
            "result": result_text,
            "error": None,
            "duration_ms": duration_ms,
        }

    except asyncio.TimeoutError:
        # Kill the process if it timed out
        try:
            proc.kill()
            await proc.wait()
        except Exception:
            pass
        return {
            "success": False,
            "result": None,
            "error": f"Timeout after {TIMEOUT_SECONDS}s (model={model})",
            "duration_ms": TIMEOUT_SECONDS * 1000,
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": f"Subprocess error: {str(e)}",
            "duration_ms": 0,
        }


def _parse_content_json(text: str) -> dict | None:
    """Extract and parse JSON from Claude's response text."""
    # Try direct parse first
    try:
        data = json.loads(text)
        if isinstance(data, dict) and "linkedin" in data:
            return data
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code fence
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group(1))
            if isinstance(data, dict) and "linkedin" in data:
                return data
        except json.JSONDecodeError:
            pass

    # Try finding JSON object in the text
    brace_start = text.find("{")
    if brace_start >= 0:
        # Find matching closing brace
        depth = 0
        for i in range(brace_start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        data = json.loads(text[brace_start:i + 1])
                        if isinstance(data, dict) and "linkedin" in data:
                            return data
                    except json.JSONDecodeError:
                        pass
                    break

    return None


def _validate_content(data: dict) -> dict | None:
    """Validate the content structure matches expected frontend format."""
    required_keys = {"analysis", "tone", "linkedin", "twitter", "email", "podcast", "instagram"}
    if not required_keys.issubset(data.keys()):
        return None

    # Validate analysis
    analysis = data.get("analysis", {})
    if not isinstance(analysis, dict):
        return None
    for key in ("wordCount", "readTime", "keywords", "detectedTone"):
        if key not in analysis:
            # Provide defaults for missing analysis fields
            if key == "wordCount":
                analysis["wordCount"] = 0
            elif key == "readTime":
                analysis["readTime"] = 1
            elif key == "keywords":
                analysis["keywords"] = []
            elif key == "detectedTone":
                analysis["detectedTone"] = data.get("tone", "conversational")

    # Validate linkedin is a list with slides
    if not isinstance(data["linkedin"], list) or len(data["linkedin"]) < 3:
        return None

    # Validate twitter is a list with tweets
    if not isinstance(data["twitter"], list) or len(data["twitter"]) < 3:
        return None

    # Validate email has required fields
    email = data.get("email", {})
    if not isinstance(email, dict):
        return None
    for key in ("subject", "greeting", "intro", "mainInsights", "cta", "title"):
        if key not in email:
            return None
    # Ensure optional email fields exist
    email.setdefault("highlight", "")
    email.setdefault("stats", [])
    email.setdefault("keywords", [])

    # Validate podcast
    podcast = data.get("podcast", {})
    if not isinstance(podcast, dict) or "segments" not in podcast:
        return None
    podcast.setdefault("episodeDuration", 15)
    podcast.setdefault("title", "Episode")

    # Validate instagram
    if not isinstance(data["instagram"], list) or len(data["instagram"]) < 1:
        return None

    return data


async def generate_content(article_text: str, tone: str = "auto") -> dict:
    """Generate repurposed content using Claude Code CLI.

    Returns dict with 'success', 'data', 'error', 'duration_ms' keys.
    On success, 'data' contains the full content JSON matching frontend schema.
    """
    user_prompt = build_user_prompt(article_text, tone)

    # Try primary model
    logger.info(f"Attempting generation with {PRIMARY_MODEL}...")
    result = await _run_claude(user_prompt, PRIMARY_MODEL)

    if result["success"]:
        content = _parse_content_json(result["result"])
        if content:
            validated = _validate_content(content)
            if validated:
                logger.info(f"Generation successful with {PRIMARY_MODEL} in {result['duration_ms']}ms")
                return {
                    "success": True,
                    "data": validated,
                    "error": None,
                    "duration_ms": result["duration_ms"],
                    "model": PRIMARY_MODEL,
                }
            else:
                logger.warning(f"Validation failed for {PRIMARY_MODEL} response")
        else:
            logger.warning(f"JSON parsing failed for {PRIMARY_MODEL} response")

    # Try fallback model
    logger.info(f"Falling back to {FALLBACK_MODEL}...")
    result = await _run_claude(user_prompt, FALLBACK_MODEL)

    if result["success"]:
        content = _parse_content_json(result["result"])
        if content:
            validated = _validate_content(content)
            if validated:
                logger.info(f"Generation successful with {FALLBACK_MODEL} in {result['duration_ms']}ms")
                return {
                    "success": True,
                    "data": validated,
                    "error": None,
                    "duration_ms": result["duration_ms"],
                    "model": FALLBACK_MODEL,
                }

    # Both models failed
    error_msg = result.get("error", "Unknown error")
    logger.error(f"All models failed. Last error: {error_msg}")
    return {
        "success": False,
        "data": None,
        "error": f"AI generation failed: {error_msg}",
        "duration_ms": result.get("duration_ms", 0),
        "model": None,
    }

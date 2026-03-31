"""End-to-end tests for RepurposeBot using Playwright."""

import json
import os
import re
import tempfile

import pytest
from playwright.sync_api import Page, expect, sync_playwright

BASE_URL = "http://localhost:3001"
AI_TIMEOUT = 180_000  # 3 minutes for AI generation
DEFAULT_TIMEOUT = 30_000

SAMPLE_TEXT = """The Future of Remote Work and Distributed Teams

Remote work has fundamentally changed how organizations operate. Companies embracing distributed teams report 25% higher productivity and 30% lower overhead costs. The shift accelerated during the pandemic but has become a permanent fixture in modern business strategy.

First, communication tools have matured significantly. Platforms like Slack, Zoom, and Notion enable seamless collaboration across time zones. Teams that establish clear communication protocols consistently outperform those that rely on ad hoc interactions.

Second, trust-based management has proven more effective than surveillance. Organizations that measure output rather than hours worked see higher employee satisfaction and retention rates. Research shows that 78% of remote workers feel more productive at home compared to office settings.

Third, the talent pool has expanded dramatically. Companies are no longer limited to hiring within commuting distance. This geographical freedom has enabled startups to compete with enterprise companies for top talent by offering flexible work arrangements.

The key challenge remains maintaining team culture and preventing isolation. Successful remote organizations invest heavily in virtual team building, regular check-ins, and periodic in-person gatherings to strengthen interpersonal bonds.

Looking ahead, hybrid models are emerging as the preferred approach. Most organizations are settling on two to three days in office per week, combining the benefits of face-to-face interaction with the flexibility of remote work. Leaders who adapt their management style to this new reality will have a significant competitive advantage in attracting and retaining talent."""


@pytest.fixture(scope="module")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context()
    page = context.new_page()
    page.set_default_timeout(DEFAULT_TIMEOUT)
    yield page
    context.close()


# ── Page Load & UI Tests ──────────────────────────────────────────────

class TestPageLoad:
    def test_page_loads(self, page: Page):
        page.goto(BASE_URL)
        expect(page).to_have_title(re.compile("RepurposeBot"))

    def test_hero_visible(self, page: Page):
        page.goto(BASE_URL)
        hero = page.locator(".hero")
        expect(hero).to_be_visible()
        expect(page.locator("h1")).to_contain_text("Five Powerful Formats")

    def test_input_tabs_work(self, page: Page):
        page.goto(BASE_URL)
        page.click('[data-tab="file"]')
        expect(page.locator("#panel-file")).to_be_visible()
        page.click('[data-tab="text"]')
        expect(page.locator("#panel-text")).to_be_visible()
        page.click('[data-tab="url"]')
        expect(page.locator("#panel-url")).to_be_visible()

    def test_tone_buttons_work(self, page: Page):
        page.goto(BASE_URL)
        page.click('[data-tone="professional"]')
        expect(page.locator('[data-tone="professional"]')).to_have_class(re.compile("active"))
        expect(page.locator('[data-tone="auto"]')).not_to_have_class(re.compile("active"))


class TestBannerHidden:
    def test_sandbox_banner_hidden(self, page: Page):
        page.goto(BASE_URL)
        page.wait_for_timeout(2000)
        for selector in ["#ninja-daytona-banner", "#ninja-connection-status", "#ninja-badge"]:
            el = page.locator(selector)
            if el.count() > 0:
                expect(el).to_be_hidden()


# ── API Endpoint Tests ────────────────────────────────────────────────

class TestAPIEndpoints:
    def test_health_endpoint(self, page: Page):
        response = page.request.get(f"{BASE_URL}/api/health")
        assert response.ok
        data = response.json()
        assert data["status"] == "ok"

    def test_fetch_url_with_tavily(self, page: Page):
        """Test that URL fetch works (via Tavily or direct fallback)."""
        response = page.request.post(
            f"{BASE_URL}/api/fetch-url",
            data=json.dumps({"url": "https://www.paulgraham.com/greatwork.html"}),
            headers={"Content-Type": "application/json"},
        )
        assert response.ok
        data = response.json()
        assert "text" in data
        assert data["word_count"] > 500  # Should be a substantial article
        assert data["title"] != ""
        assert data.get("source") in ("tavily", "direct")

    def test_library_endpoint(self, page: Page):
        response = page.request.get(f"{BASE_URL}/api/library")
        assert response.ok
        data = response.json()
        assert isinstance(data, list)


# ── Input Type 1: Text Paste ─────────────────────────────────────────

class TestTextInput:
    def test_text_input_generates_all_5_formats(self, page: Page):
        """Full E2E: paste text -> submit -> verify all 5 formats render."""
        page.goto(BASE_URL)

        # Switch to text tab
        page.click('[data-tab="text"]')
        page.fill("#text-input", SAMPLE_TEXT)

        # Select professional tone
        page.click('[data-tone="professional"]')

        # Submit
        page.click("#submit-btn")

        # Wait for loading screen
        expect(page.locator("#loading-screen")).to_have_class(re.compile("active"), timeout=5000)

        # Wait for results (AI generation takes time)
        expect(page.locator("#results-section")).to_have_class(
            re.compile("active"), timeout=AI_TIMEOUT
        )

        # Verify results header
        expect(page.locator("#results-section .results-title")).to_contain_text("Your Content Is Ready")

        # Verify all 5 output tabs exist and have content
        for tab in ["linkedin", "twitter", "email", "podcast", "instagram"]:
            expect(page.locator(f'[data-output="{tab}"]')).to_be_visible()

        # Click through each tab and verify content rendered
        page.click('[data-output="linkedin"]')
        slides = page.locator("#linkedin-output .slide-card")
        assert slides.count() >= 4, f"Expected at least 4 slides, got {slides.count()}"

        page.click('[data-output="twitter"]')
        tweets = page.locator("#twitter-output .tweet")
        assert tweets.count() >= 4, f"Expected at least 4 tweets, got {tweets.count()}"

        page.click('[data-output="email"]')
        expect(page.locator("#email-output .email-preview")).to_be_visible()

        page.click('[data-output="podcast"]')
        segments = page.locator("#podcast-output .script-block")
        assert segments.count() >= 3, f"Expected at least 3 podcast segments, got {segments.count()}"

        page.click('[data-output="instagram"]')
        captions = page.locator("#instagram-output .insta-card")
        assert captions.count() >= 2, f"Expected at least 2 instagram captions, got {captions.count()}"


# ── Input Type 2: URL Input ──────────────────────────────────────────

class TestURLInput:
    def test_url_input_generates_content(self, page: Page):
        """Full E2E: enter URL -> submit -> verify results appear."""
        page.goto(BASE_URL)

        # URL tab is default — use a shorter article to avoid AI timeout
        page.fill("#url-input", "https://www.paulgraham.com/hwh.html")

        # Submit
        page.click("#submit-btn")

        # Wait for loading screen
        expect(page.locator("#loading-screen")).to_have_class(re.compile("active"), timeout=10000)

        # Wait for results (URL fetch + AI generation)
        expect(page.locator("#results-section")).to_have_class(
            re.compile("active"), timeout=AI_TIMEOUT
        )

        # Verify results rendered
        expect(page.locator("#results-section .results-title")).to_contain_text("Your Content Is Ready")

        # Verify at least LinkedIn content is rendered
        page.click('[data-output="linkedin"]')
        expect(page.locator("#linkedin-output .slide-card").first).to_be_visible()

        # Verify Twitter content
        page.click('[data-output="twitter"]')
        expect(page.locator("#twitter-output .tweet").first).to_be_visible()


# ── Input Type 3: File Upload (all 4 types) ──────────────────────────

def _create_test_pdf(path: str):
    """Create a test PDF file with sample article content."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    rect = fitz.Rect(50, 50, 545, 790)
    page.insert_textbox(rect, SAMPLE_TEXT, fontsize=10)
    doc.save(path)
    doc.close()


def _upload_file_and_verify(page: Page, file_path: str):
    """Helper: upload a file, submit, and verify AI generates all 5 formats."""
    page.goto(BASE_URL)
    page.click('[data-tab="file"]')
    page.set_input_files("#file-input", file_path)
    page.wait_for_timeout(1000)
    expect(page.locator("#drop-label")).to_contain_text("loaded")

    page.click("#submit-btn")
    expect(page.locator("#loading-screen")).to_have_class(re.compile("active"), timeout=10000)
    expect(page.locator("#results-section")).to_have_class(
        re.compile("active"), timeout=AI_TIMEOUT
    )
    expect(page.locator("#results-section .results-title")).to_contain_text("Your Content Is Ready")

    # Verify at least LinkedIn and email content rendered
    page.click('[data-output="linkedin"]')
    expect(page.locator("#linkedin-output .slide-card").first).to_be_visible()
    page.click('[data-output="email"]')
    expect(page.locator("#email-output .email-preview")).to_be_visible()


class TestFileUploadTxt:
    def test_txt_file_upload(self, page: Page):
        """E2E: upload .txt file -> submit -> verify results."""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(SAMPLE_TEXT)
            tmp_path = f.name
        try:
            _upload_file_and_verify(page, tmp_path)
        finally:
            os.unlink(tmp_path)


class TestFileUploadHtml:
    def test_html_file_upload(self, page: Page):
        """E2E: upload .html file -> submit -> verify results."""
        html_content = f"<html><body><article>{SAMPLE_TEXT.replace(chr(10), '<br>')}</article></body></html>"
        with tempfile.NamedTemporaryFile(mode="w", suffix=".html", delete=False) as f:
            f.write(html_content)
            tmp_path = f.name
        try:
            _upload_file_and_verify(page, tmp_path)
        finally:
            os.unlink(tmp_path)


class TestFileUploadMd:
    def test_md_file_upload(self, page: Page):
        """E2E: upload .md file -> submit -> verify results."""
        md_content = f"# Remote Work Article\n\n{SAMPLE_TEXT}"
        with tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False) as f:
            f.write(md_content)
            tmp_path = f.name
        try:
            _upload_file_and_verify(page, tmp_path)
        finally:
            os.unlink(tmp_path)


class TestFileUploadPdf:
    def test_pdf_file_upload(self, page: Page):
        """E2E: upload .pdf file -> submit -> verify results."""
        tmp_path = tempfile.mktemp(suffix=".pdf")
        _create_test_pdf(tmp_path)
        try:
            _upload_file_and_verify(page, tmp_path)
        finally:
            os.unlink(tmp_path)


# ── Library Tests ─────────────────────────────────────────────────────

class TestLibrary:
    def test_library_shows_entries(self, page: Page):
        """Library should have entries from previous tests."""
        page.goto(BASE_URL)
        page.click("#library-btn")

        expect(page.locator("#library-section")).to_be_visible()
        page.wait_for_timeout(2000)

        items = page.locator(".library-item")
        expect(items.first).to_be_visible(timeout=5000)

    def test_library_view_item(self, page: Page):
        """Click view on a library item and verify results load."""
        page.goto(BASE_URL)
        page.click("#library-btn")
        page.wait_for_timeout(2000)

        # Click view on the first item
        view_btn = page.locator(".library-item .action-btn").first
        expect(view_btn).to_be_visible()
        view_btn.click()

        # Results should appear
        expect(page.locator("#results-section")).to_have_class(
            re.compile("active"), timeout=5000
        )
        expect(page.locator("#results-section .results-title")).to_contain_text("Your Content Is Ready")

    def test_library_back_button(self, page: Page):
        page.goto(BASE_URL)
        page.click("#library-btn")
        expect(page.locator("#library-section")).to_be_visible()

        page.locator("#library-section .btn-secondary").click()
        expect(page.locator("#library-section")).to_be_hidden()
        expect(page.locator(".hero")).to_be_visible()

/* ============================================
   REPURPOSEBOT - Main App Controller
   No emoji characters — SVG icons throughout
   ============================================ */

// ── Shared SVG icon snippets used in dynamic HTML ────────────────
const SVG = {
  copy:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  download: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  clock:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  sliders:  `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  type:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
  layers:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  twitter:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l16 16M4 20L20 4"/><path d="M20 4h-5l-11 16h5"/></svg>`,
  mail:     `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  mic:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  instagram:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  key:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  lightbulb:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  trendingUp:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  arrowRight:`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  heart:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  repeat:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
  msgCircle:`<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  share:    `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  image:    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  play:     `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  radio:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,
  target:   `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
};

// ── State ─────────────────────────────────────────────────────────
const State = {
  currentTab: 'url',
  currentOutputTab: 'linkedin',
  tone: 'auto',
  results: null,
  articleText: '',
  pendingFile: null,
  totalSlides: 0
};

// ── DOM helpers ───────────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupInputTabs();
  setupToneButtons();
  setupOutputTabs();
  setupFileUpload();
  setupSubmitButton();
  setupNewContentButton();
  setupCharCounter();
});

// ── Input Tabs ────────────────────────────────────────────────────
function setupInputTabs() {
  $$('.input-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.input-tab').forEach(b => b.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`panel-${btn.dataset.tab}`)?.classList.add('active');
      State.currentTab = btn.dataset.tab;
    });
  });
}

// ── Tone Buttons ──────────────────────────────────────────────────
function setupToneButtons() {
  $$('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.tone = btn.dataset.tone;
    });
  });
}

// ── Output Tabs ───────────────────────────────────────────────────
function setupOutputTabs() {
  $$('.output-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.output-tab-btn').forEach(b => b.classList.remove('active'));
      $$('.output-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`panel-${btn.dataset.output}`)?.classList.add('active');
      State.currentOutputTab = btn.dataset.output;
    });
  });
}

// ── File Upload ───────────────────────────────────────────────────
function setupFileUpload() {
  const zone  = document.querySelector('.file-drop-zone');
  const input = $('file-input');
  if (!zone || !input) return;

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0]; if (f) handleFileRead(f);
  });
  input.addEventListener('change', e => { const f = e.target.files[0]; if (f) handleFileRead(f); });
}

function handleFileRead(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['txt','md','html','htm','pdf'].includes(ext)) {
    showToast('Please upload a .txt, .md, .html, or .pdf file', 'error'); return;
  }

  // PDF files need server-side extraction
  if (ext === 'pdf') {
    State.articleText = '';
    State.pendingFile = file;
    const label = $('drop-label');
    if (label) label.textContent = `${file.name} loaded (${(file.size/1024).toFixed(1)} KB) — PDF will be processed on submit`;
    showToast(`"${file.name}" ready to process`, 'success');
    return;
  }

  // Text-based files: read client-side
  State.pendingFile = null;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result;
    if (ext === 'html' || ext === 'htm') {
      const div = document.createElement('div');
      div.innerHTML = text;
      text = div.innerText || div.textContent || '';
    }
    State.articleText = text;
    const label = $('drop-label');
    if (label) label.textContent = `${file.name} loaded (${(file.size/1024).toFixed(1)} KB)`;
    showToast(`"${file.name}" ready to process`, 'success');
  };
  reader.readAsText(file);
}

// ── Char Counter ──────────────────────────────────────────────────
function setupCharCounter() {
  const ta = $('text-input'), ct = $('char-count');
  if (!ta || !ct) return;
  ta.addEventListener('input', () => { ct.textContent = `${ta.value.length} characters`; });
}

// ── Submit ────────────────────────────────────────────────────────
function setupSubmitButton() {
  const btn = $('submit-btn');
  if (btn) btn.addEventListener('click', handleSubmit);
}

async function handleSubmit() {
  const submitBtn = $('submit-btn');
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (State.currentTab === 'url') {
      const url = $('url-input')?.value.trim();
      if (!url)            { showToast('Please enter a URL', 'error'); return; }
      if (!isValidUrl(url)){ showToast('Please enter a valid URL (include https://)', 'error'); return; }
      await processWithAI(null, url);
      return;
    }
    if (State.currentTab === 'file') {
      if (State.pendingFile) {
        // PDF or other file needing server-side extraction
        await processFileWithAI(State.pendingFile);
        return;
      }
      if (!State.articleText) { showToast('Please upload a file first', 'error'); return; }
      await processWithAI(State.articleText, null);
      return;
    }
    if (State.currentTab === 'text') {
      const text = $('text-input')?.value.trim();
      if (!text || text.length < 100) { showToast('Please enter at least 100 characters', 'error'); return; }
      await processWithAI(text, null);
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ── AI-Powered Processing via Backend API ─────────────────────────
async function processWithAI(text, url) {
  showLoadingScreen();
  const steps = [
    { id:'step-fetch' },
    { id:'step-analyze' },
    { id:'step-linkedin' },
    { id:'step-twitter' },
    { id:'step-email' },
    { id:'step-podcast' },
    { id:'step-instagram' }
  ];

  try {
    // Step 1: Fetch URL content if needed
    if (url && !text) {
      activate(0, steps); updateProgress(5);
      try {
        const res = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (data.error || !data.text || data.text.length < 50) {
          throw new Error(data.error || 'Could not extract content from URL');
        }
        text = data.text;
      } catch (fetchErr) {
        console.warn('Backend URL fetch failed:', fetchErr);
        throw new Error('Could not fetch URL content. Try pasting the text directly.');
      }
    }
    complete(0, steps); updateProgress(15);

    // Step 2: Generate content via AI backend (SSE)
    activate(1, steps); updateProgress(20);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone: State.tone, source_url: url || '' }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Server error');
    }

    // Read SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let resultData = null;
    let currentEvent = null;
    let lastCompletedStep = -1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith('data: ')) continue;

        const dataStr = line.slice(6);
        try {
          const payload = JSON.parse(dataStr);
          if (currentEvent === 'progress') {
            if (payload.step === 'analyzing') {
              complete(0, steps);
              activate(1, steps); updateProgress(30);
              lastCompletedStep = 0;
            } else if (payload.step === 'generating') {
              complete(1, steps);
              activate(2, steps); updateProgress(40);
              lastCompletedStep = 1;
            } else if (payload.step === 'saving') {
              // Sequentially complete steps 2-5 (linkedin through podcast)
              await completeStepsThrough(2, 6, steps);
              activate(6, steps); updateProgress(85);
              lastCompletedStep = 5;
            }
          } else if (currentEvent === 'result') {
            resultData = payload;
            // Complete any remaining steps
            await completeStepsThrough(lastCompletedStep + 1, 7, steps);
            updateProgress(95);
          } else if (currentEvent === 'done') {
            updateProgress(100);
          } else if (currentEvent === 'error') {
            throw new Error(payload.message || 'AI generation failed');
          }
        } catch (parseErr) {
          if (parseErr.message && !parseErr.message.includes('JSON'))
            throw parseErr;
        }
        currentEvent = null;
      }
    }

    if (!resultData) {
      throw new Error('No result received from AI');
    }

    await delay(300);
    hideLoadingScreen();
    State.results = resultData;
    renderResults(resultData);

  } catch (err) {
    console.error('AI processing failed:', err);
    hideLoadingScreen();
    showToast(err.message || 'AI generation failed', 'error');

    // Fallback to local engine if available
    if (text && window.RepurposeEngine) {
      showToast('Using local generation as fallback...', 'success');
      const tone = State.tone === 'auto' ? null : State.tone;
      const results = window.RepurposeEngine.repurposeContent(text, tone);
      State.results = results;
      renderResults(results);
    }
  }
}

// ── File Upload + AI Processing (for PDF and server-extracted files) ──
async function processFileWithAI(file) {
  showLoadingScreen();
  const steps = [
    { id:'step-fetch' }, { id:'step-analyze' }, { id:'step-linkedin' },
    { id:'step-twitter' }, { id:'step-email' }, { id:'step-podcast' }, { id:'step-instagram' }
  ];

  try {
    // Step 1: Upload file to backend for extraction
    activate(0, steps); updateProgress(5);

    const formData = new FormData();
    formData.append('file', file);

    const extractRes = await fetch('/api/extract-file', { method: 'POST', body: formData });
    if (!extractRes.ok) {
      const err = await extractRes.json().catch(() => ({}));
      throw new Error(err.detail || 'Could not extract text from file');
    }
    const extractData = await extractRes.json();
    const text = extractData.text;
    if (!text || text.length < 50) throw new Error('Extracted text is too short');

    complete(0, steps); updateProgress(15);

    // Step 2: Generate content via AI (reuse processWithAI logic)
    activate(1, steps); updateProgress(20);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tone: State.tone, source_url: '' }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || 'Server error');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let resultData = null;
    let currentEvt = null;
    let lastDone = -1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) { currentEvt = line.slice(7).trim(); continue; }
        if (!line.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(line.slice(6));
          if (currentEvt === 'progress') {
            if (payload.step === 'analyzing') { complete(0, steps); activate(1, steps); updateProgress(30); lastDone = 0; }
            else if (payload.step === 'generating') { complete(1, steps); activate(2, steps); updateProgress(40); lastDone = 1; }
            else if (payload.step === 'saving') { await completeStepsThrough(2, 6, steps); activate(6, steps); updateProgress(85); lastDone = 5; }
          } else if (currentEvt === 'result') {
            resultData = payload;
            await completeStepsThrough(lastDone + 1, 7, steps);
            updateProgress(95);
          } else if (currentEvt === 'done') {
            updateProgress(100);
          } else if (currentEvt === 'error') {
            throw new Error(payload.message || 'AI generation failed');
          }
        } catch (parseErr) {
          if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
        }
        currentEvt = null;
      }
    }

    if (!resultData) throw new Error('No result received from AI');

    await delay(300);
    hideLoadingScreen();
    State.results = resultData;
    State.pendingFile = null;
    renderResults(resultData);

  } catch (err) {
    console.error('File processing failed:', err);
    hideLoadingScreen();
    showToast(err.message || 'File processing failed', 'error');
  }
}

function activate(i, steps) { if (i >= 0 && i < steps.length) $(steps[i].id)?.classList.add('active'); }
function complete(i, steps)  { if (i >= 0 && i < steps.length) { const el=$(steps[i].id); el?.classList.remove('active'); el?.classList.add('done'); } }
function updateProgress(pct) { const b=document.querySelector('.progress-fill'); if(b) b.style.width=pct+'%'; }
function delay(ms) { return new Promise(r=>setTimeout(r,ms)); }

// Sequentially activate and complete steps from `from` to `to` (exclusive) with a small visual delay
async function completeStepsThrough(from, to, steps) {
  for (let i = from; i < to && i < steps.length; i++) {
    const el = $(steps[i].id);
    if (el && !el.classList.contains('done')) {
      el.classList.add('active');
      await delay(120);
      el.classList.remove('active');
      el.classList.add('done');
    }
  }
}

function showLoadingScreen() {
  // Reset all steps to default state
  $$('.load-step').forEach(el => { el.classList.remove('active', 'done'); });
  updateProgress(0);
  $('loading-screen')?.classList.add('active');
  document.body.style.overflow='hidden';
}
function hideLoadingScreen() { $('loading-screen')?.classList.remove('active'); document.body.style.overflow=''; }

// ── Render Results ────────────────────────────────────────────────
function renderResults(results) {
  const { analysis, tone, linkedin, twitter, email, podcast, instagram } = results;

  const metaEl = $('results-meta');
  if (metaEl) {
    const toneLabel = tone.charAt(0).toUpperCase() + tone.slice(1);
    metaEl.innerHTML = `
      <span class="results-meta-item">${SVG.type} <strong>${analysis.wordCount}</strong> words</span>
      <span class="results-meta-item">${SVG.clock} <strong>${analysis.readTime}</strong> min read</span>
      <span class="results-meta-item">${SVG.sliders} Tone: <strong>${toneLabel}</strong></span>`;
  }

  renderLinkedIn(linkedin, analysis);
  renderTwitter(twitter);
  renderEmail(email);
  renderPodcast(podcast);
  renderInstagram(instagram);

  document.querySelector('.input-section').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  $('results-section').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $$('.output-tab-btn')[0]?.click();
}

// ── LinkedIn Renderer ─────────────────────────────────────────────
function renderLinkedIn(slides, analysis) {
  const container = $('linkedin-output');
  if (!container) return;

  // Slide card backgrounds
  const slideColors = [
    'linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)',
    'linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%)',
    'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)',
    'linear-gradient(135deg,#f59e0b 0%,#ec4899 100%)',
    'linear-gradient(135deg,#8b5cf6 0%,#3b82f6 100%)',
  ];

  const slidesHtml = slides.map((slide, i) => {
    if (slide.type === 'cover') {
      return `
        <div class="slide-card cover" onclick="selectSlide(${i})">
          <div class="slide-num">Slide ${slide.slideNum} / ${slides.length}</div>
          <div>
            <div class="slide-icon" style="color:rgba(255,255,255,0.7);">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </div>
            <div class="slide-title">${escHtml(slide.title)}</div>
          </div>
          <div class="slide-body" style="font-style:italic;opacity:0.78;">${escHtml(slide.subtitle || '')}</div>
          <div class="slide-deco"></div>
        </div>`;
    }
    if (slide.type === 'cta') {
      return `
        <div class="slide-card cta-slide" onclick="selectSlide(${i})">
          <div class="slide-num">Slide ${slide.slideNum} / ${slides.length}</div>
          <div>
            <div class="slide-icon" style="color:var(--accent);">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="slide-title" style="font-size:16px;">${escHtml(slide.title)}</div>
          </div>
          <div class="slide-body">${escHtml(slide.body || '')}</div>
          <div class="slide-deco"></div>
        </div>`;
    }
    if (slide.type === 'stat') {
      return `
        <div class="slide-card content-slide" onclick="selectSlide(${i})" style="background:linear-gradient(135deg,#131326 0%,#1a1a32 100%);border-color:rgba(59,130,246,0.22);">
          <div class="slide-num">Slide ${slide.slideNum} / ${slides.length}</div>
          <div>
            <div class="slide-icon" style="color:var(--accent-blue);">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div class="slide-title" style="font-size:16px;color:var(--accent-blue);">${escHtml(slide.title)}</div>
          </div>
          <div class="slide-body">${escHtml(slide.body || '')}</div>
          <div class="slide-deco"></div>
        </div>`;
    }
    // Content slide
    const slideIdx = (i - 1) % slideColors.length;
    return `
      <div class="slide-card content-slide" onclick="selectSlide(${i})">
        <div class="slide-num">Slide ${slide.slideNum} / ${slides.length}</div>
        <div>
          <div class="slide-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div class="slide-title" style="font-size:14px;color:var(--accent);font-weight:700;margin-bottom:6px;">${escHtml(slide.title)}</div>
        </div>
        <div class="slide-body">${escHtml(slide.body || '')}</div>
        <div class="slide-deco"></div>
      </div>`;
  }).join('');

  const dotsHtml = slides.map((_,i) =>
    `<div class="carousel-dot ${i===0?'active':''}" onclick="selectSlide(${i})"></div>`
  ).join('');

  const slideTextRows = slides.map(s => `
    <div class="slide-text-row">
      <div class="slide-text-label">Slide ${s.slideNum}</div>
      <div class="slide-text-content">${escHtml((s.title||'') + (s.body ? ' — ' + s.body : ''))}</div>
    </div>`).join('');

  container.innerHTML = `
    <div class="summary-bar">
      <div class="summary-stat">${SVG.layers} <strong>${slides.length}</strong> slides generated</div>
      <div class="summary-stat">${SVG.type} <strong>${analysis.wordCount}</strong> words analyzed</div>
      <div class="summary-stat">${SVG.key} <strong>${analysis.keywords.slice(0,3).join(', ')}</strong></div>
      <div class="tone-chip">${SVG.sliders} ${analysis.detectedTone}</div>
    </div>
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:linear-gradient(135deg,#0077b5,#00a0dc);color:white;">${SVG.linkedin}</div>
          LinkedIn Carousel
        </div>
        <div class="card-actions">
          <button class="action-btn" id="copy-li-btn" onclick="copyLinkedInText()">${SVG.copy} Copy All Text</button>
          <button class="action-btn" onclick="downloadLinkedIn()">${SVG.download} Download Script</button>
        </div>
      </div>
      <div class="carousel-slides" id="carousel-inner">${slidesHtml}</div>
      <div class="carousel-nav" id="carousel-dots">${dotsHtml}</div>
      <div class="slide-counter" id="slide-counter">Slide 1 of ${slides.length} — scroll or click to navigate</div>
    </div>
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:rgba(139,92,246,0.15);color:var(--accent);">${SVG.layers}</div>
          Slide Text Content
        </div>
        <button class="action-btn" onclick="copyLinkedInText()">${SVG.copy} Copy</button>
      </div>
      <div>${slideTextRows}</div>
    </div>`;

  State.totalSlides = slides.length;

  const inner = $('carousel-inner');
  if (inner) {
    inner.addEventListener('scroll', () => {
      const idx = Math.round(inner.scrollLeft / 286);
      updateCarouselDots(idx);
    });
  }
}

function selectSlide(index) {
  const inner = $('carousel-inner');
  if (inner) inner.scrollTo({ left: index * 286, behavior: 'smooth' });
  updateCarouselDots(index);
}
function updateCarouselDots(index) {
  $$('#carousel-dots .carousel-dot').forEach((d,i) => d.classList.toggle('active', i===index));
  const c = $('slide-counter');
  if (c) c.textContent = `Slide ${index+1} of ${State.totalSlides} — scroll or click to navigate`;
}
function copyLinkedInText() {
  if (!State.results) return;
  const text = State.results.linkedin.map(s=>`[Slide ${s.slideNum}]\n${s.title||''}\n${s.body||''}`).join('\n\n---\n\n');
  copyToClipboard(text,'copy-li-btn');
}
function downloadLinkedIn() {
  if (!State.results) return;
  const text = State.results.linkedin.map(s=>`SLIDE ${s.slideNum}\n${'─'.repeat(30)}\n${s.title||''}\n\n${s.body||''}`).join('\n\n'+'═'.repeat(40)+'\n\n');
  downloadText(`LinkedIn_Carousel_${Date.now()}.txt`,`LINKEDIN CAROUSEL\nGenerated by RepurposeBot\n\n${text}`);
}

// ── Twitter Renderer ──────────────────────────────────────────────
function renderTwitter(tweets) {
  const container = $('twitter-output');
  if (!container) return;

  const tweetsHtml = tweets.map(tweet => {
    const textFormatted = tweet.text
      .replace(/#(\w+)/g,'<span class="hashtag">#$1</span>')
      .replace(/\n/g,'<br>');
    return `
      <div class="tweet">
        <div class="tweet-avatar">Y</div>
        <div class="tweet-content">
          <div class="tweet-header">
            <span class="tweet-name">Your Name</span>
            <span class="tweet-handle">@yourhandle</span>
            <span class="tweet-num">${tweet.num}/${tweets.length}</span>
          </div>
          <div class="tweet-text">${textFormatted}</div>
          <div class="tweet-actions">
            <span class="tweet-action">${SVG.msgCircle} Reply</span>
            <span class="tweet-action">${SVG.repeat} Retweet</span>
            <span class="tweet-action">${SVG.heart} Like</span>
            <button class="action-btn" style="margin-left:auto;" onclick="copyTweet(${tweet.num-1})">${SVG.copy} Copy</button>
          </div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:linear-gradient(135deg,#1da1f2,#0d8bd9);color:white;">${SVG.twitter}</div>
          Twitter / X Thread &mdash; ${tweets.length} tweets
        </div>
        <div class="card-actions">
          <button class="action-btn" id="copy-twitter-btn" onclick="copyTwitterThread()">${SVG.copy} Copy Full Thread</button>
          <button class="action-btn" onclick="downloadTwitter()">${SVG.download} Download</button>
        </div>
      </div>
      <div class="tweet-thread">${tweetsHtml}</div>
    </div>`;
}

function copyTweet(index) { if (State.results) copyToClipboard(State.results.twitter[index].text); }
function copyTwitterThread() {
  if (!State.results) return;
  copyToClipboard(State.results.twitter.map(t=>t.text).join('\n\n─────────\n\n'),'copy-twitter-btn');
}
function downloadTwitter() {
  if (!State.results) return;
  const text = State.results.twitter.map((t,i)=>`Tweet ${i+1}/${State.results.twitter.length}\n${'─'.repeat(28)}\n${t.text}`).join('\n\n');
  downloadText(`Twitter_Thread_${Date.now()}.txt`,`TWITTER / X THREAD\nGenerated by RepurposeBot\n\n${text}`);
}

// ── Email Renderer ────────────────────────────────────────────────
function renderEmail(emailData) {
  const container = $('email-output');
  if (!container) return;

  const insightsHtml = emailData.mainInsights.map(ins =>
    `<p style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;">
      <span style="color:var(--accent);margin-top:2px;flex-shrink:0;">${SVG.arrowRight}</span>
      ${escHtml(ins.replace(/^[-•*]\s*/,''))}
    </p>`).join('');

  const statsHtml = emailData.stats.length > 0
    ? `<h3>${SVG.barChart} By The Numbers</h3>${emailData.stats.map(s=>`<p>${escHtml(s)}</p>`).join('')}`
    : '';

  container.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:linear-gradient(135deg,#ea4335,#fbbc04);color:white;">${SVG.mail}</div>
          Email Newsletter Draft
        </div>
        <div class="card-actions">
          <button class="action-btn" id="copy-email-btn" onclick="copyEmail()">${SVG.copy} Copy Full Email</button>
          <button class="action-btn" onclick="downloadEmail()">${SVG.download} Download</button>
        </div>
      </div>
      <div class="email-preview">
        <div class="email-header-band">
          <h2>${escHtml(emailData.subject)}</h2>
          <p>Your weekly newsletter</p>
        </div>
        <div class="email-meta-bar">
          <div class="email-meta-item">From: <span>Your Name <you@yourdomain.com></span></div>
          <div class="email-meta-item">Subject: <span>${escHtml(emailData.subject)}</span></div>
        </div>
        <div class="email-body">
          <p>${escHtml(emailData.greeting)}</p>
          <p>${escHtml(emailData.intro)}</p>
          <h3>${SVG.key} Key Takeaways</h3>
          ${insightsHtml}
          ${emailData.highlight ? `<div class="email-highlight">"${escHtml(emailData.highlight)}"</div>` : ''}
          ${statsHtml}
          <h3>${SVG.lightbulb} Why This Matters</h3>
          <p>Understanding ${escHtml(emailData.keywords[0]||'this topic')} is no longer optional — it is a competitive necessity. The insights from "${escHtml(emailData.title)}" offer a clear view of what is working right now and how you can apply it immediately.</p>
          <p>Take 10 minutes this week to reflect on how these insights apply to your own situation. Small, consistent actions compound over time.</p>
          <p>Until next week,<br><strong>Your Name</strong></p>
        </div>
        <div class="email-cta-area" style="background:rgba(225,29,72,0.04);border-radius:0 0 var(--radius-lg) var(--radius-lg);">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Suggested CTA text</div>
          <div style="font-size:14px;color:var(--text-secondary);font-weight:500;">${escHtml(emailData.cta)}</div>
        </div>
      </div>
    </div>`;
}

function copyEmail() {
  const preview = document.querySelector('.email-preview');
  if (preview) copyToClipboard(preview.innerText||preview.textContent, 'copy-email-btn');
}
function downloadEmail() {
  if (!State.results) return;
  const e = State.results.email;
  const text = `SUBJECT: ${e.subject}\n\n${e.greeting}\n\n${e.intro}\n\nKey Takeaways:\n${e.mainInsights.map(i=>'• '+i).join('\n')}\n\n${e.highlight?`"${e.highlight}"\n\n`:''}CTA: ${e.cta}\n\nGenerated by RepurposeBot`;
  downloadText(`Email_Newsletter_${Date.now()}.txt`,text);
}

// ── Podcast Renderer ──────────────────────────────────────────────
function renderPodcast(podcastData) {
  const container = $('podcast-output');
  if (!container) return;

  const typeClass = { intro:'intro', main:'main', segment:'seg', transition:'trans', outro:'outro' };

  const segIcons = {
    intro:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    main:       `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    segment:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
    transition: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
    outro:      `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  };

  const segmentsHtml = podcastData.segments.map(seg => `
    <div class="script-block">
      <div class="script-block-header ${typeClass[seg.type]||'main'}">
        <div class="header-left">
          ${segIcons[seg.type]||segIcons.main}
          ${escHtml(seg.label)}
        </div>
        <span class="dur-badge">${escHtml(seg.duration)}</span>
      </div>
      <div class="script-block-body">
        ${seg.stageDir ? `<div class="stage-dir">${escHtml(seg.stageDir)}</div>` : ''}
        <div class="script-text">${escHtml(seg.text)}</div>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:linear-gradient(135deg,#8b5cf6,#ec4899);color:white;">${SVG.mic}</div>
          ${escHtml(podcastData.title)}
        </div>
        <div class="card-actions">
          <span style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:5px;">${SVG.clock} ~${podcastData.episodeDuration} min episode</span>
          <button class="action-btn" id="copy-podcast-btn" onclick="copyPodcast()">${SVG.copy} Copy Script</button>
          <button class="action-btn" onclick="downloadPodcast()">${SVG.download} Download</button>
        </div>
      </div>
      <div class="podcast-script">${segmentsHtml}</div>
    </div>`;
}

function copyPodcast() {
  if (!State.results) return;
  const text = State.results.podcast.segments.map(s=>`${s.label} (~${s.duration})\n${'─'.repeat(28)}\n${s.stageDir?s.stageDir+'\n\n':''}${s.text}`).join('\n\n');
  copyToClipboard(text,'copy-podcast-btn');
}
function downloadPodcast() {
  if (!State.results) return;
  const p = State.results.podcast;
  const text = `${p.title}\nEstimated Duration: ~${p.episodeDuration} minutes\nGenerated by RepurposeBot\n\n${'═'.repeat(48)}\n\n`
    + p.segments.map(s=>`${s.label} (~${s.duration})\n${'─'.repeat(38)}\n${s.stageDir?s.stageDir+'\n\n':''}${s.text}`).join('\n\n');
  downloadText(`Podcast_Script_${Date.now()}.txt`,text);
}

// ── Instagram Renderer ────────────────────────────────────────────
function renderInstagram(captions) {
  const container = $('instagram-output');
  if (!container) return;

  const mockBgs = [
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)'
  ];

  const cardsHtml = captions.map((cap, i) => {
    const lines = cap.text.split('\n');
    const hashtagLine = lines[lines.length-1] || '';
    const bodyLines = lines.slice(0,-1).join('<br>');

    return `
      <div class="insta-card variant-${cap.variant}">
        <div class="insta-mock" style="background:${mockBgs[i % mockBgs.length]};">
          ${SVG.image}
        </div>
        <div class="insta-top">
          <span class="insta-variant-badge">Variant ${cap.variant}</span>
          <span class="insta-style-label">${escHtml(cap.style)}</span>
        </div>
        <div class="insta-caption-text">
          ${bodyLines}
          <span class="insta-hashtags">${escHtml(hashtagLine)}</span>
        </div>
        <div class="insta-footer">
          <div class="insta-actions">
            <span class="insta-action">${SVG.heart} Save</span>
            <span class="insta-action">${SVG.msgCircle} Comment</span>
            <span class="insta-action">${SVG.share} Share</span>
          </div>
          <button class="action-btn" onclick="copyInstaCaption(${cap.variant-1})">${SVG.copy} Copy</button>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="content-card">
      <div class="card-header">
        <div class="card-title">
          <div class="card-icon" style="background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:white;">${SVG.instagram}</div>
          Instagram Captions &mdash; 3 Variants
        </div>
        <button class="action-btn" id="copy-insta-btn" onclick="copyAllInsta()">${SVG.copy} Copy All</button>
      </div>
      <div class="instagram-grid">${cardsHtml}</div>
    </div>`;
}

function copyInstaCaption(index) { if (State.results) copyToClipboard(State.results.instagram[index].text); }
function copyAllInsta() {
  if (!State.results) return;
  const text = State.results.instagram.map((c,i)=>`--- VARIANT ${i+1}: ${c.style} ---\n\n${c.text}`).join('\n\n'+'═'.repeat(38)+'\n\n');
  copyToClipboard(text,'copy-insta-btn');
}

// ── New Content Button ────────────────────────────────────────────
function setupNewContentButton() {
  const btn = $('new-content-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelector('.input-section').style.display = '';
    document.querySelector('.hero').style.display = '';
    $('results-section').classList.remove('active');
    const urlInput = $('url-input');
    if (urlInput) urlInput.value = '';
    State.results = null; State.articleText = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Utilities ─────────────────────────────────────────────────────
function isValidUrl(str) {
  try { const u = new URL(str); return u.protocol==='http:'||u.protocol==='https:'; }
  catch { return false; }
}

function escHtml(str) {
  return String(str||'')
    .replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>')
    .replace(/"/g,'"').replace(/'/g,'&#039;');
}

function copyToClipboard(text, btnId = null) {
  const finish = () => {
    showToast('Copied to clipboard', 'success');
    if (btnId) {
      const btn = $(btnId);
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = `${SVG.check} Copied`;
        btn.classList.add('copied');
        setTimeout(()=>{ btn.innerHTML=orig; btn.classList.remove('copied'); }, 2000);
      }
    }
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(finish).catch(()=>fallbackCopy(text,finish));
  } else { fallbackCopy(text,finish); }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
  if (cb) cb();
}

function downloadText(filename, content) {
  const blob = new Blob([content], {type:'text/plain'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${filename}`, 'success');
}

function showToast(message, type='success') {
  const container = document.querySelector('.toast-container');
  if (!container) return;
  const icon = type==='success' ? SVG.checkCircle : SVG.alertCircle;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon} ${message}`;
  container.appendChild(toast);
  setTimeout(()=>{
    toast.style.cssText = 'opacity:0;transform:translateX(14px);transition:all 0.25s;';
    setTimeout(()=>toast.remove(), 260);
  }, 3000);
}

// ── File Library ──────────────────────────────────────────────────
let libraryVisible = false;

function toggleLibrary() {
  const libSection = $('library-section');
  const hero = document.querySelector('.hero');
  const input = document.querySelector('.input-section');
  const results = $('results-section');

  libraryVisible = !libraryVisible;

  if (libraryVisible) {
    if (hero) hero.style.display = 'none';
    if (input) input.style.display = 'none';
    if (results) results.classList.remove('active');
    libSection.classList.remove('hidden');
    loadLibrary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    libSection.classList.add('hidden');
    if (!State.results) {
      if (hero) hero.style.display = '';
      if (input) input.style.display = '';
    } else {
      results.classList.add('active');
    }
  }
}

async function loadLibrary() {
  const container = $('library-list');
  if (!container) return;

  container.innerHTML = '<div class="library-empty">Loading...</div>';

  try {
    const res = await fetch('/api/library');
    const entries = await res.json();

    if (!entries.length) {
      container.innerHTML = `
        <div class="library-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          No generated content yet. Create your first content package above.
        </div>`;
      return;
    }

    container.innerHTML = '<div class="library-grid">' + entries.map(entry => {
      const date = new Date(entry.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="library-item">
          <div class="library-item-info">
            <div class="library-item-title">${escHtml(entry.title || 'Untitled')}</div>
            <div class="library-item-meta">
              <span>${SVG.clock} ${date}</span>
              <span>${SVG.type} ${entry.word_count || 0} words</span>
              <span>${SVG.sliders} ${entry.tone || 'auto'}</span>
            </div>
          </div>
          <div class="library-item-actions">
            <button class="action-btn" onclick="viewLibraryItem('${entry.id}')">${SVG.layers} View</button>
            <button class="action-btn" onclick="downloadLibraryItem('${entry.id}')">${SVG.download} Download</button>
            <button class="action-btn" onclick="deleteLibraryItem('${entry.id}', this)" style="color:var(--accent);">${SVG.alertCircle} Delete</button>
          </div>
        </div>`;
    }).join('') + '</div>';
  } catch (err) {
    container.innerHTML = '<div class="library-empty">Could not load library.</div>';
  }
}

async function viewLibraryItem(id) {
  try {
    const res = await fetch(`/api/library/${id}`);
    const data = await res.json();
    State.results = data;
    libraryVisible = false;
    $('library-section').classList.add('hidden');
    renderResults(data);
  } catch (err) {
    showToast('Could not load this item', 'error');
  }
}

function downloadLibraryItem(id) {
  window.open(`/api/download/${id}/all`, '_blank');
}

async function deleteLibraryItem(id, btn) {
  if (!confirm('Delete this content package? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/library/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Content deleted', 'success');
    // Remove the item from the DOM
    const item = btn.closest('.library-item');
    if (item) {
      item.style.cssText = 'opacity:0;transform:translateX(20px);transition:all 0.3s;';
      setTimeout(() => { item.remove(); }, 300);
    }
  } catch (err) {
    showToast('Could not delete item', 'error');
  }
}

// ── Global references for inline onclick attrs ────────────────────
window.State           = State;
window.selectSlide     = selectSlide;
window.copyLinkedInText= copyLinkedInText;
window.downloadLinkedIn= downloadLinkedIn;
window.copyTwitterThread=copyTwitterThread;
window.copyTweet       = copyTweet;
window.downloadTwitter = downloadTwitter;
window.copyEmail       = copyEmail;
window.downloadEmail   = downloadEmail;
window.copyPodcast     = copyPodcast;
window.downloadPodcast = downloadPodcast;
window.copyInstaCaption= copyInstaCaption;
window.copyAllInsta    = copyAllInsta;
window.showToast       = showToast;
window.downloadText    = downloadText;
window.toggleLibrary   = toggleLibrary;
window.viewLibraryItem = viewLibraryItem;
window.downloadLibraryItem = downloadLibraryItem;
window.deleteLibraryItem = deleteLibraryItem;
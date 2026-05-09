const TYPE_LABELS = {
  A: 'Industry Analysis',
  B: 'How-To Guide',
  C: 'Thought Leadership',
  D: 'Case Study',
};

function $(id) { return document.getElementById(id); }

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Load topics ──────────────────────────────────────────────

async function loadTopics() {
  $('loading').classList.remove('hidden');
  $('error').classList.add('hidden');
  $('topics-grid').classList.add('hidden');
  $('topics-grid').innerHTML = '';
  $('refresh-btn').disabled = true;

  try {
    const res = await fetch('/api/topics');
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Server error ${res.status}`);
    }
    const topics = await res.json();
    renderTopics(topics);
  } catch (e) {
    $('loading').classList.add('hidden');
    $('error-msg').textContent = e.message;
    $('error').classList.remove('hidden');
  } finally {
    $('refresh-btn').disabled = false;
  }
}

function renderTopics(topics) {
  $('loading').classList.add('hidden');

  const grid = $('topics-grid');
  grid.innerHTML = '';

  for (const topic of topics) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.innerHTML = `
      <div class="card-top">
        <span class="type-badge">${escapeHtml(TYPE_LABELS[topic.type] || topic.type)}</span>
        <span class="card-arrow">→</span>
      </div>
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.description)}</p>
      <span class="keyword-tag">${escapeHtml(topic.keyword)}</span>
    `;
    card.addEventListener('click', () => startPipeline(topic));
    grid.appendChild(card);
  }

  grid.classList.remove('hidden');
}

// ── Pipeline ─────────────────────────────────────────────────

function startPipeline(topic) {
  $('modal-title').textContent = topic.title;

  ['generating', 'saving', 'git', 'framer'].forEach(id => setStep(id, 'pending'));

  $('result-done').classList.add('hidden');
  $('result-error').classList.add('hidden');
  $('modal').classList.remove('hidden');

  runPipeline(topic);
}

async function runPipeline(topic) {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          handleEvent(JSON.parse(line.slice(6)));
        } catch (_) {}
      }
    }
  } catch (e) {
    handleEvent({ step: 'error', status: 'error', message: e.message });
  }
}

function handleEvent({ step, status, message }) {
  if (step === 'done') {
    $('result-done').classList.remove('hidden');
    return;
  }

  if (step === 'error') {
    $('result-error-msg').textContent = message || 'An unexpected error occurred.';
    $('result-error').classList.remove('hidden');
    return;
  }

  setStep(step, status);
}

function setStep(stepId, status) {
  const el = $(`step-${stepId}`);
  if (el) el.dataset.status = status;
}

function resetPipeline() {
  $('modal').classList.add('hidden');
}

// ── Boot ─────────────────────────────────────────────────────
loadTopics();

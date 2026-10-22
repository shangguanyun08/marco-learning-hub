(function (root) {
  'use strict';
  const SESSION = 'week-oct12-3-5';
  const KEY = 'harry-math-day3-5-scratch-v1';
  const MODE_KEY = 'harry-math-day3-5-layout-v1';
  const NS = 'http://www.w3.org/2000/svg';
  const mounted = new WeakSet();
  let records = {}, enabled = true, activeSession = null, finishActive = null;
  let storageOK = true;
  try {
    enabled = root.localStorage.getItem(MODE_KEY) !== 'original';
    const saved = JSON.parse(root.localStorage.getItem(KEY) || 'null');
    if (saved?.version === 1 && saved.questions) {
      for (const [source, work] of Object.entries(saved.questions)) {
        if (!/^[1-6]$/.test(source) || !Array.isArray(work.strokes)) continue;
        records[source] = work.strokes.slice(0, 200).filter(stroke =>
          Array.isArray(stroke) && stroke.length > 0 && stroke.length <= 1200 &&
          stroke.every(p => Array.isArray(p) && p.length === 2 && p.every(n => Number.isFinite(n) && n >= 0 && n <= 1000)));
      }
    }
  } catch { storageOK = false; }

  const controls = root.document.createElement('section');
  controls.id = 'scratch-layout-controls';
  controls.className = 'scratch-layout-controls';
  controls.hidden = true;
  controls.setAttribute('aria-label', 'Day 3.5 layout');
  controls.innerHTML = '<div><strong>Day 3.5 · My working</strong><p id="scratch-layout-note"></p></div><button type="button" id="scratch-layout-toggle" aria-controls="questions"></button>';
  root.document.querySelector('#practice-content').prepend(controls);
  const toggle = controls.querySelector('button');
  const note = controls.querySelector('p');
  let originalGuidance = '';

  function flush() { finishActive?.(); }
  function applyLayout() {
    const targeted = activeSession === SESSION;
    controls.hidden = !targeted;
    root.document.body.classList.toggle('math-scratch-mode', targeted && enabled);
    toggle.textContent = enabled ? 'Use original layout' : 'Use scratchpad layout';
    note.textContent = enabled ? 'Drawings save on this device. Answers keep their usual score.' : 'Original layout · Your drawings are kept for when you switch back.';
    if (targeted && originalGuidance) root.document.querySelector('.gentle').textContent = enabled
      ? 'Write with your Apple Pencil, finger, or mouse. Scroll outside the pad. Your working is optional.' : originalGuidance;
  }
  function setSession(id) {
    flush();
    activeSession = id;
    const mode = new URLSearchParams(root.location.search).get('scratch');
    if (mode === 'off') enabled = false;
    if (mode === 'on') enabled = true;
    applyLayout();
  }
  toggle.addEventListener('click', () => {
    flush(); enabled = !enabled;
    try { root.localStorage.setItem(MODE_KEY, enabled ? 'scratchpad' : 'original'); } catch {}
    const url = new URL(root.location.href);
    url.searchParams.set('scratch', enabled ? 'on' : 'off');
    root.history.replaceState(null, '', url);
    applyLayout();
    controls.scrollIntoView({block: 'start'});
  });
  function save(source, strokes, status) {
    records[source] = strokes;
    try {
      root.localStorage.setItem(KEY, JSON.stringify({version: 1, questions: Object.fromEntries(
        Object.entries(records).map(([key, value]) => [key, {strokes: value}]))}));
      storageOK = true;
    } catch { storageOK = false; }
    status.textContent = storageOK ? 'Drawing saved on this device.' : 'Drawing kept on this page. Device storage is unavailable.';
  }
  function mount(session) {
    if (session?.id !== SESSION) return;
    originalGuidance = session.practiceOnly
      ? 'Keep trying until each answer is correct. Your first-try percentage is saved separately and retries do not change it. There is no separate second round.'
      : root.document.querySelector('.gentle').textContent;
    applyLayout();
    for (const card of root.document.querySelectorAll('#questions > .question')) {
      if (mounted.has(card)) continue;
      mounted.add(card);
      const source = card.dataset.source;
      const question = root.document.createElement('div');
      question.className = 'scratch-question-content';
      while (card.firstChild) question.append(card.firstChild);
      card.append(question);
      card.classList.add('scratch-question');
      const pad = root.document.createElement('section');
      pad.className = 'math-scratchpad';
      pad.setAttribute('aria-label', 'Scratchpad for question ' + source);
      pad.innerHTML = '<div class="math-scratch-heading"><h4>My scratchpad</h4><span>Optional working</span></div>' +
        '<div class="math-scratch-tools"><button type="button" data-ink="undo">Undo</button><button type="button" data-ink="redo">Redo</button><button type="button" data-ink="clear">Clear pad</button></div>' +
        '<svg class="math-ink" viewBox="0 0 1000 800" preserveAspectRatio="none" role="img" aria-label="Draw your working for question ' + source + '"><g></g></svg>' +
        '<p class="math-ink-status" role="status">Write with your Apple Pencil, finger, or mouse.</p>';
      card.append(pad);
      const svg = pad.querySelector('svg'), group = svg.querySelector('g'), status = pad.querySelector('[role="status"]');
      const undo = [], redo = [];
      let stroke = null, pointer = null, line = null;
      const strokes = () => records[source] || [];
      const buttons = () => {
        pad.querySelector('[data-ink="undo"]').disabled = !undo.length && !strokes().length;
        pad.querySelector('[data-ink="redo"]').disabled = !redo.length;
        pad.querySelector('[data-ink="clear"]').disabled = !strokes().length;
      };
      function polyline(points) {
        const element = root.document.createElementNS(NS, 'polyline');
        for (const [key, value] of Object.entries({fill: 'none', stroke: '#193c49', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke'})) element.setAttribute(key, value);
        element.setAttribute('points', points.map(p => p.join(',')).join(' '));
        return element;
      }
      function redraw() { group.replaceChildren(...strokes().map(polyline)); buttons(); }
      function point(event) {
        const bounds = svg.getBoundingClientRect();
        return [Math.max(0, Math.min(1000, Math.round((event.clientX - bounds.left) / bounds.width * 10000) / 10)),
          Math.max(0, Math.min(800, Math.round((event.clientY - bounds.top) / bounds.height * 8000) / 10))];
      }
      function finish() {
        if (!stroke) return;
        const complete = stroke;
        stroke = null; pointer = null; finishActive = null;
        undo.push(strokes()); redo.length = 0;
        save(source, [...strokes(), complete], status); buttons();
      }
      svg.addEventListener('pointerdown', event => {
        if (!enabled || pointer !== null || event.isPrimary === false || event.button > 0) return;
        if (strokes().length >= 200) { status.textContent = 'This pad is full. Undo a stroke or clear the pad to keep writing.'; return; }
        event.preventDefault(); flush();
        pointer = event.pointerId;
        svg.setPointerCapture?.(pointer);
        const p = point(event); stroke = [p, [...p]];
        line = polyline(stroke); group.append(line); finishActive = finish;
        status.textContent = 'Drawing…';
      });
      svg.addEventListener('pointermove', event => {
        if (!stroke || pointer !== event.pointerId) return;
        event.preventDefault();
        const samples = event.getCoalescedEvents?.();
        for (const sample of samples?.length ? samples : [event]) {
          const p = point(sample), last = stroke.at(-1);
          if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1) continue;
          if (stroke.length >= 1200) stroke = stroke.filter((_, i) => i % 2 === 0);
          stroke.push(p);
        }
        line.setAttribute('points', stroke.map(p => p.join(',')).join(' '));
      });
      for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(name, event => {
        if (pointer === event.pointerId) finish();
      });
      for (const button of pad.querySelectorAll('[data-ink]')) button.addEventListener('click', () => {
        flush();
        const action = button.dataset.ink;
        if (action === 'undo') {
          redo.push(strokes()); save(source, undo.length ? undo.pop() : strokes().slice(0, -1), status);
        } else if (action === 'redo') {
          if (!redo.length) return;
          undo.push(strokes()); save(source, redo.pop(), status);
        } else {
          undo.push(strokes()); redo.length = 0; save(source, [], status);
        }
        redraw();
      });
      redraw();
    }
  }
  root.addEventListener('pagehide', flush);
  root.document.addEventListener('visibilitychange', () => { if (root.document.hidden) flush(); });
  root.HarryMathScratch = {setSession, mount, flush};
})(window);

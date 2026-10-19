/* App shell: routing, lecture pages, quizzes, flashcards, formula sheet */
(function () {
'use strict';
const L = window.LECTURES;
const VIZ = window.VIZ;
const $ = s => document.querySelector(s);
const main = $('#main'), navEl = $('#nav');
const KEY = 'ics504-midterm-lab-v1';
const NUM = { l1: '1', l2: '2', l3a: '3A', l3b: '3B', l4: '4', l5: '5' };
let prog = { quiz: {}, seen: {}, cards: {} };
try { prog = Object.assign(prog, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
function save() { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { /* ignore */ } paintProgress(); }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ICON = {
  cap: 'M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z',
  cards: 'M184,72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V88A16,16,0,0,0,184,72Zm0,128H40V88H184V200ZM232,56V176a8,8,0,0,1-16,0V56H64a8,8,0,0,1,0-16H216A16,16,0,0,1,232,56Z',
  fn: 'M208,40a8,8,0,0,1-8,8H170.71a24,24,0,0,0-23.62,19.71L137.59,120H184a8,8,0,0,1,0,16H134.68l-10,55.16A40,40,0,0,1,85.29,224H56a8,8,0,0,1,0-16H85.29a24,24,0,0,0,23.62-19.71l9.5-52.29H72a8,8,0,0,1,0-16h49.32l10-55.16A40,40,0,0,1,170.71,32H200A8,8,0,0,1,208,40Z',
  exam: 'M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z',
  half: 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,16.37a86.4,86.4,0,0,1,16,3V212.67a86.4,86.4,0,0,1-16,3Zm32,9.26a87.81,87.81,0,0,1,16,10.54V195.83a87.81,87.81,0,0,1-16,10.54ZM40,128a88.11,88.11,0,0,1,80-87.63V215.63A88.11,88.11,0,0,1,40,128Zm160,50.54V77.46a87.82,87.82,0,0,1,0,101.08Z',
  sun: 'M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z',
  moon: 'M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z',
  left: 'M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z',
  right: 'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z'
};
const ico = n => `<svg class="i" viewBox="0 0 256 256" aria-hidden="true"><path d="${ICON[n]}"/></svg>`;
const RMQ = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct = id => { const lec = L.find(l => l.id === id); const seen = (prog.seen[id] || []).length / lec.learn.length; const q = prog.quiz[id] || 0; return Math.round((0.5 * Math.min(1, seen) + 0.5 * q) * 100); };

/* ---------- nav ---------- */
function buildNav() {
  navEl.innerHTML = `
  <a class="brand" href="#"><span class="brand-m">${ico('cap')}</span><span class="brand-t"><span class="brand-k">ICS 504</span><span class="brand-n">Midterm Lab</span></span></a>
  <div class="nav-g"><span class="nav-h">Lectures</span>
  ${L.map(l => `<a class="nav-l" href="#${l.id}" data-r="${l.id}" style="--lc:var(--${l.id})"><span class="nl-c">L${NUM[l.id]}</span><span class="nl-t">${l.short}</span><span class="nl-p" aria-label="progress"><i></i></span></a>`).join('')}
  </div>
  <div class="nav-g"><span class="nav-h">Revise</span>
  <a class="nav-l tool" href="#cards" data-r="cards"><span class="nl-c">${ico('cards')}</span><span class="nl-t">Flashcards</span></a>
  <a class="nav-l tool" href="#formulas" data-r="formulas"><span class="nl-c">${ico('fn')}</span><span class="nl-t">Formula sheet</span></a>
  <a class="nav-l tool" href="#exam" data-r="exam"><span class="nl-c">${ico('exam')}</span><span class="nl-t">Mock exam</span></a>
  </div>
  <button type="button" class="theme-t" id="themeT"></button>`;
  paintProgress();
  const t = $('#themeT'); let mode = 'auto'; try { mode = localStorage.getItem(KEY + '-theme') || 'auto'; } catch (e) { /* */ }
  const apply = () => { if (mode === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = mode; t.innerHTML = ico(mode === 'auto' ? 'half' : mode === 'light' ? 'sun' : 'moon') + '<span>Theme: ' + (mode === 'auto' ? 'system' : mode) + '</span>'; requestAnimationFrame(() => (window.VIZ_REDRAW || new Set()).forEach(f => f())); };
  t.addEventListener('click', () => { mode = mode === 'auto' ? 'light' : mode === 'light' ? 'dark' : 'auto'; try { localStorage.setItem(KEY + '-theme', mode); } catch (e) { /* */ } apply(); });
  apply();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => requestAnimationFrame(() => (window.VIZ_REDRAW || new Set()).forEach(f => f())));
}
function paintProgress() { navEl.querySelectorAll('.nav-l[data-r]').forEach(a => { const id = a.dataset.r; if (!NUM[id]) return; const i = a.querySelector('.nl-p i'); if (i) i.style.width = pct(id) + '%'; }); }
function activeNav(r) { navEl.querySelectorAll('.nav-l').forEach(a => a.classList.toggle('on', a.dataset.r === r)); }

/* ---------- rendering helpers ---------- */
let io = null;
function cleanup() { (window.VIZ_CLEAN || []).splice(0).forEach(f => { try { f(); } catch (e) { /* */ } }); if (io) { io.disconnect(); io = null; } if (window.MathJax && MathJax.typesetClear) { try { MathJax.typesetClear([main]); } catch (e) { /* */ } } }
function typeset(root) { const MJ = window.MathJax; if (MJ && MJ.typesetPromise) MJ.typesetPromise([root]).catch(e => console.warn(e)); }
window.__mjReady = () => typeset(main);
function finish(root) {
  root.querySelectorAll('table').forEach(t => { if (t.parentElement.classList.contains('tbl-wrap')) return; const w = document.createElement('div'); w.className = 'tbl-wrap'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
  root.querySelectorAll('[data-viz]').forEach(el => { const f = VIZ[el.dataset.viz]; if (!f) return; try { f(el); } catch (e) { console.error(e); el.innerHTML = '<p class="small">This lab could not load.</p>'; } });
  typeset(root);
}

/* ---------- home ---------- */
function home() {
  main.innerHTML = `
  <section class="hero">
    <div class="hero-t">
      <h1>Given data, how does a model find the <em>best</em> parameters?</h1>
      <p class="lede">Six lectures of ICS 504, one question. Read the theory, work every process in a live lab, then lock it in with recall, flashcards and quizzes.</p>
      <div class="btns"><a class="btn" href="#l1">Start Lecture 1 ${ico('right')}</a><a class="btn ghost" href="#exam">Take a mock exam</a></div>
    </div>
    <figure class="hero-v"><canvas id="heroCv" role="img" aria-label="Animated gradient descent descending a cost surface"></canvas><figcaption>Gradient descent, live. Each dot is one step <b>β ← β − α∇J</b>; the ring marks the minimum it converges to.</figcaption></figure>
  </section>
  <section class="home-s">
    <h2>The whole course is one recipe</h2>
    <p class="lede">Every algorithm makes three choices: what shape the model takes, how its error is measured, and how that error is driven down.</p>
    <div class="matrix"><div class="mx-scroll"><table class="mtx"><thead><tr><th>Lecture</th><th>Representation<span>What shape can the model take?</span></th><th>Evaluation<span>How wrong is it?</span></th><th>Optimization<span>How do we improve it?</span></th></tr></thead><tbody><tr style="--lc:var(--l1)"><th><a href="#l1"><span class="code">L${NUM.l1}</span>${L.find(l => l.id === 'l1').short}</a></th><td>Line ŷ = βᵀx</td><td>Mean squared error</td><td>Gradient descent</td></tr><tr style="--lc:var(--l2)"><th><a href="#l2"><span class="code">L${NUM.l2}</span>${L.find(l => l.id === 'l2').short}</a></th><td>Polynomial and interaction features</td><td>RSS + λ · penalty</td><td>Gradient descent; λ by cross-validation</td></tr><tr style="--lc:var(--l3a)"><th><a href="#l3a"><span class="code">L${NUM.l3a}</span>${L.find(l => l.id === 'l3a').short}</a></th><td>Sigmoid of a line</td><td>Log loss (maximum likelihood)</td><td>Gradient descent</td></tr><tr style="--lc:var(--l3b)"><th><a href="#l3b"><span class="code">L${NUM.l3b}</span>${L.find(l => l.id === 'l3b').short}</a></th><td>Distributions: Bernoulli, Gaussian</td><td>Likelihood of the data</td><td>Maximum likelihood</td></tr><tr style="--lc:var(--l4)"><th><a href="#l4"><span class="code">L${NUM.l4}</span>${L.find(l => l.id === 'l4').short}</a></th><td>If-then rules on feature thresholds</td><td>Gini impurity or entropy</td><td>Greedy recursive splitting</td></tr><tr style="--lc:var(--l5)"><th><a href="#l5"><span class="code">L${NUM.l5}</span>${L.find(l => l.id === 'l5').short}</a></th><td>Many decorrelated trees, averaged</td><td>Gini or entropy per tree; OOB error</td><td>Bootstrap rows and random feature subsets</td></tr></tbody></table></div></div>
  </section>
  <section class="home-s">
    <h2>Lectures</h2>
    <div class="cards">${L.map(l => `<article class="lcard" style="--lc:var(--${l.id})"><div class="lc-top"><span class="lc-num" aria-label="Lecture ${NUM[l.id]}">${NUM[l.id]}</span><span class="lc-pct">${pct(l.id)}% done</span></div><h3><a href="#${l.id}">${l.title}</a></h3><p>${l.thesis}</p><div class="lc-bar"><i style="width:${pct(l.id)}%"></i></div><div class="lc-links"><a href="#${l.id}">Learn</a><a href="#${l.id}-examples">Examples</a><a href="#${l.id}-summary">Summary</a><a href="#${l.id}-quiz">Quiz${prog.quiz[l.id] != null ? ` (best ${Math.round(prog.quiz[l.id] * 100)}%)` : ''}</a></div></article>`).join('')}</div>
  </section>
  <section class="home-s">
    <h2>A study loop that works</h2>
    <ol class="loop">
      <li><b>Learn</b><span>Read each section and play with its lab until you can predict what a slider will do before you move it.</span></li>
      <li><b>Work the examples</b><span>Cover the solution and compute it yourself first. These mirror exam-style calculations.</span></li>
      <li><b>Recall</b><span>Open the summary and answer the active-recall prompts out loud before revealing.</span></li>
      <li><b>Test</b><span>Take the lecture quiz, then the mixed mock exam. Drill missed terms in Flashcards.</span></li>
    </ol>
    <p class="small">Progress (sections read, best quiz scores, known flashcards) is saved in this browser only.</p>
  </section>`;
  heroAnim(); finish(main);
}
function heroAnim() {
  const cv = $('#heroCv'); if (!cv) return; const ctx = cv.getContext('2d'); let w = 0, h = 0, path = [], t0 = 0, raf = 0, bg = null;
  const J = (x, y) => 0.5 * (1.0 * x * x + 2 * 0.55 * x * y + 2.4 * y * y), G = (x, y) => [x + 0.55 * y, 0.55 * x + 2.4 * y];
  const starts = [[-2.6, 1.5], [2.5, 1.6], [-2.2, -1.6], [2.7, -1.2]]; let si = 0;
  function newPath() { let p = starts[si++ % starts.length].slice(); path = [p]; for (let i = 0; i < 40; i++) { const g = G(p[0], p[1]); p = [p[0] - 0.36 * g[0], p[1] - 0.36 * g[1]]; path.push(p); } }
  function size() { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; const d = Math.min(2, devicePixelRatio || 1); cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); bg = null; }
  const X = x => w / 2 + x / 3.2 * (w / 2), Y = y => h / 2 - y / 2.1 * (h / 2);
  function draw(k) {
    const c = window.VZ.cols(cv); ctx.clearRect(0, 0, w, h);
    if (!bg) { bg = document.createElement('canvas'); bg.width = Math.ceil(w / 3); bg.height = Math.ceil(h / 3); const o = bg.getContext('2d'), img = o.createImageData(bg.width, bg.height); const A = window.VZ.hex2rgb(c.accent), B = window.VZ.hex2rgb(c.bg);
      for (let j = 0; j < bg.height; j++) for (let i = 0; i < bg.width; i++) { const x = (i * 3 - w / 2) / (w / 2) * 3.2, y = -(j * 3 - h / 2) / (h / 2) * 2.1; const v = Math.sqrt(J(x, y)) / 3.4; const band = Math.floor(v * 10); const a = Math.max(0, 0.5 * (1 - v)) + (band % 2 ? 0.06 : 0); const q = (j * bg.width + i) * 4; for (let z = 0; z < 3; z++) img.data[q + z] = Math.round(B[z] * (1 - a) + A[z] * a); img.data[q + 3] = 255; }
      o.putImageData(img, 0, 0); }
    ctx.drawImage(bg, 0, 0, w, h);
    const n = Math.min(path.length, Math.floor(Math.max(0, k)) + 1);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 1.6; ctx.beginPath(); for (let i = 0; i < n; i++) { const [x, y] = path[i]; i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); } ctx.stroke();
    for (let i = 0; i < n; i++) { const [x, y] = path[i]; ctx.beginPath(); ctx.arc(X(x), Y(y), i === n - 1 ? 6 : 2.6, 0, 7); ctx.fillStyle = i === n - 1 ? c.accent : c.ink; ctx.fill(); if (i === n - 1) { ctx.strokeStyle = c.bg; ctx.lineWidth = 2; ctx.stroke(); } }
    ctx.strokeStyle = c.good; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(0), Y(0), 9, 0, 7); ctx.stroke();
    const over = k - (path.length - 1);
    if (over > 0 && over < 10) { const t = over / 10, e = 1 - Math.pow(1 - t, 3); ctx.globalAlpha = 1 - t; ctx.beginPath(); ctx.arc(X(0), Y(0), 9 + 34 * e, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  newPath(); size();
  const ro = new ResizeObserver(() => { size(); draw(path.length); }); ro.observe(cv);
  const redraw = () => { bg = null; draw(path.length); }; window.VIZ_REDRAW.add(redraw);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, last = 0;
  const vis = new IntersectionObserver(es => { visible = es[0].isIntersecting; }); vis.observe(cv);
  if (reduce) draw(path.length); else { const tick = t => { raf = requestAnimationFrame(tick); if (!visible || document.hidden) { t0 += last ? t - last : 0; last = t; return; } last = t; if (!t0) t0 = t; const k = (t - t0) / 150; if (k > path.length + 14) { t0 = t; newPath(); } draw(k); }; raf = requestAnimationFrame(tick); }
  window.VIZ_CLEAN.push(() => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); window.VIZ_REDRAW.delete(redraw); });
}

/* ---------- lecture ---------- */
const TABS = [['learn', 'Learn'], ['examples', 'Worked examples'], ['summary', 'Summary & recall'], ['quiz', 'Quiz']];
function lecture(lec, tab) {
  const i = L.indexOf(lec), prev = L[i - 1], next = L[i + 1];
  main.innerHTML = `<div class="lec" style="--lc:var(--${lec.id})">
  <header class="lec-h"><span class="lec-num" aria-hidden="true">${NUM[lec.id]}</span><div class="lec-ht"><h1><span class="sr">Lecture ${NUM[lec.id]}: </span>${lec.title}</h1><p class="lede">${lec.thesis}</p></div>
  <nav class="tabs" aria-label="Lecture sections">${TABS.map(([k, n]) => `<a href="#${lec.id}${k === 'learn' ? '' : '-' + k}" class="tab${k === tab ? ' on' : ''}" ${k === tab ? 'aria-current="page"' : ''}>${n}${k === tab ? '<span class="tab-ind"></span>' : ''}</a>`).join('')}</nav></header>
  <div class="lec-b" id="lecB"></div>
  <footer class="lec-f">${prev ? `<a href="#${prev.id}" class="pn-l"><small>${ico('left')} Previous</small>Lecture ${NUM[prev.id]}: ${prev.short}</a>` : '<span></span>'}${next ? `<a href="#${next.id}" class="pn-r"><small>Next ${ico('right')}</small>Lecture ${NUM[next.id]}: ${next.short}</a>` : `<a href="#exam" class="pn-r"><small>Next ${ico('right')}</small>Mixed mock exam</a>`}</footer></div>`;
  const B = $('#lecB');
  if (tab === 'examples') examplesTab(lec, B); else if (tab === 'summary') summaryTab(lec, B); else if (tab === 'quiz') quizTab(lec, B); else learnTab(lec, B);
}
function learnTab(lec, B) {
  B.innerHTML = `<div class="learn"><aside class="toc" aria-label="In this lecture"><span class="toc-h">In this lecture</span>${lec.learn.map((s, i) => `<button type="button" data-s="${s.id}"><span>${NUM[lec.id]}.${i + 1}</span>${s.title}</button>`).join('')}</aside>
  <article class="prose">${lec.learn.map((s, i) => `<section class="sec" id="sec-${s.id}" data-sid="${s.id}"><h2><span class="secno">${NUM[lec.id]}.${i + 1}</span>${s.title}</h2>${s.html}</section>`).join('')}
  <div class="next-step"><p>Finished reading? Test the ideas on concrete numbers.</p><a class="btn" href="#${lec.id}-examples">Worked examples ${ico('right')}</a></div></article></div>`;
  B.querySelectorAll('.toc button').forEach(b => b.addEventListener('click', () => { const t = document.getElementById('sec-' + b.dataset.s); if (t) t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }));
  const seen = new Set(prog.seen[lec.id] || []);
  io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { const id = e.target.dataset.sid; B.querySelectorAll('.toc button').forEach(b => b.classList.toggle('on', b.dataset.s === id)); if (!seen.has(id)) { seen.add(id); prog.seen[lec.id] = [...seen]; save(); } } }); }, { rootMargin: '-20% 0px -65% 0px' });
  B.querySelectorAll('.sec').forEach(s => io.observe(s));
  finish(B);
}
function examplesTab(lec, B) {
  B.innerHTML = `<div class="prose wide"><p class="lede-s">Try each one on paper before reading the solution. Open a solution only after you have an answer.</p>
  ${lec.examples.map((e, i) => `<article class="ex"><h3><span class="ex-n">${NUM[lec.id]}.${i + 1}</span>${e.title}</h3><div class="ex-b">${e.html}</div></article>`).join('')}
  <div class="next-step"><p>Ready to consolidate?</p><a class="btn" href="#${lec.id}-summary">Summary ${ico('right')}</a></div></div>`;
  finish(B);
}
function summaryTab(lec, B) {
  const s = lec.summary;
  B.innerHTML = `<div class="prose wide summ">
  <section class="big"><h2>The big picture</h2><p>${esc(s.big)}</p></section>
  <section><h2>Core concepts</h2><ul class="concepts">${s.concepts.map(c => `<li>${esc(c)}</li>`).join('')}</ul></section>
  <section><h2>Formula sheet</h2><div class="fgrid">${s.formulas.map(([n, f]) => `<div class="fcard"><span>${n}</span><div class="eq">\\[${f}\\]</div></div>`).join('')}</div></section>
  <section><h2>Key terms</h2><dl class="terms">${s.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl><button type="button" class="btn ghost" id="drill">Drill these ${s.terms.length} terms as flashcards</button></section>
  <section><h2>Exam traps</h2><ul class="traps">${s.traps.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>
  <section><h2>Active recall</h2><p>Answer each prompt out loud or on paper, then reveal to check.</p><div class="recall">${s.recall.map(([q, a], i) => `<details><summary><span>${i + 1}</span>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
  <div class="btns"><button type="button" class="btn ghost" id="openAll">Reveal all answers</button><a class="btn" href="#${lec.id}-quiz">Take the quiz</a></div></section></div>`;
  $('#drill').addEventListener('click', () => { cardFilter = lec.id; location.hash = 'cards'; });
  $('#openAll').addEventListener('click', e => { const ds = B.querySelectorAll('.recall details'); const open = [...ds].some(d => !d.open); ds.forEach(d => d.open = open); e.target.textContent = open ? 'Hide all answers' : 'Reveal all answers'; });
  finish(B);
}
function quizTab(lec, B) { runQuiz(B, lec.quiz.map(q => Object.assign({ lec: lec.id }, q)), lec.id, false); }

/* ---------- quiz engine ---------- */
function runQuiz(B, qs, key, tagged, onNew) {
  B.innerHTML = `<div class="prose wide"><div class="qz-bar" role="status"><span class="qz-score"></span><div class="qz-prog"><i></i></div><button type="button" class="btn ghost" id="qzRe">${onNew ? 'New exam' : 'Retry'}</button></div>
  ${qs.map((q, i) => `<div class="qz" data-i="${i}"><p class="qz-q"><span class="qz-n">${i + 1}</span><span>${tagged ? `<span class="qz-tag" style="--lc:var(--${q.lec})">L${NUM[q.lec]}</span>` : ''}${q.q}</span></p><div class="qz-o">${q.o.map((o, j) => `<button type="button" class="opt" data-j="${j}"><span class="opt-k">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div><div class="qz-e" hidden></div></div>`).join('')}
  <div class="qz-end" hidden></div></div>`;
  let answered = 0, right = 0;
  const upd = () => { B.querySelector('.qz-score').innerHTML = `<b>${right}</b> correct of ${answered} answered · ${qs.length} questions${prog.quiz[key] != null ? ` · best ${Math.round(prog.quiz[key] * 100)}%` : ''}`; B.querySelector('.qz-prog i').style.width = (answered / qs.length * 100) + '%'; };
  B.querySelectorAll('.qz').forEach(card => {
    const q = qs[+card.dataset.i];
    card.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      if (card.dataset.done) return; card.dataset.done = '1'; answered++; const j = +b.dataset.j, ok = j === q.a; if (ok) right++;
      card.classList.add(ok ? 'ok' : 'no');
      card.querySelectorAll('.opt').forEach(o => { o.disabled = true; const k = +o.dataset.j; if (k === q.a) o.classList.add('is-right'); else if (k === j) o.classList.add('is-wrong'); });
      const e = card.querySelector('.qz-e'); e.hidden = false; e.innerHTML = `<b>${ok ? 'Correct.' : 'Not quite.'}</b> ${q.e}${!ok && tagged ? ` <a href="#${q.lec}">Review Lecture ${NUM[q.lec]}</a>` : ''}`; typeset(e);
      upd(); if (ok && !RMQ()) B.querySelector('.qz-score b').classList.add('bump');
      if (answered === qs.length) { const sc = right / qs.length; prog.quiz[key] = Math.max(prog.quiz[key] || 0, sc); save(); upd(); const end = B.querySelector('.qz-end'); end.hidden = false;
        end.innerHTML = `<h3>${Math.round(sc * 100)}%</h3><p>${sc >= 0.9 ? 'Excellent. You own this material.' : sc >= 0.7 ? 'Solid. Re-read the explanations of the ones you missed.' : 'Revisit the Learn tab and the summary, then try again.'}</p>`; end.scrollIntoView({ block: 'nearest' }); }
    }));
  });
  $('#qzRe').addEventListener('click', () => onNew ? onNew() : runQuiz(B, qs, key, tagged, onNew));
  upd(); finish(B);
}
function exam() {
  activeNav('exam');
  main.innerHTML = `<div class="lec" style="--lc:var(--accent)"><header class="lec-h solo"><div class="lec-ht"><h1>Mock exam</h1><p class="lede">15 questions drawn at random from every lecture. Each new exam reshuffles. Wrong answers link back to the lecture to review.</p></div></header><div class="lec-b" id="exB"></div></div>`;
  const all = []; L.forEach(l => l.quiz.forEach(q => all.push(Object.assign({ lec: l.id }, q))));
  const gen = () => { const a = all.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } runQuiz($('#exB'), a.slice(0, 15), 'exam', true, gen); };
  gen();
}

/* ---------- flashcards ---------- */
let cardFilter = 'all';
function cards() {
  main.innerHTML = `<div class="lec" style="--lc:var(--accent)"><header class="lec-h solo"><div class="lec-ht"><h1>Flashcards</h1><p class="lede">Say the definition before you flip. Mark cards you know; the rest come back around.</p></div></header><div class="lec-b"><div class="fc-wrap">
  <div class="btns fc-f" role="group" aria-label="Filter by lecture"><button type="button" class="chip" data-f="all">All</button>${L.map(l => `<button type="button" class="chip" data-f="${l.id}" style="--lc:var(--${l.id})">L${NUM[l.id]}</button>`).join('')}</div>
  <div class="fc-stat"></div>
  <button type="button" class="fc" id="fc" aria-live="polite"><span class="fc-in"><span class="fc-face fc-front"></span><span class="fc-face fc-back"></span></span></button>
  <div class="btns fc-act"><button type="button" class="btn ghost" id="fcAgain">${ico('left')} Again</button><button type="button" class="btn ghost" id="fcFlip">Flip</button><button type="button" class="btn" id="fcKnow">I know it ${ico('right')}</button></div>
  <div class="btns fc-more"><button type="button" class="chip" id="fcShuf">Shuffle</button><button type="button" class="chip" id="fcAll">Include known cards</button><button type="button" class="chip" id="fcReset">Reset known</button></div></div></div></div>`;
  const deck = []; L.forEach(l => l.summary.terms.forEach(([t, d]) => deck.push({ t, d, lec: l.id, k: l.id + '|' + t })));
  let incKnown = false, queue = [], flipped = false;
  const fc = $('#fc');
  function build() { queue = deck.filter(c => (cardFilter === 'all' || c.lec === cardFilter) && (incKnown || !prog.cards[c.k])); main.querySelectorAll('.fc-f .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === cardFilter))); $('#fcAll').setAttribute('aria-pressed', String(incKnown)); show(); }
  function show() {
    flipped = false; fc.classList.remove('flip'); const tot = deck.filter(c => cardFilter === 'all' || c.lec === cardFilter); const kn = tot.filter(c => prog.cards[c.k]).length;
    main.querySelector('.fc-stat').innerHTML = `<span><b>${queue.length}</b> in the queue · ${kn} of ${tot.length} known</span><div class="qz-prog"><i style="width:${tot.length ? kn / tot.length * 100 : 0}%"></i></div>`;
    const c = queue[0];
    if (!c) { fc.style.setProperty('--lc', 'var(--good)'); fc.querySelector('.fc-front').innerHTML = `<small>Deck complete</small><b>Every card in this set is marked known.</b><em>Use "Include known cards" or "Reset known" to go again.</em>`; fc.querySelector('.fc-back').innerHTML = ''; return; }
    fc.style.setProperty('--lc', `var(--${c.lec})`);
    fc.querySelector('.fc-front').innerHTML = `<small>Lecture ${NUM[c.lec]} · term</small><b>${esc(c.t)}</b><em>Tap or press Space to reveal</em>`;
    fc.querySelector('.fc-back').innerHTML = `<small>${esc(c.t)}</small><span class="fc-d">${esc(c.d)}</span>`;
  }
  const flip = () => { if (!queue[0]) return; flipped = !flipped; fc.classList.toggle('flip', flipped); };
  let busy = false;
  const swap = (dir, fn) => {
    if (busy) return; if (RMQ() || !fc.animate) { fn(); return; } busy = true;
    const out = fc.animate([{ transform: 'none', opacity: 1 }, { transform: `translateX(${dir * 56}px) rotate(${dir * 2.5}deg)`, opacity: 0 }], { duration: 170, easing: 'cubic-bezier(.4,0,1,1)' });
    out.onfinish = () => { fc.classList.add('instant'); fn(); void fc.offsetWidth; fc.classList.remove('instant');
      fc.animate([{ transform: 'translateY(12px) scale(.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = () => { busy = false; }; };
  };
  const again = () => { if (!queue[0]) return; swap(-1, () => { queue.push(queue.shift()); show(); }); };
  const know = () => { if (!queue[0]) return; swap(1, () => { const c = queue.shift(); prog.cards[c.k] = 1; save(); show(); }); };
  fc.addEventListener('click', flip); $('#fcFlip').addEventListener('click', flip); $('#fcAgain').addEventListener('click', again); $('#fcKnow').addEventListener('click', know);
  $('#fcShuf').addEventListener('click', () => { for (let i = queue.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue[i], queue[j]] = [queue[j], queue[i]]; } show(); });
  $('#fcAll').addEventListener('click', () => { incKnown = !incKnown; build(); });
  $('#fcReset').addEventListener('click', () => { deck.forEach(c => { if (cardFilter === 'all' || c.lec === cardFilter) delete prog.cards[c.k]; }); save(); build(); });
  main.querySelectorAll('.fc-f .chip').forEach(b => b.addEventListener('click', () => { cardFilter = b.dataset.f; build(); }));
  const key = e => { if (!document.body.contains(fc) || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === ' ' && document.activeElement !== fc) { e.preventDefault(); flip(); } else if (e.key === 'ArrowRight') know(); else if (e.key === 'ArrowLeft') again(); };
  document.addEventListener('keydown', key); window.VIZ_CLEAN.push(() => document.removeEventListener('keydown', key));
  build();
}

/* ---------- formula sheet ---------- */
function formulas() {
  main.innerHTML = `<div class="lec" style="--lc:var(--accent)"><header class="lec-h solo"><div class="lec-ht"><h1>Formula sheet</h1><p class="lede">Every formula from the six lectures in one place. Cover each formula and rebuild it from its name.</p></div></header>
  <div class="lec-b"><div class="prose wide">${L.map(l => `<section class="fs" style="--lc:var(--${l.id})"><h2><span class="secno">L${NUM[l.id]}</span>${l.title}</h2><div class="fgrid">${l.summary.formulas.map(([n, f]) => `<div class="fcard"><span>${n}</span><div class="eq">\\[${f}\\]</div></div>`).join('')}</div></section>`).join('')}</div></div></div>`;
  finish(main);
}

/* ---------- router ---------- */
let routed = false;
function route() {
  const go = () => render();
  if (routed && document.startViewTransition) document.startViewTransition(go); else go();
  routed = true;
}
function render() {
  cleanup();
  const h = (location.hash || '').slice(1);
  if (!h || h === 'home') { home(); activeNav(''); }
  else if (h === 'cards') { cards(); activeNav('cards'); }
  else if (h === 'formulas') { formulas(); activeNav('formulas'); }
  else if (h === 'exam') exam();
  else { const [id, tab] = h.split('-'); const lec = L.find(l => l.id === id); if (lec) { lecture(lec, TABS.some(t => t[0] === tab) ? tab : 'learn'); activeNav(id); } else { home(); activeNav(''); } }
  window.scrollTo(0, 0); main.focus({ preventScroll: true });
}
buildNav();
window.addEventListener('hashchange', route);
route();
})();

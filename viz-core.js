/* Interactive labs: shared helpers + Lecture 1 and Lecture 2 widgets */
(function () {
'use strict';
const VIZ = window.VIZ = window.VIZ || {};
const CLEAN = window.VIZ_CLEAN = window.VIZ_CLEAN || [];
const REDRAW = window.VIZ_REDRAW = window.VIZ_REDRAW || new Set();
let uid = 0;
const FONT = '12px "Geist Mono", ui-monospace, Menlo, monospace';
const FONT_S = '11px "Geist Mono", ui-monospace, Menlo, monospace';
const RM = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- utilities ---------- */
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
function cols(node) {
  const s = getComputedStyle(node); const g = n => s.getPropertyValue(n).trim();
  return { bg: g('--surface'), ink: g('--ink'), muted: g('--muted'), line: g('--line'), lc: g('--lc') || g('--accent'), accent: g('--accent'),
    a: g('--c-a'), b: g('--c-b'), good: g('--good'), bad: g('--bad'), warn: g('--warn'),
    series: ['--l1', '--l2', '--l3a', '--l3b', '--l4', '--l5'].map(g) };
}
function hex2rgb(h) { h = (h || '#888').replace('#', '').trim(); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function fmt(v, d = 2) { if (!isFinite(v)) return v > 0 ? '∞' : (v < 0 ? '−∞' : 'n/a'); const s = v.toFixed(d); return s.replace('-', '−'); }
function fmtTick(v) { const a = Math.abs(v); let s = a >= 1000 ? String(Math.round(v)) : a >= 10 ? String(+v.toFixed(1)) : String(+v.toFixed(2)); return s.replace('-', '−'); }

/* ---------- DOM helpers ---------- */
function div(parent, cls, html) { const d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; parent.appendChild(d); return d; }
const FLASK = 'M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z';
const GAME = FLASK;
function shell(host, title, tag) {
  host.classList.add('viz-on');
  host.innerHTML = `<div class="viz-head"><span class="viz-tag" title="${tag || 'Lab'}"><svg viewBox="0 0 256 256" aria-hidden="true"><path fill="currentColor" d="${tag === 'Game' ? GAME : FLASK}"/></svg></span><span class="viz-title">${title}</span></div><div class="viz-body"></div>`;
  return host.querySelector('.viz-body');
}
function slider(parent, o, cb) {
  const id = (o.id || 'v') + (++uid);
  const w = div(parent, 'ctl');
  w.innerHTML = `<label for="${id}"><span>${o.label}</span><output for="${id}"></output></label><input type="range" id="${id}" min="${o.min}" max="${o.max}" step="${o.step}" value="${o.value}">`;
  const inp = w.querySelector('input'), out = w.querySelector('output'); const f = o.fmt || (v => v);
  const upd = () => { out.textContent = f(+inp.value); inp.style.setProperty('--p', ((+inp.value - +inp.min) / ((+inp.max - +inp.min) || 1) * 100) + '%'); };
  inp.addEventListener('input', () => { upd(); cb && cb(+inp.value); });
  upd();
  return { inp, get v() { return +inp.value; }, set(v) { inp.value = v; upd(); } };
}
function button(parent, label, cb, cls) { const b = document.createElement('button'); b.type = 'button'; b.className = cls || 'btn'; b.innerHTML = label; b.addEventListener('click', cb); parent.appendChild(b); return b; }
function seg(parent, options, value, cb, label) {
  const w = div(parent, 'seg'); w.setAttribute('role', 'group'); if (label) w.setAttribute('aria-label', label);
  options.forEach(([val, lab]) => { const b = button(w, lab, () => { set(val); cb(val); }, 'seg-b'); b.dataset.v = String(val); });
  function set(v) { [...w.children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v)))); }
  set(value); return { set, el: w };
}
function check(parent, label, value, cb) {
  const id = 'c' + (++uid); const w = div(parent, 'chk');
  w.innerHTML = `<input type="checkbox" id="${id}" ${value ? 'checked' : ''}><label for="${id}">${label}</label>`;
  const i = w.querySelector('input'); i.addEventListener('change', () => cb(i.checked)); return i;
}
function canvas(parent, o = {}) {
  const wrap = div(parent, 'cv' + (o.cls ? ' ' + o.cls : ''));
  if (o.caption) div(wrap, 'cv-cap', o.caption);
  const cv = document.createElement('canvas'); wrap.appendChild(cv);
  if (o.label) cv.setAttribute('aria-label', o.label);
  cv.setAttribute('role', 'img');
  const S = { cv, ctx: cv.getContext('2d'), w: 0, h: 0, draw: null };
  const ratio = o.ratio || 0.62, min = o.min || 200, max = o.max || 440;
  let lastW = 0;
  function fit(force) {
    const w = Math.round(cv.clientWidth || wrap.clientWidth); if (!w) return;
    if (w === lastW && !force) return; lastW = w;
    const h = o.square ? Math.min(w, max) : Math.max(min, Math.min(max, Math.round(w * ratio)));
    const d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(w * d); cv.height = Math.round(h * d); cv.style.height = h + 'px';
    S.ctx.setTransform(d, 0, 0, d, 0, 0); S.w = w; S.h = h; if (S.draw) S.draw();
  }
  const ro = new ResizeObserver(() => fit()); ro.observe(wrap);
  const redraw = () => { if (S.w && S.draw) S.draw(); };
  REDRAW.add(redraw);
  CLEAN.push(() => { ro.disconnect(); REDRAW.delete(redraw); });
  S.render = () => { if (!S.w) fit(true); else if (S.draw) S.draw(); };
  S.clear = () => { S.ctx.clearRect(0, 0, S.w, S.h); };
  return S;
}

/* ---------- plotting ---------- */
function ticks(a, b, n) {
  const span = b - a; if (span <= 0) return [a]; const step0 = span / Math.max(1, n); const mag = Math.pow(10, Math.floor(Math.log10(step0))); const r = step0 / mag;
  const step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag; const out = [];
  for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9 * Math.abs(step); v += step) out.push(+v.toFixed(10));
  return out;
}
function frame(S, xd, yd, pad) {
  pad = Object.assign({ l: 50, r: 14, t: 14, b: 36 }, pad || {});
  const P = { L: pad.l, T: pad.t, W: Math.max(10, S.w - pad.l - pad.r), H: Math.max(10, S.h - pad.t - pad.b), xd, yd };
  P.X = x => P.L + (x - xd[0]) / (xd[1] - xd[0]) * P.W;
  P.Y = y => P.T + P.H - (y - yd[0]) / (yd[1] - yd[0]) * P.H;
  P.ix = px => xd[0] + (px - P.L) / P.W * (xd[1] - xd[0]);
  P.iy = py => yd[0] + (P.T + P.H - py) / P.H * (yd[1] - yd[0]);
  return P;
}
function axes(S, P, c, o = {}) {
  const ctx = S.ctx; ctx.save(); ctx.font = FONT_S; ctx.lineWidth = 1;
  const xt = o.xt || ticks(P.xd[0], P.xd[1], o.nx || Math.max(3, Math.round(P.W / 70)));
  const yt = o.yt || ticks(P.yd[0], P.yd[1], o.ny || Math.max(3, Math.round(P.H / 50)));
  if (!o.nogrid) {
    ctx.strokeStyle = c.line; ctx.globalAlpha = 0.6;
    xt.forEach(v => { const x = Math.round(P.X(v)) + 0.5; ctx.beginPath(); ctx.moveTo(x, P.T); ctx.lineTo(x, P.T + P.H); ctx.stroke(); });
    yt.forEach(v => { const y = Math.round(P.Y(v)) + 0.5; ctx.beginPath(); ctx.moveTo(P.L, y); ctx.lineTo(P.L + P.W, y); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = c.line; ctx.strokeRect(P.L + 0.5, P.T + 0.5, P.W - 1, P.H - 1);
  ctx.fillStyle = c.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const fx = o.fx || fmtTick, fy = o.fy || fmtTick;
  xt.forEach(v => ctx.fillText(fx(v), P.X(v), P.T + P.H + 5));
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  yt.forEach(v => ctx.fillText(fy(v), P.L - 6, P.Y(v)));
  if (o.xl) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xl, P.L + P.W / 2, S.h - 1); }
  if (o.yl) { ctx.save(); ctx.translate(10, P.T + P.H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
  ctx.restore();
}
function clip(S, P) { S.ctx.save(); S.ctx.beginPath(); S.ctx.rect(P.L, P.T, P.W, P.H); S.ctx.clip(); }
function curve(ctx, P, f, col, w, dash, x0, x1) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); const a = x0 != null ? x0 : P.xd[0], b = x1 != null ? x1 : P.xd[1];
  const n = Math.max(80, Math.round(P.W / 2)); let pen = false;
  for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; const y = f(x); if (!isFinite(y)) { pen = false; continue; } const px = P.X(x), py = Math.max(-5e3, Math.min(5e3, P.Y(y))); if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py); }
  ctx.stroke(); ctx.restore();
}
function polyline(ctx, P, pts, col, w, dash) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 2; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], i) => { const px = P.X(x), py = Math.max(-5e3, Math.min(5e3, P.Y(y))); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); ctx.restore();
}
function dot(ctx, x, y, r, fill, stroke, lw) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.5; ctx.stroke(); } }
function text(ctx, s, x, y, col, align, base, font) { ctx.save(); ctx.font = font || FONT; ctx.fillStyle = col; ctx.textAlign = align || 'left'; ctx.textBaseline = base || 'middle'; ctx.fillText(s, x, y); ctx.restore(); }
function arrow(ctx, x0, y0, x1, y1, col, w, head) {
  head = head || 9; const a = Math.atan2(y1 - y0, x1 - x0);
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - head * Math.cos(a - 0.42), y1 - head * Math.sin(a - 0.42)); ctx.lineTo(x1 - head * Math.cos(a + 0.42), y1 - head * Math.sin(a + 0.42)); ctx.closePath(); ctx.fill(); ctx.restore();
}
function legend(S, items, x, y) { // items: [label, color, dashed]
  const ctx = S.ctx; ctx.save(); ctx.font = FONT_S; let cx = x;
  items.forEach(([lab, col, dash]) => { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.setLineDash(dash ? [5, 4] : []); ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx + 18, y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(lab, cx + 23, y); cx += 23 + ctx.measureText(lab).width + 16; });
  ctx.restore();
}
function loop(fn, ms) { // runs fn every ms until it returns false
  let id = null, last = 0, alive = true;
  const tick = t => { if (!alive) return; if (t - last >= ms) { last = t; if (fn() === false) { alive = false; return; } } id = requestAnimationFrame(tick); };
  id = requestAnimationFrame(tick);
  const stop = () => { alive = false; if (id) cancelAnimationFrame(id); };
  CLEAN.push(stop); return stop;
}
function solve(M, v) {
  const n = v.length; const A = M.map((r, i) => r.concat([v[i]]));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    const tmp = A[c]; A[c] = A[p]; A[p] = tmp; const d = A[c][c]; if (Math.abs(d) < 1e-300) continue;
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c] / d; if (f) for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
  }
  return A.map((r, i) => r[n] / (r[i] || 1e-300));
}
function polyFit(xs, ys, deg, lam) {
  const n = deg + 1; const M = Array.from({ length: n }, () => new Array(n).fill(0)), v = new Array(n).fill(0);
  for (let i = 0; i < xs.length; i++) { const t = 2 * xs[i] - 1; const pw = [1]; for (let k = 1; k < n; k++) pw.push(pw[k - 1] * t); for (let a = 0; a < n; a++) { v[a] += pw[a] * ys[i]; for (let b = 0; b < n; b++) M[a][b] += pw[a] * pw[b]; } }
  for (let a = 0; a < n; a++) M[a][a] += (a ? lam : 0) + 1e-10;
  return solve(M, v);
}
function polyEval(c, x) { const t = 2 * x - 1; let s = 0; for (let k = c.length - 1; k >= 0; k--) s = s * t + c[k]; return s; }
function rmse(c, xs, ys) { let s = 0; for (let i = 0; i < xs.length; i++) { const e = polyEval(c, xs[i]) - ys[i]; s += e * e; } return Math.sqrt(s / xs.length); }
function readout(parent) { return div(parent, 'readout'); }
function kv(pairs) { return pairs.map(([k, v, cls]) => `<span class="kv${cls ? ' ' + cls : ''}"><b>${k}</b>${v}</span>`).join(''); }

window.VZ = { VIZ, CLEAN, REDRAW, rng, gauss, cols, hex2rgb, rgba, fmt, fmtTick, div, shell, slider, button, seg, check, canvas, ticks, frame, axes, clip, curve, polyline, dot, text, arrow, legend, loop, solve, readout, kv, FONT, FONT_S, RM, polyFit, polyEval, rmse };

/* =============================== L1 =============================== */

VIZ.mlTypes = host => {
  const body = shell(host, 'Which type of ML is it?', 'Game');
  const Q = [
    ['Netflix quietly sorts its viewers into "taste tribes" that nobody defined.', 'U', 'Clustering: nobody labelled the tribes, the algorithm discovers them.'],
    ['Your phone unlocks only for your face, trained on selfies you labelled.', 'S', 'Classification from labelled examples (you vs not-you).'],
    ['A robot vacuum bumps around the room and slowly stops hitting the couch.', 'R', 'Trial, error and reward with no dataset at all.'],
    ['A bank flags one bizarre transaction, with no examples of fraud to learn from.', 'U', 'Anomaly detection. It sounds supervised, but there are no fraud labels.'],
    ['AlphaGo teaches itself Go by playing millions of games against itself.', 'R', 'Self-play: the reward is winning the game.'],
    ["Predicting tomorrow's temperature from ten years of weather logs.", 'S', 'Regression: predict a number from labelled history.']
  ];
  const names = { S: 'Supervised', U: 'Unsupervised', R: 'Reinforcement' };
  const score = div(body, 'score-line'); let right = 0, done = 0;
  const list = div(body, 'mlq-list');
  Q.forEach(([s, a, e], i) => {
    const card = div(list, 'mlq');
    card.innerHTML = `<p class="mlq-s"><span class="mlq-n">${i + 1}</span>${s}</p><div class="mlq-b"></div><p class="mlq-e" hidden></p>`;
    const bw = card.querySelector('.mlq-b'), ex = card.querySelector('.mlq-e');
    ['S', 'U', 'R'].forEach(k => button(bw, names[k], () => {
      if (card.dataset.done) return; card.dataset.done = '1'; done++;
      const ok = k === a; if (ok) right++;
      [...bw.children].forEach((b, j) => { b.disabled = true; const kk = ['S', 'U', 'R'][j]; if (kk === a) b.classList.add('is-right'); else if (kk === k) b.classList.add('is-wrong'); });
      ex.hidden = false; ex.innerHTML = `<b>${ok ? 'Correct' : 'Not quite'} · ${names[a]}.</b> ${e}`; upd();
    }, 'opt-b'));
  });
  const reset = button(body, 'Play again', () => VIZ.mlTypes(host), 'btn ghost');
  function upd() { score.innerHTML = `<b>${right}</b> / ${done} correct${done === Q.length ? (right === Q.length ? ' · perfect' : '') : ' · answer all six'}`; }
  upd(); reset.style.marginTop = '4px';
};

VIZ.cost = host => {
  const { div: D } = VZ; const body = shell(host, 'Cost function explorer · house prices');
  const X = [200, 190, 230, 180, 210], Y = [500, 450, 650, 400, 550], m = 5, xb = 202, yb = 510;
  const grid = D(body, 'cv-grid');
  const A = canvas(D(grid, ''), { ratio: 0.78, min: 220, max: 330, caption: 'Data and the line ŷ = β₀ + β₁·area', label: 'Scatter of house prices with candidate line' });
  const B = canvas(D(grid, ''), { ratio: 0.78, min: 220, max: 330, caption: 'Cost J(β₁): one height per slope', label: 'Parabola of cost versus slope' });
  const ctl = D(body, 'ctls'); const out = readout(body);
  let b1 = 2.5;
  slider(ctl, { label: 'Slope β₁ ($k per m²)', min: 0, max: 10, step: 0.1, value: b1, fmt: v => v.toFixed(1) }, v => { b1 = v; draw(); });
  const J = b => { const b0 = yb - b * xb; let s = 0; for (let i = 0; i < m; i++) { const e = b0 + b * X[i] - Y[i]; s += e * e; } return s / (2 * m); };
  A.draw = () => {
    const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, [170, 240], [300, 750], { l: 52 });
    axes(A, P, c, { xl: 'Area (m²)', yl: 'Price ($k)' }); clip(A, P);
    const b0 = yb - b1 * xb;
    X.forEach((x, i) => { const yh = b0 + b1 * x; ctx.strokeStyle = c.bad; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.X(x), P.Y(Y[i])); ctx.lineTo(P.X(x), P.Y(yh)); ctx.stroke(); });
    curve(ctx, P, x => b0 + b1 * x, c.lc, 2.5);
    X.forEach((x, i) => dot(ctx, P.X(x), P.Y(Y[i]), 5, c.ink));
    dot(ctx, P.X(xb), P.Y(yb), 4, c.bg, c.lc, 2);
    ctx.restore();
  };
  B.draw = () => {
    const c = cols(B.cv), ctx = B.ctx; B.clear(); const P = frame(B, [0, 10], [0, 3900], { l: 52 });
    axes(B, P, c, { xl: 'β₁', yl: 'J(β₁)' }); clip(B, P);
    curve(ctx, P, J, c.muted, 2);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.lc; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(b1), P.Y(0)); ctx.lineTo(P.X(b1), P.Y(J(b1))); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, P.X(5), P.Y(J(5)), 4, c.good);
    dot(ctx, P.X(b1), P.Y(J(b1)), 7, c.lc, c.bg, 2);
    ctx.restore();
    text(ctx, 'minimum', P.X(5), P.Y(0) - 12, c.good, 'center');
  };
  function draw() {
    A.render(); B.render(); const j = J(b1), b0 = yb - b1 * xb;
    const verdict = Math.abs(b1 - 5) < 0.05 ? ['Best fit: every residual is 0', 'good'] : b1 < 5 ? ['Too shallow', 'warn'] : ['Too steep', 'warn'];
    out.innerHTML = kv([['β₀', fmt(b0, 0)], ['β₁', fmt(b1, 1)], ['J(β)', fmt(j, 1)], ['', verdict[0], verdict[1]]]);
  }
  draw();
};

VIZ.gd1d = host => {
  const body = shell(host, 'Gradient descent on J(β) = (β − 3)² + 0.5');
  const f = b => (b - 3) * (b - 3) + 0.5, g = b => 2 * (b - 3);
  const S = canvas(body, { ratio: 0.48, min: 240, max: 360, label: 'Parabola with gradient descent steps' });
  const chips = div(body, 'chips');
  const ctl = div(body, 'ctls');
  const btns = div(body, 'btns');
  const out = readout(body);
  let lr = 0.3, start = -1, path = [], stop = null;
  const sLr = slider(ctl, { label: 'Learning rate α', min: 0.01, max: 1.15, step: 0.01, value: lr, fmt: v => v.toFixed(2) }, v => { lr = v; reset(true); });
  const sSt = slider(ctl, { label: 'Start β₀', min: -1.5, max: 7.5, step: 0.1, value: start, fmt: v => v.toFixed(1) }, v => { start = v; reset(true); });
  [['Too small', 0.03], ['Well chosen', 0.3], ['Oscillates', 0.85], ['Too large', 1.05]].forEach(([n, v]) => button(chips, n, () => { lr = v; sLr.set(v); reset(false); run(); }, 'chip'));
  button(btns, 'Step', () => { halt(); stepOnce(); draw(); });
  const runB = button(btns, 'Run', () => { if (stop) { halt(); } else run(); });
  button(btns, 'Reset', () => reset(false), 'btn ghost');
  function halt() { if (stop) { stop(); stop = null; } runB.textContent = 'Run'; }
  function status() { const b = path[path.length - 1]; if (Math.abs(b - 3) > 30 || !isFinite(b)) return 'div'; if (Math.abs(g(b)) < 1e-3) return 'conv'; return 'run'; }
  function stepOnce() { if (status() !== 'run') return false; const b = path[path.length - 1]; path.push(b - lr * g(b)); return path.length < 200; }
  function run() { halt(); if (RM()) { for (let i = 0; i < 60 && stepOnce() !== false && status() === 'run'; i++); draw(); return; } runB.textContent = 'Pause'; stop = loop(() => { const ok = stepOnce(); draw(); if (ok === false || status() !== 'run') { halt(); return false; } }, 320); }
  function reset(pre) { halt(); path = [start]; if (pre) for (let i = 0; i < 6; i++) stepOnce(); draw(); }
  S.draw = () => {
    const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [-2, 8], [0, 26]);
    axes(S, P, c, { xl: 'β', yl: 'J(β)' }); clip(S, P);
    curve(ctx, P, f, c.muted, 2);
    for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; arrow(ctx, P.X(a), P.Y(f(a)), P.X(b), P.Y(f(b)), rgba(c.lc, 0.85), 1.8, 8); }
    path.forEach((b, i) => dot(ctx, P.X(b), P.Y(f(b)), i === path.length - 1 ? 6 : 3.5, i === path.length - 1 ? c.lc : c.bg, c.lc, 1.6));
    const b = path[path.length - 1];
    if (isFinite(b) && Math.abs(b) < 50) curve(ctx, P, x => f(b) + g(b) * (x - b), c.warn, 1.5, [5, 4], b - 1.3, b + 1.3);
    dot(ctx, P.X(3), P.Y(0.5), 4, c.good);
    ctx.restore();
  };
  function draw() {
    S.render(); const b = path[path.length - 1], st = status();
    const s = st === 'div' ? ['Diverging: the cost is growing', 'bad'] : st === 'conv' ? ['Converged to the minimum β = 3', 'good'] : ['Walking downhill', ''];
    out.innerHTML = kv([['step', path.length - 1], ['β', fmt(b, 3)], ['J(β)', fmt(f(b), 3)], ['slope dJ/dβ', fmt(g(b), 3)], ['next move −α·slope', fmt(-lr * g(b), 3)], ['', s[0], s[1]]]);
  }
  reset(true);
};

VIZ.gd2d = host => {
  const body = shell(host, 'Gradient descent on a 2-parameter cost surface');
  const r = rng(7), xs = [], ys = []; for (let i = 0; i < 24; i++) { const x = 4 * i / 23; xs.push(x); ys.push(1 + 0.8 * x + 0.35 * gauss(r)); }
  const m = xs.length; let sx = 0, sxx = 0, sy = 0, sxy = 0, syy = 0;
  for (let i = 0; i < m; i++) { sx += xs[i]; sxx += xs[i] * xs[i]; sy += ys[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
  const A = [[1, sx / m], [sx / m, sxx / m]], bv = [sy / m, sxy / m], cc = syy / m;
  const J = (b0, b1) => 0.5 * (A[0][0] * b0 * b0 + 2 * A[0][1] * b0 * b1 + A[1][1] * b1 * b1) - (bv[0] * b0 + bv[1] * b1) + 0.5 * cc;
  const G = (b0, b1) => [A[0][0] * b0 + A[0][1] * b1 - bv[0], A[0][1] * b0 + A[1][1] * b1 - bv[1]];
  const det = A[0][0] * A[1][1] - A[0][1] * A[0][1]; const opt = [(A[1][1] * bv[0] - A[0][1] * bv[1]) / det, (A[0][0] * bv[1] - A[0][1] * bv[0]) / det];
  const tr = A[0][0] + A[1][1], lmax = tr / 2 + Math.sqrt(tr * tr / 4 - det); const Jmin = J(opt[0], opt[1]);
  const xd = [-3, 5], yd = [-1.6, 3.2];
  const S = canvas(body, { ratio: 0.6, min: 260, max: 420, label: 'Contour map of the cost with a gradient descent path. Click to choose a start.' });
  const ctl = div(body, 'ctls'); const btns = div(body, 'btns'); const out = readout(body);
  let lr = 0.12, start = [-2.4, 2.7], path = [], stop = null, bg = null, bgKey = '';
  slider(ctl, { label: 'Learning rate α', min: 0.02, max: 0.4, step: 0.01, value: lr, fmt: v => v.toFixed(2) }, v => { lr = v; reset(); run(); });
  const runB = button(btns, 'Run', () => { if (stop) halt(); else run(); });
  button(btns, 'Reset', () => reset(), 'btn ghost');
  div(btns, 'hint', 'Click the map to choose a starting point.');
  function halt() { if (stop) { stop(); stop = null; } runB.textContent = 'Run'; }
  function st() { const p = path[path.length - 1]; const gr = G(p[0], p[1]); const n = Math.hypot(gr[0], gr[1]); if (!isFinite(n) || n > 1e3) return 'div'; if (n < 2e-3) return 'conv'; return 'run'; }
  function stepOnce() { if (st() !== 'run' || path.length > 400) return false; const p = path[path.length - 1]; const gr = G(p[0], p[1]); path.push([p[0] - lr * gr[0], p[1] - lr * gr[1]]); }
  function run() { halt(); if (RM()) { for (let i = 0; i < 400 && stepOnce() !== false; i++); draw(); return; } runB.textContent = 'Pause'; stop = loop(() => { const ok = stepOnce(); draw(); if (ok === false || st() !== 'run') { halt(); return false; } }, 60); }
  function reset() { halt(); path = [start.slice()]; draw(); }
  S.cv.addEventListener('click', e => { const rc = S.cv.getBoundingClientRect(); const P = frame(S, xd, yd); const b0 = P.ix(e.clientX - rc.left), b1 = P.iy(e.clientY - rc.top); if (b0 < xd[0] || b0 > xd[1] || b1 < yd[0] || b1 > yd[1]) return; start = [b0, b1]; reset(); run(); });
  function background(P, c) {
    const key = [S.w, S.h, c.lc, c.bg].join('|'); if (bg && key === bgKey) return bg; bgKey = key;
    const cell = 4, cw = Math.ceil(P.W / cell), ch = Math.ceil(P.H / cell); const off = document.createElement('canvas'); off.width = cw; off.height = ch;
    const o = off.getContext('2d'); const img = o.createImageData(cw, ch); const L = hex2rgb(c.lc), B = hex2rgb(c.bg);
    let jmax = Math.max(J(xd[0], yd[1]), J(xd[1], yd[0]), J(xd[0], yd[0]), J(xd[1], yd[1])) - Jmin;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const b0 = P.ix(P.L + (i + 0.5) * cell), b1 = P.iy(P.T + (j + 0.5) * cell); const v = Math.sqrt(Math.max(0, J(b0, b1) - Jmin) / jmax);
      const band = Math.floor(v * 16); const a = Math.min(0.55, 0.05 + 0.4 * Math.pow(1 - Math.min(1, v), 2) + (band % 2 ? 0.05 : 0));
      const k = (j * cw + i) * 4; for (let q = 0; q < 3; q++) img.data[k + q] = Math.round(B[q] * (1 - a) + L[q] * a); img.data[k + 3] = 255;
    }
    o.putImageData(img, 0, 0); bg = off; return bg;
  }
  S.draw = () => {
    const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, xd, yd);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(background(P, c), P.L, P.T, P.W, P.H);
    axes(S, P, c, { xl: 'β₀ (intercept)', yl: 'β₁ (slope)', nogrid: true }); clip(S, P);
    ctx.save(); ctx.font = '16px sans-serif'; ctx.fillStyle = c.good; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✕', P.X(opt[0]), P.Y(opt[1])); ctx.restore();
    polyline(ctx, P, path, c.ink, 1.6);
    path.forEach((p, i) => { if (i === 0 || i === path.length - 1 || path.length < 60) dot(ctx, P.X(p[0]), P.Y(p[1]), i === path.length - 1 ? 5 : 2.5, i === path.length - 1 ? c.lc : c.ink); });
    dot(ctx, P.X(path[0][0]), P.Y(path[0][1]), 5, c.bg, c.ink, 2);
    ctx.restore();
  };
  function draw() {
    S.render(); const p = path[path.length - 1], gr = G(p[0], p[1]); const s = st();
    out.innerHTML = kv([['step', path.length - 1], ['β₀', fmt(p[0], 3)], ['β₁', fmt(p[1], 3)], ['J', fmt(J(p[0], p[1]), 4)], ['‖∇J‖', fmt(Math.hypot(gr[0], gr[1]), 4)],
      ['stability limit', 'α < ' + fmt(2 / lmax, 3)], ['', s === 'div' ? 'Diverging' : s === 'conv' ? 'Converged' : (path.length > 400 ? 'Stopped after 400 steps' : 'Descending'), s === 'div' ? 'bad' : s === 'conv' ? 'good' : '']]);
  }
  reset(); for (let i = 0; i < 25; i++) stepOnce(); draw();
};

VIZ.matrix = host => {
  const body = shell(host, 'Matrix multiplication, one cell at a time');
  const A = [[1, 2, 0], [3, -1, 4]], B = [[2, 1], [0, 3], [-1, 2]];
  const C = A.map(r => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
  const n = v => String(v).replace('-', '−');
  const grid = (M, name, id) => `<div class="mx" data-m="${id}"><div class="mx-name">${name} <small>(${M.length}×${M[0].length})</small></div><div class="mx-g" style="grid-template-columns:repeat(${M[0].length},2.4em)">${M.map((r, i) => r.map((v, j) => `<${id === 'C' ? 'button type="button"' : 'span'} class="mx-c" data-i="${i}" data-j="${j}">${n(v)}</${id === 'C' ? 'button' : 'span'}>`).join('')).join('')}</div></div>`;
  const wrap = div(body, 'mx-row', grid(A, 'A', 'A') + '<span class="mx-op">×</span>' + grid(B, 'B', 'B') + '<span class="mx-op">=</span>' + grid(C, 'C = AB', 'C'));
  const out = div(body, 'readout mx-out');
  function pick(i, j) {
    wrap.querySelectorAll('.mx-c').forEach(e => e.classList.remove('hl', 'hl2'));
    wrap.querySelectorAll(`[data-m="A"] .mx-c[data-i="${i}"]`).forEach(e => e.classList.add('hl'));
    wrap.querySelectorAll(`[data-m="B"] .mx-c[data-j="${j}"]`).forEach(e => e.classList.add('hl'));
    wrap.querySelector(`[data-m="C"] .mx-c[data-i="${i}"][data-j="${j}"]`).classList.add('hl2');
    const terms = A[i].map((a, k) => `${n(a)}·${n(B[k][j])}`).join(' + ');
    out.innerHTML = `<span class="kv"><b>C<sub>${i + 1}${j + 1}</sub></b>row ${i + 1} of A · column ${j + 1} of B = ${terms} = <strong>${n(C[i][j])}</strong></span>`;
  }
  wrap.querySelectorAll('[data-m="C"] .mx-c').forEach(e => { const f = () => pick(+e.dataset.i, +e.dataset.j); e.addEventListener('mouseenter', f); e.addEventListener('focus', f); e.addEventListener('click', f); });
  pick(0, 1);
  const chk = div(body, 'mx-shape');
  chk.innerHTML = `<span class="mx-shape-l">Shape checker</span> (<input type="number" min="1" max="9" value="3" aria-label="rows of first">×<input type="number" min="1" max="9" value="2" aria-label="columns of first">) × (<input type="number" min="1" max="9" value="2" aria-label="rows of second">×<input type="number" min="1" max="9" value="4" aria-label="columns of second">) <output></output>`;
  const ins = chk.querySelectorAll('input'), o = chk.querySelector('output');
  const upd = () => { const [a, b, c2, d] = [...ins].map(i => +i.value); o.innerHTML = b === c2 ? `= <b class="ok">(${a}×${d})</b>` : `<b class="no">undefined: inner sizes ${b} ≠ ${c2}</b>`; };
  ins.forEach(i => i.addEventListener('input', upd)); upd();
};

VIZ.dot = host => {
  const body = shell(host, 'Dot product, angle and projection');
  const S = canvas(body, { square: true, max: 380, cls: 'cv-sq', label: 'Two draggable vectors on a grid' });
  const chips = div(body, 'chips'); const out = readout(body);
  let u = [3, 1.5], v = [1, 3], drag = null;
  [['Aligned', [[3, 2], [1.5, 1]]], ['Orthogonal', [[3, 1], [-1, 3]]], ['Opposite', [[3, 1.5], [-2, -1]]], ['Obtuse', [[3, 1], [-2, 2.5]]]].forEach(([n, [a, b]]) => button(chips, n, () => { u = a.slice(); v = b.slice(); draw(); }, 'chip'));
  div(chips, 'hint', 'Drag either arrow tip.');
  const P0 = () => frame(S, [-5, 5], [-5, 5], { l: 8, r: 8, t: 8, b: 8 });
  function ptr(e) { const rc = S.cv.getBoundingClientRect(); const P = P0(); return [P.ix(e.clientX - rc.left), P.iy(e.clientY - rc.top), e.clientX - rc.left, e.clientY - rc.top]; }
  S.cv.style.touchAction = 'none';
  S.cv.addEventListener('pointerdown', e => { const [x, y, px, py] = ptr(e); const P = P0(); const du = Math.hypot(P.X(u[0]) - px, P.Y(u[1]) - py), dv = Math.hypot(P.X(v[0]) - px, P.Y(v[1]) - py); drag = du < dv ? (du < 30 ? 'u' : null) : (dv < 30 ? 'v' : null); if (!drag) drag = du < dv ? 'u' : 'v'; S.cv.setPointerCapture(e.pointerId); move(x, y); });
  S.cv.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = ptr(e); move(x, y); });
  S.cv.addEventListener('pointerup', () => { drag = null; });
  function move(x, y) { const q = [Math.max(-4.8, Math.min(4.8, Math.round(x * 10) / 10)), Math.max(-4.8, Math.min(4.8, Math.round(y * 10) / 10))]; if (Math.hypot(q[0], q[1]) < 0.2) return; if (drag === 'u') u = q; else v = q; draw(); }
  S.draw = () => {
    const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = P0();
    ctx.save(); ctx.strokeStyle = c.line; ctx.lineWidth = 1; for (let i = -5; i <= 5; i++) { ctx.globalAlpha = i === 0 ? 1 : 0.5; ctx.beginPath(); ctx.moveTo(P.X(i), P.Y(-5)); ctx.lineTo(P.X(i), P.Y(5)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(P.X(-5), P.Y(i)); ctx.lineTo(P.X(5), P.Y(i)); ctx.stroke(); } ctx.restore();
    const d = u[0] * v[0] + u[1] * v[1], vv = v[0] * v[0] + v[1] * v[1], k = d / vv, p = [k * v[0], k * v[1]];
    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.X(u[0]), P.Y(u[1])); ctx.lineTo(P.X(p[0]), P.Y(p[1])); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(P.X(-v[0] * 10), P.Y(-v[1] * 10)); ctx.lineTo(P.X(v[0] * 10), P.Y(v[1] * 10)); ctx.globalAlpha = 0.35; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = c.warn; ctx.lineWidth = 6; ctx.globalAlpha = 0.55; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(P.X(0), P.Y(0)); ctx.lineTo(P.X(p[0]), P.Y(p[1])); ctx.stroke(); ctx.restore();
    const au = Math.atan2(-u[1], u[0]), av = Math.atan2(-v[1], v[0]); let da = av - au; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
    ctx.save(); ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(P.X(0), P.Y(0), 26, au, au + da, da < 0); ctx.stroke(); ctx.restore();
    arrow(ctx, P.X(0), P.Y(0), P.X(u[0]), P.Y(u[1]), c.a, 3, 12); arrow(ctx, P.X(0), P.Y(0), P.X(v[0]), P.Y(v[1]), c.b, 3, 12);
    text(ctx, 'u', P.X(u[0]) + 8, P.Y(u[1]) - 8, c.a, 'left', 'middle', 'bold 14px "Geist Mono", monospace');
    text(ctx, 'v', P.X(v[0]) + 8, P.Y(v[1]) - 8, c.b, 'left', 'middle', 'bold 14px "Geist Mono", monospace');
  };
  function draw() {
    S.render(); const d = u[0] * v[0] + u[1] * v[1], nu = Math.hypot(...u), nv = Math.hypot(...v), cs = d / (nu * nv), th = Math.acos(Math.max(-1, Math.min(1, cs))) * 180 / Math.PI;
    const s = Math.abs(cs) < 0.02 ? ['Orthogonal: u·v = 0', 'good'] : cs > 0.98 ? ['Nearly aligned', 'good'] : cs < -0.98 ? ['Opposite directions', 'bad'] : cs > 0 ? ['Acute angle: positive', ''] : ['Obtuse angle: negative', 'warn'];
    out.innerHTML = kv([['u', `(${fmt(u[0], 1)}, ${fmt(u[1], 1)})`], ['v', `(${fmt(v[0], 1)}, ${fmt(v[1], 1)})`], ['u·v', `${fmt(u[0], 1)}·${fmt(v[0], 1)} + ${fmt(u[1], 1)}·${fmt(v[1], 1)} = ${fmt(d, 2)}`], ['‖u‖', fmt(nu, 2)], ['‖v‖', fmt(nv, 2)], ['cos θ', fmt(cs, 3)], ['θ', fmt(th, 1) + '°'], ['projection ‖u‖cosθ', fmt(d / nv, 2)], ['', s[0], s[1]]]);
  }
  draw();
};

/* =============================== L2 =============================== */

VIZ.polyFeat = host => {
  const body = shell(host, 'PolynomialFeatures, generated live');
  const ctl = div(body, 'pf-ctl');
  ctl.innerHTML = `<label>X₁ <input type="number" step="any" value="2" aria-label="X1"></label><label>X₂ <input type="number" step="any" value="3" aria-label="X2"></label>`;
  const degS = seg(ctl, [[1, 'degree 1'], [2, 'degree 2'], [3, 'degree 3']], 2, d => { deg = d; upd(); }, 'Degree');
  const out = div(body, 'pf-out'); const note = div(body, 'readout'); let deg = 2;
  const ins = ctl.querySelectorAll('input'); ins.forEach(i => i.addEventListener('input', upd));
  const sup = n => ['', '', '²', '³'][n] || '';
  function upd() {
    const a = +ins[0].value || 0, b = +ins[1].value || 0; const terms = [];
    for (let d = 0; d <= deg; d++) for (let i = d; i >= 0; i--) { const j = d - i; const name = d === 0 ? '1' : (i ? 'X₁' + sup(i) : '') + (j ? 'X₂' + sup(j) : ''); const kind = d === 0 ? 'bias' : d === 1 ? 'orig' : (i && j ? 'inter' : 'pow'); terms.push([name, Math.pow(a, i) * Math.pow(b, j), kind]); }
    out.innerHTML = terms.map(([n, v, k]) => `<span class="pf ${k}"><i>${n}</i><b>${+v.toFixed(4)}</b></span>`).join('');
    note.innerHTML = kv([['columns', terms.length], ['legend', '<span class="pf-l bias">bias</span> <span class="pf-l orig">original</span> <span class="pf-l pow">power</span> <span class="pf-l inter">interaction</span>']]);
  }
  upd(); void degS;
};

function sinData(seed, n, noise) { const r = rng(seed), xs = [], ys = []; for (let i = 0; i < n; i++) { const x = r(); xs.push(x); ys.push(Math.sin(2 * Math.PI * x) + noise * gauss(r)); } return { xs, ys }; }
const truth = x => Math.sin(2 * Math.PI * x);

VIZ.polyLab = host => {
  const body = shell(host, 'Polynomial regression lab · degree, λ, train vs test');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.75, min: 230, max: 340, caption: 'Fit (solid) vs truth sin 2πx (dashed)', label: 'Polynomial fit to noisy data' });
  const B = canvas(div(grid, ''), { ratio: 0.75, min: 230, max: 340, caption: 'RMSE vs degree at the current λ', label: 'Training and test error versus polynomial degree' });
  const Cc = canvas(body, { ratio: 0.18, min: 110, max: 150, caption: 'Coefficient sizes |βₖ| (log scale): watch them explode when overfitting', label: 'Bar chart of coefficient magnitudes' });
  const ctl = div(body, 'ctls'); const opts = div(body, 'btns'); const out = readout(body);
  let seed = 3, deg = 3, ll = -9, showTest = true, tr, te, fits = [];
  const lamOf = v => v <= -9 ? 0 : Math.pow(10, v);
  slider(ctl, { label: 'Polynomial degree M', min: 1, max: 12, step: 1, value: deg }, v => { deg = v; draw(); });
  slider(ctl, { label: 'Ridge strength log₁₀ λ', min: -9, max: 1, step: 0.25, value: ll, fmt: v => v <= -9 ? 'λ = 0' : 'λ = ' + (lamOf(v) < 0.01 ? lamOf(v).toExponential(0) : +lamOf(v).toPrecision(2)) }, v => { ll = v; refit(); draw(); });
  check(opts, 'Show test points', true, v => { showTest = v; draw(); });
  button(opts, 'New sample', () => { seed++; data(); refit(); draw(); }, 'btn ghost');
  function data() { tr = sinData(seed * 17 + 1, 15, 0.25); te = sinData(seed * 31 + 5, 80, 0.25); }
  function refit() { fits = []; for (let d = 1; d <= 12; d++) { const c = polyFit(tr.xs, tr.ys, d, lamOf(ll)); fits[d] = { c, tr: rmse(c, tr.xs, tr.ys), te: rmse(c, te.xs, te.ys) }; } }
  A.draw = () => {
    const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, [0, 1], [-1.9, 1.9], { l: 40 }); axes(A, P, c, { xl: 'x', yl: 'y' }); clip(A, P);
    curve(ctx, P, truth, c.muted, 1.5, [5, 4]);
    if (showTest) te.xs.forEach((x, i) => dot(ctx, P.X(x), P.Y(te.ys[i]), 2.5, null, rgba(c.b, 0.7), 1.2));
    curve(ctx, P, x => polyEval(fits[deg].c, x), c.lc, 2.5);
    tr.xs.forEach((x, i) => dot(ctx, P.X(x), P.Y(tr.ys[i]), 4.5, c.a, c.bg, 1.5)); ctx.restore();
  };
  B.draw = () => {
    const c = cols(B.cv), ctx = B.ctx; B.clear(); const P = frame(B, [0.5, 12.5], [0, 1.0], { l: 44 }); axes(B, P, c, { xl: 'degree M', yl: 'RMSE', xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }); clip(B, P);
    ctx.fillStyle = rgba(c.lc, 0.12); ctx.fillRect(P.X(deg - 0.5), P.T, P.X(deg + 0.5) - P.X(deg - 0.5), P.H);
    const ptsTr = [], ptsTe = []; for (let d = 1; d <= 12; d++) { ptsTr.push([d, Math.min(5, fits[d].tr)]); ptsTe.push([d, Math.min(5, fits[d].te)]); }
    polyline(ctx, P, ptsTr, c.a, 2); polyline(ctx, P, ptsTe, c.b, 2);
    ptsTr.forEach(([x, y]) => dot(ctx, P.X(x), P.Y(y), 3, c.a)); ptsTe.forEach(([x, y]) => dot(ctx, P.X(x), P.Y(y), 3, c.b));
    ctx.restore(); legend(B, [['train', c.a], ['test', c.b]], P.L + 10, P.T + 12);
  };
  Cc.draw = () => {
    const c = cols(Cc.cv), ctx = Cc.ctx; Cc.clear(); const co = fits[deg].c; const P = frame(Cc, [-0.5, 12.5], [-2, 6], { l: 44, b: 22, t: 8 });
    axes(Cc, P, c, { xt: [0, 2, 4, 6, 8, 10, 12], yt: [-2, 0, 2, 4, 6], fy: v => '10' + ({ '-2': '⁻²', 0: '⁰', 2: '²', 4: '⁴', 6: '⁶' }[v] || ''), fx: v => 'β' + v });
    co.forEach((b, k) => { const lv = Math.max(-2, Math.min(6, Math.log10(Math.abs(b) + 1e-12))); const x = P.X(k); ctx.fillStyle = k ? c.lc : c.muted; ctx.fillRect(x - 5, P.Y(lv), 10, P.Y(-2) - P.Y(lv)); });
  };
  function draw() {
    A.render(); B.render(); Cc.render();
    const f = fits[deg]; let best = 1; for (let d = 1; d <= 12; d++) if (fits[d].te < fits[best].te) best = d;
    const mx = Math.max(...f.c.slice(1).map(Math.abs));
    const verdict = f.tr > 0.4 ? ['Underfitting: high bias', 'warn'] : (f.te > fits[best].te * 1.35 && f.te - f.tr > 0.12 ? ['Overfitting: high variance', 'bad'] : ['Good balance', 'good']);
    out.innerHTML = kv([['train RMSE', fmt(f.tr, 3)], ['test RMSE', fmt(f.te, 3)], ['best test degree', best], ['largest |β|', mx > 1e4 ? mx.toExponential(1) : fmt(mx, 2)], ['', verdict[0], verdict[1]]]);
  }
  data(); refit(); draw();
};

VIZ.darts = host => {
  const body = shell(host, 'Bias and variance on a dartboard');
  const grid = div(body, 'darts');
  const cfg = [[0, 0, 0.12, 'Low bias · low variance', 'the goal'], [0, 0, 0.38, 'Low bias · high variance', 'overfitting'], [0.5, -0.32, 0.11, 'High bias · low variance', 'underfitting'], [0.5, -0.32, 0.38, 'High bias · high variance', 'worst of both']];
  let seed = 1, shown = 14, stop = null;
  const boards = cfg.map(([dx, dy, s, t, sub]) => { const w = div(grid, 'dart'); const S = canvas(w, { square: true, max: 220, label: t }); div(w, 'dart-cap', `<b>${t}</b><span>${sub}</span>`); return { S, dx, dy, s }; });
  boards.forEach((b, bi) => { b.S.draw = () => {
    const c = cols(b.S.cv), ctx = b.S.ctx, S = b.S; S.clear(); const R = S.w / 2 - 6, cx = S.w / 2, cy = S.h / 2;
    for (let k = 5; k >= 1; k--) { dot(ctx, cx, cy, R * k / 5, k % 2 ? rgba(c.lc, 0.07) : c.bg, c.line, 1); }
    dot(ctx, cx, cy, R * 0.09, c.bad);
    const r = rng(seed * 101 + bi * 7);
    for (let i = 0; i < shown; i++) { const x = cx + R * (b.dx + b.s * gauss(r)), y = cy + R * (b.dy + b.s * gauss(r)); ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
  }; });
  const btns = div(body, 'btns');
  button(btns, 'Throw again', () => { seed++; if (stop) stop(); if (RM()) { shown = 14; boards.forEach(b => b.S.render()); return; } shown = 0; stop = loop(() => { shown++; boards.forEach(b => b.S.render()); if (shown >= 14) return false; }, 70); });
  div(btns, 'hint', 'Bias = how far the centre of the throws is from the bullseye. Variance = how scattered they are.');
  boards.forEach(b => b.S.render());
};

VIZ.bvSim = host => {
  const body = shell(host, 'Bias-variance simulation · 30 training sets per degree');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.75, min: 230, max: 340, caption: '30 fits (thin), their average (thick), truth (dashed)', label: 'Many polynomial fits from resampled datasets' });
  const B = canvas(div(grid, ''), { ratio: 0.75, min: 230, max: 340, caption: 'Decomposition of expected test error', label: 'Bias squared, variance and total error versus degree' });
  const ctl = div(body, 'ctls'); const btns = div(body, 'btns'); const out = readout(body);
  const R = 30, N = 22, SIG = 0.3, DMAX = 9, GX = Array.from({ length: 61 }, (_, i) => 0.03 + 0.94 * i / 60);
  let deg = 3, seed = 1, fits = {}, dec = {};
  slider(ctl, { label: 'Polynomial degree', min: 1, max: DMAX, step: 1, value: deg }, v => { deg = v; draw(); });
  button(btns, 'Resample all training sets', () => { seed++; compute(); draw(); }, 'btn ghost');
  function compute() {
    const sets = []; for (let r = 0; r < R; r++) sets.push(sinData(seed * 1000 + r, N, SIG));
    for (let d = 1; d <= DMAX; d++) {
      fits[d] = sets.map(s => polyFit(s.xs, s.ys, d, 1e-6));
      let b2 = 0, v = 0; GX.forEach(x => { const p = fits[d].map(c => polyEval(c, x)); const mu = p.reduce((a, b) => a + b, 0) / R; b2 += (mu - truth(x)) ** 2; v += p.reduce((a, b) => a + (b - mu) ** 2, 0) / R; });
      dec[d] = { b2: b2 / GX.length, v: v / GX.length };
    }
  }
  A.draw = () => {
    const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, [0, 1], [-2, 2], { l: 40 }); axes(A, P, c, { xl: 'x', yl: 'y' }); clip(A, P);
    fits[deg].forEach(co => curve(ctx, P, x => polyEval(co, x), rgba(c.lc, 0.28), 1.2));
    curve(ctx, P, truth, c.ink, 1.5, [5, 4]);
    curve(ctx, P, x => fits[deg].reduce((s, co) => s + polyEval(co, x), 0) / R, c.ink, 3);
    ctx.restore();
  };
  B.draw = () => {
    const c = cols(B.cv), ctx = B.ctx; B.clear(); let ymax = 0; for (let d = 1; d <= DMAX; d++) ymax = Math.max(ymax, Math.min(0.6, dec[d].b2 + dec[d].v + SIG * SIG));
    const P = frame(B, [0.5, DMAX + 0.5], [0, Math.max(0.3, ymax * 1.1)], { l: 46 }); axes(B, P, c, { xl: 'degree (complexity)', yl: 'error', xt: [1, 2, 3, 4, 5, 6, 7, 8, 9] }); clip(B, P);
    ctx.fillStyle = rgba(c.lc, 0.12); ctx.fillRect(P.X(deg - 0.5), P.T, P.X(deg + 0.5) - P.X(deg - 0.5), P.H);
    const ser = (f, col, w, dash) => { const pts = []; for (let d = 1; d <= DMAX; d++) pts.push([d, f(dec[d])]); polyline(ctx, P, pts, col, w, dash); pts.forEach(([x, y]) => dot(ctx, P.X(x), P.Y(y), 2.5, col)); };
    ser(e => e.b2, c.a, 2); ser(e => e.v, c.b, 2); ser(e => e.b2 + e.v + SIG * SIG, c.ink, 2.5);
    polyline(ctx, P, [[0.5, SIG * SIG], [DMAX + 0.5, SIG * SIG]], c.muted, 1.2, [4, 4]);
    ctx.restore(); legend(B, [['bias²', c.a], ['variance', c.b], ['total', c.ink], ['σ²', c.muted, true]], P.L + 8, P.T + 12);
  };
  function draw() { A.render(); B.render(); const e = dec[deg]; let best = 1; for (let d = 1; d <= DMAX; d++) if (dec[d].b2 + dec[d].v < dec[best].b2 + dec[best].v) best = d; out.innerHTML = kv([['bias²', fmt(e.b2, 4)], ['variance', fmt(e.v, 4)], ['σ² (noise)', fmt(SIG * SIG, 3)], ['expected test error', fmt(e.b2 + e.v + SIG * SIG, 4)], ['best degree', best, 'good']]); }
  compute(); draw();
};

VIZ.geometry = host => {
  const body = shell(host, 'Why Lasso hits zero: budget circle vs diamond');
  const S = canvas(body, { square: true, max: 400, cls: 'cv-sq', label: 'RSS ellipses meeting a circular or diamond-shaped coefficient budget' });
  const ctl = div(body, 'ctls'); const out = readout(body);
  const bh = [2.2, 0.7], M = [[1.2, 0.6], [0.6, 1.0]];
  const Q = (b1, b2) => { const d1 = b1 - bh[0], d2 = b2 - bh[1]; return M[0][0] * d1 * d1 + 2 * M[0][1] * d1 * d2 + M[1][1] * d2 * d2; };
  const tr = M[0][0] + M[1][1], det = M[0][0] * M[1][1] - M[0][1] ** 2, l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
  const e1 = (() => { const v = [M[0][1], l1 - M[0][0]]; const n = Math.hypot(...v); return [v[0] / n, v[1] / n]; })(), e2 = [-e1[1], e1[0]];
  let s = 1.4, mode = 'l1';
  const modeS = seg(ctl, [['l2', 'Ridge (L2): circle'], ['l1', 'Lasso (L1): diamond']], mode, v => { mode = v; draw(); }, 'Penalty');
  slider(ctl, { label: 'Budget t (size of the allowed region)', min: 0.2, max: 3, step: 0.05, value: s, fmt: v => v.toFixed(2) }, v => { s = v; draw(); });
  function solveC() {
    const inside = mode === 'l2' ? Math.hypot(...bh) <= s : Math.abs(bh[0]) + Math.abs(bh[1]) <= s; if (inside) return bh.slice();
    let best = null, bq = Infinity; const K = 2880;
    for (let i = 0; i < K; i++) { const t = i / K; let p; if (mode === 'l2') { const a = 2 * Math.PI * t; p = [s * Math.cos(a), s * Math.sin(a)]; } else { const q = t * 4, k = Math.floor(q), f = q - k; const C = [[s, 0], [0, s], [-s, 0], [0, -s], [s, 0]]; p = [C[k][0] + (C[k + 1][0] - C[k][0]) * f, C[k][1] + (C[k + 1][1] - C[k][1]) * f]; } const v = Q(p[0], p[1]); if (v < bq) { bq = v; best = p; } }
    return best;
  }
  function ellipse(ctx, P, q, col, w, dash) { const r = Math.sqrt(q); ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; if (dash) ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= 120; i++) { const a = 2 * Math.PI * i / 120; const x = bh[0] + r * (e1[0] * Math.cos(a) / Math.sqrt(l1) + e2[0] * Math.sin(a) / Math.sqrt(l2)); const y = bh[1] + r * (e1[1] * Math.cos(a) / Math.sqrt(l1) + e2[1] * Math.sin(a) / Math.sqrt(l2)); i ? ctx.lineTo(P.X(x), P.Y(y)) : ctx.moveTo(P.X(x), P.Y(y)); } ctx.stroke(); ctx.restore(); }
  S.draw = () => {
    const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [-1.6, 3.4], [-1.6, 3.4], { l: 34, b: 30, r: 10, t: 10 });
    axes(S, P, c, { xl: 'β₁', yl: 'β₂', xt: [-1, 0, 1, 2, 3], yt: [-1, 0, 1, 2, 3] }); clip(S, P);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.X(0), P.T); ctx.lineTo(P.X(0), P.T + P.H); ctx.moveTo(P.L, P.Y(0)); ctx.lineTo(P.L + P.W, P.Y(0)); ctx.stroke();
    const sol = solveC(), qs = Q(sol[0], sol[1]);
    ctx.save(); ctx.fillStyle = rgba(c.lc, 0.18); ctx.strokeStyle = c.lc; ctx.lineWidth = 2; ctx.beginPath();
    if (mode === 'l2') ctx.arc(P.X(0), P.Y(0), P.X(s) - P.X(0), 0, 7); else { ctx.moveTo(P.X(s), P.Y(0)); ctx.lineTo(P.X(0), P.Y(s)); ctx.lineTo(P.X(-s), P.Y(0)); ctx.lineTo(P.X(0), P.Y(-s)); ctx.closePath(); }
    ctx.fill(); ctx.stroke(); ctx.restore();
    [0.15, 0.5, 1, 2, 3.5, 5.5].forEach(k => ellipse(ctx, P, Math.max(0.02, qs) * k, rgba(c.ink, 0.25), 1));
    if (qs > 1e-6) ellipse(ctx, P, qs, c.warn, 2.2);
    dot(ctx, P.X(bh[0]), P.Y(bh[1]), 4.5, c.ink); text(ctx, 'OLS β̂', P.X(bh[0]) + 8, P.Y(bh[1]) - 10, c.ink);
    dot(ctx, P.X(sol[0]), P.Y(sol[1]), 7, c.warn, c.bg, 2);
    ctx.restore();
  };
  function draw() {
    S.render(); const sol = solveC(); const z = Math.abs(sol[1]) < 0.01;
    out.innerHTML = kv([['β₁', fmt(sol[0], 3)], ['β₂', z ? '0 (exactly)' : fmt(sol[1], 3), z ? 'good' : ''], ['RSS increase', fmt(Q(sol[0], sol[1]), 3)],
      ['', z ? 'The ellipse touched a corner on the β₁ axis: β₂ is dropped (feature selection).' : (mode === 'l2' ? 'The circle has no corners: both coefficients shrink but stay non-zero.' : (Q(sol[0], sol[1]) < 1e-9 ? 'OLS solution is inside the budget: no shrinkage.' : 'Both non-zero for this budget; shrink t to reach a corner.')), z ? 'good' : '']]);
  }
  draw(); void modeS;
};

VIZ.paths = host => {
  const body = shell(host, 'Regularization paths · Ridge → Elastic Net → Lasso');
  const S = canvas(body, { ratio: 0.55, min: 260, max: 380, label: 'Coefficient paths versus regularization strength' });
  const ctl = div(body, 'ctls'); const out = div(body, 'coef-table');
  const m = 80, p = 6, r = rng(11), X = [], Y = []; const tb = [2.5, -2, 0, 1.0, 1.2, 0];
  for (let i = 0; i < m; i++) { const x = []; for (let j = 0; j < p; j++) x.push(gauss(r)); x[3] = 0.85 * x[0] + 0.5 * gauss(r); X.push(x); }
  for (let j = 0; j < p; j++) { let mu = 0, sd = 0; X.forEach(x => mu += x[j]); mu /= m; X.forEach(x => sd += (x[j] - mu) ** 2); sd = Math.sqrt(sd / m); X.forEach(x => x[j] = (x[j] - mu) / sd); }
  X.forEach(x => Y.push(x.reduce((s, v, j) => s + v * tb[j], 0) + 1.0 * gauss(r))); const ym = Y.reduce((a, b) => a + b, 0) / m; for (let i = 0; i < m; i++) Y[i] -= ym;
  const LG = Array.from({ length: 81 }, (_, i) => 1.3 - 4.3 * i / 80);
  let alpha = 1, cur = -0.6; const cache = {};
  function pathsFor(a) {
    const key = a.toFixed(2); if (cache[key]) return cache[key];
    const beta = new Array(p).fill(0), res = Y.slice(), out = [];
    LG.forEach(lg => { const lam = Math.pow(10, lg);
      for (let it = 0; it < 300; it++) { let mx = 0; for (let j = 0; j < p; j++) { let rho = 0; for (let i = 0; i < m; i++) rho += X[i][j] * (res[i] + X[i][j] * beta[j]); rho /= m; const th = lam * a; const nb = (Math.sign(rho) * Math.max(Math.abs(rho) - th, 0)) / (1 + lam * (1 - a)); const d = nb - beta[j]; if (d) { for (let i = 0; i < m; i++) res[i] -= X[i][j] * d; beta[j] = nb; mx = Math.max(mx, Math.abs(d)); } } if (mx < 1e-7) break; }
      out.push(beta.slice()); });
    const o = LG.map((lg, i) => [lg, out[i]]).sort((u, v) => u[0] - v[0]); return (cache[key] = o);
  }
  slider(ctl, { label: 'Mix α (0 = Ridge, 1 = Lasso)', min: 0, max: 1, step: 0.05, value: alpha, fmt: v => v.toFixed(2) + (v === 0 ? ' Ridge' : v === 1 ? ' Lasso' : ' Elastic Net') }, v => { alpha = v; draw(); });
  slider(ctl, { label: 'Strength log₁₀ λ', min: -3, max: 1.3, step: 0.05, value: cur, fmt: v => 'λ = ' + (+Math.pow(10, v).toPrecision(2)) }, v => { cur = v; draw(); });
  const at = (pp, lg) => { let k = 0; while (k < pp.length - 1 && pp[k + 1][0] <= lg) k++; return pp[k][1]; };
  S.draw = () => {
    const c = cols(S.cv), ctx = S.ctx; S.clear(); const pp = pathsFor(alpha);
    const P = frame(S, [-3, 1.3], [-2.4, 2.9], { l: 46 }); axes(S, P, c, { xl: 'log₁₀ λ  (stronger penalty →)', yl: 'coefficient βⱼ' }); clip(S, P);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.L, P.Y(0)); ctx.lineTo(P.L + P.W, P.Y(0)); ctx.stroke();
    for (let j = 0; j < p; j++) polyline(ctx, P, pp.map(([lg, b]) => [lg, b[j]]), c.series[j], 2.2);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = c.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.X(cur), P.T); ctx.lineTo(P.X(cur), P.T + P.H); ctx.stroke(); ctx.setLineDash([]);
    const b = at(pp, cur); for (let j = 0; j < p; j++) dot(ctx, P.X(cur), P.Y(b[j]), 4, c.series[j], c.bg, 1.5);
    ctx.restore();
  };
  function draw() {
    S.render(); const b = at(pathsFor(alpha), cur); const c = cols(S.cv); const names = ['x₁', 'x₂', 'x₃ (useless)', 'x₄ (≈ x₁)', 'x₅', 'x₆ (useless)'];
    out.innerHTML = b.map((v, j) => `<span class="cf${Math.abs(v) < 1e-6 ? ' zero' : ''}"><i style="background:${c.series[j]}"></i>${names[j]}<b>${Math.abs(v) < 1e-6 ? '0' : fmt(v, 2)}</b></span>`).join('') + `<span class="cf note">${b.filter(v => Math.abs(v) < 1e-6).length} of 6 coefficients are exactly 0</span>`;
  }
  draw();
};

})();

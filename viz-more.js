/* Interactive labs: Lecture 3A, 3B, 4, 5 */
(function () {
'use strict';
const { VIZ, rng, gauss, cols, hex2rgb, rgba, fmt, div, shell, slider, button, seg, check, canvas, frame, axes, clip, curve, polyline, dot, text, arrow, legend, loop, readout, kv, FONT_S, RM } = window.VZ;
const sig = z => 1 / (1 + Math.exp(-z));
function tag(ctx, s, x, y, col, bg) { ctx.save(); ctx.font = FONT_S; const w = ctx.measureText(s).width + 10; ctx.fillStyle = bg; ctx.globalAlpha = 0.9; ctx.fillRect(x - w, y - 9, w, 18); ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(s, x - 5, y); ctx.restore(); }

/* =============================== L3A =============================== */

VIZ.sigmoid = host => {
  const body = shell(host, 'Logistic regression: log-odds line ↔ probability curve ↔ likelihood');
  const D = {
    lecture: { x: [-5, -4, -2, -1, 0, 2, 3, 4, 5], y: [0, 0, 0, 0, 0, 1, 1, 1, 1] },
    noisy: { x: [-5, -4, -3, -2, -1, -0.5, 0, 0.5, 1, 2, 3, 4, 5], y: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1] }
  };
  let ds = 'noisy', b0 = 0, b1 = 0.4, stop = null, iters = 0;
  const top = div(body, 'btns');
  const dsS = seg(top, [['noisy', 'Overlapping data'], ['lecture', 'Lecture data (separable)']], ds, v => { ds = v; halt(); iters = 0; draw(); }, 'Dataset');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.8, min: 230, max: 330, caption: 'Log-odds space: z = β₀ + β₁x is a straight line', label: 'Log-odds line with class points at plus and minus infinity' });
  const B = canvas(div(grid, ''), { ratio: 0.8, min: 230, max: 330, caption: 'Probability space: p̂ = σ(z), red bars = 1 − P(what happened)', label: 'Sigmoid curve with data points' });
  const ctl = div(body, 'ctls'); const btns = div(body, 'btns'); const out = readout(body);
  const s0 = slider(ctl, { label: 'Intercept β₀', min: -6, max: 6, step: 0.05, value: b0, fmt: v => v.toFixed(2) }, v => { halt(); b0 = v; draw(); });
  const s1 = slider(ctl, { label: 'Slope β₁', min: -1, max: 6, step: 0.05, value: b1, fmt: v => v.toFixed(2) }, v => { halt(); b1 = v; draw(); });
  const fitB = button(btns, 'Fit with gradient descent', () => { if (stop) halt(); else fit(); });
  button(btns, 'Reset', () => { halt(); b0 = 0; b1 = 0.4; iters = 0; s0.set(b0); s1.set(b1); draw(); }, 'btn ghost');
  function halt() { if (stop) { stop(); stop = null; } fitB.textContent = 'Fit with gradient descent'; }
  function gdStep() { const { x, y } = D[ds]; let g0 = 0, g1 = 0; x.forEach((xi, i) => { const e = sig(b0 + b1 * xi) - y[i]; g0 += e; g1 += e * xi; }); b0 -= 0.5 * g0 / x.length; b1 -= 0.5 * g1 / x.length; iters++; }
  function fit() { halt(); if (RM()) { for (let i = 0; i < 1500; i++) gdStep(); s0.set(b0); s1.set(b1); draw(); return; } fitB.textContent = 'Pause'; let n = 0; stop = loop(() => { for (let k = 0; k < 6; k++) gdStep(); n += 6; s0.set(Math.max(-6, Math.min(6, b0))); s1.set(Math.min(6, b1)); draw(); if (n >= 900) { halt(); return false; } }, 16); }
  function stats() { const { x, y } = D[ds]; let L = 1, ll = 0, acc = 0; const ps = x.map((xi, i) => { const p = sig(b0 + b1 * xi); const q = y[i] ? p : 1 - p; L *= q; ll += Math.log(Math.max(q, 1e-300)); if ((p >= 0.5 ? 1 : 0) === y[i]) acc++; return q; }); return { L, ll, loss: -ll / x.length, acc: acc / x.length, ps }; }
  A.draw = () => {
    const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, [-6, 6], [-8, 8], { l: 40 }); axes(A, P, c, { xl: 'income x', yl: 'log-odds z' }); clip(A, P);
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.L, P.Y(0)); ctx.lineTo(P.L + P.W, P.Y(0)); ctx.stroke();
    curve(ctx, P, x => b0 + b1 * x, c.lc, 2.5);
    const { x, y } = D[ds];
    x.forEach((xi, i) => { const z = b0 + b1 * xi; const yy = y[i] ? P.T + 8 : P.T + P.H - 8; ctx.setLineDash([3, 3]); ctx.strokeStyle = rgba(y[i] ? c.b : c.a, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(xi), yy); ctx.lineTo(P.X(xi), P.Y(z)); ctx.stroke(); ctx.setLineDash([]);
      arrow(ctx, P.X(xi), y[i] ? P.T + 22 : P.T + P.H - 22, P.X(xi), yy, y[i] ? c.b : c.a, 2, 7); dot(ctx, P.X(xi), P.Y(z), 3.5, c.lc); });
    ctx.restore(); tag(ctx, '+∞ (paid)', P.L + P.W - 4, P.T + 30, c.b, c.bg); tag(ctx, '−∞ (default)', P.L + P.W - 4, P.T + P.H - 30, c.a, c.bg);
  };
  B.draw = () => {
    const c = cols(B.cv), ctx = B.ctx; B.clear(); const P = frame(B, [-6, 6], [-0.06, 1.06], { l: 40 }); axes(B, P, c, { xl: 'income x', yl: 'P(y = 1)', yt: [0, 0.25, 0.5, 0.75, 1] }); clip(B, P);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.L, P.Y(0.5)); ctx.lineTo(P.L + P.W, P.Y(0.5)); ctx.stroke();
    if (Math.abs(b1) > 1e-6) { const xb = -b0 / b1; ctx.beginPath(); ctx.moveTo(P.X(xb), P.T); ctx.lineTo(P.X(xb), P.T + P.H); ctx.stroke(); } ctx.setLineDash([]);
    curve(ctx, P, x => sig(b0 + b1 * x), c.lc, 2.5);
    const { x, y } = D[ds];
    x.forEach((xi, i) => { const p = sig(b0 + b1 * xi); ctx.strokeStyle = rgba(c.bad, 0.75); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P.X(xi), P.Y(y[i])); ctx.lineTo(P.X(xi), P.Y(p)); ctx.stroke(); dot(ctx, P.X(xi), P.Y(y[i]), 5, y[i] ? c.b : c.a, c.bg, 1.5); });
    ctx.restore();
  };
  function draw() {
    A.render(); B.render(); const s = stats();
    const prod = s.ps.slice(0, 6).map(q => q.toFixed(2)).join(' × ') + (s.ps.length > 6 ? ' × …' : '');
    const sep = ds === 'lecture' && iters > 0 ? ['Separable data: β keeps growing; the MLE does not exist', 'warn'] : (iters > 0 ? ['Converged near the maximum likelihood', 'good'] : ['', '']);
    out.innerHTML = kv([['likelihood L', s.L < 1e-4 ? s.L.toExponential(2) : fmt(s.L, 4)], ['= ', prod], ['ln L', fmt(s.ll, 3)], ['log loss', fmt(s.loss, 3)], ['accuracy @0.5', Math.round(s.acc * 100) + '%'], ['boundary x', Math.abs(b1) > 1e-6 ? fmt(-b0 / b1, 2) : 'n/a'], ...(iters ? [['GD iterations', iters]] : []), ...(sep[0] ? [['', sep[0], sep[1]]] : [])]);
  }
  draw(); void dsS;
};

VIZ.odds = host => {
  const body = shell(host, 'Probability → odds → log-odds');
  const S = canvas(body, { ratio: 0.42, min: 200, max: 300, label: 'Logit curve' });
  const bar = div(body, 'oddsbar', '<span class="ob-p"></span><span class="ob-q"></span>');
  const ctl = div(body, 'ctls'); const out = readout(body); let p = 0.8;
  slider(ctl, { label: 'Probability p', min: 0.01, max: 0.99, step: 0.01, value: p, fmt: v => v.toFixed(2) }, v => { p = v; draw(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, 1], [-5, 5], { l: 40 }); axes(S, P, c, { xl: 'p', yl: 'ln(p/(1−p))' }); clip(S, P); curve(ctx, P, q => Math.log(q / (1 - q)), c.lc, 2.5, null, 0.003, 0.997); const z = Math.log(p / (1 - p)); ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(p), P.Y(-5)); ctx.lineTo(P.X(p), P.Y(z)); ctx.lineTo(P.L, P.Y(z)); ctx.stroke(); ctx.setLineDash([]); dot(ctx, P.X(p), P.Y(z), 6, c.lc, c.bg, 2); ctx.restore(); };
  function draw() { S.render(); const o = p / (1 - p), z = Math.log(o); bar.querySelector('.ob-p').style.width = (p * 100) + '%'; bar.querySelector('.ob-p').textContent = 'p = ' + p.toFixed(2); bar.querySelector('.ob-q').textContent = '1 − p = ' + (1 - p).toFixed(2);
    out.innerHTML = kv([['odds p/(1−p)', fmt(o, 3)], ['reads as', o >= 1 ? `${fmt(o, 2)} to 1 in favour` : `1 to ${fmt(1 / o, 2)} against`], ['log-odds', fmt(z, 3)], ['back to p = eᶻ/(1+eᶻ)', fmt(Math.exp(z) / (1 + Math.exp(z)), 2)]]); }
  draw();
};

VIZ.logloss = host => {
  const body = shell(host, 'Log loss: the price of each prediction');
  const S = canvas(body, { ratio: 0.45, min: 220, max: 320, label: 'Curves of negative log p and negative log one minus p' });
  const ctl = div(body, 'ctls'); const out = readout(body); let p = 0.8;
  slider(ctl, { label: 'Predicted p̂ = P(y = 1)', min: 0.01, max: 0.99, step: 0.01, value: p, fmt: v => v.toFixed(2) }, v => { p = v; draw(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, 1], [0, 4.7], { l: 40 }); axes(S, P, c, { xl: 'p̂', yl: 'loss' }); clip(S, P);
    curve(ctx, P, q => -Math.log(q), c.b, 2.5, null, 0.005, 1); curve(ctx, P, q => -Math.log(1 - q), c.a, 2.5, null, 0, 0.995);
    dot(ctx, P.X(p), P.Y(-Math.log(p)), 6, c.b, c.bg, 2); dot(ctx, P.X(p), P.Y(-Math.log(1 - p)), 6, c.a, c.bg, 2);
    ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(p), P.T); ctx.lineTo(P.X(p), P.T + P.H); ctx.stroke(); ctx.restore();
    legend(S, [['if y = 1: −ln p̂', c.b], ['if y = 0: −ln(1 − p̂)', c.a]], P.L + 10, P.T + 12); };
  function draw() { S.render(); out.innerHTML = kv([['loss if y = 1', fmt(-Math.log(p), 3)], ['loss if y = 0', fmt(-Math.log(1 - p), 3)], ['', p > 0.5 ? 'Confident in class 1: cheap if right, expensive if wrong' : 'Confident in class 0: cheap if right, expensive if wrong']]); }
  draw();
};

VIZ.threshold = host => {
  const body = shell(host, 'Threshold lab: confusion matrix, precision, recall, F1');
  const r = rng(5), pts = []; for (let i = 0; i < 24; i++) pts.push([sig(1.1 + 1.3 * gauss(r)), 1]); for (let i = 0; i < 24; i++) pts.push([sig(-1.1 + 1.3 * gauss(r)), 0]);
  const S = canvas(body, { ratio: 0.3, min: 170, max: 220, label: 'Predicted probabilities for positive and negative examples with a threshold line' });
  const ctl = div(body, 'ctls'); const grid = div(body, 'cm-wrap'); let t = 0.5;
  slider(ctl, { label: 'Decision threshold', min: 0.05, max: 0.95, step: 0.01, value: t, fmt: v => v.toFixed(2) }, v => { t = v; draw(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, 1], [-0.5, 1.5], { l: 86, b: 30 }); axes(S, P, c, { xl: 'predicted p̂', yt: [], nogrid: false });
    text(ctx, 'actual 1', P.L - 8, P.Y(1), c.b, 'right'); text(ctx, 'actual 0', P.L - 8, P.Y(0), c.a, 'right');
    ctx.fillStyle = rgba(c.lc, 0.1); ctx.fillRect(P.X(t), P.T, P.X(1) - P.X(t), P.H);
    pts.forEach(([p, y], i) => { const jit = ((i * 37) % 11 - 5) * 0.035; dot(ctx, P.X(p), P.Y(y + jit), 5, p >= t ? (y ? c.b : c.bg) : (y ? c.bg : c.a), y ? c.b : c.a, 1.8); });
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(P.X(t), P.T); ctx.lineTo(P.X(t), P.T + P.H); ctx.stroke(); text(ctx, 'predict 1 →', P.X(t) + 6, P.T + 10, c.ink, 'left', 'middle', FONT_S); };
  function draw() {
    S.render(); let TP = 0, FP = 0, FN = 0, TN = 0; pts.forEach(([p, y]) => { const h = p >= t; if (h && y) TP++; else if (h) FP++; else if (y) FN++; else TN++; });
    const Pr = TP + FP ? TP / (TP + FP) : NaN, Rc = TP / (TP + FN), F = Pr + Rc ? 2 * Pr * Rc / (Pr + Rc) : NaN;
    grid.innerHTML = `<table class="cm"><thead><tr><th></th><th>predicted 1</th><th>predicted 0</th></tr></thead><tbody><tr><th>actual 1</th><td class="tp">TP ${TP}</td><td class="fn">FN ${FN}</td></tr><tr><th>actual 0</th><td class="fp">FP ${FP}</td><td class="tn">TN ${TN}</td></tr></tbody></table>
    <div class="readout">${kv([['accuracy', fmt((TP + TN) / pts.length, 3)], ['precision TP/(TP+FP)', isNaN(Pr) ? 'n/a (no positives predicted)' : fmt(Pr, 3)], ['recall TP/(TP+FN)', fmt(Rc, 3)], ['F1', isNaN(F) ? 'n/a' : fmt(F, 3)]])}</div>`;
  }
  draw();
};

/* =============================== L3B =============================== */

VIZ.table2x2 = host => {
  const body = shell(host, 'Diagnostic test table · joint, marginal, conditional');
  const wrap = div(body, 't22');
  wrap.innerHTML = `<table class="tbl t22-t"><thead><tr><th></th><th>Disease (A)</th><th>Healthy (¬A)</th><th>Total</th></tr></thead><tbody>
  <tr><th>Test + (B)</th><td><input type="number" min="0" value="1800" aria-label="disease and positive"></td><td><input type="number" min="0" value="200" aria-label="healthy and positive"></td><td class="tb"></td></tr>
  <tr><th>Test − (¬B)</th><td><input type="number" min="0" value="200" aria-label="disease and negative"></td><td><input type="number" min="0" value="1800" aria-label="healthy and negative"></td><td class="tnb"></td></tr>
  <tr><th>Total</th><td class="ta"></td><td class="tna"></td><td class="tt"></td></tr></tbody></table>`;
  const S = canvas(div(wrap, 't22-m'), { ratio: 0.75, min: 180, max: 260, caption: 'Area = probability', label: 'Mosaic plot of the table' });
  const btns = div(body, 'btns'); const out = readout(body);
  const ins = wrap.querySelectorAll('input');
  button(btns, 'Make it independent', () => { [ins[0].value, ins[1].value, ins[2].value, ins[3].value] = [1000, 1000, 1000, 1000]; draw(); }, 'chip');
  button(btns, 'Lecture table', () => { [ins[0].value, ins[1].value, ins[2].value, ins[3].value] = [1800, 200, 200, 1800]; draw(); }, 'chip');
  button(btns, 'Rare disease', () => { [ins[0].value, ins[1].value, ins[2].value, ins[3].value] = [90, 990, 10, 8910]; draw(); }, 'chip');
  ins.forEach(i => i.addEventListener('input', draw));
  const v = () => [...ins].map(i => Math.max(0, +i.value || 0));
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const [ab, nab, anb, nanb] = v(); const N = ab + nab + anb + nanb || 1; const W = S.w - 4, H = S.h - 4; const wa = (ab + anb) / N * W;
    const cell = (x, y, w, h, col, a, lab) => { ctx.fillStyle = rgba(col, a); ctx.fillRect(x, y, w, h); ctx.strokeStyle = c.bg; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); if (w > 40 && h > 18) text(ctx, lab, x + w / 2, y + h / 2, c.ink, 'center', 'middle', FONT_S); };
    const ha = (ab + anb) ? ab / (ab + anb) * H : 0, hn = (nab + nanb) ? nab / (nab + nanb) * H : 0;
    cell(2, 2, wa, ha, c.b, 0.75, 'A,B'); cell(2, 2 + ha, wa, H - ha, c.b, 0.3, 'A,¬B'); cell(2 + wa, 2, W - wa, hn, c.a, 0.6, '¬A,B'); cell(2 + wa, 2 + hn, W - wa, H - hn, c.a, 0.22, '¬A,¬B'); };
  function draw() {
    const [ab, nab, anb, nanb] = v(); const N = ab + nab + anb + nanb || 1; const pa = (ab + anb) / N, pb = (ab + nab) / N, pab = ab / N;
    wrap.querySelector('.tb').textContent = ab + nab; wrap.querySelector('.tnb').textContent = anb + nanb; wrap.querySelector('.ta').textContent = ab + anb; wrap.querySelector('.tna').textContent = nab + nanb; wrap.querySelector('.tt').textContent = N;
    const ind = Math.abs(pab - pa * pb) < 0.005;
    out.innerHTML = kv([['Pr(A)', fmt(pa, 3)], ['Pr(B)', fmt(pb, 3)], ['Pr(AB)', fmt(pab, 3)], ['Pr(A)Pr(B)', fmt(pa * pb, 3)], ['', ind ? 'Independent: Pr(AB) = Pr(A)Pr(B)' : 'Dependent: Pr(AB) ≠ Pr(A)Pr(B)', ind ? 'good' : 'warn'], ['Pr(B|A) = Pr(AB)/Pr(A)', pa ? fmt(pab / pa, 3) : 'n/a'], ['Pr(A|B) = Pr(AB)/Pr(B)', pb ? fmt(pab / pb, 3) : 'n/a']]);
    S.render();
  }
  draw();
};

VIZ.bayes = host => {
  const body = shell(host, "Bayes' rule with 1000 people");
  const S = canvas(body, { ratio: 0.5, min: 200, max: 330, label: 'Grid of 1000 dots coloured by disease and test outcome' });
  const ctl = div(body, 'ctls'); const out = readout(body);
  let prev = 0.01, sens = 0.9, fpr = 0.1;
  slider(ctl, { label: 'Prior: prevalence Pr(D)', min: 0.005, max: 0.5, step: 0.005, value: prev, fmt: v => (v * 100).toFixed(1) + '%' }, v => { prev = v; draw(); });
  slider(ctl, { label: 'Likelihood: sensitivity Pr(+|D)', min: 0.5, max: 1, step: 0.01, value: sens, fmt: v => (v * 100).toFixed(0) + '%' }, v => { sens = v; draw(); });
  slider(ctl, { label: 'False-positive rate Pr(+|¬D)', min: 0, max: 0.3, step: 0.005, value: fpr, fmt: v => (v * 100).toFixed(1) + '%' }, v => { fpr = v; draw(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const cw = 50, rw = 20; const sz = Math.min((S.w - 4) / cw, (S.h - 30) / rw); const d = Math.round(1000 * prev), tp = Math.round(d * sens), fp = Math.round((1000 - d) * fpr);
    for (let k = 0; k < 1000; k++) { const i = k % cw, j = Math.floor(k / cw); let col, a; if (k < tp) { col = c.bad; a = 1; } else if (k < d) { col = c.bad; a = 0.28; } else if (k < d + fp) { col = c.warn; a = 1; } else { col = c.muted; a = 0.22; } dot(ctx, 2 + (i + 0.5) * sz, 2 + (j + 0.5) * sz, sz * 0.36, rgba(col, a)); }
    legend(S, [['sick & test +', c.bad], ['healthy & test +', c.warn], ['sick & test −', rgba(c.bad, 0.35)], ['healthy & test −', rgba(c.muted, 0.5)]], 4, S.h - 10); };
  function draw() { S.render(); const pp = sens * prev + fpr * (1 - prev), post = pp ? sens * prev / pp : 0; const d = Math.round(1000 * prev), tp = Math.round(d * sens), fp = Math.round((1000 - d) * fpr);
    out.innerHTML = kv([['Pr(+) = evidence', fmt(pp, 4)], ['posterior Pr(D|+)', `${fmt(sens, 2)}×${fmt(prev, 3)} / ${fmt(pp, 4)} = <strong>${fmt(post * 100, 1)}%</strong>`, post < 0.5 ? 'warn' : 'good'], ['in the grid', `${tp} true positives vs ${fp} false positives`]]); }
  draw();
};

VIZ.dice = host => {
  const body = shell(host, 'Sum of dice: exact distribution vs simulation');
  const top = div(body, 'btns'); let k = 3, target = 5, sim = null;
  const kS = seg(top, [[1, '1 die'], [2, '2 dice'], [3, '3 dice']], k, v => { k = v; sim = null; target = Math.min(Math.max(target, k), 6 * k); tS.inp.min = k; tS.inp.max = 6 * k; tS.set(target); draw(); }, 'Number of dice');
  const S = canvas(body, { ratio: 0.45, min: 220, max: 320, label: 'Bar chart of the probability of each sum' });
  const ctl = div(body, 'ctls'); const btns = div(body, 'btns'); const out = readout(body);
  const tS = slider(ctl, { label: 'Highlight X =', min: 3, max: 18, step: 1, value: target }, v => { target = v; draw(); });
  button(btns, 'Roll 3,000 times', () => { const r = rng(Date.now() & 0xffff); sim = {}; for (let i = 0; i < 3000; i++) { let s = 0; for (let j = 0; j < k; j++) s += 1 + Math.floor(r() * 6); sim[s] = (sim[s] || 0) + 1; } draw(); }, 'btn');
  function dist() { let d = { 0: 1 }; for (let j = 0; j < k; j++) { const n = {}; Object.keys(d).forEach(s => { for (let f = 1; f <= 6; f++) n[+s + f] = (n[+s + f] || 0) + d[s]; }); d = n; } return d; }
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const d = dist(), tot = Math.pow(6, k); const mx = Math.max(...Object.values(d)) / tot;
    const P = frame(S, [k - 0.7, 6 * k + 0.7], [0, mx * 1.2], { l: 46 }); axes(S, P, c, { xl: 'sum X', yl: 'Pr(X = x)', xt: Array.from({ length: 5 * k + 1 }, (_, i) => i + k).filter((v, i, a) => a.length < 12 || v % 2 === 0) }); clip(S, P);
    const bw = Math.max(3, (P.X(k + 1) - P.X(k)) * 0.7);
    Object.keys(d).forEach(s => { const p = d[s] / tot; ctx.fillStyle = +s === target ? c.lc : rgba(c.lc, 0.35); ctx.fillRect(P.X(+s) - bw / 2, P.Y(p), bw, P.Y(0) - P.Y(p)); if (sim) dot(ctx, P.X(+s), P.Y((sim[s] || 0) / 3000), 3.5, c.ink); });
    ctx.restore(); if (sim) legend(S, [['exact', c.lc], ['simulated (dots)', c.ink]], P.L + 10, P.T + 12); };
  function draw() { S.render(); const d = dist(), tot = Math.pow(6, k); const n = d[target] || 0; out.innerHTML = kv([['Pr(X = ' + target + ')', `${n}/${tot} = ${fmt(n / tot, 4)}`], ['E[X] = 3.5 × ' + k, fmt(3.5 * k, 1)], ...(sim ? [['simulated frequency', fmt((sim[target] || 0) / 3000, 4)]] : [])]); }
  draw(); void kS;
};

VIZ.dist = host => {
  const body = shell(host, 'Bernoulli and Gaussian distributions');
  const top = div(body, 'btns'); let mode = 'g', th = 0.3, m1 = 0, s1 = 1, m2 = 2, s2 = 1.5, sum = false;
  const S = canvas(body, { ratio: 0.45, min: 220, max: 320, label: 'Distribution plot' });
  const ctlB = div(body, 'ctls'), ctlG = div(body, 'ctls'); const opt = div(body, 'btns'); const out = readout(body);
  seg(top, [['g', 'Gaussian'], ['b', 'Bernoulli']], mode, v => { mode = v; ctlB.hidden = v !== 'b'; ctlG.hidden = v !== 'g'; opt.hidden = v !== 'g'; draw(); }, 'Distribution');
  slider(ctlB, { label: 'θ = Pr(X = 1)', min: 0, max: 1, step: 0.01, value: th, fmt: v => v.toFixed(2) }, v => { th = v; draw(); });
  slider(ctlG, { label: 'μ₁', min: -3, max: 3, step: 0.1, value: m1, fmt: v => v.toFixed(1) }, v => { m1 = v; draw(); });
  slider(ctlG, { label: 'σ₁', min: 0.3, max: 3, step: 0.1, value: s1, fmt: v => v.toFixed(1) }, v => { s1 = v; draw(); });
  check(opt, 'Add independent X₂ ~ N(2, 1.5²) and show X₁ + X₂', false, v => { sum = v; draw(); });
  ctlB.hidden = true;
  const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / Math.sqrt(2 * Math.PI * s * s);
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear();
    if (mode === 'b') { const P = frame(S, [-0.8, 1.8], [0, 1.05], { l: 44 }); axes(S, P, c, { xt: [0, 1], yt: [0, 0.25, 0.5, 0.75, 1], xl: 'x', yl: 'Pr(X = x)' }); clip(S, P);
      [[0, 1 - th], [1, th]].forEach(([x, p]) => { ctx.fillStyle = x ? c.b : c.a; ctx.fillRect(P.X(x) - 30, P.Y(p), 60, P.Y(0) - P.Y(p)); text(ctx, p.toFixed(2), P.X(x), P.Y(p) - 10, c.ink, 'center'); }); ctx.restore(); return; }
    const ms = m1 + m2, ss = Math.sqrt(s1 * s1 + s2 * s2); const ymax = Math.max(pdf(m1, m1, s1), sum ? pdf(m2, m2, s2) : 0) * 1.15;
    const P = frame(S, [-6, 9], [0, ymax], { l: 44 }); axes(S, P, c, { xl: 'x', yl: 'density p(x)' }); clip(S, P);
    ctx.fillStyle = rgba(c.lc, 0.15); ctx.beginPath(); ctx.moveTo(P.X(m1 - s1), P.Y(0)); for (let x = m1 - s1; x <= m1 + s1; x += 0.02) ctx.lineTo(P.X(x), P.Y(pdf(x, m1, s1))); ctx.lineTo(P.X(m1 + s1), P.Y(0)); ctx.fill();
    curve(ctx, P, x => pdf(x, m1, s1), c.lc, 2.5);
    if (sum) { curve(ctx, P, x => pdf(x, m2, s2), c.b, 2, [5, 4]); curve(ctx, P, x => pdf(x, ms, ss), c.ink, 2.5); }
    ctx.restore(); legend(S, sum ? [['X₁', c.lc], ['X₂', c.b, true], ['X₁ + X₂', c.ink]] : [['X₁ (shaded: μ ± σ ≈ 68%)', c.lc]], P.L + 10, P.T + 12); };
  function draw() { S.render(); out.innerHTML = mode === 'b' ? kv([['Pr(X=1) = θ¹(1−θ)⁰', fmt(th, 2)], ['Pr(X=0) = θ⁰(1−θ)¹', fmt(1 - th, 2)], ['E[X] = θ', fmt(th, 2)], ['Var = θ(1−θ)', fmt(th * (1 - th), 4)]]) :
    kv([['E[X₁]', fmt(m1, 1)], ['Var(X₁) = σ²', fmt(s1 * s1, 2)], ...(sum ? [['X₁ + X₂ mean', fmt(m1 + m2, 1)], ['variance σ₁² + σ₂²', fmt(s1 * s1 + s2 * s2, 2)], ['std', `${fmt(Math.sqrt(s1 * s1 + s2 * s2), 2)} (not ${fmt(s1 + s2, 1)})`]] : [])]); }
  draw();
};

/* =============================== Trees =============================== */

const giniF = (cnt, n) => { if (!n) return 0; let s = 1; for (const k of cnt) s -= (k / n) ** 2; return s; };
const entF = (cnt, n) => { if (!n) return 0; let s = 0; for (const k of cnt) if (k) s -= (k / n) * Math.log2(k / n); return s; };
function cart(X, y, opt, r, idx) {
  const nF = X[0].length, K = opt.K || 2, imp = opt.crit === 'entropy' ? entF : giniF; const minLeaf = opt.minLeaf || 1;
  function grow(ix, depth) {
    const n = ix.length; let node;
    if (opt.reg) { let s = 0, s2 = 0; for (const i of ix) { s += y[i]; s2 += y[i] * y[i]; } node = { n, val: s / n, sse: Math.max(0, s2 - s * s / n), depth }; }
    else { const cnt = new Array(K).fill(0); for (const i of ix) cnt[y[i]]++; node = { n, cnt, depth, imp: imp(cnt, n), p1: cnt[1] / n, val: cnt.indexOf(Math.max(...cnt)) }; }
    const pure = opt.reg ? node.sse < 1e-12 : node.cnt.some(c => c === n);
    if (depth >= (opt.maxDepth == null ? 99 : opt.maxDepth) || n < 2 * minLeaf || pure) return node;
    let feats = [...Array(nF).keys()];
    if (opt.maxFeatures && opt.maxFeatures < nF) { for (let i = nF - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [feats[i], feats[j]] = [feats[j], feats[i]]; } feats = feats.slice(0, opt.maxFeatures); }
    let best = { score: Infinity };
    for (const f of feats) {
      const s = ix.slice().sort((a, b) => X[a][f] - X[b][f]);
      if (opt.reg) {
        let sL = 0, s2L = 0, sT = 0, s2T = 0; for (const i of s) { sT += y[i]; s2T += y[i] * y[i]; }
        for (let k = 1; k < n; k++) { const v = y[s[k - 1]]; sL += v; s2L += v * v; if (k < minLeaf || n - k < minLeaf) continue; if (X[s[k - 1]][f] === X[s[k]][f]) continue; const sR = sT - sL, s2R = s2T - s2L; const sc = (s2L - sL * sL / k) + (s2R - sR * sR / (n - k)); if (sc < best.score) best = { score: sc, f, t: (X[s[k - 1]][f] + X[s[k]][f]) / 2, k, s }; }
      } else {
        const cL = new Array(K).fill(0), cR = node.cnt.slice();
        for (let k = 1; k < n; k++) { const v = y[s[k - 1]]; cL[v]++; cR[v]--; if (k < minLeaf || n - k < minLeaf) continue; if (X[s[k - 1]][f] === X[s[k]][f]) continue; const sc = (k * imp(cL, k) + (n - k) * imp(cR, n - k)) / n; if (sc < best.score) best = { score: sc, f, t: (X[s[k - 1]][f] + X[s[k]][f]) / 2, k, s }; }
      }
    }
    const parent = opt.reg ? node.sse : node.imp;
    if (best.score === Infinity || parent - best.score < (opt.minDec || 0) + 1e-12) return node;
    node.f = best.f; node.t = best.t; node.gain = parent - best.score;
    node.left = grow(best.s.slice(0, best.k), depth + 1); node.right = grow(best.s.slice(best.k), depth + 1);
    return node;
  }
  return grow(idx || X.map((_, i) => i), 0);
}
function leafOf(node, x) { while (node.left) node = x[node.f] <= node.t ? node.left : node.right; return node; }
function treeStats(node) { if (!node.left) return { leaves: 1, depth: 0 }; const a = treeStats(node.left), b = treeStats(node.right); return { leaves: a.leaves + b.leaves, depth: 1 + Math.max(a.depth, b.depth) }; }
function rules(node, names, cls, ind = '', out = []) {
  if (out.length > 60) return out;
  if (!node.left) { out.push(`${ind}→ ${cls ? cls[node.val] : fmt(node.val, 2)}  <span>${node.cnt ? `(${node.cnt.join(' / ')})` : `(n = ${node.n})`}</span>`); return out; }
  out.push(`${ind}<b>if</b> ${names[node.f]} ≤ ${fmt(node.t, 2)}:`); rules(node.left, names, cls, ind + '│  ', out);
  out.push(`${ind}<b>else</b>:  <i>(${names[node.f]} &gt; ${fmt(node.t, 2)})</i>`); rules(node.right, names, cls, ind + '   ', out); return out;
}
function moons(n, noise, seed) { const r = rng(seed), X = [], y = []; for (let i = 0; i < n; i++) { const c = i % 2, t = Math.PI * r(); let a, b; if (!c) { a = Math.cos(t); b = Math.sin(t); } else { a = 1 - Math.cos(t); b = 0.5 - Math.sin(t); } X.push([a + noise * gauss(r), b + noise * gauss(r)]); y.push(c); } return { X, y }; }
const MX = [-1.7, 2.7], MY = [-1.3, 1.8];
function raster(S, P, probFn, c, smooth) {
  const cell = 4, cw = Math.ceil(P.W / cell), ch = Math.ceil(P.H / cell); const off = document.createElement('canvas'); off.width = cw; off.height = ch;
  const o = off.getContext('2d'), img = o.createImageData(cw, ch); const A = hex2rgb(c.a), B = hex2rgb(c.b), G = hex2rgb(c.bg);
  for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const x = P.ix(P.L + (i + 0.5) * cell), yv = P.iy(P.T + (j + 0.5) * cell); const p = probFn([x, yv]); const a = 0.1 + 0.32 * Math.abs(p - 0.5) * 2; const k = (j * cw + i) * 4; for (let q = 0; q < 3; q++) { const col = A[q] * (1 - p) + B[q] * p; img.data[k + q] = Math.round(G[q] * (1 - a) + col * a); } img.data[k + 3] = 255; }
  o.putImageData(img, 0, 0); S.ctx.imageSmoothingEnabled = !!smooth; S.ctx.drawImage(off, P.L, P.T, P.W, P.H); S.ctx.imageSmoothingEnabled = true;
}
function drawPts(ctx, P, X, y, c, hollow, r) { X.forEach((x, i) => dot(ctx, P.X(x[0]), P.Y(x[1]), r || 3.6, hollow ? null : (y[i] ? c.b : c.a), hollow ? rgba(y[i] ? c.b : c.a, 0.8) : c.bg, hollow ? 1.2 : 1)); }
window.VZ.tree = { cart, leafOf, treeStats, rules, moons, raster, giniF, entF };

/* =============================== L4 =============================== */

VIZ.impurity = host => {
  const body = shell(host, 'Impurity calculator · Gini, entropy, error');
  const grid = div(body, 'cv-grid');
  const left = div(grid, 'imp-left'); const S = canvas(div(grid, ''), { ratio: 0.75, min: 220, max: 320, caption: 'Two-class curves vs share p of class A', label: 'Gini, entropy and error as functions of p' });
  const bar = div(left, 'imp-bar'); const ctl = div(left, 'ctls one'); const out = div(left, 'readout');
  let n = [6, 2, 0];
  ['Class A (count)', 'Class B (count)', 'Class C (count)'].forEach((l, i) => slider(ctl, { label: l, min: 0, max: 20, step: 1, value: n[i] }, v => { n[i] = v; draw(); }));
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, 1], [0, 1.05], { l: 40 }); axes(S, P, c, { xl: 'p (share of class A)', yl: 'impurity' }); clip(S, P);
    curve(ctx, P, p => 2 * p * (1 - p), c.lc, 2.5); curve(ctx, P, p => p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p), c.b, 2.5); curve(ctx, P, p => 1 - Math.max(p, 1 - p), c.muted, 2, [5, 4]);
    const N = n[0] + n[1] + n[2]; if (N && !n[2]) { const p = n[0] / N; dot(ctx, P.X(p), P.Y(2 * p * (1 - p)), 5.5, c.lc, c.bg, 2); dot(ctx, P.X(p), P.Y(entF([n[0], n[1]], N)), 5.5, c.b, c.bg, 2); dot(ctx, P.X(p), P.Y(1 - Math.max(p, 1 - p)), 5, c.muted, c.bg, 2); }
    ctx.restore(); legend(S, [['Gini', c.lc], ['entropy', c.b], ['error', c.muted, true]], P.L + 8, P.T + 12); };
  function draw() { const N = n[0] + n[1] + n[2]; const C = n.filter(v => v > 0).length || 1; const k = n[2] ? 3 : 2;
    bar.innerHTML = N ? n.map((v, i) => v ? `<span class="ib ib${i}" style="flex:${v}">${'ABC'[i]} ${v}</span>` : '').join('') : '<span class="ib empty">empty node</span>';
    const g = giniF(n, N), e = entF(n, N), er = N ? 1 - Math.max(...n) / N : 0;
    out.innerHTML = kv([['Gini 1 − Σp²', fmt(g, 3)], ['max for ' + k + ' classes', fmt(1 - 1 / k, 3)], ['entropy (bits)', fmt(e, 3)], ['max', fmt(Math.log2(k), 3)], ['error 1 − max p', fmt(er, 3)], ['', g < 1e-9 ? 'Pure node' : (g > 1 - 1 / k - 1e-6 ? 'Maximally mixed' : 'Mixed'), g < 1e-9 ? 'good' : '']]); void C;
    S.render(); }
  draw();
};

VIZ.spamSplit = host => {
  const body = shell(host, 'Choosing the root: URL vs has-attachment');
  const top = div(body, 'btns'); const tree = div(body, 'split-tree'); const out = div(body, 'calc');
  const F = { url: { name: 'URL', L: [2, 1], R: [1, 3] }, att: { name: 'Has attachment', L: [3, 1], R: [0, 3] } }; let f = 'url';
  seg(top, [['url', 'Split on URL'], ['att', 'Split on attachment']], f, v => { f = v; draw(); }, 'Feature');
  const H = (a, b) => entF([a, b], a + b), Gi = (a, b) => giniF([a, b], a + b);
  function draw() {
    const { name, L, R } = F[f]; const nl = L[0] + L[1], nr = R[0] + R[1], n = nl + nr;
    const gL = Gi(...L), gR = Gi(...R), gw = nl / n * gL + nr / n * gR, g0 = Gi(3, 4), hL = H(...L), hR = H(...R), hw = nl / n * hL + nr / n * hR, h0 = H(3, 4);
    tree.innerHTML = `<div class="st-root">Root · spam 3 · not 4</div><div class="st-q">${name}?</div><div class="st-kids"><div class="st-leaf"><small>True</small>spam ${L[0]} · not ${L[1]}<em>Gini ${fmt(gL, 3)} · H ${fmt(hL, 3)}</em></div><div class="st-leaf"><small>False</small>spam ${R[0]} · not ${R[1]}<em>Gini ${fmt(gR, 3)} · H ${fmt(hR, 3)}</em></div></div>`;
    out.innerHTML = `<p><b>Weighted Gini</b> = ${nl}/7 × ${fmt(gL, 3)} + ${nr}/7 × ${fmt(gR, 3)} = <strong>${fmt(gw, 3)}</strong> &nbsp;·&nbsp; Gini decrease = ${fmt(g0, 3)} − ${fmt(gw, 3)} = ${fmt(g0 - gw, 3)}</p>
    <p><b>Information gain</b> = H(root) − weighted H = ${fmt(h0, 3)} − (${nl}/7 × ${fmt(hL, 3)} + ${nr}/7 × ${fmt(hR, 3)}) = <strong>${fmt(h0 - hw, 3)} bits</strong></p>
    <p class="verdict ${f === 'att' ? 'good' : 'warn'}">${f === 'att' ? 'Winner: has-attachment gives the lower weighted Gini (0.214 vs 0.405) and the higher gain (0.522 vs 0.128). It becomes the root.' : 'URL helps a little, but compare it with the attachment split before choosing the root.'}</p>`;
  }
  draw();
};

VIZ.thresh = host => {
  const body = shell(host, 'Continuous feature: testing every midpoint');
  const data = [[10, 1], [20, 1], [30, 0], [40, 0], [50, 0]];
  const S = canvas(body, { ratio: 0.32, min: 170, max: 220, label: 'Number line of emails by word count with a candidate threshold' });
  const B = canvas(body, { ratio: 0.26, min: 140, max: 190, label: 'Weighted Gini for each candidate threshold' });
  const ctl = div(body, 'ctls'); const out = readout(body); div(body, 'hint', 'Click a point to flip its label (spam ↔ not spam) and watch the best split move.');
  let idx = 1;
  const sl = slider(ctl, { label: 'Candidate threshold', min: 0, max: 3, step: 1, value: idx, fmt: v => 'Words ≤ ' + mids()[v] }, v => { idx = v; draw(); });
  function sorted() { return data.slice().sort((a, b) => a[0] - b[0]); }
  function mids() { const s = sorted(); return s.slice(1).map((d, i) => (d[0] + s[i][0]) / 2); }
  function score(t) { const L = [0, 0], R = [0, 0]; data.forEach(([x, y]) => (x <= t ? L : R)[y]++); const nl = L[0] + L[1], nr = R[0] + R[1]; return { L, R, g: (nl * giniF(L, nl) + nr * giniF(R, nr)) / data.length }; }
  S.cv.addEventListener('click', e => { const rc = S.cv.getBoundingClientRect(); const P = frame(S, [0, 60], [0, 1], { l: 20, r: 20, b: 34 }); const x = P.ix(e.clientX - rc.left); let bi = 0; data.forEach((d, i) => { if (Math.abs(d[0] - x) < Math.abs(data[bi][0] - x)) bi = i; }); if (Math.abs(data[bi][0] - x) < 5) { data[bi][1] = 1 - data[bi][1]; draw(); } });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, 60], [0, 1], { l: 20, r: 20, b: 34 }); const t = mids()[idx];
    ctx.fillStyle = rgba(c.lc, 0.1); ctx.fillRect(P.L, P.T, P.X(t) - P.L, P.H);
    axes(S, P, c, { xl: 'words in email', yt: [], xt: [0, 10, 20, 30, 40, 50, 60], nogrid: true });
    data.forEach(([x, y]) => { dot(ctx, P.X(x), P.Y(0.45), 11, y ? c.b : c.a, c.bg, 2); text(ctx, y ? 'Y' : 'N', P.X(x), P.Y(0.45), c.bg, 'center', 'middle', 'bold 11px "Geist Mono", monospace'); });
    mids().forEach(m => { ctx.strokeStyle = c.muted; ctx.setLineDash([2, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(m), P.T + 4); ctx.lineTo(P.X(m), P.T + P.H - 4); ctx.stroke(); ctx.setLineDash([]); });
    ctx.strokeStyle = c.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(P.X(t), P.T); ctx.lineTo(P.X(t), P.T + P.H); ctx.stroke(); text(ctx, '≤ ' + t, P.X(t) + 5, P.T + 10, c.ink, 'left', 'middle', FONT_S);
    legend(S, [['spam (Y)', c.b], ['not spam (N)', c.a]], P.L + P.W - 210, P.T + P.H - 8); };
  B.draw = () => { const c = cols(B.cv), ctx = B.ctx; B.clear(); const m = mids(); const sc = m.map(t => score(t).g); const P = frame(B, [-0.5, m.length - 0.5], [0, 0.55], { l: 46, b: 26 });
    axes(B, P, c, { xt: m.map((_, i) => i), fx: i => '≤ ' + m[i], yt: [0, 0.25, 0.5], yl: 'weighted Gini' });
    const best = sc.indexOf(Math.min(...sc)); sc.forEach((g, i) => { ctx.fillStyle = i === idx ? c.lc : rgba(c.lc, 0.35); ctx.fillRect(P.X(i) - 18, P.Y(g), 36, P.Y(0) - P.Y(g)); text(ctx, fmt(g, 3) + (i === best ? ' best' : ''), P.X(i), Math.max(P.T + 8, P.Y(g) - 9), i === best ? c.good : c.muted, 'center', 'middle', FONT_S); }); };
  function draw() { const m = mids(); sl.inp.max = m.length - 1; const t = m[idx], s = score(t); const nl = s.L[0] + s.L[1], nr = s.R[0] + s.R[1];
    out.innerHTML = kv([['left (≤ ' + t + ')', `Y ${s.L[1]} · N ${s.L[0]} → Gini ${fmt(giniF(s.L, nl), 3)}`], ['right', `Y ${s.R[1]} · N ${s.R[0]} → Gini ${fmt(giniF(s.R, nr), 3)}`], ['weighted', `(${nl}/5)·${fmt(giniF(s.L, nl), 3)} + (${nr}/5)·${fmt(giniF(s.R, nr), 3)} = <strong>${fmt(s.g, 3)}</strong>`]]);
    S.render(); B.render(); }
  draw();
};

VIZ.regTree = host => {
  const body = shell(host, 'Regression tree: a staircase built by RSS');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.75, min: 220, max: 320, caption: 'Each leaf predicts the mean of its region', label: 'Piecewise-constant fit' });
  const B = canvas(div(grid, ''), { ratio: 0.75, min: 220, max: 320, caption: 'Root split: RSS for every candidate s', label: 'RSS versus split point' });
  const ctl = div(body, 'ctls'); const out = readout(body);
  const r = rng(4), X = [], y = []; for (let i = 0; i < 46; i++) { const x = 3 * r(); X.push([x]); y.push((x <= 1 ? 1.5 : x <= 2 ? 2.2 : 1.5) + 0.17 * gauss(r)); }
  let depth = 2, tree;
  slider(ctl, { label: 'max_depth', min: 0, max: 6, step: 1, value: depth }, v => { depth = v; fit(); draw(); });
  function fit() { tree = cart(X, y, { reg: true, maxDepth: depth, minLeaf: 1 }); }
  const rssAt = s => { let a = 0, b = 0, na = 0, nb = 0; X.forEach((x, i) => { if (x[0] <= s) { a += y[i]; na++; } else { b += y[i]; nb++; } }); const ma = a / (na || 1), mb = b / (nb || 1); let rs = 0; X.forEach((x, i) => { rs += (y[i] - (x[0] <= s ? ma : mb)) ** 2; }); return rs; };
  const cands = X.map(x => x[0]).sort((a, b) => a - b).slice(1).map((v, i, a) => (v + (i ? a[i - 1] : X.map(x => x[0]).sort((p, q) => p - q)[0])) / 2);
  A.draw = () => { const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, [0, 3], [0.8, 2.9], { l: 40 }); axes(A, P, c, { xl: 'X', yl: 'Y' }); clip(A, P);
    X.forEach((x, i) => dot(ctx, P.X(x[0]), P.Y(y[i]), 3.5, rgba(c.ink, 0.55)));
    ctx.strokeStyle = c.lc; ctx.lineWidth = 3; ctx.beginPath(); let prev = null; for (let i = 0; i <= 600; i++) { const x = 3 * i / 600; const v = leafOf(tree, [x]).val; if (prev === null) ctx.moveTo(P.X(x), P.Y(v)); else { if (Math.abs(v - prev) > 1e-9) ctx.lineTo(P.X(x), P.Y(prev)); ctx.lineTo(P.X(x), P.Y(v)); } prev = v; } ctx.stroke(); ctx.restore(); };
  B.draw = () => { const c = cols(B.cv), ctx = B.ctx; B.clear(); const vals = cands.map(rssAt); const mx = Math.max(...vals); const P = frame(B, [0, 3], [0, mx * 1.08], { l: 46 }); axes(B, P, c, { xl: 'candidate split s', yl: 'RSS(s)' }); clip(B, P);
    polyline(ctx, P, cands.map((s, i) => [s, vals[i]]), c.b, 2); const bi = vals.indexOf(Math.min(...vals)); dot(ctx, P.X(cands[bi]), P.Y(vals[bi]), 6, c.good, c.bg, 2); ctx.restore(); text(ctx, 'best s = ' + fmt(cands[bi], 2), P.X(cands[bi]), P.Y(vals[bi]) - 14, c.good, 'center', 'middle', FONT_S); };
  function draw() { A.render(); B.render(); let rs = 0; X.forEach((x, i) => { rs += (y[i] - leafOf(tree, x).val) ** 2; }); const st = treeStats(tree); out.innerHTML = kv([['leaves', st.leaves], ['depth', st.depth], ['total RSS', fmt(rs, 3)], ['root split', tree.left ? 'X ≤ ' + fmt(tree.t, 2) : 'none (depth 0: one mean)']]); }
  fit(); draw();
};

VIZ.treeLab = host => {
  const body = shell(host, 'Decision tree lab · grow, prune, and watch the test accuracy');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.72, min: 240, max: 340, caption: 'Feature space: each rectangle is a leaf', label: 'Decision regions of the tree' });
  const B = canvas(div(grid, ''), { ratio: 0.72, min: 240, max: 340, caption: 'Accuracy vs max_depth (same settings)', label: 'Training and test accuracy versus depth' });
  const ctl = div(body, 'ctls'); const opts = div(body, 'btns'); const out = readout(body);
  const det = document.createElement('details'); det.className = 'quick'; det.innerHTML = '<summary>Show the learned if-then rules</summary><pre class="rules"></pre>'; body.appendChild(det);
  let depth = 3, minLeaf = 1, crit = 'gini', showTest = false, seed = 2, tr, te, tree, curveD = [];
  slider(ctl, { label: 'max_depth', min: 1, max: 12, step: 1, value: depth }, v => { depth = v; fit(); draw(); });
  slider(ctl, { label: 'min_samples_leaf', min: 1, max: 25, step: 1, value: minLeaf }, v => { minLeaf = v; fit(true); draw(); });
  seg(opts, [['gini', 'Gini'], ['entropy', 'Entropy']], crit, v => { crit = v; fit(true); draw(); }, 'Criterion');
  check(opts, 'Show test points', false, v => { showTest = v; A.render(); });
  button(opts, 'New sample', () => { seed++; data(); fit(true); draw(); }, 'btn ghost');
  function data() { tr = moons(200, 0.32, seed * 7 + 1); te = moons(500, 0.32, seed * 13 + 3); }
  const acc = (t, D) => D.X.reduce((s, x, i) => s + (leafOf(t, x).val === D.y[i] ? 1 : 0), 0) / D.X.length;
  function fit(all) { tree = cart(tr.X, tr.y, { maxDepth: depth, minLeaf, crit }); if (all || !curveD.length) { curveD = []; for (let d = 1; d <= 12; d++) { const t = cart(tr.X, tr.y, { maxDepth: d, minLeaf, crit }); curveD.push([d, acc(t, tr), acc(t, te)]); } } }
  A.draw = () => { const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, MX, MY, { l: 36, b: 30 }); raster(A, P, x => leafOf(tree, x).p1, c, false); axes(A, P, c, { xl: 'x₁', yl: 'x₂', nogrid: true }); clip(A, P); if (showTest) drawPts(ctx, P, te.X, te.y, c, true, 2.6); drawPts(ctx, P, tr.X, tr.y, c); ctx.restore(); };
  B.draw = () => { const c = cols(B.cv), ctx = B.ctx; B.clear(); const P = frame(B, [0.5, 12.5], [0.6, 1.005], { l: 44 }); axes(B, P, c, { xl: 'max_depth', yl: 'accuracy', xt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }); clip(B, P);
    ctx.fillStyle = rgba(c.lc, 0.12); ctx.fillRect(P.X(depth - 0.5), P.T, P.X(depth + 0.5) - P.X(depth - 0.5), P.H);
    polyline(ctx, P, curveD.map(d => [d[0], d[1]]), c.a, 2); polyline(ctx, P, curveD.map(d => [d[0], d[2]]), c.b, 2);
    curveD.forEach(d => { dot(ctx, P.X(d[0]), P.Y(d[1]), 3, c.a); dot(ctx, P.X(d[0]), P.Y(d[2]), 3, c.b); }); ctx.restore(); legend(B, [['train', c.a], ['test', c.b]], P.L + 10, P.T + P.H - 12); };
  function draw() { A.render(); B.render(); const st = treeStats(tree); const bt = curveD.reduce((b, d) => d[2] > b[2] ? d : b, curveD[0]);
    out.innerHTML = kv([['leaves', st.leaves], ['actual depth', st.depth], ['train acc', fmt(acc(tree, tr) * 100, 1) + '%'], ['test acc', fmt(acc(tree, te) * 100, 1) + '%'], ['best test depth', bt[0], 'good'], ['', acc(tree, tr) - acc(tree, te) > 0.07 ? 'Gap between train and test: overfitting' : (acc(tree, tr) < 0.85 ? 'Too shallow: underfitting' : 'Reasonable fit'), acc(tree, tr) - acc(tree, te) > 0.07 ? 'bad' : '']]);
    det.querySelector('.rules').innerHTML = rules(tree, ['x₁', 'x₂'], ['class A', 'class B']).join('\n'); }
  data(); fit(true); draw();
};

/* =============================== L5 =============================== */

const lnF = [0]; for (let i = 1; i <= 210; i++) lnF[i] = lnF[i - 1] + Math.log(i);
function majErr(n, e) { if (e <= 0) return 0; if (e >= 1) return 1; let s = 0; for (let k = Math.ceil((n + 1) / 2); k <= n; k++) s += Math.exp(lnF[n] - lnF[k] - lnF[n - k] + k * Math.log(e) + (n - k) * Math.log(1 - e)); return s; }

VIZ.crowd = host => {
  const body = shell(host, 'Wisdom of the crowd: majority-vote error');
  const S = canvas(body, { ratio: 0.45, min: 220, max: 320, label: 'Ensemble error versus number of independent classifiers' });
  const ctl = div(body, 'ctls'); const out = readout(body); let n = 25, e = 0.35;
  slider(ctl, { label: 'Number of classifiers n', min: 1, max: 101, step: 2, value: n }, v => { n = v; draw(); });
  slider(ctl, { label: 'Error of each classifier ε', min: 0.05, max: 0.95, step: 0.01, value: e, fmt: v => (v * 100).toFixed(0) + '%' }, v => { e = v; draw(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [1, 101], [0, 1], { l: 44 }); axes(S, P, c, { xl: 'number of independent classifiers n', yl: 'P(majority wrong)' }); clip(S, P);
    const ser = (ee, col, w, dash) => { const pts = []; for (let k = 1; k <= 101; k += 2) pts.push([k, majErr(k, ee)]); polyline(ctx, P, pts, col, w, dash); };
    ser(0.35, rgba(c.muted, 0.6), 1.5, [5, 4]); ser(0.55, rgba(c.muted, 0.6), 1.5, [5, 4]); ser(e, c.lc, 2.8);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = c.warn; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.L, P.Y(e)); ctx.lineTo(P.L + P.W, P.Y(e)); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, P.X(n), P.Y(majErr(n, e)), 6, c.lc, c.bg, 2); ctx.restore();
    text(ctx, 'ε = 35%', P.X(101) - 4, P.Y(majErr(101, 0.35)) - 10, c.muted, 'right', 'middle', FONT_S); text(ctx, 'ε = 55%', P.X(101) - 4, P.Y(majErr(101, 0.55)) + 12, c.muted, 'right', 'middle', FONT_S); text(ctx, 'single model', P.L + 6, P.Y(e) - 9, c.warn, 'left', 'middle', FONT_S); };
  function draw() { S.render(); const p = majErr(n, e); out.innerHTML = kv([['one model wrong', fmt(e * 100, 0) + '%'], [`majority of ${n} wrong`, fmt(p * 100, 2) + '%', p < e ? 'good' : p > e ? 'bad' : ''], ['', e < 0.5 ? 'Better than random: the crowd improves with size' : e > 0.5 ? 'Worse than random: the crowd gets worse with size' : 'A coin flip stays a coin flip']]); }
  draw();
};

VIZ.bootstrap = host => {
  const body = shell(host, 'Bootstrap sampling and out-of-bag rows');
  const top = div(body, 'btns'); const stage = div(body, 'boot'); const btns = div(body, 'btns'); const out = readout(body);
  let mode = 'letters', draws = ['C', 'A', 'D', 'C', 'E', 'D', 'A', 'B', 'B', 'C'], stop = null;
  const items = () => mode === 'letters' ? ['A', 'B', 'C', 'D', 'E'] : ['0', '1', '2', '3', '4', '5', '6'];
  const nDraw = () => mode === 'letters' ? 10 : 7;
  seg(top, [['letters', 'Letters A-E, draw 10'], ['rows', 'Rows 0-6, draw 7 (one tree)']], mode, v => { mode = v; draws = v === 'rows' ? ['2', '5', '3', '5', '1', '2', '3'] : ['C', 'A', 'D', 'C', 'E', 'D', 'A', 'B', 'B', 'C']; render(); }, 'Example');
  button(btns, 'Draw a new sample', () => { if (stop) stop(); const it = items(), r = rng((Date.now() & 0xffff) + 1); const full = Array.from({ length: nDraw() }, () => it[Math.floor(r() * it.length)]); if (RM()) { draws = full; render(); return; } draws = []; stop = loop(() => { draws.push(full[draws.length]); render(); if (draws.length >= full.length) return false; }, 220); });
  function render() {
    const it = items(); const cnt = {}; draws.forEach(d => cnt[d] = (cnt[d] || 0) + 1);
    stage.innerHTML = `<div class="boot-src">${it.map(i => `<span class="bt ${draws.length === nDraw() && !cnt[i] ? 'oob' : ''}">${i}<small>${cnt[i] ? '×' + cnt[i] : (draws.length === nDraw() ? 'OOB' : '')}</small></span>`).join('')}</div><div class="boot-arrow">sample with replacement →</div><div class="boot-out">${draws.map((d, i) => `<span class="bd ${draws.indexOf(d) !== i ? 'dup' : ''}">${d}</span>`).join('')}</div>`;
    const oob = it.filter(i => !cnt[i]);
    out.innerHTML = kv([['drawn', draws.length + ' / ' + nDraw()], ['unique items used', Object.keys(cnt).length + ' of ' + it.length], ['out-of-bag', draws.length === nDraw() ? (oob.length ? '{' + oob.join(', ') + '}' : 'none this time') : '…'], ['expected OOB share (1 − 1/n)ⁿ', fmt(Math.pow(1 - 1 / it.length, nDraw()) * 100, 1) + '%']]);
  }
  render();
  const sim = div(body, 'boot-sim'); const S = canvas(sim, { ratio: 0.36, min: 180, max: 250, label: 'Out-of-bag fraction versus n' }); const ctl = div(sim, 'ctls'); const so = readout(sim);
  const NS = [5, 7, 10, 20, 50, 100, 200, 500, 1000]; let ni = 5, emp = null;
  slider(ctl, { label: 'Dataset size n', min: 0, max: NS.length - 1, step: 1, value: ni, fmt: v => 'n = ' + NS[v] }, v => { ni = v; emp = null; draw2(); });
  button(div(sim, 'btns'), 'Simulate 2,000 bootstrap samples', () => { const n = NS[ni], r = rng(99 + ni); let tot = 0; for (let k = 0; k < 2000; k++) { const seen = new Uint8Array(n); for (let j = 0; j < n; j++) seen[Math.floor(r() * n)] = 1; let o = 0; for (let j = 0; j < n; j++) if (!seen[j]) o++; tot += o / n; } emp = tot / 2000; draw2(); });
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [Math.log10(4), 3.05], [0.3, 0.38], { l: 50 }); axes(S, P, c, { xt: [Math.log10(5), 1, 2, 3], fx: v => String(Math.round(Math.pow(10, v))), yt: [0.3, 0.32, 0.34, 0.36, 0.38], xl: 'n (log scale)', yl: 'OOB fraction' }); clip(S, P);
    ctx.setLineDash([5, 4]); ctx.strokeStyle = c.good; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.L, P.Y(Math.exp(-1))); ctx.lineTo(P.L + P.W, P.Y(Math.exp(-1))); ctx.stroke(); ctx.setLineDash([]);
    curve(ctx, P, lx => Math.pow(1 - 1 / Math.pow(10, lx), Math.pow(10, lx)), c.lc, 2.5); const n = NS[ni]; dot(ctx, P.X(Math.log10(n)), P.Y(Math.pow(1 - 1 / n, n)), 6, c.lc, c.bg, 2); if (emp != null) dot(ctx, P.X(Math.log10(n)), P.Y(emp), 4, c.ink); ctx.restore(); text(ctx, 'e⁻¹ ≈ 0.368', P.L + P.W - 6, P.Y(Math.exp(-1)) - 9, c.good, 'right', 'middle', FONT_S); };
  function draw2() { S.render(); const n = NS[ni]; so.innerHTML = kv([['(1 − 1/n)ⁿ', fmt(Math.pow(1 - 1 / n, n), 4)], ['limit e⁻¹', fmt(Math.exp(-1), 4)], ['each tree sees ≈', fmt((1 - Math.pow(1 - 1 / n, n)) * 100, 1) + '% of rows'], ...(emp != null ? [['simulated', fmt(emp, 4), 'good']] : [])]); }
  draw2();
};

VIZ.varAvg = host => {
  const body = shell(host, 'Variance of an average of B correlated trees');
  const S = canvas(body, { ratio: 0.45, min: 220, max: 320, label: 'Variance versus number of trees for several correlations' });
  const ctl = div(body, 'ctls'); const out = readout(body); let rho = 0.3, B = 50;
  slider(ctl, { label: 'Correlation between trees ρ', min: 0, max: 1, step: 0.01, value: rho, fmt: v => v.toFixed(2) }, v => { rho = v; draw(); });
  slider(ctl, { label: 'Number of trees B', min: 1, max: 300, step: 1, value: B }, v => { B = v; draw(); });
  const V = (r, b) => r + (1 - r) / b;
  S.draw = () => { const c = cols(S.cv), ctx = S.ctx; S.clear(); const P = frame(S, [0, Math.log10(300)], [0, 1.05], { l: 44 }); axes(S, P, c, { xt: [0, Math.log10(3), 1, Math.log10(30), 2, Math.log10(300)], fx: v => String(Math.round(Math.pow(10, v))), xl: 'number of trees B (log scale)', yl: 'Var / σ²' }); clip(S, P);
    [0, 0.1, 0.3, 0.6].forEach(r => { curve(ctx, P, lb => V(r, Math.pow(10, lb)), rgba(c.muted, 0.55), 1.4, [4, 4]); });
    curve(ctx, P, lb => V(rho, Math.pow(10, lb)), c.lc, 2.8);
    ctx.setLineDash([2, 3]); ctx.strokeStyle = c.warn; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.L, P.Y(rho)); ctx.lineTo(P.L + P.W, P.Y(rho)); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, P.X(Math.log10(B)), P.Y(V(rho, B)), 6, c.lc, c.bg, 2); ctx.restore();
    [0, 0.1, 0.3, 0.6].forEach(r => text(ctx, 'ρ=' + r, P.L + P.W - 4, P.Y(V(r, 300)) - 7, c.muted, 'right', 'middle', FONT_S)); text(ctx, 'floor ρσ²', P.L + 6, P.Y(rho) - 9, c.warn, 'left', 'middle', FONT_S); };
  function draw() { S.render(); const v = V(rho, B); out.innerHTML = kv([['ρσ²', fmt(rho, 3)], ['(1 − ρ)σ²/B', fmt((1 - rho) / B, 4)], ['total Var', fmt(v, 4)], ['vs one tree', fmt((1 - v) * 100, 1) + '% less variance', 'good']]); }
  draw();
};

VIZ.forest = host => {
  const body = shell(host, 'Random forest lab · one tree vs the forest');
  const grid = div(body, 'cv-grid');
  const A = canvas(div(grid, ''), { ratio: 0.72, min: 230, max: 330, caption: 'Tree #1 alone (fully grown)', label: 'Decision regions of a single tree' });
  const B = canvas(div(grid, ''), { ratio: 0.72, min: 230, max: 330, caption: 'Forest: averaged class probability (soft voting)', label: 'Decision regions of the forest' });
  const E = canvas(body, { ratio: 0.3, min: 180, max: 240, caption: 'Error vs number of trees', label: 'Out-of-bag and test error versus number of trees' });
  const ctl = div(body, 'ctls'); const opts = div(body, 'btns'); const out = readout(body);
  let B_ = 25, mf = 1, boot = true, seed = 1, trees = [], curveE = [], tr, te;
  slider(ctl, { label: 'n_estimators (trees shown)', min: 1, max: 100, step: 1, value: B_ }, v => { B_ = v; draw(); });
  seg(opts, [[1, 'max_features = 1 (random subspace)'], [2, 'max_features = 2 (plain bagging)']], mf, v => { mf = +v; build(); draw(); }, 'Features per split');
  check(opts, 'bootstrap rows', true, v => { boot = v; build(); draw(); });
  button(opts, 'Regrow with new randomness', () => { seed++; build(); draw(); }, 'btn ghost');
  tr = moons(200, 0.35, 21); te = moons(500, 0.35, 77);
  function build() {
    const r = rng(seed * 991); trees = []; const n = tr.X.length;
    for (let b = 0; b < 100; b++) { const inBag = new Uint8Array(n); let idx; if (boot) { idx = []; for (let i = 0; i < n; i++) { const k = Math.floor(r() * n); idx.push(k); inBag[k] = 1; } } else { idx = tr.X.map((_, i) => i); inBag.fill(1); } trees.push({ t: cart(tr.X, tr.y, { maxDepth: 40, minLeaf: 1, maxFeatures: mf }, r, idx), inBag }); }
    const ov = new Float64Array(n), oc = new Uint16Array(n), tv = new Float64Array(te.X.length); curveE = [];
    trees.forEach((T, b) => { for (let i = 0; i < n; i++) if (!T.inBag[i]) { ov[i] += leafOf(T.t, tr.X[i]).p1; oc[i]++; } te.X.forEach((x, i) => { tv[i] += leafOf(T.t, x).p1; });
      let oe = 0, on = 0; for (let i = 0; i < n; i++) if (oc[i]) { on++; if ((ov[i] / oc[i] >= 0.5 ? 1 : 0) !== tr.y[i]) oe++; } let te_ = 0; te.X.forEach((x, i) => { if ((tv[i] / (b + 1) >= 0.5 ? 1 : 0) !== te.y[i]) te_++; });
      curveE.push([b + 1, on ? oe / on : NaN, te_ / te.X.length, on]); });
  }
  const prob = (x, k) => { let s = 0; for (let b = 0; b < k; b++) s += leafOf(trees[b].t, x).p1; return s / k; };
  A.draw = () => { const c = cols(A.cv), ctx = A.ctx; A.clear(); const P = frame(A, MX, MY, { l: 36, b: 30 }); raster(A, P, x => leafOf(trees[0].t, x).p1, c, false); axes(A, P, c, { xl: 'x₁', yl: 'x₂', nogrid: true }); clip(A, P); drawPts(ctx, P, tr.X, tr.y, c, false, 3); ctx.restore(); };
  B.draw = () => { const c = cols(B.cv), ctx = B.ctx; B.clear(); const P = frame(B, MX, MY, { l: 36, b: 30 }); raster(B, P, x => prob(x, B_), c, true); axes(B, P, c, { xl: 'x₁', yl: 'x₂', nogrid: true }); clip(B, P); drawPts(ctx, P, tr.X, tr.y, c, false, 3); ctx.restore(); };
  E.draw = () => { const c = cols(E.cv), ctx = E.ctx; E.clear(); const P = frame(E, [1, 100], [0, 0.4], { l: 44 }); axes(E, P, c, { xl: 'number of trees', yl: 'error' }); clip(E, P);
    const single = curveE[0][2]; ctx.setLineDash([4, 4]); ctx.strokeStyle = c.muted; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(P.L, P.Y(single)); ctx.lineTo(P.L + P.W, P.Y(single)); ctx.stroke(); ctx.setLineDash([]);
    if (boot) polyline(ctx, P, curveE.filter(d => isFinite(d[1])).map(d => [d[0], d[1]]), c.b, 2); polyline(ctx, P, curveE.map(d => [d[0], d[2]]), c.a, 2);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P.X(B_), P.T); ctx.lineTo(P.X(B_), P.T + P.H); ctx.stroke(); ctx.restore();
    legend(E, boot ? [['OOB error', c.b], ['test error', c.a], ['tree #1 test error', c.muted, true]] : [['test error', c.a], ['tree #1 test error', c.muted, true]], P.L + 10, P.T + 12); };
  function draw() { A.render(); B.render(); E.render(); const d = curveE[B_ - 1];
    out.innerHTML = kv([['tree #1 test acc', fmt((1 - curveE[0][2]) * 100, 1) + '%'], [`forest of ${B_} test acc`, fmt((1 - d[2]) * 100, 1) + '%', 'good'], ['OOB acc', boot && isFinite(d[1]) ? fmt((1 - d[1]) * 100, 1) + '%' + (d[3] < 200 ? ` (on ${d[3]} rows)` : '') : 'needs bootstrap = True', boot ? '' : 'warn']]); }
  build(); draw();
};

})();

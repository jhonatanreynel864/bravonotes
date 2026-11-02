// Luces de Navidad en los bordes de las tarjetas verdes (estilo bombillos "pera" colgando de un cable ondulado).
// Se dibujan siguiendo el contorno real de cada tarjeta (esquinas redondeadas incluidas) y se
// redibujan solas cuando la tarjeta cambia de tamaño o aparece una nueva.
(function () {
  const SELECTOR = '.glass-card, header.topbar, .gastos-theme .g-card';
  // rojo-naranja, naranja, amarillo, azul, verde, blanco cálido
  const COLORS = ['#ff3b3b', '#ff9a1f', '#ffe14d', '#2fa8ff', '#3dff7a', '#ffe9c2'];
  const ORDER = [0, 3, 1, 2, 4, 3, 5, 0, 2, 3, 1, 4];   // secuencia fija para que se vea "al azar" pero estable
  const SPACING = 27;     // px entre bombillos
  const WAVE = 2.2;       // amplitud de la onda del cable
  const PAD = 18;         // margen del SVG para que no se corte el brillo
  const NS = 'http://www.w3.org/2000/svg';
  const sizes = new WeakMap();

  // Recorrido horario de un rectángulo redondeado: punto en la distancia s
  function makePath(w, h, r) {
    const top = w - 2 * r, side = h - 2 * r, arc = Math.PI * r / 2;
    const L = 2 * top + 2 * side + 4 * arc;
    function at(s) {
      s = ((s % L) + L) % L;
      if (s < top) return [r + s, 0];
      s -= top;
      if (s < arc) { const a = -Math.PI / 2 + s / r; return [w - r + r * Math.cos(a), r + r * Math.sin(a)]; }
      s -= arc;
      if (s < side) return [w, r + s];
      s -= side;
      if (s < arc) { const a = s / r; return [w - r + r * Math.cos(a), h - r + r * Math.sin(a)]; }
      s -= arc;
      if (s < top) return [w - r - s, h];
      s -= top;
      if (s < arc) { const a = Math.PI / 2 + s / r; return [r + r * Math.cos(a), h - r + r * Math.sin(a)]; }
      s -= arc;
      if (s < side) return [0, h - r - s];
      s -= side;
      const a = Math.PI + s / r; return [r + r * Math.cos(a), r + r * Math.sin(a)];
    }
    // normal hacia afuera (el recorrido es horario en pantalla)
    function normal(s) {
      const p1 = at(s - 0.6), p2 = at(s + 0.6);
      let tx = p2[0] - p1[0], ty = p2[1] - p1[1];
      const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
      return [ty, -tx];
    }
    return { L, at, normal };
  }

  function el(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  // bombillo "pera": casquillo oscuro + cuerpo + brillo; el eje local +y apunta hacia donde cuelga
  function bulb(color) {
    const g = el('g', {});
    g.appendChild(el('ellipse', { cx: 0, cy: 8, rx: 7.2, ry: 8.2, fill: color, 'fill-opacity': .38 }));      // resplandor
    g.appendChild(el('rect', { x: -1.9, y: -.5, width: 3.8, height: 3.6, rx: .8, fill: '#2b1d12' }));          // casquillo
    g.appendChild(el('path', { d: 'M-1.6 3 C-4.6 5.2 -4.5 9.4 0 11.6 C4.5 9.4 4.6 5.2 1.6 3 Z', fill: color }));    // cuerpo
    g.appendChild(el('ellipse', { cx: 0, cy: 8, rx: 1.9, ry: 2.8, fill: '#fff', 'fill-opacity': .6 }));    // centro brillante
    g.appendChild(el('ellipse', { cx: -2, cy: 6, rx: .8, ry: 1.5, fill: '#fff', 'fill-opacity': .8 }));       // destello
    return g;
  }

  function draw(card, svg) {
    const w = card.offsetWidth, h = card.offsetHeight;
    const prev = sizes.get(card);
    if (prev && prev[0] === w && prev[1] === h) return;
    sizes.set(card, [w, h]);
    svg.textContent = '';
    if (w < 40 || h < 24) return;

    let r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 16;
    r = Math.max(6, Math.min(r, w / 2 - 1, h / 2 - 1));
    svg.setAttribute('width', w + PAD * 2);
    svg.setAttribute('height', h + PAD * 2);
    svg.setAttribute('viewBox', `${-PAD} ${-PAD} ${w + PAD * 2} ${h + PAD * 2}`);
    svg.style.left = `-${PAD + 1}px`;
    svg.style.top = `-${PAD + 1}px`;

    // borde verde lima brillante (como la referencia) + resplandor suave
    svg.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: r, ry: r, fill: 'none', stroke: '#7dff4f', 'stroke-opacity': .2, 'stroke-width': 6 }));
    svg.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: r, ry: r, fill: 'none', stroke: '#9bff6e', 'stroke-opacity': .95, 'stroke-width': 1.8 }));

    const path = makePath(w, h, r);
    const n = Math.max(8, Math.round(path.L / SPACING));
    const step = path.L / n;
    const lambda = step;                    // una onda del cable por bombillo

    // cable ondulado oscuro
    const pts = [];
    const samples = Math.ceil(path.L / 3);
    for (let k = 0; k <= samples; k++) {
      const s = k * path.L / samples;
      const p = path.at(s), nm = path.normal(s);
      const off = WAVE * Math.sin(2 * Math.PI * s / lambda);
      pts.push((p[0] + nm[0] * off).toFixed(1) + ',' + (p[1] + nm[1] * off).toFixed(1));
    }
    svg.appendChild(el('polygon', { points: pts.join(' '), fill: 'none', stroke: '#1a110a', 'stroke-opacity': .92, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));

    const groups = [0, 1, 2].map(i => {
      const g = el('g', { class: 'xl-g xl-g' + i });
      svg.appendChild(g);
      return g;
    });
    for (let i = 0; i < n; i++) {
      const jitter = ((i * 37) % 7 - 3) * 0.9;           // separación ligeramente irregular
      const s = i * step + jitter;
      const p = path.at(s), nm = path.normal(s);
      const off = WAVE * Math.sin(2 * Math.PI * s / lambda);
      const x = p[0] + nm[0] * off, y = p[1] + nm[1] * off;
      // cuelgan hacia afuera; en el borde superior cuelgan hacia adentro (como en la referencia)
      let dx = nm[0], dy = nm[1];
      if (nm[1] < -0.55 && i % 4 !== 0) { dx = -dx; dy = -dy; }
      const tilt = ((i * 53) % 9 - 4) * 2.2;             // pequeña inclinación natural
      const ang = Math.atan2(-dx, dy) * 180 / Math.PI + tilt;
      const b = bulb(COLORS[ORDER[i % ORDER.length]]);
      b.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      groups[i % 3].appendChild(b);
    }
  }

  const ro = new ResizeObserver(entries => {
    for (const e of entries) {
      const svg = e.target.querySelector(':scope > svg.xlights');
      if (svg) draw(e.target, svg);
    }
  });

  function mount() {
    document.querySelectorAll(SELECTOR).forEach(card => {
      if (card.querySelector(':scope > svg.xlights')) return;
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'xlights');
      svg.setAttribute('aria-hidden', 'true');
      card.appendChild(svg);
      sizes.delete(card);
      ro.observe(card);
      draw(card, svg);
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => { document.querySelectorAll('svg.xlights').forEach(s => sizes.delete(s.parentElement)); schedule(); });
  schedule();
})();

// Nieve de Bravonotes: 600 copos, velocidad media (igual que antes).
// El canvas va DETRÁS del contenido (z-index 0): la nieve cae sobre el fondo
// rojo pero nunca encima de las tarjetas, horarios, modales, etc.
//
// Mejoras de rendimiento (se ve igual, gasta mucha menos batería):
//  · Cada copo se dibuja con una imagen ya preparada (antes se calculaba un
//    "shadowBlur" por copo en cada cuadro, que es muy costoso).
//  · La velocidad depende del tiempo real, no de los FPS: en pantallas de
//    90/120 Hz la nieve ya no cae el doble de rápido.
(function () {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TOTAL_FLAKES = 600;
  const SPEED_FACTOR = 1.5; // velocidad media
  const MAX_SIZE = 4.0;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W = 0, H = 0;
  let snowflakes = [];
  let running = true;
  let last = 0;

  // Sprites: copo nítido y copo con brillo (para los grandes)
  function makeSprite(glow) {
    const R = 16, pad = glow ? 14 : 2, size = (R + pad) * 2;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    if (glow) { g.shadowBlur = 18; g.shadowColor = 'rgba(255,255,255,0.85)'; }
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(size / 2, size / 2, R, 0, Math.PI * 2); g.fill();
    return { img: c, scale: size / (R * 2) };
  }
  const SPRITE_FLAT = makeSprite(false);
  const SPRITE_GLOW = makeSprite(true);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  class Snowflake {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * (W + 200) - 100;
      this.y = initial ? Math.random() * H : -10;
      this.size = Math.random() * (MAX_SIZE - 0.8) + 0.8;
      this.baseSpeed = (this.size / MAX_SIZE) * 0.9 + 0.4;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.oscillationSpeed = Math.random() * 0.02 + 0.005;
      this.oscillationDistance = Math.random() * 1.2 + 0.3;
      this.step = Math.random() * Math.PI * 2;
      this.sprite = this.size > 2.8 ? SPRITE_GLOW : SPRITE_FLAT;
    }
    update(k) {
      this.step += this.oscillationSpeed * k;
      this.x += (Math.sin(this.step) * this.oscillationDistance + 0.4) * k;
      this.y += this.baseSpeed * SPEED_FACTOR * k;
      if (this.y > H + 10) this.reset();
      if (this.x > W + 100) this.x = -100;
      else if (this.x < -100) this.x = W + 100;
    }
    draw() {
      const d = this.size * 2 * this.sprite.scale;
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(this.sprite.img, this.x - d / 2, this.y - d / 2, d, d);
    }
  }

  for (let i = 0; i < TOTAL_FLAKES; i++) snowflakes.push(new Snowflake());

  function animate(now) {
    if (!running) return;
    // k = 1 equivale a un cuadro a 60 fps (así se calibró la velocidad original)
    const k = last ? Math.min((now - last) / 16.667, 3) : 1;
    last = now;
    ctx.clearRect(0, 0, W, H);
    for (const flake of snowflakes) { flake.update(k); flake.draw(); }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  // Pausar cuando la app está en segundo plano (ahorra batería)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; last = 0; requestAnimationFrame(animate); }
  });

  requestAnimationFrame(animate);
})();

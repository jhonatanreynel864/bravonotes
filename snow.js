// Nieve de Bravonotes: 600 copos, velocidad media.
// El canvas va DETRÁS del contenido (z-index 0): la nieve cae sobre el fondo
// rojo pero nunca encima de las tarjetas, tablas de horarios, modales, etc.
(function () {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const TOTAL_FLAKES = 600;
  const SPEED_FACTOR = 1.5; // velocidad media
  const MAX_SIZE = 4.0;
  let snowflakes = [];
  let running = true;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Snowflake {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * (canvas.width + 200) - 100;
      this.y = initial ? Math.random() * canvas.height : -10;
      this.size = Math.random() * (MAX_SIZE - 0.8) + 0.8;
      this.baseSpeed = (this.size / MAX_SIZE) * 0.9 + 0.4;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.oscillationSpeed = Math.random() * 0.02 + 0.005;
      this.oscillationDistance = Math.random() * 1.2 + 0.3;
      this.step = Math.random() * Math.PI * 2;
    }

    update() {
      this.step += this.oscillationSpeed;
      this.x += Math.sin(this.step) * this.oscillationDistance + 0.4;
      this.y += this.baseSpeed * SPEED_FACTOR;

      if (this.y > canvas.height + 10) this.reset();
      if (this.x > canvas.width + 100) this.x = -100;
      else if (this.x < -100) this.x = canvas.width + 100;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      if (this.size > 2.8) {
        ctx.shadowBlur = this.size * 1.8;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
  }

  for (let i = 0; i < TOTAL_FLAKES; i++) snowflakes.push(new Snowflake());

  function animate() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const flake of snowflakes) {
      flake.update();
      flake.draw();
    }
    requestAnimationFrame(animate);
  }

  // Pausar cuando la app está en segundo plano (ahorra batería)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; requestAnimationFrame(animate); }
  });

  animate();
})();

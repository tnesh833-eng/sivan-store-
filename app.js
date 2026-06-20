/* ================================================================
   Shivam Store — app.js
   3D Water Purification Flow Canvas Background
   + Animated Mascot, Awareness counters, Particle system
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────
     1. 3D WATER PURIFICATION FLOW — Canvas Background
     ──────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('waterCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], streams = [], bubbles3D = [];
  let animFrame;
  let time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

  /* --- Water Particle (droplet) --- */
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = -20;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = Math.random() * 1.8 + 0.8;
      this.r  = Math.random() * 5 + 2;
      this.life    = 1;
      this.decay   = Math.random() * 0.003 + 0.002;
      this.hue     = 195 + Math.random() * 30;
      this.shimmer = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.shimmer += 0.04;
      this.life -= this.decay;
      if (this.y > H + 20 || this.life <= 0) this.reset();
    }
    draw() {
      const alpha = this.life * (0.5 + Math.sin(this.shimmer) * 0.2);
      const grad  = ctx.createRadialGradient(
        this.x - this.r * 0.3, this.y - this.r * 0.3, 0,
        this.x, this.y, this.r
      );
      grad.addColorStop(0, `hsla(${this.hue},90%,80%,${alpha})`);
      grad.addColorStop(0.6, `hsla(${this.hue},80%,55%,${alpha * 0.7})`);
      grad.addColorStop(1,   `hsla(${this.hue},70%,40%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  /* --- Flow Stream (flowing water lines) --- */
  class Stream {
    constructor() { this.reset(); }
    reset() {
      this.x      = Math.random() * W;
      this.y      = 0;
      this.len    = Math.random() * 120 + 60;
      this.speed  = Math.random() * 1.5 + 0.5;
      this.width  = Math.random() * 3 + 1;
      this.hue    = 200 + Math.random() * 20;
      this.alpha  = Math.random() * 0.15 + 0.05;
      this.wave   = Math.random() * Math.PI * 2;
      this.waveAmp= Math.random() * 20 + 5;
      this.waveFreq = Math.random() * 0.01 + 0.005;
    }
    update() {
      this.y += this.speed;
      this.wave += 0.02;
      if (this.y > H + this.len) this.reset();
    }
    draw() {
      const xOff = Math.sin(this.wave + this.y * this.waveFreq) * this.waveAmp;
      ctx.beginPath();
      ctx.moveTo(this.x + xOff, this.y);
      ctx.lineTo(this.x + xOff, this.y + this.len);
      const grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.len);
      grad.addColorStop(0,   `hsla(${this.hue},80%,60%,0)`);
      grad.addColorStop(0.3, `hsla(${this.hue},80%,60%,${this.alpha})`);
      grad.addColorStop(0.7, `hsla(${this.hue},80%,60%,${this.alpha})`);
      grad.addColorStop(1,   `hsla(${this.hue},80%,60%,0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = this.width;
      ctx.stroke();
    }
  }

  /* --- 3D Bubble (perspective effect) --- */
  class Bubble3D {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * W;
      this.y     = H + 60;
      this.z     = Math.random() * 800 + 100;  // depth
      this.baseR = Math.random() * 30 + 10;
      this.vy    = -(Math.random() * 1 + 0.4);
      this.vx    = (Math.random() - 0.5) * 0.5;
      this.phase = Math.random() * Math.PI * 2;
      this.hue   = 195 + Math.random() * 35;
    }
    update() {
      this.x += this.vx + Math.sin(this.phase) * 0.3;
      this.y += this.vy;
      this.phase += 0.015;
      this.z  += 0.5;  // coming "closer"
      if (this.y < -80 || this.z > 1200) this.reset();
    }
    draw() {
      const scale  = 600 / (600 + this.z);
      const r      = this.baseR * scale;
      const alpha  = Math.min(scale * 0.4, 0.25);

      // Shadow (depth cue)
      const sx = this.x;
      const sy = Math.min(this.y + r * 2 + 10, H);
      ctx.beginPath();
      ctx.ellipse(sx, sy, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(2,132,199,${alpha * 0.3})`;
      ctx.fill();

      // Bubble
      const grad = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, r * 0.05,
        this.x, this.y, r
      );
      grad.addColorStop(0,    `hsla(${this.hue},70%,90%,${alpha * 0.8})`);
      grad.addColorStop(0.4,  `hsla(${this.hue},80%,65%,${alpha * 0.6})`);
      grad.addColorStop(0.75, `hsla(${this.hue},80%,50%,${alpha * 0.4})`);
      grad.addColorStop(1,    `hsla(${this.hue},70%,40%,0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(this.x - r * 0.32, this.y - r * 0.3, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 1.5})`;
      ctx.fill();
    }
  }

  /* --- Wave layers --- */
  function drawWaves() {
    const waves = [
      { amp: 18, freq: 0.006, speed: 0.8,  alpha: 0.07, hue: 210, yBase: H * 0.55 },
      { amp: 12, freq: 0.009, speed: -0.5, alpha: 0.06, hue: 200, yBase: H * 0.65 },
      { amp: 22, freq: 0.004, speed: 0.6,  alpha: 0.05, hue: 195, yBase: H * 0.72 },
      { amp: 8,  freq: 0.012, speed: -1.0, alpha: 0.04, hue: 220, yBase: H * 0.80 },
    ];

    waves.forEach(({ amp, freq, speed, alpha, hue, yBase }) => {
      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= W; x += 4) {
        const y = yBase + Math.sin(x * freq + time * speed) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, yBase - amp, 0, H);
      g.addColorStop(0,   `hsla(${hue},70%,55%,${alpha})`);
      g.addColorStop(0.5, `hsla(${hue},70%,45%,${alpha * 0.5})`);
      g.addColorStop(1,   `hsla(${hue},70%,35%,0)`);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  /* --- Hex grid (purification membrane effect) --- */
  function drawMembrane() {
    const size = 28;
    const cols = Math.ceil(W / (size * 1.73)) + 1;
    const rows = Math.ceil(H / (size * 1.5)) + 1;
    const pulse = Math.sin(time * 0.5) * 0.015 + 0.02;

    ctx.strokeStyle = `rgba(56,189,248,${pulse})`;
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xOff = (r % 2) * size * 0.87;
        const cx = c * size * 1.73 + xOff;
        const cy = r * size * 1.5;
        
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const px = cx + size * Math.cos(angle);
          const py = cy + size * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();
      }
    }
    ctx.stroke();
  }

  /* --- Molecule trails --- */
  const molecules = [];
  for (let i = 0; i < 8; i++) {
    molecules.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      trail: [],
      hue: 195 + Math.random() * 30
    });
  }

  function updateMolecules() {
    molecules.forEach(m => {
      m.x += m.vx; m.y += m.vy;
      if (m.x < 0 || m.x > W) m.vx *= -1;
      if (m.y < 0 || m.y > H) m.vy *= -1;
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 30) m.trail.shift();

      if (m.trail.length > 1) {
        for (let i = 1; i < m.trail.length; i++) {
          const a = (i / m.trail.length) * 0.08;
          ctx.beginPath();
          ctx.moveTo(m.trail[i-1].x, m.trail[i-1].y);
          ctx.lineTo(m.trail[i].x, m.trail[i].y);
          ctx.strokeStyle = `hsla(${m.hue},80%,60%,${a})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${m.hue},80%,65%,0.6)`;
      ctx.fill();
    });
  }

  /* --- INIT --- */
  function init() {
    particles  = Array.from({ length: 80 },  () => new Particle());
    streams    = Array.from({ length: 25 },  () => new Stream());
    bubbles3D  = Array.from({ length: 30 },  () => {
      const b = new Bubble3D();
      b.y = Math.random() * H;  // start scattered
      return b;
    });
  }

  /* --- MAIN LOOP --- */
  function animate() {
    animFrame = requestAnimationFrame(animate);
    time += 0.016;

    ctx.clearRect(0, 0, W, H);

    // Membrane background
    drawMembrane();

    // Streams
    streams.forEach(s => { s.update(); s.draw(); });

    // Waves
    drawWaves();

    // 3D Bubbles
    bubbles3D.forEach(b => { b.update(); b.draw(); });

    // Droplet particles
    particles.forEach(p => { p.update(); p.draw(); });

    // Molecule trails
    updateMolecules();
  }

  init();
  animate();


  /* ──────────────────────────────────────────────────────────────
     2. MASCOT MESSAGES & BEHAVIOR
     ──────────────────────────────────────────────────────────── */
  const mascot      = document.getElementById('mascot');
  const mascotClose = document.getElementById('mascotClose');
  const mascotMsg   = document.getElementById('mascotMsg');

  const messages = [
    '💧 Drink 8 glasses of pure water daily!',
    '🏥 RO water prevents 80% of diseases!',
    '🌿 Copper-infused water boosts immunity!',
    '✅ Pure water = healthier kidneys!',
    '⚗️ TDS below 500 is safe to drink!',
    '🎯 Our RO removes 95% toxic TDS!',
    '📞 Call us for a FREE water test!',
    '❤️ Protect your family with pure water!',
    '🔬 UV light kills 99.9% of bacteria!',
    '💡 Replace RO filters every 6 months!',
  ];

  let msgIndex = 0;

  function rotateMascotMessage() {
    msgIndex = (msgIndex + 1) % messages.length;
    if (mascotMsg) {
      mascotMsg.style.opacity = '0';
      setTimeout(() => {
        mascotMsg.textContent = messages[msgIndex];
        mascotMsg.style.opacity = '1';
        mascotMsg.style.transition = 'opacity 0.4s ease';
      }, 300);
    }
  }

  setInterval(rotateMascotMessage, 4000);

  if (mascotClose) {
    mascotClose.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mascot) mascot.style.display = 'none';
    });
  }

  // Clicking mascot scrolls to contact
  if (mascot) {
    mascot.addEventListener('click', () => {
      const contact = document.getElementById('contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }


  /* ──────────────────────────────────────────────────────────────
     3. ANIMATED STATS COUNTER
     ──────────────────────────────────────────────────────────── */
  function animateCounter(el, target, suffix = '') {
    let start   = 0;
    const dur   = 2000;
    const step  = 16;
    const inc   = target / (dur / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(start) + (suffix || '');
    }, step);
  }

  const statEls = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function tryAnimateStats() {
    if (statsAnimated) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      statsAnimated = true;
      statEls.forEach(el => {
        const target = parseInt(el.dataset.target || '0', 10);
        const suffix = el.dataset.target === '5'  ? '★' :
                       el.dataset.target === '95' ? '%' : '+';
        animateCounter(el, target, suffix);
      });
    }
  }

  window.addEventListener('scroll', tryAnimateStats, { passive: true });
  setTimeout(tryAnimateStats, 800);


  /* ──────────────────────────────────────────────────────────────
     4. AWARENESS BAR ANIMATION
     ──────────────────────────────────────────────────────────── */
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.awareness-fill');
        if (fill) {
          const w = fill.dataset.w || '80';
          setTimeout(() => { fill.style.width = w + '%'; }, 200);
        }
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.awareness-bar').forEach(bar => barObserver.observe(bar));


  /* ──────────────────────────────────────────────────────────────
     5. FLOW STAGE ANIMATION (sequential highlight)
     ──────────────────────────────────────────────────────────── */
  const flowStages = document.querySelectorAll('.flow-stage');
  let flowIndex    = 0;

  if (flowStages.length) {
    setInterval(() => {
      flowStages.forEach(s => s.classList.remove('active'));
      flowIndex = (flowIndex + 1) % flowStages.length;
      flowStages[flowIndex].classList.add('active');
    }, 1200);
  }


  /* ──────────────────────────────────────────────────────────────
     6. MOUSE PARALLAX on hero visual
     ──────────────────────────────────────────────────────────── */
  const heroVisual = document.querySelector('.hero-visual');

  if (heroVisual) {
    window.addEventListener('mousemove', (e) => {
      const xRatio = (e.clientX / window.innerWidth  - 0.5) * 2;
      const yRatio = (e.clientY / window.innerHeight - 0.5) * 2;
      heroVisual.style.transform =
        `perspective(800px) rotateY(${xRatio * 8}deg) rotateX(${-yRatio * 6}deg)`;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      heroVisual.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    });
  }


  /* ──────────────────────────────────────────────────────────────
     7. RIPPLE EFFECT on buttons
     ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top  - size/2}px;
        background:rgba(255,255,255,0.35);
        transform:scale(0); animation:rippleAnim 0.6s linear;
        pointer-events:none; z-index:999;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // Add ripple keyframe
  if (!document.getElementById('rippleStyle')) {
    const style = document.createElement('style');
    style.id = 'rippleStyle';
    style.textContent = `@keyframes rippleAnim { to { transform:scale(1); opacity:0; } }`;
    document.head.appendChild(style);
  }


  /* ──────────────────────────────────────────────────────────────
     8. CURSOR WATER SPLASH on click
     ──────────────────────────────────────────────────────────── */
  function createSplash(x, y) {
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('div');
      const angle  = (Math.PI * 2 * i) / 6;
      const dist   = 30 + Math.random() * 30;
      const dx     = Math.cos(angle) * dist;
      const dy     = Math.sin(angle) * dist;
      dot.style.cssText = `
        position:fixed; left:${x}px; top:${y}px;
        width:8px; height:8px; border-radius:50%;
        background:rgba(56,189,248,0.75);
        pointer-events:none; z-index:9999;
        transform:translate(-50%,-50%);
        transition:transform 0.5s ease, opacity 0.5s ease;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`;
        dot.style.opacity   = '0';
      });
      setTimeout(() => dot.remove(), 550);
    }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('a, button, input, textarea, select, iframe')) {
      createSplash(e.clientX, e.clientY);
    }
  });

})(); // end IIFE

/* =========================================
   ORBITAL INTERFACE — SCRIPT.JS
   Cyberpunk Orbital Ascension Interface
   ========================================= */

'use strict';

// ─── REGISTER SCROLLTRIGGER ────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── CURSOR ────────────────────────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursorTrail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    gsap.to(cursor, { x: mx, y: my, duration: 0.08, ease: 'none' });
  });

  function animTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    gsap.set(trail, { x: tx, y: ty });
    requestAnimationFrame(animTrail);
  }
  animTrail();

  document.querySelectorAll('a, button, .planet-node, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor,  { scale: 2.5, duration: 0.2 });
      gsap.to(trail,   { scale: 1.5, opacity: 0.4, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursor,  { scale: 1, duration: 0.2 });
      gsap.to(trail,   { scale: 1, opacity: 1, duration: 0.2 });
    });
  });
})();

// ─── HERO CANVAS: ANIMATED CITY PARTICLES ─────────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Floating data particles
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vy: -(0.2 + Math.random() * 0.6),
    vx: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.6 + 0.1,
    hue: Math.random() > 0.7 ? 285 : 195,
  }));

  // Grid scan line
  let scanY = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gradient BG for canvas (sky)
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#020208');
    sky.addColorStop(0.5, '#040410');
    sky.addColorStop(1, '#06060f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Neon grid
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    ctx.lineWidth = 1;
    const gs = 60;
    for (let x = 0; x < canvas.width; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Scan line
    scanY = (scanY + 0.8) % canvas.height;
    const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    scanGrad.addColorStop(0,   'transparent');
    scanGrad.addColorStop(0.5, 'rgba(0,229,255,0.04)');
    scanGrad.addColorStop(1,   'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 40, canvas.width, 80);

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
      ctx.fill();
    });

    // Cityscape silhouette buildings
    ctx.fillStyle = 'rgba(5,5,12,0.95)';
    const bH = canvas.height;
    // Buildings
    const buildings = [
      [0, 0.35, 0.06, 1],     [0.04, 0.28, 0.05, 1],
      [0.08, 0.42, 0.04, 1],  [0.11, 0.32, 0.06, 1],
      [0.15, 0.22, 0.05, 1],  [0.19, 0.38, 0.07, 1],
      [0.24, 0.28, 0.04, 1],  [0.27, 0.15, 0.08, 1],
      [0.33, 0.40, 0.06, 1],  [0.37, 0.30, 0.05, 1],
      [0.41, 0.20, 0.09, 1],  [0.48, 0.45, 0.07, 1],
      [0.53, 0.25, 0.05, 1],  [0.56, 0.35, 0.06, 1],
      [0.60, 0.18, 0.08, 1],  [0.66, 0.40, 0.05, 1],
      [0.69, 0.30, 0.07, 1],  [0.74, 0.22, 0.06, 1],
      [0.78, 0.38, 0.05, 1],  [0.81, 0.28, 0.08, 1],
      [0.86, 0.42, 0.06, 1],  [0.90, 0.20, 0.05, 1],
      [0.93, 0.35, 0.07, 1],
    ];

    buildings.forEach(([xr, hr, wr]) => {
      const bx = xr * canvas.width;
      const bw = wr * canvas.width;
      const bh = hr * bH * 0.5;
      ctx.fillRect(bx, bH - bh, bw, bh);
    });

    // Building windows — tiny glowing rectangles
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    buildings.forEach(([xr, hr, wr]) => {
      if (Math.random() > 0.97) {
        const bx = xr * canvas.width;
        const bw = wr * canvas.width;
        const bh = hr * bH * 0.5;
        const wx = bx + Math.random() * bw * 0.8;
        const wy = bH - bh + Math.random() * bh * 0.7;
        ctx.fillStyle = Math.random() > 0.5
          ? 'rgba(0,229,255,0.6)'
          : 'rgba(200,180,255,0.4)';
        ctx.fillRect(wx, wy, 2, 3);
      }
    });

    // Neon city glow at base
    const cityGlow = ctx.createLinearGradient(0, bH * 0.6, 0, bH);
    cityGlow.addColorStop(0, 'transparent');
    cityGlow.addColorStop(1, 'rgba(0,229,255,0.04)');
    ctx.fillStyle = cityGlow;
    ctx.fillRect(0, bH * 0.6, canvas.width, bH * 0.4);

    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── STAR CANVAS (ASCENSION) ──────────────────────────────────────────────
let starProgress = 0;

function initStarCanvas(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { density = 200, shootingStars = true, isOrbital = false } = opts;

  function resize() {
    canvas.width  = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: density }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * 1.5 + 0.2,
    alpha: Math.random() * 0.8 + 0.1,
    twinkle: Math.random() * 0.02,
    phase: Math.random() * Math.PI * 2,
    vx: isOrbital ? (Math.random() - 0.5) * 0.0001 : 0,
    vy: isOrbital ? (Math.random() - 0.5) * 0.0001 : 0,
  }));

  let shooters = [];
  let frame = 0;

  function spawnShooter() {
    shooters.push({
      x: Math.random(),
      y: Math.random() * 0.5,
      vx: 0.005 + Math.random() * 0.008,
      vy: 0.003 + Math.random() * 0.005,
      life: 1,
      len: 0.1 + Math.random() * 0.1,
    });
  }

  function drawCanvas() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isOrbital) {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const prog = isOrbital ? 1 : Math.min(starProgress * 2, 1);

    stars.forEach(s => {
      s.phase += s.twinkle;
      const tw = Math.sin(s.phase) * 0.3 + 0.7;
      const alpha = s.alpha * tw * prog;

      if (isOrbital) { s.x += s.vx; s.y += s.vy; }
      if (s.x < 0) s.x = 1; if (s.x > 1) s.x = 0;
      if (s.y < 0) s.y = 1; if (s.y > 1) s.y = 0;

      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${alpha})`;
      ctx.fill();

      // Star cross
      if (s.size > 1.2 && alpha > 0.4) {
        ctx.strokeStyle = `rgba(180,220,255,${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        const px = s.x * canvas.width;
        const py = s.y * canvas.height;
        ctx.beginPath(); ctx.moveTo(px - s.size * 3, py); ctx.lineTo(px + s.size * 3, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py - s.size * 3); ctx.lineTo(px, py + s.size * 3); ctx.stroke();
      }
    });

    // Shooting stars
    if (shootingStars && prog > 0.3) {
      if (frame % 180 === 0) spawnShooter();

      shooters = shooters.filter(s => {
        s.x += s.vx * prog;
        s.y += s.vy * prog;
        s.life -= 0.02;

        if (s.life <= 0 || s.x > 1.2 || s.y > 1.2) return false;

        const tailGrad = ctx.createLinearGradient(
          (s.x - s.vx * s.len * 20) * canvas.width,
          (s.y - s.vy * s.len * 20) * canvas.height,
          s.x * canvas.width, s.y * canvas.height
        );
        tailGrad.addColorStop(0, 'transparent');
        tailGrad.addColorStop(1, `rgba(200,240,255,${s.life * 0.8 * prog})`);

        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo((s.x - s.vx * s.len * 20) * canvas.width, (s.y - s.vy * s.len * 20) * canvas.height);
        ctx.lineTo(s.x * canvas.width, s.y * canvas.height);
        ctx.stroke();

        return true;
      });
    }

    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();
}

initStarCanvas('starCanvas', { density: 250, shootingStars: true, isOrbital: false });
initStarCanvas('spaceCanvas', { density: 350, shootingStars: true, isOrbital: true });
initStarCanvas('finalCanvas', { density: 200, shootingStars: false, isOrbital: true });

// ─── HERO ANIMATION SEQUENCE ──────────────────────────────────────────────
(function heroSequence() {
  const tl = gsap.timeline({ delay: 0.4 });

  tl.to('.system-id', { opacity: 1, duration: 0.6, ease: 'power2.out' })
    .to('#boot1', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.3')
    .to('#boot2', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.4')
    .to('#boot3', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '+=0.5')
    .to('.sub-info', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '+=0.3')
    .to('.clearance-container', { opacity: 1, duration: 0.4 }, '+=0.2')
    .to('.scroll-hint', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '+=0.5');
})();

// ─── CLEARANCE BAR ON SCROLL ──────────────────────────────────────────────
(function clearanceBar() {
  const fill = document.getElementById('clearanceFill');
  const glow = document.getElementById('clearanceGlow');
  const pct  = document.getElementById('clearancePct');

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end:   'bottom bottom',
    scrub: true,
    onUpdate(self) {
      const p = Math.round(self.progress * 100);
      fill.style.width = p + '%';
      glow.style.right = (100 - p) + '%';
      pct.textContent = p + '%';
    }
  });
})();

// ─── ASCENSION SCROLL MECHANIC ────────────────────────────────────────────
(function ascension() {
  const section = document.getElementById('ascension');
  const rocket  = document.getElementById('rocketWrap');
  const altHud  = document.getElementById('altHud');
  const altVal  = document.getElementById('altVal');
  const velVal  = document.getElementById('velVal');
  const phaseVal = document.getElementById('phaseVal');

  const atmoCity  = document.getElementById('atmoCity');
  const atmoLow   = document.getElementById('atmoLow');
  const atmoMid   = document.getElementById('atmoMid');
  const atmoHigh  = document.getElementById('atmoHigh');
  const atmoSpace = document.getElementById('atmoSpace');

  const phases = ['CITY', 'TROPOSPHERE', 'STRATOSPHERE', 'MESOSPHERE', 'ORBIT'];
  const altitudes = [0, 12, 50, 85, 400];
  const velocities = [0.3, 1.2, 3.8, 7.9, 7.9];

  // Entrance to section
  ScrollTrigger.create({
    trigger: '#ascension',
    start: 'top 80%',
    onEnter: () => {
      gsap.to(altHud, { opacity: 1, duration: 0.5 });
    }
  });

  // Main scroll-driven ascension
  ScrollTrigger.create({
    trigger: '#ascension',
    start: 'top top',
    end: '+=3000',
    pin: true,
    scrub: 1.2,
    onUpdate(self) {
      const p = self.progress;
      starProgress = p;

      // Rocket rises
      gsap.set(rocket, {
        y: -p * window.innerHeight * 0.65
      });

      // Atmosphere layers
      if (p < 0.25) {
        const lp = p / 0.25;
        gsap.set(atmoCity, { opacity: lp * 0.8 });
        gsap.set(atmoLow,  { opacity: 0 });
      } else if (p < 0.50) {
        const lp = (p - 0.25) / 0.25;
        gsap.set(atmoCity, { opacity: (1-lp) * 0.8 });
        gsap.set(atmoLow,  { opacity: lp * 0.9 });
        gsap.set(atmoMid,  { opacity: 0 });
      } else if (p < 0.75) {
        const lp = (p - 0.5) / 0.25;
        gsap.set(atmoLow,  { opacity: (1-lp) * 0.9 });
        gsap.set(atmoMid,  { opacity: lp * 0.85 });
        gsap.set(atmoHigh, { opacity: 0 });
      } else {
        const lp = (p - 0.75) / 0.25;
        gsap.set(atmoMid,   { opacity: (1-lp) * 0.85 });
        gsap.set(atmoHigh,  { opacity: lp * 0.9 });
        gsap.set(atmoSpace, { opacity: lp * 0.7 });
      }

      // HUD readouts
      const phaseIdx = Math.min(Math.floor(p * phases.length), phases.length - 1);
      phaseVal.textContent = phases[phaseIdx];

      const alt = Math.floor(lerp(0, 400, p));
      const vel = lerp(0.3, 7.9, p).toFixed(1);
      altVal.textContent = alt.toString().padStart(3, '0') + ' km';
      velVal.textContent = vel + ' km/s';
    }
  });
})();

function lerp(a, b, t) { return a + (b - a) * t; }

// ─── ORBITAL SECTION ENTRANCE ─────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#orbital',
  start: 'top 80%',
  onEnter: () => {
    gsap.to('.orbital-header', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

    // Planets fade in staggered
    gsap.fromTo('.planet-orbit',
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)', stagger: 0.2, delay: 0.3 }
    );

    // Rings fade in
    gsap.fromTo('.orbital-ring',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power3.out', stagger: 0.1, delay: 0.2 }
    );

    gsap.fromTo('.orbital-core',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(2)', delay: 0.5 }
    );
  }
});

// ─── PLANET PANEL SYSTEM ─────────────────────────────────────────────────
(function planetPanels() {
  const overlay  = document.getElementById('panelOverlay');
  const panels   = document.querySelectorAll('.planet-panel');
  const nodes    = document.querySelectorAll('.planet-node');

  function openPanel(key) {
    // Close all first
    panels.forEach(p => p.classList.remove('active'));

    const panelMap = {
      skills:     'panelSkills',
      projects:   'panelProjects',
      experience: 'panelExperience',
      contact:    'panelContact',
    };

    const panelId = panelMap[key];
    if (!panelId) return;

    const panel = document.getElementById(panelId);
    overlay.classList.add('active');
    panel.classList.add('active');

    // Panel entrance animation
    gsap.fromTo(panel,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    );

    // Panel-specific content animations
    if (key === 'skills') animateSkillRings();
    if (key === 'projects') animateProjectCards();
    if (key === 'experience') animateTimeline();
    if (key === 'contact') animateContact();
  }

  function closePanel() {
    const activePanel = document.querySelector('.planet-panel.active');
    if (activePanel) {
      gsap.to(activePanel, {
        opacity: 0, y: 20, scale: 0.97, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          overlay.classList.remove('active');
          panels.forEach(p => p.classList.remove('active'));
        }
      });
    } else {
      overlay.classList.remove('active');
    }
  }

  // Planet clicks
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      openPanel(node.dataset.planet);
    });
  });

  // Close buttons
  document.querySelectorAll('.panel-close').forEach(btn => {
    btn.addEventListener('click', closePanel);
  });

  // Click overlay bg
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closePanel();
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
  });
})();

// ─── SKILL RINGS ANIMATION ────────────────────────────────────────────────
function animateSkillRings() {
  // Add SVG gradient definition
  document.querySelectorAll('.skill-ring').forEach(svg => {
    if (!svg.querySelector('defs')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', 'ringGrad');
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
      const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#7b2fff');
      const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#00e5ff');
      grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);
      svg.insertBefore(defs, svg.firstChild);
    }
  });

  gsap.to('.skill-item', {
    opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
  });
}

// ─── PROJECT CARDS ANIMATION ──────────────────────────────────────────────
function animateProjectCards() {
  gsap.to('.project-card', {
    opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12,
  });
}

// ─── TIMELINE ANIMATION ───────────────────────────────────────────────────
function animateTimeline() {
  gsap.to('.timeline-item', {
    opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.15,
  });
}

// ─── CONTACT ANIMATION ────────────────────────────────────────────────────
function animateContact() {
  gsap.fromTo('.contact-terminal',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
  );
}

// ─── SUPABASE CONFIGURATION ────────────────────────────────────────────────
const SUPABASE_URL = "https://rjyutkewkohrttxklwil.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqeXV0a2V3a29ocnR0eGtsd2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDcyODYsImV4cCI6MjA4ODEyMzI4Nn0.cYeKYo2n1JqNw6h9cV6oVt5hHE1QSY1qd3xjHEJBqYI";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── CONTACT FORM SUBMIT ──────────────────────────────────────────────────
(function contactForm() {
  const btn     = document.getElementById('formSubmit');
  const loader  = document.getElementById('submitLoader');
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('txSuccess');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const name  = document.getElementById('senderName').value;
    const email = document.getElementById('senderEmail').value;
    const msg   = document.getElementById('senderMsg').value;

    // Existing UI validation (kept intact)
    if (!name || !email || !msg) {
      // Shake the form
      gsap.to(form, { x: -8, duration: 0.07, yoyo: true, repeat: 5, ease: 'none' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      gsap.to(form, { x: -8, duration: 0.07, yoyo: true, repeat: 5, ease: 'none' });
      return;
    }

    loader.classList.add('active');

    try {
      // Real Supabase insertion
      const { data, error } = await supabaseClient
        .from('messages')
        .insert([
          {
            name: name,
            email: email,
            message: msg
          }
        ]);

      if (error) {
        throw error;
      }

      // Success: Show success message
      loader.classList.remove('active');
      gsap.to(form, { opacity: 0, y: -10, duration: 0.3, onComplete: () => {
        form.style.display = 'none';
        success.classList.add('active');
        gsap.fromTo(success,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
        );
      }});

      // Optional: Clear form fields
      document.getElementById('senderName').value = '';
      document.getElementById('senderEmail').value = '';
      document.getElementById('senderMsg').value = '';

    } catch (error) {
      // Error handling
      loader.classList.remove('active');
      console.error('Supabase error:', error);
      
      // Show error feedback (shake + optional error message)
      gsap.to(form, { x: -8, duration: 0.07, yoyo: true, repeat: 5, ease: 'none' });
      
      // Optional: You could add an error message display here
      // For now, just shake the form to indicate error
    }
  });
})();

// ─── FINAL SECTION ENTRANCE ───────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#final',
  start: 'top 70%',
  onEnter: () => {
    gsap.to('.final-content', {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out'
    });
    gsap.fromTo('.final-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );
    gsap.fromTo('.final-links .final-link',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.6 }
    );
  }
});

// ─── HERO → SECTION TRANSITION ────────────────────────────────────────────
ScrollTrigger.create({
  trigger: '#hero',
  start: 'bottom 80%',
  onLeave: () => {
    gsap.to('.hero-section', { opacity: 0.4, duration: 0.5 });
  },
  onEnterBack: () => {
    gsap.to('.hero-section', { opacity: 1, duration: 0.5 });
  }
});

// ─── PERFORMANCE: DISABLE ANIMATIONS WHEN NOT IN VIEW ────────────────────
(function performanceOptimize() {
  // Pause orbital animations when panel is open
  const overlay = document.getElementById('panelOverlay');
  const observer = new MutationObserver(() => {
    const isOpen = overlay.classList.contains('active');
    document.querySelectorAll('.planet-orbit').forEach(el => {
      el.style.animationPlayState = isOpen ? 'paused' : 'running';
    });
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
})();

// ─── RESIZE HANDLER ───────────────────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

// ─── SMOOTH SCROLL PREVENTION ─────────────────────────────────────────────
// Let GSAP/ScrollTrigger control everything
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      gsap.to(window, {
        scrollTo: target,
        duration: 1.5,
        ease: 'power3.inOut'
      });
    }
  });
});

// ─── INIT LOG ─────────────────────────────────────────────────────────────
console.log('%c ORBITAL INTERFACE v1.0 ', 'background:#00e5ff;color:#050505;font-family:monospace;font-weight:bold;padding:4px 10px;');
console.log('%c KGK-7734-ALPHA :: KESHAV GOKUL. K ', 'color:#7b2fff;font-family:monospace;font-size:10px;');

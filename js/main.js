'use strict';

// ============================================================
// SPACE CANVAS — stars, nebula, satellite
// ============================================================
(function initSpaceCanvas() {
  const canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], satellites = [], animFrame;
  let t = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.15, 0.9),
        base: rand(0.1, 0.7),
        speed: rand(0.0003, 0.0015),
        phase: rand(0, Math.PI * 2)
      });
    }
    satellites = [
      {
        x: -60, y: H * 0.22,
        dx: 0.018, dy: 0.004,
        size: 3.5,
        angle: 0.18
      },
      {
        x: W + 40, y: H * 0.62,
        dx: -0.012, dy: -0.003,
        size: 2.8,
        angle: -0.3
      }
    ];
  }

  function drawNebula() {
    const grd1 = ctx.createRadialGradient(W * 0.15, H * 0.3, 0, W * 0.15, H * 0.3, W * 0.38);
    grd1.addColorStop(0, 'rgba(40, 50, 75, 0.045)');
    grd1.addColorStop(1, 'rgba(10, 10, 12, 0)');
    ctx.fillStyle = grd1;
    ctx.fillRect(0, 0, W, H);

    const grd2 = ctx.createRadialGradient(W * 0.82, H * 0.7, 0, W * 0.82, H * 0.7, W * 0.32);
    grd2.addColorStop(0, 'rgba(30, 38, 60, 0.035)');
    grd2.addColorStop(1, 'rgba(10, 10, 12, 0)');
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSatellite(sat, time) {
    ctx.save();
    sat.x += sat.dx;
    sat.y += sat.dy;
    if (sat.dx > 0 && sat.x > W + 80) { sat.x = -80; sat.y = rand(H * 0.1, H * 0.85); }
    if (sat.dx < 0 && sat.x < -80) { sat.x = W + 80; sat.y = rand(H * 0.1, H * 0.85); }

    ctx.translate(sat.x, sat.y);
    ctx.rotate(sat.angle);

    const s = sat.size;
    const alpha = 0.32 + 0.08 * Math.sin(time * 0.7 + sat.phase || 0);
    ctx.strokeStyle = `rgba(180, 180, 196, ${alpha})`;
    ctx.fillStyle = `rgba(160, 168, 184, ${alpha * 0.7})`;
    ctx.lineWidth = 0.7;

    // Body
    ctx.fillRect(-s * 0.8, -s * 0.5, s * 1.6, s);
    ctx.strokeRect(-s * 0.8, -s * 0.5, s * 1.6, s);

    // Solar panels left
    ctx.fillStyle = `rgba(80, 100, 130, ${alpha * 0.8})`;
    ctx.fillRect(-s * 3.2, -s * 0.25, s * 2.2, s * 0.5);
    ctx.strokeRect(-s * 3.2, -s * 0.25, s * 2.2, s * 0.5);

    // Solar panels right
    ctx.fillRect(s * 1, -s * 0.25, s * 2.2, s * 0.5);
    ctx.strokeRect(s * 1, -s * 0.25, s * 2.2, s * 0.5);

    // Panel dividers
    ctx.beginPath();
    ctx.moveTo(-s * 2.1, -s * 0.25);
    ctx.lineTo(-s * 2.1, s * 0.25);
    ctx.moveTo(s * 2.1, -s * 0.25);
    ctx.lineTo(s * 2.1, s * 0.25);
    ctx.strokeStyle = `rgba(140, 150, 170, ${alpha * 0.5})`;
    ctx.stroke();

    ctx.restore();
  }

  function draw(timestamp) {
    t = timestamp * 0.001;
    ctx.clearRect(0, 0, W, H);
    drawNebula();

    for (const star of stars) {
      const alpha = star.base + (star.base * 0.5) * Math.sin(t * star.speed * 60 + star.phase);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 205, 220, ${alpha})`;
      ctx.fill();
    }

    for (const sat of satellites) {
      drawSatellite(sat, t);
    }

    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrame);
    resize();
    animFrame = requestAnimationFrame(draw);
  });

  resize();
  animFrame = requestAnimationFrame(draw);
})();

// ============================================================
// NAVIGATION
// ============================================================
(function initNav() {
  const nav = document.querySelector('nav');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active page highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

// ============================================================
// PAGE TRANSITIONS
// ============================================================
(function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on load
  document.addEventListener('DOMContentLoaded', () => {
    overlay.classList.remove('active');
  });

  // Fade out on link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
})();
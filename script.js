/* ============================================================
   AkshaRaksha — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- Current Year ---- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Navigation: Scroll State ---- */
  const nav = document.getElementById('nav');

  function updateNav() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- Navigation: Mobile Toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));

      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.opacity  = '0';
        spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity  = '';
        spans[2].style.transform = '';
      }
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity  = '';
        spans[2].style.transform = '';
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity  = '';
        spans[2].style.transform = '';
      }
    });
  }

  /* ---- Scroll Reveal ---- */
  const revealSelectors = [
    '.reveal-fade',
    '.reveal-up',
    '.reveal-left',
    '.reveal-right',
    '.reveal-fade-delay',
    '.reveal-phase',
    '.reveal-flow',
  ];

  const revealEls = document.querySelectorAll(revealSelectors.join(', '));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: reveal all immediately
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ---- Space Canvas ---- */
  const canvas  = document.getElementById('spaceCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');

  let W, H;
  let stars     = [];
  let satellites = [];
  let rafId;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -- Resize -- */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initStars();
    initSatellites();
  }

  /* -- Stars -- */
  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 10000);  // sparse density
    for (let i = 0; i < count; i++) {
      stars.push({
        x:       Math.random() * W,
        y:       Math.random() * H,
        r:       Math.random() * 1.2 + 0.2,
        alpha:   Math.random() * 0.6 + 0.2,
        dAlpha:  (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        twinkle: Math.random() < 0.35,
      });
    }
  }

  /* -- Satellites -- */
  function makeSatellite(index) {
    const speed  = 0.12 + Math.random() * 0.08;
    const angle  = Math.random() * Math.PI * 2;
    const radius = Math.min(W, H) * (0.32 + index * 0.18);
    return {
      cx:    W / 2,
      cy:    H * 0.42,
      angle: angle,
      dAngle: (index === 0 ? 1 : -1) * speed * (Math.PI / 900),
      radius: radius,
      size:   2.4,
      opacity: 0.55 + Math.random() * 0.2,
    };
  }

  function initSatellites() {
    satellites = [makeSatellite(0), makeSatellite(1)];
  }

  /* -- Draw -- */
  function drawStars() {
    stars.forEach(function (s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 225, 235, ${s.alpha})`;
      ctx.fill();
    });
  }

  function updateStars() {
    stars.forEach(function (s) {
      if (!s.twinkle) return;
      s.alpha += s.dAlpha;
      if (s.alpha > 0.85 || s.alpha < 0.05) s.dAlpha *= -1;
    });
  }

  function drawNebula() {
    const grd = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, Math.min(W, H) * 0.55);
    grd.addColorStop(0,   'rgba(60, 55, 80, 0.04)');
    grd.addColorStop(0.5, 'rgba(40, 45, 65, 0.03)');
    grd.addColorStop(1,   'rgba(0,  0,  0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    const grd2 = ctx.createRadialGradient(W * 0.75, H * 0.6, 0, W * 0.75, H * 0.6, Math.min(W, H) * 0.4);
    grd2.addColorStop(0,   'rgba(50, 65, 55, 0.025)');
    grd2.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSatellite(sat) {
    const x = sat.cx + Math.cos(sat.angle) * sat.radius;
    const y = sat.cy + Math.sin(sat.angle) * sat.radius * 0.38; // ellipse

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sat.angle + Math.PI / 4);
    ctx.globalAlpha = sat.opacity;

    // Body
    ctx.fillStyle   = 'rgba(200, 210, 220, 1)';
    ctx.fillRect(-sat.size, -sat.size * 0.6, sat.size * 2, sat.size * 1.2);

    // Solar panels
    ctx.fillStyle = 'rgba(60, 90, 130, 0.8)';
    ctx.fillRect(-sat.size * 3.2, -sat.size * 0.35, sat.size * 2, sat.size * 0.7);
    ctx.fillRect( sat.size * 1.2, -sat.size * 0.35, sat.size * 2, sat.size * 0.7);

    // Panel lines
    ctx.strokeStyle = 'rgba(130, 160, 200, 0.4)';
    ctx.lineWidth   = 0.4;
    ctx.beginPath();
    ctx.moveTo(-sat.size * 2.2, -sat.size * 0.35);
    ctx.lineTo(-sat.size * 2.2,  sat.size * 0.35);
    ctx.moveTo( sat.size * 2.2, -sat.size * 0.35);
    ctx.lineTo( sat.size * 2.2,  sat.size * 0.35);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function updateSatellites() {
    satellites.forEach(function (sat) {
      sat.angle += sat.dAngle;
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#08090b';
    ctx.fillRect(0, 0, W, H);

    drawNebula();
    drawStars();

    satellites.forEach(function (sat) {
      // Only draw satellite if it's in the upper arc (not "behind earth")
      const normY = Math.sin(sat.angle) * 0.38;
      if (normY < 0.15) {
        drawSatellite(sat);
      }
    });

    if (!prefersReducedMotion) {
      updateStars();
      updateSatellites();
    }

    rafId = requestAnimationFrame(render);
  }

  /* -- Parallax on banner -- */
  const bannerImg = document.querySelector('.banner-img');

  function handleParallax() {
    if (!bannerImg) return;
    const scrollY  = window.scrollY;
    const heroH    = document.querySelector('.hero').offsetHeight;
    if (scrollY < heroH) {
      const offset = scrollY * 0.28;
      bannerImg.style.transform = `scale(1.05) translateY(${offset}px)`;
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });

  /* -- Init -- */
  function init() {
    resize();
    render();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  // Wait for layout
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---- Phase timeline: expand on click ---- */
  document.addEventListener('DOMContentLoaded', function () {
    const phases = document.querySelectorAll('.timeline-phase');

    phases.forEach(function (phase) {
      const content = phase.querySelector('.phase-content');
      const body    = phase.querySelector('.phase-body');
      if (!body) return;

      // Collapse by default (except completed/active)
      if (!phase.classList.contains('completed') && !phase.classList.contains('active')) {
        body.style.maxHeight  = '0';
        body.style.overflow   = 'hidden';
        body.style.opacity    = '0';
        body.style.transition = 'max-height 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease';
        phase.setAttribute('data-collapsed', 'true');
      }

      content.style.cursor = 'pointer';
      content.setAttribute('role', 'button');
      content.setAttribute('tabindex', '0');
      content.setAttribute('aria-expanded',
        phase.classList.contains('completed') || phase.classList.contains('active') ? 'true' : 'false'
      );

      function toggle() {
        const collapsed = phase.getAttribute('data-collapsed') === 'true';
        if (collapsed) {
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity   = '1';
          phase.setAttribute('data-collapsed', 'false');
          content.setAttribute('aria-expanded', 'true');
        } else {
          body.style.maxHeight = '0';
          body.style.opacity   = '0';
          phase.setAttribute('data-collapsed', 'true');
          content.setAttribute('aria-expanded', 'false');
        }
      }

      content.addEventListener('click', toggle);
      content.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  });

  /* ---- Smooth scroll for anchor links (supplement CSS) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH   = nav ? nav.offsetHeight : 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

}());

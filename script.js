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
  }  /* ---- Premium Custom Cursor System ---- */
  let cursorDot, cursorRing;
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let dotX = -100, dotY = -100;
  let isHovered = false;

  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isCoarse) {
    cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor';
    cursorRing = document.createElement('div');
    cursorRing.className = 'custom-cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Custom cursor click ripple
    window.addEventListener('mousedown', function () {
      if (cursorRing) {
        cursorRing.style.width = '24px';
        cursorRing.style.height = '24px';
        cursorRing.style.borderColor = 'var(--green-bright)';
      }
    });

    window.addEventListener('mouseup', function () {
      if (cursorRing) {
        cursorRing.style.width = isHovered ? '56px' : '38px';
        cursorRing.style.height = isHovered ? '56px' : '38px';
        cursorRing.style.borderColor = isHovered ? 'var(--saffron-bright)' : 'rgba(232, 135, 58, 0.38)';
      }
    });

    // Animate loop for cursor lerping
    function animateCursor() {
      dotX += (mouseX - dotX) * 0.28;
      dotY += (mouseY - dotY) * 0.28;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top = dotY + 'px';

      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Attach interactive hover behaviors
    function bindCursorHovers() {
      const targets = document.querySelectorAll('a, button, [role="button"], .flow-step-inner, .phase-content');
      targets.forEach(function (el) {
        // Skip duplicate additions
        if (el.getAttribute('data-cursor-bound')) return;
        el.setAttribute('data-cursor-bound', 'true');

        el.addEventListener('mouseenter', function () {
          isHovered = true;
          cursorDot.classList.add('cursor-hover');
          cursorRing.classList.add('cursor-hover-ring');
        });
        el.addEventListener('mouseleave', function () {
          isHovered = false;
          cursorDot.classList.remove('cursor-hover');
          cursorRing.classList.remove('cursor-hover-ring');
        });
      });
    }

    // Dynamic polling of document to ensure newly added items are also bound
    setInterval(bindCursorHovers, 1000);
    document.addEventListener('DOMContentLoaded', bindCursorHovers);
  }

  /* ---- Space Canvas ---- */
  const canvas  = document.getElementById('spaceCanvas');
  if (canvas) {
    const ctx     = canvas.getContext('2d');
    let W, H;
    let stars     = [];
    let satellites = [];
    let comets    = [];
    let mouseCanvasX = -1000, mouseCanvasY = -1000;
    let rafId;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -- Resize -- */
    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initStars();
      initSatellites();
    }

    /* -- Track mouse for star shimmer and magnet repel -- */
    window.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouseCanvasX = e.clientX - rect.left;
      mouseCanvasY = e.clientY - rect.top;
    });

    /* -- Click to launch shooting comets -- */
    canvas.addEventListener('click', function (e) {
      if (prefersReducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      comets.push({
        x: clickX,
        y: clickY,
        dx: (Math.random() - 0.5) * 8 + (Math.random() < 0.5 ? -3 : 3),
        dy: Math.random() * 4 + 4,
        length: Math.random() * 80 + 40,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.015,
        width: Math.random() * 2 + 1
      });
    });

    /* -- Stars -- */
    function initStars() {
      stars = [];
      const count = Math.floor((W * H) / 10000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x:       Math.random() * W,
          y:       Math.random() * H,
          origX:   0,
          origY:   0,
          r:       Math.random() * 1.2 + 0.2,
          alpha:   Math.random() * 0.6 + 0.2,
          dAlpha:  (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
          twinkle: Math.random() < 0.35,
        });
        stars[i].origX = stars[i].x;
        stars[i].origY = stars[i].y;
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

      // Draw dynamic constellation grid connecting stars to cursor and each other
      if (!prefersReducedMotion && mouseCanvasX > -500) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < stars.length; i++) {
          const s1 = stars[i];
          const dx1 = s1.x - mouseCanvasX;
          const dy1 = s1.y - mouseCanvasY;
          const dist1 = Math.sqrt(dx1*dx1 + dy1*dy1);
          
          if (dist1 < 140) {
            // Draw link from cursor to star (saffron color packet)
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(mouseCanvasX, mouseCanvasY);
            const alpha1 = ((140 - dist1) / 140) * 0.14;
            ctx.strokeStyle = `rgba(232, 135, 58, ${alpha1})`;
            ctx.stroke();
            
            // Connect to neighboring stars (green/blue transmission grid)
            for (let j = i + 1; j < stars.length; j++) {
              const s2 = stars[j];
              const dx2 = s2.x - s1.x;
              const dy2 = s2.y - s1.y;
              const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
              
              if (dist2 < 75) {
                ctx.beginPath();
                ctx.moveTo(s1.x, s1.y);
                ctx.lineTo(s2.x, s2.y);
                const alpha2 = ((140 - dist1) / 140) * ((75 - dist2) / 75) * 0.22;
                ctx.strokeStyle = `rgba(74, 138, 91, ${alpha2})`;
                ctx.stroke();
              }
            }
          }
        }
      }
    }

    function updateStars() {
      stars.forEach(function (s) {
        // Sparkle and repel slightly from cursor
        const dx = s.origX - mouseCanvasX;
        const dy = s.origY - mouseCanvasY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 120) {
          const force = (120 - dist) * 0.06;
          s.x = s.origX + (dx / dist) * force;
          s.y = s.origY + (dy / dist) * force;
          s.alpha = Math.min(1.0, s.alpha + 0.05);
        } else {
          // Gently slide back to original coordinates
          s.x += (s.origX - s.x) * 0.08;
          s.y += (s.origY - s.y) * 0.08;
          if (s.twinkle) {
            s.alpha += s.dAlpha;
            if (s.alpha > 0.85 || s.alpha < 0.05) s.dAlpha *= -1;
          }
        }
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
      const y = sat.cy + Math.sin(sat.angle) * sat.radius * 0.38;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sat.angle + Math.PI / 4);
      ctx.globalAlpha = sat.opacity;

      ctx.fillStyle   = 'rgba(200, 210, 220, 1)';
      ctx.fillRect(-sat.size, -sat.size * 0.6, sat.size * 2, sat.size * 1.2);

      ctx.fillStyle = 'rgba(60, 90, 130, 0.8)';
      ctx.fillRect(-sat.size * 3.2, -sat.size * 0.35, sat.size * 2, sat.size * 0.7);
      ctx.fillRect( sat.size * 1.2, -sat.size * 0.35, sat.size * 2, sat.size * 0.7);

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

    function drawComets() {
      comets.forEach(function (c) {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.dx * 3, c.y - c.dy * 3);
        grad.addColorStop(0, `rgba(232, 135, 58, ${c.alpha})`);
        grad.addColorStop(0.4, `rgba(74, 138, 91, ${c.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.width;
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.dx * 3.5, c.y - c.dy * 3.5);
        ctx.stroke();
      });
    }

    function updateComets() {
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.dx;
        c.y += c.dy;
        c.alpha -= c.decay;
        if (c.alpha <= 0) {
          comets.splice(i, 1);
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#08090b';
      ctx.fillRect(0, 0, W, H);

      drawNebula();
      drawStars();
      drawComets();

      satellites.forEach(function (sat) {
        const normY = Math.sin(sat.angle) * 0.38;
        if (normY < 0.15) {
          drawSatellite(sat);
        }
      });

      if (!prefersReducedMotion) {
        updateStars();
        updateSatellites();
        updateComets();
      }

      rafId = requestAnimationFrame(render);
    }

    resize();
    render();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  /* -- Parallax on hero background image -- */
  const heroBgImg = document.querySelector('.hero-bg-img');

  function handleParallax() {
    if (!heroBgImg) return;
    const scrollY  = window.scrollY;
    const heroH    = document.querySelector('.hero').offsetHeight;
    if (scrollY < heroH) {
      const offset = scrollY * 0.28;
      heroBgImg.style.transform = `scale(1.05) translateY(${offset}px)`;
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

  /* ---- Interactive 3D Earth ---- */
  const earthCanvas = document.getElementById('earthCanvas');
  if (earthCanvas) {
    const eCtx = earthCanvas.getContext('2d');
    let eW, eH;
    let rx = 0.4;  // rotation X
    let ry = 0.8;  // rotation Y
    let targetRx = 0.4;
    let targetRy = 0.8;
    let isDragging = false;
    let lastMouseX, lastMouseY;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    const earthRadius = 90;
    
    // Generate Earth nodes (Fibonacci sphere distribution for uniform nodes)
    const nodes = [];
    const numNodes = 120;
    for (let i = 0; i < numNodes; i++) {
      const theta = Math.acos(-1 + (2 * i) / numNodes);
      const phi = Math.sqrt(numNodes * Math.PI) * theta;
      nodes.push({
        x: Math.sin(theta) * Math.cos(phi) * earthRadius,
        y: Math.cos(theta) * earthRadius,
        z: Math.sin(theta) * Math.sin(phi) * earthRadius,
        active: Math.random() < 0.2,
        blinkSpeed: 0.05 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }

    const numLatitudes = 8;
    const numLongitudes = 10;
    
    function resizeEarth() {
      const rect = earthCanvas.getBoundingClientRect();
      eW = earthCanvas.width = rect.width * (window.devicePixelRatio || 1);
      eH = earthCanvas.height = rect.height * (window.devicePixelRatio || 1);
      eCtx.resetTransform();
      eCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }
    
    // 3D Point Projection helper
    function project(x, y, z) {
      // Rotate Y
      const x1 = x * Math.cos(ry) - z * Math.sin(ry);
      const z1 = x * Math.sin(ry) + z * Math.cos(ry);
      // Rotate X
      const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      
      const cx = 150;
      const cy = 150;
      return {
        x: cx + x1,
        y: cy + y2,
        z: z2
      };
    }
    
    function drawEarth() {
      eCtx.clearRect(0, 0, 300, 300);
      
      // Auto rotate when not dragging
      if (!isDragging) {
        dragVelocityX *= 0.95;
        dragVelocityY *= 0.95;
        ry += 0.0035 + dragVelocityX;
        rx += dragVelocityY;
        rx = Math.max(-Math.PI/3, Math.min(Math.PI/3, rx));
      } else {
        ry += (targetRy - ry) * 0.2;
        rx += (targetRx - rx) * 0.2;
      }
      
      const centerX = 150;
      const centerY = 150;
      
      // 1. Atmosphere / Outer Glow
      const glowGrad = eCtx.createRadialGradient(centerX, centerY, earthRadius - 2, centerX, centerY, earthRadius + 15);
      glowGrad.addColorStop(0, 'rgba(74, 138, 91, 0.18)');
      glowGrad.addColorStop(0.5, 'rgba(74, 138, 91, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      eCtx.fillStyle = glowGrad;
      eCtx.beginPath();
      eCtx.arc(centerX, centerY, earthRadius + 15, 0, Math.PI * 2);
      eCtx.fill();
      
      // Base dark globe representing shadowed earth
      eCtx.fillStyle = 'rgba(8, 10, 16, 0.9)';
      eCtx.beginPath();
      eCtx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      eCtx.fill();
      
      eCtx.lineWidth = 0.5;
      
      // Longitude lines
      for (let j = 0; j < numLongitudes; j++) {
        const phi = (j / numLongitudes) * Math.PI * 2;
        eCtx.beginPath();
        let first = true;
        for (let i = 0; i <= 36; i++) {
          const theta = (i / 36) * Math.PI;
          const x = Math.sin(theta) * Math.cos(phi) * earthRadius;
          const y = Math.cos(theta) * earthRadius;
          const z = Math.sin(theta) * Math.sin(phi) * earthRadius;
          const pt = project(x, y, z);
          
          if (first) {
            eCtx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            eCtx.lineTo(pt.x, pt.y);
          }
        }
        eCtx.strokeStyle = 'rgba(74, 138, 91, 0.07)';
        eCtx.stroke();
      }
      
      // Latitude lines
      for (let j = 1; j < numLatitudes; j++) {
        const theta = (j / numLatitudes) * Math.PI;
        const latRad = Math.sin(theta) * earthRadius;
        const y = Math.cos(theta) * earthRadius;
        eCtx.beginPath();
        let first = true;
        for (let i = 0; i <= 36; i++) {
          const phi = (i / 36) * Math.PI * 2;
          const x = Math.cos(phi) * latRad;
          const z = Math.sin(phi) * latRad;
          const pt = project(x, y, z);
          
          if (first) {
            eCtx.moveTo(pt.x, pt.y);
            first = false;
          } else {
            eCtx.lineTo(pt.x, pt.y);
          }
        }
        eCtx.strokeStyle = 'rgba(74, 138, 91, 0.07)';
        eCtx.stroke();
      }

      // 2. Volumetric Nodes (back nodes first, then connections, then front nodes)
      const projectedNodes = nodes.map(n => {
        n.phase += n.blinkSpeed;
        const pt = project(n.x, n.y, n.z);
        return {
          orig: n,
          x: pt.x,
          y: pt.y,
          z: pt.z
        };
      });
      
      projectedNodes.sort((a, b) => a.z - b.z);
      
      // Draw connection lines
      eCtx.strokeStyle = 'rgba(74, 138, 91, 0.12)';
      eCtx.lineWidth = 0.5;
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        if (n1.z < 0) continue;
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j];
          if (n2.z < 0) continue;
          
          const dx = n1.orig.x - n2.orig.x;
          const dy = n1.orig.y - n2.orig.y;
          const dz = n1.orig.z - n2.orig.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < 40) {
            eCtx.beginPath();
            eCtx.moveTo(n1.x, n1.y);
            eCtx.lineTo(n2.x, n2.y);
            eCtx.stroke();
          }
        }
      }
      
      // Draw nodes
      projectedNodes.forEach(pn => {
        const isFront = pn.z >= 0;
        const baseOpacity = isFront ? 0.7 : 0.15;
        const scale = isFront ? 1.0 : 0.6;
        
        eCtx.beginPath();
        if (pn.orig.active) {
          const blink = Math.sin(pn.orig.phase) * 0.4 + 0.6;
          eCtx.arc(pn.x, pn.y, 2.5 * scale, 0, Math.PI * 2);
          eCtx.fillStyle = `rgba(232, 135, 58, ${baseOpacity * blink})`;
          eCtx.fill();
          
          if (isFront) {
            eCtx.beginPath();
            eCtx.arc(pn.x, pn.y, 5, 0, Math.PI * 2);
            eCtx.strokeStyle = `rgba(232, 135, 58, ${0.12 * blink})`;
            eCtx.stroke();
          }
        } else {
          eCtx.arc(pn.x, pn.y, 1.2 * scale, 0, Math.PI * 2);
          eCtx.fillStyle = isFront ? 'rgba(74, 138, 91, 0.6)' : 'rgba(74, 138, 91, 0.15)';
          eCtx.fill();
        }
      });
      
      // 3. Orbiting Satellite and Signal Beams
      const satTime = Date.now() * 0.0006;
      const satOrbitRadius = earthRadius * 1.35;
      
      const satX = Math.cos(satTime) * satOrbitRadius;
      const satY = Math.sin(satTime) * Math.cos(0.5) * satOrbitRadius;
      const satZ = Math.sin(satTime) * Math.sin(0.5) * satOrbitRadius;
      
      const satPt = project(satX, satY, satZ);
      
      eCtx.beginPath();
      let orbitFirst = true;
      for (let i = 0; i <= 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const oX = Math.cos(angle) * satOrbitRadius;
        const oY = Math.sin(angle) * Math.cos(0.5) * satOrbitRadius;
        const oZ = Math.sin(angle) * Math.sin(0.5) * satOrbitRadius;
        const opt = project(oX, oY, oZ);
        
        if (opt.z > -10) {
          if (orbitFirst) {
            eCtx.moveTo(opt.x, opt.y);
            orbitFirst = false;
          } else {
            eCtx.lineTo(opt.x, opt.y);
          }
        }
      }
      eCtx.lineWidth = 0.6;
      eCtx.strokeStyle = 'rgba(232, 135, 58, 0.12)';
      eCtx.stroke();
      
      const satFront = satPt.z >= 0;
      const satOpacity = satFront ? 0.9 : 0.2;
      
      eCtx.fillStyle = `rgba(232, 135, 58, ${satOpacity})`;
      eCtx.beginPath();
      eCtx.arc(satPt.x, satPt.y, 3.5, 0, Math.PI * 2);
      eCtx.fill();
      
      eCtx.strokeStyle = `rgba(74, 138, 91, ${satOpacity * 0.8})`;
      eCtx.lineWidth = 1;
      eCtx.beginPath();
      eCtx.moveTo(satPt.x - 7, satPt.y);
      eCtx.lineTo(satPt.x + 7, satPt.y);
      eCtx.stroke();
      
      if (satFront) {
        const frontActive = projectedNodes.find(pn => pn.z > 20 && pn.orig.active);
        if (frontActive) {
          eCtx.beginPath();
          eCtx.moveTo(satPt.x, satPt.y);
          eCtx.lineTo(frontActive.x, frontActive.y);
          eCtx.strokeStyle = 'rgba(232, 135, 58, 0.22)';
          eCtx.lineWidth = 0.8;
          eCtx.setLineDash([3, 4]);
          eCtx.stroke();
          eCtx.setLineDash([]);
          
          eCtx.beginPath();
          eCtx.arc(frontActive.x, frontActive.y, 3.5, 0, Math.PI * 2);
          eCtx.fillStyle = 'rgba(232, 135, 58, 0.4)';
          eCtx.fill();
        }
      }
      
      eCtx.beginPath();
      eCtx.arc(centerX, centerY, earthRadius + 22, 0, Math.PI * 2);
      eCtx.strokeStyle = 'rgba(74, 138, 91, 0.04)';
      eCtx.lineWidth = 1;
      eCtx.stroke();

      requestAnimationFrame(drawEarth);
    }
    
    resizeEarth();
    window.addEventListener('resize', resizeEarth);
    drawEarth();
    
    function startDrag(clientX, clientY) {
      isDragging = true;
      lastMouseX = clientX;
      lastMouseY = clientY;
      dragVelocityX = 0;
      dragVelocityY = 0;
    }
    
    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      const dx = clientX - lastMouseX;
      const dy = clientY - lastMouseY;
      
      targetRy = ry + dx * 0.007;
      targetRx = rx + dy * 0.007;
      targetRx = Math.max(-Math.PI/3, Math.min(Math.PI/3, targetRx));
      
      dragVelocityX = dx * 0.0012;
      dragVelocityY = dy * 0.0012;
      
      lastMouseX = clientX;
      lastMouseY = clientY;
    }
    
    function endDrag() {
      isDragging = false;
    }
    
    earthCanvas.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
    });
    
    window.addEventListener('mousemove', (e) => {
      moveDrag(e.clientX, e.clientY);
    });
    
    window.addEventListener('mouseup', () => {
      endDrag();
    });
    
    earthCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    
    earthCanvas.addEventListener('touchend', () => {
      endDrag();
    });
  }

  /* ---- 3D Perspective Tilt Parallax on Hero Content ---- */
  (function() {
    const hero = document.getElementById('home');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent || isCoarse) return;
    
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    
    hero.addEventListener('mousemove', function(e) {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Target rotation angles (max 10 degrees)
      targetTiltX = -(y / (rect.height / 2)) * 10;
      targetTiltY = (x / (rect.width / 2)) * 10;
    });
    
    hero.addEventListener('mouseleave', function() {
      targetTiltX = 0;
      targetTiltY = 0;
    });
    
    function updateTilt() {
      // Lerp for liquid smooth physics
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;
      
      heroContent.style.transform = `perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
      requestAnimationFrame(updateTilt);
    }
    updateTilt();
  }());

}());

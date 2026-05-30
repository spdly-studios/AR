(() => {

  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });

  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navMobile.classList.remove('open'));
  });

  const bgAudio = document.getElementById('bg-audio');
  const musicPrompt = document.getElementById('bg-music-prompt');
  const musicToggle = document.getElementById('music-toggle');
  const iconOn = musicToggle.querySelector('.icon-music-on');
  const iconOff = musicToggle.querySelector('.icon-music-off');
  let musicPlaying = false;

  bgAudio.volume = 0.3;
  bgAudio.crossOrigin = "anonymous";
  
  // Handle audio buffering for seamless playback
  bgAudio.addEventListener('ended', () => {
    if (musicPlaying) {
      bgAudio.currentTime = 0;
      bgAudio.play().catch(() => {});
    }
  }, false);

  document.getElementById('music-yes').addEventListener('click', () => {
    bgAudio.play().catch(() => {});
    musicPlaying = true;
    musicPrompt.style.display = 'none';
    musicToggle.classList.remove('hidden');
    iconOn.classList.remove('hidden');
    iconOff.classList.add('hidden');
  });

  document.getElementById('music-no').addEventListener('click', () => {
    musicPrompt.style.display = 'none';
    musicToggle.classList.remove('hidden');
    iconOn.classList.add('hidden');
    iconOff.classList.remove('hidden');
  });

  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      bgAudio.pause();
      musicPlaying = false;
      iconOn.classList.add('hidden');
      iconOff.classList.remove('hidden');
    } else {
      bgAudio.play().catch(() => {});
      musicPlaying = true;
      iconOn.classList.remove('hidden');
      iconOff.classList.add('hidden');
    }
  });

  function createStars(container, count) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'star-dot';
      const size = Math.random() * 2.5 + 0.5;
      dot.style.cssText = [
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `width:${size}px`,
        `height:${size}px`,
        `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
        `--delay:${(Math.random() * 5).toFixed(1)}s`,
        `--max-op:${(Math.random() * 0.7 + 0.2).toFixed(2)}`,
        `opacity:0`
      ].join(';');
      frag.appendChild(dot);
    }
    container.appendChild(frag);
  }

  const starsLayer = document.getElementById('stars-layer');
  if (starsLayer) createStars(starsLayer, 180);

  const joinStars = document.getElementById('join-stars');
  if (joinStars) createStars(joinStars, 60);

  const canvas = document.getElementById('orbit-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, cx, cy, earthR;
  let satellites = [];
  let animFrame;

  const SAT_CONFIG = [
    { orbitRxFactor: 0.72, orbitRyFactor: 0.22, tilt: -0.18, speed: 0.0008, color: '#FF9933', size: 5, trailLen: 0.6 },
    { orbitRxFactor: 0.58, orbitRyFactor: 0.16, tilt: 0.25, speed: -0.0006, color: '#138808', size: 4, trailLen: 0.5 },
    { orbitRxFactor: 0.88, orbitRyFactor: 0.27, tilt: 0.08, speed: 0.0005, color: 'rgba(255,255,255,0.5)', size: 3, trailLen: 0.4 },
  ];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W * 0.5;
    cy = H * 0.78;
    earthR = Math.min(W, H) * 0.38;

    satellites = SAT_CONFIG.map((cfg, idx) => ({
      ...cfg,
      orbitRx: earthR * cfg.orbitRxFactor,
      orbitRy: earthR * cfg.orbitRyFactor,
      angle: (idx / SAT_CONFIG.length) * Math.PI * 2,
      trail: []
    }));
  }

  function drawEllipticOrbit(sat) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sat.tilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, sat.orbitRx, sat.orbitRy, 0, 0, Math.PI * 2);
    ctx.strokeStyle = sat.color.includes('rgba') ? 'rgba(255,255,255,0.04)' : sat.color + '18';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }

  function ellipticPoint(sat, angle) {
    const cosT = Math.cos(sat.tilt);
    const sinT = Math.sin(sat.tilt);
    const lx = Math.cos(angle) * sat.orbitRx;
    const ly = Math.sin(angle) * sat.orbitRy;
    return {
      x: cx + lx * cosT - ly * sinT,
      y: cy + lx * sinT + ly * cosT
    };
  }

  function drawSatellite(sat, pos) {
    const sz = sat.size;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(sat.angle + Math.PI / 4);

    ctx.fillStyle = sat.color;
    ctx.fillRect(-sz * 0.3, -sz * 0.3, sz * 0.6, sz * 0.6);

    ctx.fillStyle = sat.color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(-sz * 1.8, -sz * 0.12, sz * 1.2, sz * 0.24);
    ctx.fillRect(sz * 0.6, -sz * 0.12, sz * 1.2, sz * 0.24);

    ctx.restore();

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, sz * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = sat.color;
    ctx.globalAlpha = 0.06;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawTrail(sat) {
    if (sat.trail.length < 2) return;
    for (let i = 1; i < sat.trail.length; i++) {
      const t = i / sat.trail.length;
      const p0 = sat.trail[i - 1];
      const p1 = sat.trail[i];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = sat.color;
      ctx.globalAlpha = t * 0.35;
      ctx.lineWidth = (sat.size * 0.4) * t;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  const TRAIL_MAX = 80;

  function animate() {
    ctx.clearRect(0, 0, W, H);

    satellites.forEach(sat => {
      drawEllipticOrbit(sat);
    });

    satellites.forEach(sat => {
      sat.angle += sat.speed;

      const pos = ellipticPoint(sat, sat.angle);
      sat.trail.push({ x: pos.x, y: pos.y });
      if (sat.trail.length > TRAIL_MAX) sat.trail.shift();

      drawTrail(sat);
      drawSatellite(sat, pos);
    });

    animFrame = requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrame);
    resize();
    animate();
  });
  animate();

  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const heroContent = document.querySelector('.hero-content');
  const heroBgImg = document.getElementById('hero-bg-img');

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    const hH = document.getElementById('hero').offsetHeight;
    if (sy < hH) {
      if (heroContent) heroContent.style.transform = `translateY(${sy * 0.18}px)`;
      if (heroBgImg) heroBgImg.style.transform = `scale(1.04) translateY(${sy * 0.08}px)`;
    }
  }, { passive: true });

  const roleTagEls = document.querySelectorAll('.role-tag');
  roleTagEls.forEach((tag, i) => {
    tag.style.animationDelay = `${i * 0.08}s`;
    tag.addEventListener('mouseenter', () => {
      tag.style.borderColor = 'var(--aksha)';
      tag.style.color = 'var(--aksha)';
    });
    tag.addEventListener('mouseleave', () => {
      tag.style.borderColor = '';
      tag.style.color = '';
    });
  });

  const heroSection = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      heroSection.querySelectorAll('.reveal-up').forEach(el => {
        setTimeout(() => el.classList.add('revealed'), 100);
      });
    }
  }, { threshold: 0.01 });
  heroObserver.observe(heroSection);

  // 3D Satellite Sphere
  const container = document.getElementById('satellite-3d-container');
  if (container && typeof THREE !== 'undefined') {
    let scene, camera, renderer, earth, satellites3d = [];
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;

    function init3D() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020408);
      
      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.z = 3.5;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // Create Earth sphere
      const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x138808,
        emissive: 0x0a4d04,
        shininess: 5
      });
      earth = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earth);

      // Add atmosphere glow
      const atmosphereGeometry = new THREE.SphereGeometry(1.08, 64, 64);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF9933,
        transparent: true,
        opacity: 0.1
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphere);

      // Create orbital paths and satellites
      const orbits = [
        { radius: 1.8, speed: 0.001, color: 0xFF9933, count: 2 },
        { radius: 2.2, speed: -0.0008, color: 0x138808, count: 2 },
        { radius: 2.6, speed: 0.0006, color: 0xffffff, count: 1 }
      ];

      orbits.forEach((orbit, orbitIdx) => {
        // Draw orbital line
        const orbitPoints = [];
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          orbitPoints.push(new THREE.Vector3(
            Math.cos(angle) * orbit.radius,
            Math.sin(angle) * orbit.radius * 0.3,
            Math.sin(angle) * orbit.radius * 0.5
          ));
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ 
          color: orbit.color, 
          transparent: true,
          opacity: 0.3,
          linewidth: 1
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);

        // Create satellites
        for (let i = 0; i < orbit.count; i++) {
          const satGeometry = new THREE.OctahedronGeometry(0.08, 1);
          const satMaterial = new THREE.MeshPhongMaterial({ 
            color: orbit.color,
            emissive: orbit.color,
            emissiveIntensity: 0.5
          });
          const satellite = new THREE.Mesh(satGeometry, satMaterial);
          
          satellite.orbit = {
            radius: orbit.radius,
            speed: orbit.speed,
            angle: (i / orbit.count) * Math.PI * 2,
            yRadiusMultiplier: 0.3,
            zRadiusMultiplier: 0.5,
            color: orbit.color
          };
          
          satellites3d.push(satellite);
          scene.add(satellite);
        }
      });

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xFF9933, 1, 100);
      pointLight.position.set(5, 3, 5);
      scene.add(pointLight);

      // Mouse controls
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width * 2 - 1;
        mouseY = -(e.clientY - rect.top) / rect.height * 2 + 1;
        targetRotationX = mouseY * 0.5;
        targetRotationY = mouseX * 0.5;
      });

      // Touch controls
      container.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const rect = container.getBoundingClientRect();
          const touch = e.touches[0];
          mouseX = (touch.clientX - rect.left) / rect.width * 2 - 1;
          mouseY = -(touch.clientY - rect.top) / rect.height * 2 + 1;
          targetRotationX = mouseY * 0.5;
          targetRotationY = mouseX * 0.5;
        }
      });

      window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });

      animate3D();
    }

    function animate3D() {
      requestAnimationFrame(animate3D);

      // Smooth camera rotation
      earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.05;
      earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.05;

      // Auto-rotate slightly when mouse isn't moving
      earth.rotation.y += 0.0002;

      // Update satellites
      satellites3d.forEach(sat => {
        sat.orbit.angle += sat.orbit.speed;
        
        const x = Math.cos(sat.orbit.angle) * sat.orbit.radius;
        const y = Math.sin(sat.orbit.angle) * sat.orbit.radius * sat.orbit.yRadiusMultiplier;
        const z = Math.sin(sat.orbit.angle) * sat.orbit.radius * sat.orbit.zRadiusMultiplier;
        
        sat.position.set(x, y, z);
        sat.rotation.x += 0.01;
        sat.rotation.y += 0.02;
      });

      renderer.render(scene, camera);
    }

    // Initialize when visible
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        init3D();
        observer.disconnect();
      }
    });
    observer.observe(container);
  }

})();

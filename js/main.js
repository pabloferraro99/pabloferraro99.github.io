/* ============================================
   PORTFOLIO — Main JavaScript
   Vanilla JS — No dependencies
   ============================================ */

(function () {
  'use strict';

  // --- DOM Elements ---
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const yearEl = document.getElementById('year');

  // --- Set current year ---
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Navbar: glass-morphism on scroll ---
  function handleNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load

  // --- Hamburger menu toggle ---
  hamburger.addEventListener('click', function () {
    nav.classList.toggle('nav--open');
    document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('.nav__mobile-link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll reveal animations (Intersection Observer) ---
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    revealElements.forEach(function (el) {
      el.classList.add('active');
    });
  }

  // --- Hero particle network animation ---
  (function initParticles() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 70;
    var connectionDistance = 140;
    var mouseRadius = 180;
    var mouseX = -1000;
    var mouseY = -1000;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        // Mix of blue and purple tinted particles
        var hue = Math.random() > 0.8 ? 'purple' : 'blue';
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          baseR: Math.random() * 1.2 + 0.5,
          r: 0,
          pulse: Math.random() * Math.PI * 2,
          hue: hue
        });
      }
    }

    resize();
    createParticles();
    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    var hero = document.getElementById('hero');
    hero.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', function () {
      mouseX = -1000;
      mouseY = -1000;
    });

    var time = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      // Draw connections first (behind particles)
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var cdx = p.x - p2.x;
          var cdy = p.y - p2.y;
          var dist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (dist < connectionDistance) {
            var lineAlpha = (1 - dist / connectionDistance) * 0.1;

            var midX = (p.x + p2.x) / 2;
            var midY = (p.y + p2.y) / 2;
            var midDist = Math.sqrt((midX - mouseX) * (midX - mouseX) + (midY - mouseY) * (midY - mouseY));
            if (midDist < mouseRadius) {
              var boost = 1 - midDist / mouseRadius;
              lineAlpha = (1 - dist / connectionDistance) * (0.1 + boost * 0.2);
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(100, 160, 255, ' + lineAlpha + ')';
            ctx.lineWidth = midDist < mouseRadius ? 0.7 : 0.4;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        p.r = p.baseR + Math.sin(time * 2 + p.pulse) * 0.3;

        var dx = p.x - mouseX;
        var dy = p.y - mouseY;
        var distToMouse = Math.sqrt(dx * dx + dy * dy);
        var mouseInfluence = Math.max(0, 1 - distToMouse / mouseRadius);

        if (distToMouse < mouseRadius && distToMouse > 5) {
          p.x -= dx * 0.004 * mouseInfluence;
          p.y -= dy * 0.004 * mouseInfluence;
        }

        var alpha = 0.2 + mouseInfluence * 0.4;
        var radius = p.r + mouseInfluence * 1.5;
        var color = p.hue === 'purple' ? '139, 92, 246' : '80, 140, 255';

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ', ' + alpha + ')';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    animate();
  })();

  // --- Active section highlighting in nav ---
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav__link[data-section]');

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var sectionId = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle(
                'nav__link--active',
                link.getAttribute('data-section') === sectionId
              );
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: '-72px 0px -50% 0px' }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();

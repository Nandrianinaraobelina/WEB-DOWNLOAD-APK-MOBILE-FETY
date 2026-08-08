/* ============================================================
   FetyApp — Landing page de téléchargement
   Animations : GSAP + ScrollTrigger + Lenis + Motion + Three.js
   (repli automatique vers les animations vanilla si un CDN échoue)
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const doc = document.documentElement;

  const gsapReady = !prefersReduced && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motionReady = !prefersReduced && typeof window.Motion !== 'undefined';

  if (gsapReady) doc.classList.add('gsap-ready');
  if (motionReady) doc.classList.add('motion-ready');

  /* ============================================================
     AFFICHAGE DE LA PAGE (planifié EN PREMIER, quoi qu'il arrive)
     ============================================================ */
  const preloader = document.getElementById('preloader');
  let revealed = false;

  // Force tout le contenu à devenir visible (filet de sécurité)
  function forceShowAll() {
    doc.classList.add('no-anim');
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-blur')
      .forEach(function (el) { el.classList.add('visible'); });
  }

  // heroEntrance (GSAP) est déclarée plus bas — les déclarations de fonction
  // sont hoistées, donc elle est déjà disponible ici.

  function revealPage() {
    if (revealed) return;
    revealed = true;
    doc.classList.add('page-ready');
    if (gsapReady) {
      try {
        heroEntrance();
      } catch (e) {
        forceShowAll();
      }
    }
    if (preloader) {
      setTimeout(function () { preloader.remove(); }, 600);
    }
  }

  if (prefersReduced) {
    // Mouvement réduit : on affiche directement le contenu
    revealPage();
  } else if (preloader) {
    // L'entrée du hero démarre quand le rideau du preloader s'est levé
    preloader.addEventListener('animationend', revealPage, { once: true });
    // Filet de sécurité si l'événement ne se déclenche pas
    setTimeout(revealPage, 3200);
  } else {
    setTimeout(revealPage, 1550);
  }

  /* ============================================================
     SPLIT TEXT (mots du titre) — isolé : une erreur ici ne bloque rien
     ============================================================ */
  try {
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle && !prefersReduced) {
      const nodes = Array.from(heroTitle.childNodes);
      let idx = 0;
      nodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (part === '') return;
            const span = document.createElement('span');
            if (part.trim() === '') {
              span.className = 'split-word space';
              span.innerHTML = '&nbsp;';
            } else {
              span.className = 'split-word';
              span.textContent = part;
              span.style.setProperty('--i', idx++);
            }
            frag.appendChild(span);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.classList.add('split-word');
          node.style.setProperty('--i', idx++);
        }
      });
    }
  } catch (e) { /* split text optionnel */ }

  /* ============================================================
     LENIS (smooth scroll) + synchronisation GSAP — isolé
     ============================================================ */
  let lenis = null;
  try {
    if (window.Lenis && !prefersReduced) {
      lenis = new Lenis({
        duration: 1.2,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
      });

      if (gsapReady) {
        // Intégration officielle Lenis <-> GSAP ScrollTrigger
        lenis.on('scroll', window.ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        (function rafLenis(time) {
          lenis.raf(time);
          requestAnimationFrame(rafLenis);
        })(0);
      }
      document.documentElement.style.scrollBehavior = 'auto';
    }
  } catch (e) { lenis = null; }

  // Ancres : scroll fluide via Lenis (sinon smooth natif)
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     ENTRÉE DU HERO (GSAP timeline)
     ============================================================ */
  function heroEntrance() {
    const words = gsap.utils.toArray('.hero h1 .split-word');
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero .badge', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo(
        words,
        { opacity: 0, y: 36, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, stagger: 0.05 },
        '-=0.35'
      )
      .fromTo('.hero .subtitle', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35')
      .fromTo('.hero .cta-row', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo('.hero .hero-stats', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo(
        '.phone-wrap',
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.inOut' },
        '-=0.4'
      )
      // Entrée 3D spectaculaire du téléphone (rotation + zoom + flou)
      .fromTo(
        '.phone-tilt',
        { rotateY: 45, scale: 0.7, opacity: 0, filter: 'blur(6px)' },
        { rotateY: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out' },
        '-=0.9'
      );

    // Une fois l'entrée terminée : le téléphone suit le scroll jusqu'au footer
    tl.eventCallback('onComplete', function () { initPhoneFollow(); });
  }

  /* ============================================================
     TÉLÉPHONE : suivi du scroll jusqu'au footer
     Le téléphone passe en position:fixed à son emplacement du hero,
     puis descend (scrub) jusqu'à la zone du footer quand on scroll,
     et remonte quand on remonte la page. Il reste DEVANT les cartes.
     ============================================================ */
  let phoneFollowInit = false;

  function initPhoneFollow() {
    if (phoneFollowInit || !gsapReady) return;
    const wrap = document.querySelector('.phone-wrap');
    const hero = document.querySelector('.hero');
    const footer = document.querySelector('footer');
    if (!wrap || !hero || !footer) return;

    // Position du téléphone DANS le hero (avant de passer en fixed)
    const heroRect = hero.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const relLeft = wrapRect.left - heroRect.left;
    const relTop = wrapRect.top - heroRect.top;
    const width = wrapRect.width;

    // Distance à parcourir pour terminer la descente près du footer
    function computeTravel() {
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const footRect = footer.getBoundingClientRect();
      const target = footRect.top + window.scrollY - width * 1.2;
      const current = wrapRect.top + window.scrollY;
      return Math.max(0, target - current);
    }

    let travel = computeTravel();
    let followTween = null;

    function createFollowTween() {
      if (followTween) { followTween.scrollTrigger.kill(); followTween.kill(); }
      followTween = gsap.to(wrap, {
        y: travel,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6
        }
      });
    }

    // Passe en fixed à l'emplacement exact du hero (aucun saut visuel)
    wrap.classList.add('phone-follow');
    gsap.set(wrap, {
      top: wrapRect.top,
      left: wrapRect.left,
      width: width,
      position: 'fixed'
    });

    // Descente liée au scroll (scrub) : on remonte quand on remonte la page
    createFollowTween();

    // Au redimensionnement, on recalcule la course (la position fixed ne
    // change que si on est encore en haut de page, sinon pas de saut visuel)
    function rebuild() {
      if (window.scrollY < 4) {
        gsap.set(wrap, {
          top: hero.getBoundingClientRect().top + relTop,
          left: hero.getBoundingClientRect().left + relLeft
        });
      }
      travel = computeTravel();
      createFollowTween();
      window.ScrollTrigger.refresh();
    }
    let resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 180);
    });

    phoneFollowInit = true;
  }

  /* ================= NAVBAR ================= */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ================= SCROLL PROGRESS + REVEALS + PARALLAX ================= */
  const progress = document.getElementById('scroll-progress');

  if (gsapReady) {
    // Barre de progression pilotée par ScrollTrigger
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        progress.style.transform = 'scaleX(' + self.progress + ')';
      }
    });

    // Scroll reveal des sections (variantes gérées via les valeurs CSS initiales)
    gsap.utils.toArray('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-blur')
      .forEach(function (el) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: function () {
            gsap.to(el, {
              opacity: 1,
              x: 0, y: 0, scale: 1,
              filter: 'blur(0px)',
              duration: 0.9,
              ease: 'power3.out'
            });
          }
        });
      });

    // Parallax du hero (scrub)
    gsap.to('.blob-a', {
      yPercent: 60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.blob-b', {
      yPercent: 90, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    // Parallax de la colonne texte (le téléphone, lui, reste fixed et suit le scroll)
    gsap.to('.hero-copy', {
      y: 140, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 40%', scrub: 0.5 }
    });

    // Recalcule après chargement complet (polices, images)
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
  } else {
    // ---------- Repli vanilla (sans GSAP) ----------
    let parallaxTicking = false;

    function updateScrollFx() {
      const y = window.scrollY;
      const max = doc.scrollHeight - window.innerHeight;

      if (progress) {
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      }
      if (prefersReduced) return;

      const blobA = document.querySelector('.blob-a');
      const blobB = document.querySelector('.blob-b');
      const heroCopy = document.querySelector('.hero-copy');

      if (blobA) blobA.style.transform = 'translateY(' + (y * -0.12) + 'px)';
      if (blobB) blobB.style.transform = 'translateY(' + (y * -0.18) + 'px)';
      if (heroCopy) {
        heroCopy.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        heroCopy.style.opacity = Math.max(0, 1 - y / 620);
      }
      parallaxTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(updateScrollFx);
      }
    }, { passive: true });
    updateScrollFx();

    // Reveal vanilla
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-blur')
      .forEach(function (el) { revealObserver.observe(el); });

    document.querySelectorAll('.feature-card.reveal-zoom, .step.reveal-left, .step.reveal-zoom, .step.reveal-right')
      .forEach(function (el, i) {
        el.style.transitionDelay = (i % 3) * 0.12 + 's';
      });
  }

  /* ================= MICRO-INTERACTIONS : BOUTONS MAGNÉTIQUES + TILT 3D ================= */
  if (motionReady && finePointer) {
    // Motion (spring) : boutons magnétiques
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        window.Motion.animate(
          el,
          { x: x, y: y },
          { type: 'spring', stiffness: 220, damping: 16, mass: 0.5 }
        );
      });
      el.addEventListener('mouseleave', function () {
        window.Motion.animate(
          el,
          { x: 0, y: 0 },
          { type: 'spring', stiffness: 150, damping: 12 }
        );
      });
    });

    // Motion (spring) : tilt 3D + lueur suiveuse des cartes
    document.querySelectorAll('.feature-card, .step, .steps .card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        window.Motion.animate(
          card,
          { rotateY: px * 6, rotateX: -py * 6, y: -4, transformPerspective: 900 },
          { type: 'spring', stiffness: 260, damping: 20 }
        );
      });
      card.addEventListener('mouseleave', function () {
        window.Motion.animate(
          card,
          { rotateY: 0, rotateX: 0, y: 0 },
          { type: 'spring', stiffness: 150, damping: 15 }
        );
      });
    });
  } else if (finePointer && !prefersReduced) {
    // ---------- Repli vanilla (sans Motion) : boutons magnétiques ----------
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });

    // Repli vanilla : tilt 3D
    document.querySelectorAll('.feature-card, .step, .steps .card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 6).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ================= RIPPLE (micro-interaction au clic) ================= */
  function createRipple(e, btn) {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - r.left - size / 2) + 'px';
    span.style.top = (e.clientY - r.top - size / 2) + 'px';
    btn.appendChild(span);
    setTimeout(function () { span.remove(); }, 650);
  }
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) { createRipple(e, btn); });
  });

  /* ================= FOND 3D HERO (Three.js : particules) ================= */
  function initHeroParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !window.THREE || prefersReduced) return;

    try {
      const hero = document.querySelector('.hero');
      const width = hero.clientWidth;
      const height = hero.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);

      // Nuage de particules
      const count = Math.max(40, Math.min(130, Math.floor(width / 10)));
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 9;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({
        color: 0x9A7FD0,
        size: 0.06,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Parallax avec la souris
      let mouseX = 0, mouseY = 0;
      const onMouseMove = function (e) {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      let rafId = 0;
      let running = true;

      function tick() {
        if (!running) return;
        points.rotation.y += 0.0006;
        points.rotation.x += 0.0002;
        camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      }

      // Ne rendre que lorsque le hero est visible
      const visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            running = true;
            rafId = requestAnimationFrame(tick);
          } else {
            running = false;
            cancelAnimationFrame(rafId);
          }
        });
      });
      visibilityObserver.observe(canvas);

      // Redimensionnement
      const onResize = function () {
        const nw = hero.clientWidth;
        const nh = hero.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);

      tick();
    } catch (err) {
      // WebGL indisponible : le fond reste transparent, la page fonctionne normalement
    }
  }
  initHeroParticles();

  /* ================= TOAST TÉLÉCHARGEMENT ================= */
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer;

  function showDownloadToast(btn) {
    if (btn) btn.classList.add('loading');
    toastText.textContent = 'Téléchargement en cours…';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastText.textContent = 'Téléchargement démarré. Vérifiez vos téléchargements !';
      if (btn) btn.classList.remove('loading');
      setTimeout(function () { toast.classList.remove('show'); }, 3500);
    }, 1800);
  }

  document.getElementById('download-btn').addEventListener('click', function () {
    showDownloadToast(this);
  });
  document.getElementById('download-btn-2').addEventListener('click', function () {
    showDownloadToast(this);
  });
})();

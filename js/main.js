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
        { rotateY: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power4.out', clearProps: 'transform,filter,opacity' },
        '-=0.9'
      );
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

    // Scroll reveal : SUPPRIMÉ (rendait la page invisible si l'événement
    // de scroll ne se déclenchait pas). Le contenu est toujours visible.

    // Parallax du hero (scrub)
    gsap.to('.blob-a', {
      yPercent: 60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.blob-b', {
      yPercent: 90, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    // Parallax de la colonne texte du hero (déplacement seul, sans estompage)
    gsap.to('.hero-copy', {
      y: 120, ease: 'none',
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
        heroCopy.style.transform = 'translateY(' + (y * 0.14) + 'px)';
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

    // Reveal vanilla : SUPPRIMÉ (même raison — contenu toujours visible)
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

  /* ================= CARROUSEL FONCTIONNALITÉS ================= */
  function initFeaturesCarousel() {
    const track = document.querySelector('.features-track');
    if (!track) return;
    const prev = document.querySelector('.carousel-prev');
    const next = document.querySelector('.carousel-next');
    const dotsWrap = document.querySelector('.carousel-dots');
    const cells = Array.prototype.slice.call(track.children);
    if (!cells.length || !dotsWrap) return;

    function visibleCount() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }
    function pageCount() {
      return Math.max(1, Math.ceil(cells.length / visibleCount()));
    }
    function pageStep() {
      return Math.max(1, track.clientWidth);
    }
    function currentPage() {
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return 0;
      return Math.min(pageCount() - 1, Math.round(track.scrollLeft / pageStep()));
    }
    function updateDots() {
      const dots = dotsWrap.children;
      const page = currentPage();
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === page);
      }
      if (prev) prev.style.opacity = page <= 0 ? '0.35' : '1';
      if (next) next.style.opacity = page >= pageCount() - 1 ? '0.35' : '1';
    }
    function go(dir) {
      const max = track.scrollWidth - track.clientWidth;
      const target = dir > 0
        ? Math.min(track.scrollLeft + pageStep(), max)
        : Math.max(track.scrollLeft - pageStep(), 0);
      track.scrollTo({ left: target, behavior: 'smooth' });
    }
    function buildDots() {
      dotsWrap.innerHTML = '';
      const pages = pageCount();
      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Aller à la page ' + (i + 1));
        (function (idx) {
          dot.addEventListener('click', function () {
            track.scrollTo({ left: idx * pageStep(), behavior: 'smooth' });
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
      updateDots();
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', updateDots, { passive: true });

    buildDots();
    window.addEventListener('resize', buildDots);
  }
  initFeaturesCarousel();

  /* ================= MENU MOBILE (dropdown) ================= */
  function initMobileMenu() {
    const burger = document.getElementById('nav-burger');
    const dropdown = document.getElementById('nav-dropdown');
    const nav = document.getElementById('navbar');
    if (!burger || !dropdown || !nav) return;

    function closeMenu() {
      dropdown.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = dropdown.classList.toggle('open');
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    dropdown.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeMenu();
    });
  }
  initMobileMenu();

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

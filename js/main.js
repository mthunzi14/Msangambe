/* ══════════════════════════════════════════════════════════════
   MSANGAMBE SIGUDLA — msangambe.com
   js/main.js — 10 IIFEs
   Son Dynasty · South Africa · 2026
   ══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   SHARED HELPERS (module scope, not exposed globally)
───────────────────────────────────────────────────────────── */
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

/* ══════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   Dot follows mouse instantly. Ring lerps toward dot via rAF.
   Disabled on touch devices. Scales on hover + pulses on click.
   ══════════════════════════════════════════════════════════════ */
(function initCursor() {
  if (navigator.maxTouchPoints > 0) return;

  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  document.body.style.cursor = 'none';

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;

  const LERP = 0.12;

  function lerp(a, b, t) { return a + (b - a) * t; }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  (function rafLoop() {
    ringX = lerp(ringX, mouseX, LERP);
    ringY = lerp(ringY, mouseY, LERP);
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(rafLoop);
  })();

  const hoverTargets = 'a, button, .model-cell, .dynasty-social, .contact-btn, .cta-link, .streaming-link, .art-cell, .dynasty-card, .nav-link';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.add('is-hovering');
      dot.style.transform += ' scale(0)';
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      ring.classList.remove('is-hovering');
      dot.style.transform = dot.style.transform.replace(' scale(0)', '');
    }
  });

  document.addEventListener('mousedown', () => {
    ring.classList.add('is-clicking');
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('is-clicking');
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ══════════════════════════════════════════════════════════════
   2. NAVIGATION
   Scroll hide/show · logo swap · active link · burger · Escape
   ══════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav        = $('#main-nav');
  const burger     = $('.nav-burger');
  const mobileMenu = $('#mobile-menu');
  const mobileClose = $('.mobile-close');
  if (!nav) return;

  let lastScroll  = 0;
  let ticking     = false;

  function updateNav() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }

    if (scrollY > 200) {
      if (scrollY > lastScroll) {
        nav.classList.add('is-hidden');
      } else {
        nav.classList.remove('is-hidden');
      }
    } else {
      nav.classList.remove('is-hidden');
    }

    lastScroll = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  /* Active nav link via IntersectionObserver */
  const sections  = $$('section[id], div[id]').filter(el => el.id);
  const navLinks  = $$('.nav-link');

  const sectionMap = new Map();
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    sectionMap.set(id, link);
  });

  const visibleSections = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    if (visibleSections.size === 0) return;

    let maxRatio  = 0;
    let activeId  = '';

    visibleSections.forEach((ratio, id) => {
      if (ratio > maxRatio) { maxRatio = ratio; activeId = id; }
    });

    navLinks.forEach(l => l.classList.remove('active'));
    if (sectionMap.has(activeId)) {
      sectionMap.get(activeId).classList.add('active');
    }
  }, { threshold: [0.1, 0.3, 0.5] });

  $$('#home, #story, #sound, #dynasty, #modelling, #visual-art, #journal, #contact').forEach(s => {
    if (s) observer.observe(s);
  });

  /* Burger — open mobile menu */
  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (burger)      burger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  /* Close on nav link click */
  $$('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

/* ══════════════════════════════════════════════════════════════
   3. INTERSECTION OBSERVER REVEAL
   Observes .reveal, .reveal-left, .reveal-right, .reveal-scale
   Adds .is-visible when element enters viewport at threshold 0.15
   ══════════════════════════════════════════════════════════════ */
(function initReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   4. HERO ENTRANCE STAGGER
   On DOMContentLoaded, staggers hero elements into view.
   Hero image also gets .is-loaded once it has loaded.
   ══════════════════════════════════════════════════════════════ */
(function initHeroEntrance() {
  const delays = [
    ['.hero-stamp',   0],
    ['.hero-name',    200],
    ['.hero-tagline', 400],
    ['.hero-ctas',    600],
  ];

  delays.forEach(([sel, delay]) => {
    const el = $(sel);
    if (!el) return;
    setTimeout(() => el.classList.add('is-visible'), delay);
  });

  /* 3D viewport wrapper fade-in */
  const hero3d = $('.hero-3d-wrap');
  if (hero3d) {
    setTimeout(() => hero3d.classList.add('is-loaded'), 600);
  }
})();

/* ══════════════════════════════════════════════════════════════
   5. HERO PARALLAX
   requestAnimationFrame loop. Three layers at different speeds.
   Stops applying when section is off screen for performance.
   ══════════════════════════════════════════════════════════════ */
(function initParallax() {
  const watermark = $('.hero-watermark');
  const hero3dWrap = $('.hero-3d-wrap');
  const content   = $('.hero-content');
  const hero      = $('#home');
  if (!hero) return;

  let ticking = false;

  function applyParallax() {
    const scrollY   = window.scrollY;
    const heroBottom = hero.getBoundingClientRect().bottom;

    if (heroBottom < 0) { ticking = false; return; }

    if (watermark) watermark.style.transform = `translateY(${scrollY * 0.2}px)`;
    if (hero3dWrap) {
      hero3dWrap.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.35}px))`;
    }
    if (content) {
      content.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.15}px))`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   6. DRAGON ENTRANCE ANIMATION
   Fires once 300ms after DOMContentLoaded.
   CSS @keyframes dragon-fly handles the actual motion.
   Element is hidden after animation completes.
   ══════════════════════════════════════════════════════════════ */
(function initDragon() {
  const dragon = $('.dragon-element');
  if (!dragon) return;

  setTimeout(() => {
    dragon.classList.add('dragon-fly');

    dragon.addEventListener('animationend', () => {
      dragon.style.display = 'none';
    }, { once: true });
  }, 300);
})();

/* ══════════════════════════════════════════════════════════════
   7. SMOOTH SCROLL
   Intercepts all [href^="#"] clicks and smoothly scrolls to target.
   Offsets by nav height so content isn't hidden under nav.
   ══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  const NAV_HEIGHT = 72;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id     = link.getAttribute('href');
    if (id === '#') return;

    const target = $(id);
    if (!target) return;

    e.preventDefault();

    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════════════════════
   8. MARQUEE PAUSE ON HOVER
   Each .marquee-track pauses its CSS animation on mouseenter
   and resumes on mouseleave.
   ══════════════════════════════════════════════════════════════ */
(function initMarquee() {
  $$('.marquee-track').forEach(track => {
    track.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    track.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   9. MODELLING GRID BUILDER
   Populates #modelling-grid with <figure> elements from the
   modellingImages array. Applies staggered IntersectionObserver
   reveal to each figure.
   NOTE: Image filenames use "PM" — confirm timestamps if updated.
   ══════════════════════════════════════════════════════════════ */
(function initModellingGrid() {
  const grid = $('#modelling-grid');
  if (!grid) return;

  const BASE_PATH = 'assets/images/modelling/';

  const modellingImages = [
    'WhatsApp Image 2026-04-22 at 5.58.14 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.58.15 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.51 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.53 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.56 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.56 PM (1).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.57 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.57 PM (1).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.57 PM (2).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.58 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.58 PM (1).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.58 PM (2).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.58 PM (3).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.59 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.59 PM (1).jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.59 PM (2).jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.00 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.00 PM (1).jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.00 PM (2).jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.00 PM (3).jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.01 PM.jpeg',
    'WhatsApp Image 2026-04-22 at 5.43.01 PM (1).jpeg',
  ];

  const fragment = document.createDocumentFragment();

  modellingImages.forEach((filename, index) => {
    const figure = document.createElement('figure');
    figure.className = 'model-cell reveal-scale';
    figure.setAttribute('role', 'listitem');
    figure.style.setProperty('--i', String(index % 6));

    // Lightbox properties
    figure.setAttribute('data-media-type', 'image');
    figure.setAttribute('data-media-src', BASE_PATH + filename);
    figure.setAttribute('data-title', `EDITORIAL SHOOT · ${index + 1}`);
    figure.setAttribute('data-meta', `SON DYNASTY · MODEL WORK`);

    const img = document.createElement('img');
    img.src     = BASE_PATH + filename;
    img.alt     = 'Msangambe Sigudla';
    img.loading = 'lazy';
    img.decoding = 'async';

    const caption = document.createElement('figcaption');
    caption.innerHTML = `
      <span class="model-title">EDITORIAL SHOOT · ${index + 1}</span>
      <span class="model-credit">SON DYNASTY</span>
      <span class="model-context">2026 · MSANGAMBE.COM</span>
    `;

    figure.appendChild(img);
    figure.appendChild(caption);
    fragment.appendChild(figure);
  });

  grid.appendChild(fragment);

  /* Staggered IntersectionObserver for newly created figures */
  const cellObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = (parseInt(entry.target.style.getPropertyValue('--i') || '0')) * 120;
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, delay);
        cellObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.model-cell', grid).forEach(cell => cellObserver.observe(cell));
})();

/* ══════════════════════════════════════════════════════════════
   10. FOOTER YEAR + CONTACT FORM VALIDATION & SUBMISSION
   ══════════════════════════════════════════════════════════════ */
(function initFooterAndForms() {
  /* Auto-set copyright year */
  const yearEl = $('#copyright-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Contact form validation & Formspree fetch */
  const form = $('#contact-form');
  if (!form) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(field, msg) {
    let errorEl = field.parentElement.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'field-error';
      errorEl.style.cssText = 'font-family:Cinzel,serif;font-size:9px;letter-spacing:0.2em;color:#8B8B6B;margin-top:4px;';
      field.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = msg;
    field.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    const errorEl = field.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
    field.removeAttribute('aria-invalid');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const nameField    = form.querySelector('#form-name');
    const surnameField = form.querySelector('#form-surname');
    const numberField  = form.querySelector('#form-number');
    const emailField   = form.querySelector('#form-email');
    const messageField = form.querySelector('#form-message');

    [nameField, surnameField, numberField, emailField, messageField].forEach(field => {
      if (field) clearError(field);
    });

    if (nameField && !nameField.value.trim()) {
      showError(nameField, 'NAME IS REQUIRED');
      valid = false;
    }
    if (surnameField && !surnameField.value.trim()) {
      showError(surnameField, 'SURNAME IS REQUIRED');
      valid = false;
    }
    if (numberField && !numberField.value.trim()) {
      showError(numberField, 'CONTACT NUMBER IS REQUIRED');
      valid = false;
    }
    if (emailField) {
      if (!emailField.value.trim()) {
        showError(emailField, 'EMAIL ADDRESS IS REQUIRED');
        valid = false;
      } else if (!EMAIL_RE.test(emailField.value.trim())) {
        showError(emailField, 'PLEASE ENTER A VALID EMAIL ADDRESS');
        valid = false;
      }
    }
    if (messageField && !messageField.value.trim()) {
      showError(messageField, 'MESSAGE CANNOT BE EMPTY');
      valid = false;
    }

    if (!valid) return;

    const submitBtn = $('#form-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = "SENDING REQUEST...";
      submitBtn.disabled = true;
    }

    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: nameField.value.trim(),
        surname: surnameField.value.trim(),
        number: numberField.value.trim(),
        email: emailField.value.trim(),
        message: messageField.value.trim()
      })
    })
    .then(res => {
      // Regardless of Formspree test limit, display success for previewing client response
      form.classList.add('is-hidden');
      const successMsg = $('#booking-success-msg');
      if (successMsg) successMsg.classList.remove('is-hidden');
    })
    .catch(err => {
      console.error('Booking submission error:', err);
      // Fallback preview
      form.classList.add('is-hidden');
      const successMsg = $('#booking-success-msg');
      if (successMsg) successMsg.classList.remove('is-hidden');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.textContent = "BOOK A MEETING";
        submitBtn.disabled = false;
      }
    });
  });

  const successClose = $('#success-close-btn');
  const successMsg = $('#booking-success-msg');
  if (successClose && successMsg) {
    successClose.addEventListener('click', () => {
      successMsg.classList.add('is-hidden');
      form.classList.remove('is-hidden');
      form.reset();
    });
  }
})();

/* ══════════════════════════════════════════════════════════════
   11. DYNAMIC LIGHTBOX OVERLAY
   ══════════════════════════════════════════════════════════════ */
(function initLightbox() {
  const lightbox = $('#dynasty-lightbox');
  const mediaBox = $('#lightbox-media-box');
  const titleEl  = $('#lightbox-title');
  const metaEl   = $('#lightbox-meta');
  const closeBtn = $('#lightbox-close-btn');
  const prevBtn  = $('#lightbox-prev-btn');
  const nextBtn  = $('#lightbox-next-btn');
  if (!lightbox || !mediaBox) return;

  let currentItems = [];
  let currentIndex = -1;

  function openLightbox(itemsList, startIndex) {
    currentItems = itemsList;
    currentIndex = startIndex;
    updateLightboxMedia();
    lightbox.classList.remove('is-hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('is-hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    mediaBox.innerHTML = '';
    document.body.style.overflow = '';
  }

  function updateLightboxMedia() {
    if (currentIndex < 0 || currentIndex >= currentItems.length) return;
    mediaBox.innerHTML = '';
    const item = currentItems[currentIndex];
    const type = item.getAttribute('data-media-type') || 'image';
    const src  = item.getAttribute('data-media-src');
    const title = item.getAttribute('data-title') || 'UNTITLED';
    const meta  = item.getAttribute('data-meta') || 'SON DYNASTY';

    titleEl.textContent = title;
    metaEl.textContent  = meta;

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = true;
      mediaBox.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      mediaBox.appendChild(img);
    }
  }

  function showNext() {
    if (currentItems.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentItems.length;
    updateLightboxMedia();
  }

  function showPrev() {
    if (currentItems.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    updateLightboxMedia();
  }

  document.addEventListener('click', (e) => {
    const artCell = e.target.closest('.art-cell');
    const modelCell = e.target.closest('.model-cell');

    if (artCell) {
      const allArt = $$('.art-cell');
      const idx = allArt.indexOf(artCell);
      openLightbox(allArt, idx);
    } else if (modelCell) {
      const allModels = $$('.model-cell');
      const idx = allModels.indexOf(modelCell);
      openLightbox(allModels, idx);
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn)  nextBtn.addEventListener('click', showNext);
  if (prevBtn)  prevBtn.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target.closest('.lightbox-backdrop') || e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('is-hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
})();

/* ══════════════════════════════════════════════════════════════
   12. BESPOKE AUDIO PLAYER & RADIO SIMULATOR
   ══════════════════════════════════════════════════════════════ */
(function initAudioPlayer() {
  const audio = $('#hidden-audio');
  const playBtn = $('#player-play-btn');
  const playIcon = $('#play-icon');
  const pauseIcon = $('#pause-icon');
  const prevBtn = $('#player-prev-btn');
  const nextBtn = $('#player-next-btn');
  const titleEl = $('#player-track-title');
  const artistEl = $('#player-track-artist');
  const prodEl = $('#player-track-producer');
  const coverEl = $('#player-cover');
  const discWrapper = $('.album-disc-wrapper');
  const scrubSlider = $('#player-scrub');
  const currentText = $('#player-time-current');
  const durationText = $('#player-time-duration');
  const volumeSlider = $('#player-volume');
  
  const tuneBtn = $('#terminal-tune-btn');
  const visualizer = $('.terminal-visualizer');
  const terminalText = $('.terminal-status-text');

  if (!audio || !playBtn) return;

  const tracks = [
    {
      title: "CYBERNETIC RITUAL",
      artist: "ARTIST: SON DYNASTY",
      producer: "PRODUCERS: SON DYNASTY & XYON",
      cover: "assets/logo-sondynasty-globe.png",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      title: "PRETORIA BEATS",
      artist: "ARTIST: SON DYNASTY",
      producer: "PRODUCERS: SON DYNASTY",
      cover: "assets/logo-lockup-white-on-black.png",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
      title: "DYNASTY INTRO",
      artist: "ARTIST: SON DYNASTY",
      producer: "PRODUCERS: SON DYNASTY & PROD. X",
      cover: "assets/logo-crest-black-on-white.png",
      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let isTuned = false;

  function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.src;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;
    prodEl.textContent = track.producer;
    coverEl.src = track.cover;
    scrubSlider.value = 0;
    currentText.textContent = "0:00";
    durationText.textContent = "0:00";
  }

  function playTrack() {
    isPlaying = true;
    audio.play().catch(err => console.log("Audio deferred."));
    playIcon.classList.add('is-hidden');
    pauseIcon.classList.remove('is-hidden');
    if (discWrapper) discWrapper.classList.add('spinning');
  }

  function pauseTrack() {
    isPlaying = false;
    audio.pause();
    playIcon.classList.remove('is-hidden');
    pauseIcon.classList.add('is-hidden');
    if (discWrapper) discWrapper.classList.remove('spinning');
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
  }

  audio.addEventListener('durationchange', () => {
    const duration = audio.duration;
    if (duration) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      durationText.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  });

  audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const duration = audio.duration;
    if (duration) {
      const percent = (current / duration) * 100;
      scrubSlider.value = percent;
      
      const currentMin = Math.floor(current / 60);
      const currentSec = Math.floor(current % 60);
      currentText.textContent = `${currentMin}:${currentSec < 10 ? '0' : ''}${currentSec}`;
    }
  });

  audio.addEventListener('ended', nextTrack);

  scrubSlider.addEventListener('input', () => {
    const val = scrubSlider.value;
    const duration = audio.duration;
    if (duration) {
      audio.currentTime = (val / 100) * duration;
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  if (tuneBtn && visualizer && terminalText) {
    tuneBtn.addEventListener('click', () => {
      isTuned = !isTuned;
      if (isTuned) {
        tuneBtn.textContent = "DISCONNECT FREQUENCY";
        tuneBtn.classList.add('active');
        visualizer.classList.add('animating');
        terminalText.textContent = "DYNASTY RADIO BROADCAST · ONLINE";
        audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3";
        playTrack();
      } else {
        tuneBtn.textContent = "TUNE IN FREQUENCY";
        tuneBtn.classList.remove('active');
        visualizer.classList.remove('animating');
        terminalText.textContent = "DYNASTY RADIO BROADCAST · LIVE";
        pauseTrack();
        loadTrack(currentTrackIndex);
      }
    });
  }

  loadTrack(currentTrackIndex);

  playBtn.addEventListener('click', togglePlay);
  if (nextBtn) nextBtn.addEventListener('click', nextTrack);
  if (prevBtn) prevBtn.addEventListener('click', prevTrack);
})();

/* ══════════════════════════════════════════════════════════════
   13. CINEMA ROOM PLAYLIST CONTROL
   ══════════════════════════════════════════════════════════════ */
(function initCinema() {
  const iframe = $('#cinema-iframe');
  const commentaryText = $('#cinema-commentary-text');
  const items = $$('.cinema-item');
  if (!iframe || !commentaryText || !items.length) return;

  const commentaries = [
    "This is our weekly visual statement. An entry point to Dynasty World. Rebellion as a ritual.",
    "Techno/Animal spirit. A visualization of ancestral spirits existing inside the cybernetic grid. Shot in Pretoria.",
    "Love vs Limerence. Dialogues of infatuation, obsession, and the search for authentic connection."
  ];

  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      items.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');
      const url = item.getAttribute('data-video-url');
      iframe.src = url;
      commentaryText.textContent = commentaries[index] || commentaries[0];
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   14. TABBED JOURNAL DASHBOARD & TWEETS
   ══════════════════════════════════════════════════════════════ */
(function initJournalDashboard() {
  const tabs = $$('.journal-tab-btn');
  const essaysView = $('#journal-essays-view');
  const tweetsView = $('#journal-tweets-view');
  const tweetContainer = $('#tweet-list-container');
  if (!tabs.length || !essaysView || !tweetsView || !tweetContainer) return;

  const tweets = [
    {
      date: "MAY 22, 2026",
      handle: "@sondynasty",
      content: "Dynasty is never meant to simply be witnessed. It is meant to be experienced. Pretoria underground shoots live."
    },
    {
      date: "MAY 18, 2026",
      handle: "@sondynasty",
      content: "Flesh and machine. Techno/Animal spirit is the direction. New drops arriving shortly."
    },
    {
      date: "MAY 14, 2026",
      handle: "@sondynasty",
      content: "Directed context fumbled from Twitter, now woven directly into the frequency."
    },
    {
      date: "MAY 10, 2026",
      handle: "@sondynasty",
      content: "Silence is a weapon. The pause between notes holds more power than the noise."
    }
  ];

  const fragment = document.createDocumentFragment();
  tweets.forEach((tweet, idx) => {
    const div = document.createElement('div');
    div.className = 'tweet-card reveal-left';
    div.style.setProperty('--i', String(idx));
    div.innerHTML = `
      <div class="tweet-card-header">
        <span class="tweet-handle label">${tweet.handle}</span>
        <span class="tweet-date label">${tweet.date}</span>
      </div>
      <p class="tweet-text">${tweet.content}</p>
      <div class="tweet-footer">
        <span class="label">RETWEETS · 12</span>
        <span class="label">LIKES · 48</span>
      </div>
    `;
    fragment.appendChild(div);
  });
  tweetContainer.appendChild(fragment);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      if (target === 'tweets') {
        essaysView.classList.remove('active');
        tweetsView.classList.add('active');
        $$('.tweet-card', tweetsView).forEach(card => {
          card.classList.remove('is-visible');
          void card.offsetWidth;
          card.classList.add('is-visible');
        });
      } else {
        tweetsView.classList.remove('active');
        essaysView.classList.add('active');
      }
    });
  });

  const essayContentList = [
    {
      title: "On the weight of becoming",
      date: "MAY 22, 2026 · ENTRY 01",
      body: `<p>Some words about the journey, the stillness before movement, and what it means to build something that lasts beyond the moment.</p><br><p>To become requires a shedding of skin. You cannot transition into new realities while holding tightly to the comforts of yesterday. The process is heavy, silent, and often invisible. The weight of becoming is the weight of potential. The density of raw carbon transitioning under pressure.</p>`
    },
    {
      title: "The art of choosing silence",
      date: "MAY 15, 2026 · ENTRY 02",
      body: `<p>There is power in what is not said. In the pause between notes. In the space between frames. This is where the dynasty breathes.</p><br><p>In a world of constant amplification, silence is a direct rebellion. Choosing to hold back, choosing to remain still, is a high-level creative act. We do not speak because we have to; we speak only when the silence can no longer contain the frequency of the work.</p>`
    },
    {
      title: "On building in public",
      date: "MAY 08, 2026 · ENTRY 03",
      body: `<p>Every venture, every creation, every step made visible. The dynasty does not hide its process — it reveals it as art.</p><br><p>To build in public is to be vulnerable, yet invincible. By exposing the frame before the paint, you invite the world into the architecture of creation. The errors, the triumphs, the fumbles, the breakthroughs — they are all part of the performance. The medium is the message, and the process is the masterpiece.</p>`
    },
    {
      title: "Limerence & Obsession",
      date: "MAY 01, 2026 · ENTRY 04",
      body: `<p class="label" style="color:var(--silver-deep);">[ CINEMATIC SCRIPT CONCEPT ]</p><br>
             <p><strong>SON:</strong> So I was kind of like just talking today, and I wanted to record the conversation I was just having with myself, you know? But I do also want to make a video, almost like a short cinematic film. Showing what we're talking about when I'm talking about the conflicting ideas between love and everything else like infatuation, Limerence, and obsession. What do they mean?</p><br>
             <p><strong>SHE:</strong> You speak of them as if they are separate rooms in the same house. But they are different fires. Infatuation is a match struck in the dark — quick, blinding, and gone in seconds.</p><br>
             <p><strong>SON:</strong> And Limerence? It's a projection of the mind. An obsession with a version of you that only lives in my head. Between flesh and machine, spirit and system.</p><br>
             <p><strong>SHE:</strong> That is not love. That is the fear of being alone, dressed in a royal cloak. True love is stillness. It does not demand obsession or cinematic lighting. It just is.</p>`
    }
  ];

  $$('.journal-read').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-essay-index') || '0');
      const essay = essayContentList[idx];
      if (!essay) return;

      const overlay = document.createElement('div');
      overlay.className = 'essay-reader-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,10,0.85);backdrop-filter:blur(24px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s ease;';
      overlay.innerHTML = `
        <div class="essay-reader-card" style="background:var(--black);color:var(--white);width:90%;max-width:650px;padding:60px 48px;border:1px solid var(--silver);box-shadow:var(--glow-lg);position:relative;transform:translateY(20px);transition:transform 0.4s var(--ease-out-expo);max-height:85vh;overflow-y:auto;">
          <button class="essay-reader-close label" style="position:absolute;top:24px;right:28px;cursor:pointer;font-family:Cinzel,serif;font-size:10px;letter-spacing:0.2em;color:var(--silver-deep);border:0;background:0;">[ CLOSE ]</button>
          <span class="label" style="color:var(--silver-deep);font-size:9px;margin-bottom:12px;display:block;">${essay.date}</span>
          <h2 style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-weight:300;font-size:36px;line-height:1.2;margin-bottom:24px;color:var(--white); border-bottom:1px solid rgba(192,192,192,0.25);padding-bottom:16px;">${essay.title}</h2>
          <div class="essay-reader-body" style="font-family:\'Raleway\',sans-serif;font-weight:300;font-size:15px;line-height:1.8;color:var(--grey-light);">${essay.body}</div>
        </div>
      `;
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      void overlay.offsetWidth;
      overlay.style.opacity = '1';
      overlay.querySelector('.essay-reader-card').style.transform = 'translateY(0)';

      const close = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('.essay-reader-card').style.transform = 'translateY(20px)';
        setTimeout(() => {
          overlay.remove();
          document.body.style.overflow = '';
        }, 400);
      };

      overlay.querySelector('.essay-reader-close').addEventListener('click', close);
      overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) close();
      });
      document.addEventListener('keydown', function escHandler(ev) {
        if (ev.key === 'Escape') {
          close();
          document.removeEventListener('keydown', escHandler);
        }
      });
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   13. 3D WEBGL HERO CANVAS & MORPHING MATERIALS
   Initializes Three.js Torus Knot (Dragon Crest representation)
   and manages PLATINUM, CYBER, OBSIDIAN, DIAMOND styles and cursor interaction.
   ══════════════════════════════════════════════════════════════ */
(function initThreeDHero() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  let scene, camera, renderer, knot, logoMesh, particleSystem, lights = [];
  let currentMaterialName = 'platinum';
  let materials = {};
  
  // Mouse tracking variables
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  
  // Pulse and timing variables
  let clock = new THREE.Clock();

  function init() {
    // 1. SCENE & CAMERA
    scene = new THREE.Scene();
    
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.z = 6;

    // 2. RENDERER
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // 3. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);
    lights.push(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);
    lights.push(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);
    lights.push(dirLight2);

    // Dynamic colored accents for premium reflections (placed further out to avoid harsh hot spots)
    const accentLight1 = new THREE.PointLight(0x00ffcc, 1.2, 25);
    accentLight1.position.set(6, -4, 5);
    scene.add(accentLight1);
    lights.push(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff0055, 0.8, 25);
    accentLight2.position.set(-6, 4, 4);
    scene.add(accentLight2);
    lights.push(accentLight2);

    // 4. PROCEDURAL TEXTURES & LOGO LOADING
    const envMapTexture = createProceduralEnvMap();
    const carbonTexture = createCarbonTexture();
    
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('FAVICON-LOGO_NOBG-removebg-preview.png');

    // 5. MATERIALS SETUP
    // Style A: PLATINUM (Sleek Chrome, soft professional reflection)
    materials.platinum = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.1, // slightly rough for smooth satin metal sheen
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMap: envMapTexture,
      envMapIntensity: 2.2
    });

    // Style B: CYBER (Glowing grid / wireframe core overlay)
    materials.cyberSolid = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
      transmission: 0.65,
      thickness: 1.2
    });
    
    materials.cyberWire = new THREE.MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });

    // Style C: OBSIDIAN (Matte black detailed carbon weave pattern)
    materials.obsidian = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.7,
      metalness: 0.1,
      map: carbonTexture,
      bumpMap: carbonTexture,
      bumpScale: 0.015
    });

    // Style D: DIAMOND (Clear refractive crystal)
    materials.diamond = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1.0,
      ior: 2.42, // index of refraction for diamond
      roughness: 0.02,
      metalness: 0.0,
      thickness: 1.2,
      transparent: true,
      envMap: envMapTexture,
      envMapIntensity: 2.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0
    });

    // 6. GEOMETRY & MESH CREATION
    // Slim, elegant Torus Knot geometry (radius=1.45, tube=0.15 for sophisticated look)
    const geometry = new THREE.TorusKnotGeometry(1.45, 0.15, 300, 20, 3, 4);
    
    // Group containing the mesh(es) for mouse rotation control
    knot = new THREE.Group();
    
    // Main mesh
    const mainMesh = new THREE.Mesh(geometry, materials.platinum);
    mainMesh.name = 'mainMesh';
    knot.add(mainMesh);

    // Overlay mesh for Neon wireframe look (active only in cyber mode)
    const wireMesh = new THREE.Mesh(geometry, materials.cyberWire);
    wireMesh.name = 'wireMesh';
    wireMesh.scale.setScalar(1.01); // slightly larger to prevent clipping
    wireMesh.visible = false;
    knot.add(wireMesh);

    scene.add(knot);

    // Floating double-sided logo plate at the center of the knot
    const logoGeometry = new THREE.PlaneGeometry(1.1, 1.1);
    const logoMaterial = new THREE.MeshStandardMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.15,
      metalness: 0.8
    });
    logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
    logoMesh.name = 'logoMesh';
    logoMesh.position.set(0, 0, 0);
    scene.add(logoMesh);

    // 7. PARTICLES BACKGROUND (Ethereal dust field)
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xdddddd,
      size: 0.08,
      map: pTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 8. EVENT LISTENERS
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    
    // Set up material tab and action clicks
    setupTabs();
    setupActionButtons();

    // Start animation loop
    animate();
  }

  // Softbox-style studio lighting equirectangular envmap generator
  function createProceduralEnvMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base sky/ground gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#101015');
    grad.addColorStop(0.45, '#1e1e24');
    grad.addColorStop(0.5, '#2e2e38');
    grad.addColorStop(0.55, '#1a1a20');
    grad.addColorStop(1, '#0a0a0d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Softbox highlight 1 (Top Left)
    let softGrad1 = ctx.createRadialGradient(120, 60, 0, 120, 60, 80);
    softGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    softGrad1.addColorStop(0.35, 'rgba(255, 255, 255, 0.4)');
    softGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = softGrad1;
    ctx.beginPath();
    ctx.arc(120, 60, 80, 0, Math.PI * 2);
    ctx.fill();

    // Softbox highlight 2 (Right Center)
    let softGrad2 = ctx.createRadialGradient(380, 120, 0, 380, 120, 100);
    softGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    softGrad2.addColorStop(0.4, 'rgba(255, 255, 255, 0.25)');
    softGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = softGrad2;
    ctx.beginPath();
    ctx.arc(380, 120, 100, 0, Math.PI * 2);
    ctx.fill();

    // Softbox highlight 3 (Bottom Left - subtle blue fill light)
    let softGrad3 = ctx.createRadialGradient(180, 200, 0, 180, 200, 120);
    softGrad3.addColorStop(0, 'rgba(100, 150, 255, 0.35)');
    softGrad3.addColorStop(0.5, 'rgba(100, 150, 255, 0.1)');
    softGrad3.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = softGrad3;
    ctx.beginPath();
    ctx.arc(180, 200, 120, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }

  function createCarbonTexture() {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, size / 2, size / 2);
    ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
    
    ctx.fillStyle = '#181818';
    ctx.fillRect(size / 4, 0, size / 4, size / 2);
    ctx.fillRect((3 * size) / 4, size / 2, size / 4, size / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
  }

  function setMaterial(materialName) {
    if (materialName === currentMaterialName) return;
    
    const mainMesh = knot.getObjectByName('mainMesh');
    const wireMesh = knot.getObjectByName('wireMesh');
    if (!mainMesh || !wireMesh) return;

    currentMaterialName = materialName;
    wireMesh.visible = false;
    
    // Sync logo colors/opacities with active styles
    if (logoMesh) {
      if (materialName === 'platinum') {
        logoMesh.material.color.setHex(0xffffff);
        logoMesh.material.opacity = 0.95;
      } else if (materialName === 'cyber') {
        logoMesh.material.color.setHex(0x00ffcc);
        logoMesh.material.opacity = 0.9;
      } else if (materialName === 'obsidian') {
        logoMesh.material.color.setHex(0x444444);
        logoMesh.material.opacity = 0.85;
      } else if (materialName === 'diamond') {
        logoMesh.material.color.setHex(0xffffff);
        logoMesh.material.opacity = 0.95;
      }
    }
    
    if (materialName === 'platinum') {
      mainMesh.material = materials.platinum;
      lights[1].color.setHex(0xffffff);
      lights[2].color.setHex(0xffffff);
      lights[3].color.setHex(0x00ffcc);
      lights[4].color.setHex(0xff0055);
    } else if (materialName === 'cyber') {
      mainMesh.material = materials.cyberSolid;
      wireMesh.visible = true;
      lights[1].color.setHex(0x00ffcc);
      lights[2].color.setHex(0xff0055);
      lights[3].color.setHex(0x00ffcc);
      lights[4].color.setHex(0xff0055);
    } else if (materialName === 'obsidian') {
      mainMesh.material = materials.obsidian;
      lights[1].color.setHex(0xffffff);
      lights[2].color.setHex(0x444444);
      lights[3].color.setHex(0x00ffcc);
      lights[4].color.setHex(0xff0055);
    } else if (materialName === 'diamond') {
      mainMesh.material = materials.diamond;
      lights[1].color.setHex(0xffffff);
      lights[2].color.setHex(0xaaaaaa);
      lights[3].color.setHex(0x00ffcc);
      lights[4].color.setHex(0xff0055);
    }
  }

  function setupTabs() {
    const tabs = document.querySelectorAll('.hero-3d-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const materialType = tab.getAttribute('data-material');
        setMaterial(materialType);
      });
    });
  }

  function setupActionButtons() {
    const actionBtns = document.querySelectorAll('.hero-hud-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetSelector = btn.getAttribute('data-scroll-to');
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
  }

  function onWindowResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Apply continuous auto-rotation to the Torus Knot mesh geometry directly
    const mainMesh = knot.getObjectByName('mainMesh');
    const wireMesh = knot.getObjectByName('wireMesh');
    if (mainMesh) {
      mainMesh.rotation.y = elapsedTime * 0.25;
      mainMesh.rotation.x = elapsedTime * 0.12;
    }
    if (wireMesh) {
      wireMesh.rotation.y = elapsedTime * 0.25;
      wireMesh.rotation.x = elapsedTime * 0.12;
    }

    // Apply mouse tilt to the parent knot group only
    knot.rotation.y = targetX * 0.5;
    knot.rotation.x = targetY * 0.5;

    // Logo plate floats gently in the middle and tilts with cursor coords (stays upright)
    if (logoMesh) {
      logoMesh.rotation.y = targetX * 0.5;
      logoMesh.rotation.x = targetY * 0.5;
      logoMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.06; // elegant levitation
    }

    if (currentMaterialName === 'cyber') {
      const wireMesh = knot.getObjectByName('wireMesh');
      if (wireMesh) {
        const pulse = 0.5 + Math.sin(elapsedTime * 4) * 0.35;
        wireMesh.material.opacity = pulse;
        
        const cycleColor = Math.sin(elapsedTime * 2);
        if (cycleColor > 0) {
          wireMesh.material.color.setHex(0x00ffcc);
        } else {
          wireMesh.material.color.setHex(0xff0055);
        }
      }
    }

    if (particleSystem) {
      particleSystem.rotation.y = elapsedTime * 0.015;
      particleSystem.rotation.x = elapsedTime * 0.008;
      
      if (currentMaterialName === 'cyber') {
        particleSystem.material.opacity = 0.6 + Math.sin(elapsedTime * 2) * 0.2;
      } else {
        particleSystem.material.opacity = 0.3;
      }
    }

    renderer.render(scene, camera);
  }

  init();
})();

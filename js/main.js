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

function alignDwiTwitterFeedHeight() {
  const cover = document.querySelector('.coming-soon-cover');
  const twitterFeed = document.querySelector('.dwi-chronicle-feed') || document.querySelector('.dwi-twitter-feed');
  if (!cover || !twitterFeed) return;

  const height = cover.offsetHeight;
  if (height > 0) {
    twitterFeed.style.height = 'auto';
    twitterFeed.style.maxHeight = height + 'px';
  }
}

window.addEventListener('resize', () => {
  const dwiPage = document.querySelector('#dwi');
  if (dwiPage && dwiPage.style.display !== 'none') {
    alignDwiTwitterFeedHeight();
  }
});

/* ══════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR
   Dot follows mouse instantly. Ring lerps toward dot via rAF.
   Disabled on touch devices. Scales on hover + pulses on click.
   ══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;

  if (navigator.maxTouchPoints === 0) {
    document.body.style.cursor = 'none';
  }

  const prompt = document.getElementById('medallion-prompt');
  if (prompt && navigator.maxTouchPoints > 0) {
    prompt.textContent = 'TAP TO ENTER DYNASTY WORLD';
  }

  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;
  let ringX  = mouseX;
  let ringY  = mouseY;

  const LERP = 0.12;

  function lerp(a, b, t) { return a + (b - a) * t; }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchHoldTimeout = null;
  let hasDraggedOrHeld = false;

  function showTouchCursor() {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    const prompt = document.getElementById('medallion-prompt');
    if (prompt && document.body.classList.contains('is-locked')) {
      prompt.classList.add('is-active');
    }
  }

  document.addEventListener('touchstart', (e) => {
    if (!document.body.classList.contains('is-locked')) return;
    
    // Prevent default touch down scroll behaviors
    e.preventDefault();

    const touch = e.touches ? e.touches[0] : null;
    if (!touch) return;

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchStartTime = Date.now();
    hasDraggedOrHeld = false;

    // Immediately update mouse coordinates so the custom cursor ring moves to where they tapped
    if (typeof touch.clientX === 'number' && !isNaN(touch.clientX)) {
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      dot.style.transform = `translate3d(${touch.clientX}px, ${touch.clientY}px, 0) translate(-50%, -50%)`;
    }

    // Start a timer. If they hold their finger for 220ms, it triggers the hover custom cursor and tooltip
    clearTimeout(touchHoldTimeout);
    touchHoldTimeout = setTimeout(() => {
      hasDraggedOrHeld = true;
      showTouchCursor();
    }, 220);
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!document.body.classList.contains('is-locked')) return;
    
    e.preventDefault();

    const touch = e.touches ? e.touches[0] : null;
    if (!touch) return;

    if (typeof touch.clientX === 'number' && !isNaN(touch.clientX)) {
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      dot.style.transform = `translate3d(${touch.clientX}px, ${touch.clientY}px, 0) translate(-50%, -50%)`;
    }

    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // If they drag beyond a small jitter threshold (e.g. 8px), show the custom cursor and tooltip immediately
    if (distance > 8) {
      if (!hasDraggedOrHeld) {
        hasDraggedOrHeld = true;
        clearTimeout(touchHoldTimeout);
        showTouchCursor();
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (!document.body.classList.contains('is-locked')) return;

    clearTimeout(touchHoldTimeout);

    const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!touch) return;

    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const duration = Date.now() - touchStartTime;

    // Fade out custom cursor items immediately
    dot.style.opacity = '0';
    ring.style.opacity = '0';
    const prompt = document.getElementById('medallion-prompt');
    if (prompt) prompt.classList.remove('is-active');

    // If it was a quick tap (duration < 250ms and distance < 12px), enter Dynasty World!
    if (duration < 250 && distance < 12) {
      if (window.triggerDynastyWorldEntry) {
        window.triggerDynastyWorldEntry();
      }
    }
  });

  (function rafLoop() {
    if (typeof mouseX === 'number' && !isNaN(mouseX) && typeof mouseY === 'number' && !isNaN(mouseY)) {
      if (isNaN(ringX) || isNaN(ringY)) {
        ringX = mouseX;
        ringY = mouseY;
      } else {
        ringX = lerp(ringX, mouseX, LERP);
        ringY = lerp(ringY, mouseY, LERP);
      }
      
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      
      const tooltip = document.getElementById('medallion-prompt');
      if (tooltip) {
        const isActive = tooltip.classList.contains('is-active');
        tooltip.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) translateY(40px) scale(${isActive ? 1.0 : 0.9})`;
      }
    }
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
  const SPA_PAGES = ['#dwi', '#story-page', '#modelling', '#visual-art', '#visual-art-gallery', '#sound', '#hox', '#contact'];
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
    const isAnyPageVisible = SPA_PAGES.some(pageId => {
      const el = document.querySelector(pageId);
      return el && el.style.display !== 'none';
    });
    if (isAnyPageVisible) {
      return;
    }
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

  $$('#story').forEach(s => {
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

  /* Router and Smooth scroll */
  const NAV_HEIGHT = 108;
  const mainWrapper = document.getElementById('main-content-wrapper');
  const flash = document.getElementById('flash-overlay');

  function setActiveNavLink(targetId) {
    const links = document.querySelectorAll('.nav-link, .mobile-nav-links a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    // Let onLogoClick handle the nav-logo clicks exclusively
    if (link.classList.contains('nav-logo')) {
      return;
    }

    const id = link.getAttribute('href');
    if (id === '#') return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    // Check if any SPA page is currently visible
    const visiblePageId = SPA_PAGES.find(pageId => {
      const el = document.querySelector(pageId);
      return el && el.style.display !== 'none';
    });

    const isTargetPage = SPA_PAGES.includes(id);

    // 1. Transitioning TO an SPA page
    if (isTargetPage) {
      if (visiblePageId === id) return;

      if (flash) {
        flash.classList.add('is-fast');
        flash.classList.add('is-active');
      }

      setTimeout(() => {
        window.isCanvasActive = false; // Pause WebGL loop when navigating away from home page

        // Hide main content wrapper
        if (mainWrapper) mainWrapper.style.display = 'none';

        // Hide all other SPA pages
        SPA_PAGES.forEach(pageId => {
          const el = document.querySelector(pageId);
          if (el) {
            el.classList.remove('is-visible');
            el.style.display = 'none';
          }
        });

        // Show the target page
        if (target) {
          const displayMode = (id === '#contact' || id === '#story-page' || id === '#hox' || id === '#dwi') ? 'flex' : 'block';
          target.style.display = displayMode;
          target.offsetHeight; // force reflow
          target.classList.add('is-visible');

          if (id === '#dwi') {
            alignDwiTwitterFeedHeight();
            setTimeout(alignDwiTwitterFeedHeight, 100);
          }

          if (id === '#visual-art' && window.reinitArtCardSwapPositions) {
            window.reinitArtCardSwapPositions();
          }
        }

        // Toggle footer and nav dark theme classes
        const footer = $('.site-footer');
        if (footer) {
          if (id === '#hox' || id === '#sound') {
            footer.classList.add('is-dark');
          } else {
            footer.classList.remove('is-dark');
          }
        }
        if (nav) {
          if (id === '#hox' || id === '#sound') {
            nav.classList.add('is-dark-page');
          } else {
            nav.classList.remove('is-dark-page');
          }
        }

        // Trigger typing reveal animation on story page title
        if (id === '#story-page') {
          const titleEl = target.querySelector('.story-page-title');
          if (titleEl) {
            titleEl.classList.remove('play-typing');
            void titleEl.offsetWidth; // force reflow
            titleEl.classList.add('play-typing');
          }
        }

        window.scrollTo({ top: 0, behavior: 'auto' });
        setActiveNavLink(id.replace('#', ''));

        if (flash) flash.classList.remove('is-active');
      }, 150);

      return;
    }

    // 2. Transitioning FROM an SPA page to a main content section
    if (visiblePageId) {
      if (flash) {
        flash.classList.add('is-fast');
        flash.classList.add('is-active');
      }

      setTimeout(() => {
        window.isCanvasActive = true; // Resume WebGL loop when returning to main layout sections

        // Hide all SPA pages
        SPA_PAGES.forEach(pageId => {
          const el = document.querySelector(pageId);
          if (el) {
            el.classList.remove('is-visible');
            el.style.display = 'none';
          }
        });

        // Restore main content wrapper
        if (mainWrapper) mainWrapper.style.display = 'block';

        // Scroll instantly to the target section
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: 'auto' });
        
        // Toggle footer and nav dark theme classes off
        const footer = $('.site-footer');
        if (footer) footer.classList.remove('is-dark');
        if (nav) nav.classList.remove('is-dark-page');

        if (flash) flash.classList.remove('is-active');
      }, 150);

      return;
    }

    // 3. Standard smooth scroll
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* Footer logo click scroll-to-top */
  const footerLogo = $('.footer-msangambe-logo');
  if (footerLogo) {
    footerLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Initial Hash Routing Check
  const initialHash = window.location.hash;
  if (initialHash && SPA_PAGES.includes(initialHash)) {
    window.isCanvasActive = false; // Pause WebGL loop if SPA subpage loaded directly
    // Hide main content wrapper
    if (mainWrapper) mainWrapper.style.display = 'none';

    // Hide all other SPA pages
    SPA_PAGES.forEach(pageId => {
      const el = document.querySelector(pageId);
      if (el) {
        el.classList.remove('is-visible');
        el.style.display = 'none';
      }
    });

    // Show the target page
    const target = document.querySelector(initialHash);
    if (target) {
      const displayMode = (initialHash === '#contact' || initialHash === '#story-page' || initialHash === '#hox' || initialHash === '#dwi') ? 'flex' : 'block';
      target.style.display = displayMode;
      target.offsetHeight; // force reflow
      target.classList.add('is-visible');

      if (initialHash === '#story-page') {
        const titleEl = target.querySelector('.story-page-title');
        if (titleEl) {
          titleEl.classList.remove('play-typing');
          void titleEl.offsetWidth; // force reflow
          titleEl.classList.add('play-typing');
        }
      }

      if (initialHash === '#dwi') {
        alignDwiTwitterFeedHeight();
        setTimeout(alignDwiTwitterFeedHeight, 100);
      }

      if (initialHash === '#visual-art' && window.reinitArtCardSwapPositions) {
        window.reinitArtCardSwapPositions();
      }
    }

    // Toggle footer and nav dark theme classes
    const footer = $('.site-footer');
    if (footer) {
      if (initialHash === '#hox' || initialHash === '#sound') {
        footer.classList.add('is-dark');
      } else {
        footer.classList.remove('is-dark');
      }
    }
    if (nav) {
      if (initialHash === '#hox' || initialHash === '#sound') {
        nav.classList.add('is-dark-page');
      } else {
        nav.classList.remove('is-dark-page');
      }
    }

    // Unlock body & disable landing navbar state
    document.body.classList.remove('is-locked');
    if (nav) nav.classList.remove('is-landing');

    // Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveNavLink(initialHash.replace('#', ''));
  }
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
        if (entry.target.classList.contains('story-heading')) {
          entry.target.classList.remove('play-entrance');
          void entry.target.offsetWidth; // force reflow
          entry.target.classList.add('play-entrance');
        }
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
    const elements = $$(sel);
    if (elements.length === 0) return;
    setTimeout(() => {
      elements.forEach(el => el.classList.add('is-visible'));
    }, delay);
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
  const contents  = $$('.hero-content');
  const hero      = $('#home');
  if (!hero) return;

  let ticking = false;

  function applyParallax() {
    const scrollY   = window.scrollY;
    const heroBottom = hero.getBoundingClientRect().bottom;

    if (hero.style.display === 'none' || heroBottom < 0) { ticking = false; return; }

    if (watermark) watermark.style.transform = `translateY(${scrollY * 0.2}px)`;
    if (hero3dWrap) {
      hero3dWrap.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.35}px))`;
    }
    contents.forEach(content => {
      content.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.15}px))`;
    });

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
  }, 300);
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
    'BLACK.jpeg',
    'BLONDE.jpeg',
    'CALVIN.jpeg',
    'CIG.jpeg',
    'GFA.jpeg',
    'HOP.jpeg',
    'JAGUAR.jpeg',
    'KLEIN.jpeg',
    'KLEIN2.jpeg',
    'KOINZ.jpeg',
    'OG.jpeg',
    'SMOOTH.jpeg',
    'WhatsApp Image 2026-04-22 at 5.42.58 PM.jpeg',
    'ZEBRA.jpeg'
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
    if (!valid) return;

    const submitBtn = $('#form-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = "SENDING REQUEST...";
      submitBtn.disabled = true;
    }

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
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
        submitBtn.textContent = "LET'S CONNECT";
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
    document.documentElement.classList.add('is-locked-modal');
    document.body.classList.add('is-locked-modal');
  }

  function closeLightbox() {
    lightbox.classList.add('is-hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    mediaBox.innerHTML = '';
    document.documentElement.classList.remove('is-locked-modal');
    document.body.classList.remove('is-locked-modal');
  }

  function updateLightboxMedia() {
    lightbox.scrollTop = 0; // Reset scroll position to top on media change
    if (currentIndex < 0 || currentIndex >= currentItems.length) return;
    const item = currentItems[currentIndex];
    const type = item.getAttribute('data-media-type') || 'image';
    const src  = item.getAttribute('data-media-src');
    const title = item.getAttribute('data-title') || 'UNTITLED';
    const meta  = item.getAttribute('data-meta') || 'SON DYNASTY';

    titleEl.textContent = title;
    metaEl.textContent  = meta;

    // Check for advanced art details
    const artist = item.getAttribute('data-artist');
    const subject = item.getAttribute('data-subject');
    const dateMade = item.getAttribute('data-date-made');
    const datePublished = item.getAttribute('data-date-published');
    const notes = item.getAttribute('data-notes');

    const detailsEl = document.getElementById('lightbox-art-details');
    const basicEl = lightbox.querySelector('.lightbox-basic-info');

    if (artist) {
      if (basicEl) basicEl.style.display = 'none';
      if (detailsEl) {
        detailsEl.style.display = 'block';
        const dName = document.getElementById('detail-name');
        const dArtist = document.getElementById('detail-artist');
        const dSubject = document.getElementById('detail-subject');
        const dMade = document.getElementById('detail-date-made');
        const dPub = document.getElementById('detail-date-published');
        const dNotes = document.getElementById('detail-notes');

        if (dName) dName.textContent = title;
        if (dArtist) dArtist.textContent = artist;
        if (dSubject) dSubject.textContent = subject || 'Visual Art';
        if (dMade) dMade.textContent = dateMade || '';
        if (dPub) dPub.textContent = datePublished || '';
        if (dNotes) dNotes.textContent = notes || '';
      }
    } else {
      if (basicEl) basicEl.style.display = 'block';
      if (detailsEl) detailsEl.style.display = 'none';
    }

    if (type === 'video') {
      mediaBox.innerHTML = '';
      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = true;
      mediaBox.appendChild(video);
    } else {
      // Decode image asynchronously to eliminate UI thread lag and frame drops
      const img = new Image();
      img.src = src;
      img.alt = title;
      img.decode().then(() => {
        if (currentItems[currentIndex] === item) {
          mediaBox.innerHTML = '';
          mediaBox.appendChild(img);
        }
      }).catch(() => {
        if (currentItems[currentIndex] === item) {
          mediaBox.innerHTML = '';
          mediaBox.appendChild(img);
        }
      });
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
    const galleryCell = e.target.closest('.gallery-cell');
    const modelCell = e.target.closest('.model-cell');
    const playerCover = e.target.closest('#player-cover');
    const dwiCover = e.target.closest('.dwi-cover-wrapper');
    const dwiProduct = e.target.closest('.dwi-product-trigger');

    if (artCell) {
      if (window.getFrontArtCard && window.getFrontArtCard() !== artCell) {
        if (window.bringArtCardToFront) {
          const allArt = $$('.art-cell');
          const idx = allArt.indexOf(artCell);
          window.bringArtCardToFront(idx);
        }
        return;
      }
      const allArt = $$('.art-cell');
      const idx = allArt.indexOf(artCell);
      openLightbox(allArt, idx);
    } else if (galleryCell) {
      const allGallery = $$('.gallery-cell');
      const idx = allGallery.indexOf(galleryCell);
      openLightbox(allGallery, idx);
    } else if (modelCell) {
      const allModels = $$('.model-cell');
      const idx = allModels.indexOf(modelCell);
      openLightbox(allModels, idx);
    } else if (playerCover) {
      openLightbox([playerCover], 0);
    } else if (dwiCover) {
      openLightbox([dwiCover], 0);
    } else if (dwiProduct) {
      openLightbox([dwiProduct], 0);
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
  const audio          = $('#hidden-audio');
  const playBtn        = $('#player-play-btn');
  const playIcon       = $('#play-icon');
  const pauseIcon      = $('#pause-icon');
  const prevBtn        = $('#player-prev-btn');
  const nextBtn        = $('#player-next-btn');
  const titleEl        = $('#player-track-title');
  const artistEl       = $('#player-track-artist');
  const prodEl         = $('#player-track-producer');
  const extraEl        = $('#player-track-extra');
  const genreEl        = $('#player-genre-tag');
  const coverEl        = $('#player-cover');
  const discWrapper    = $('#disc-wrapper-hero');
  const scrubSlider    = $('#player-scrub');
  const currentText    = $('#player-time-current');
  const durationText   = $('#player-time-duration');
  const volumeSlider   = $('#player-volume');
  const waveform       = $('#hero-waveform');
  const libraryList    = $('#music-library-list');
  const libraryCount   = $('#library-count');

  const tuneBtn        = $('#terminal-tune-btn');
  const visualizer     = $('.terminal-visualizer');
  const terminalText   = $('.terminal-status-text');

  if (!audio || !playBtn) return;

  /* ── TRACK CATALOGUE ────────────────────────────────────── */
  const tracks = [
    {
      title:    "ZIZI",
      artist:   "ARTIST: SON DYNASTY",
      producer: "PRODUCED BY: DROOPIE, SON DYNASTY",
      extra:    "MIXED & MASTERED BY: OAGENG MAKOKWE, DROOPIE · 2016",
      genre:    "HIP-HOP · POP · ROCK",
      written:  "Written by: Son Dynasty",
      cover:    "assets/images/ZIZI_song_cover_.jpg",
      src:      "assets/music/ZIZI.mp3?v=2"
    },
    {
      title:    "DIGITAL OVERLOAD",
      artist:   "ARTIST: SON DYNASTY",
      producer: "PRODUCED BY: DROOPIE",
      extra:    "MIXED & MASTERED BY: OAGENG MAKOKWE, DROOPIE · 2016",
      genre:    "PUNK · HIP-HOP · POP · ROCK",
      written:  "Written by: Son Dynasty, Droopie, Cushy",
      cover:    "assets/images/Digital_Overload_.png",
      src:      "assets/music/DIGITAL OVERLOAD.mp3"
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying  = false;
  let isTuned    = false;
  const previewedTracks = new Set();

  /* ── LIBRARY RENDER ─────────────────────────────────────── */
  function renderLibrary() {
    if (!libraryList) return;
    libraryList.innerHTML = '';
    if (libraryCount) {
      libraryCount.textContent = tracks.length + (tracks.length === 1 ? ' TRACK' : ' TRACKS');
    }
    tracks.forEach((t, i) => {
      const row = document.createElement('button');
      row.className = 'library-track-row' + (i === currentTrackIndex ? ' is-active' : '');
      row.setAttribute('aria-label', 'Play ' + t.title);
      row.dataset.index = i;
      row.innerHTML = `
        <div class="library-track-art">
          <img src="${t.cover}" alt="${t.title} cover" class="library-track-thumb">
          <div class="library-track-play-overlay">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="library-track-details">
          <span class="library-track-name">${t.title}</span>
          <span class="library-track-meta label">${t.genre}</span>
        </div>
        <div class="library-track-waveform">
          ${Array.from({length: 12}, (_, b) =>
            `<span style="height:${20 + Math.random()*60}%"></span>`
          ).join('')}
        </div>
        <div class="library-track-duration label" id="lib-dur-${i}">—</div>`;
      row.addEventListener('click', () => {
        currentTrackIndex = i;
        loadTrack(i);
        playTrack();
      });
      libraryList.appendChild(row);
    });
  }

  /* ── LOAD TRACK ─────────────────────────────────────────── */
  function loadTrack(index) {
    const t = tracks[index];
    audio.src      = t.src;
    titleEl.textContent  = t.title;
    artistEl.textContent = t.artist;
    prodEl.textContent   = t.producer;
    if (extraEl) extraEl.textContent = t.extra;
    if (genreEl) genreEl.textContent = t.genre;
    coverEl.src          = t.cover;
    
    /* Add lightbox data attributes so it zooms dynamically on click */
    coverEl.setAttribute('data-media-src', t.cover);
    coverEl.setAttribute('data-media-type', 'image');
    coverEl.setAttribute('data-title', t.title);
    coverEl.setAttribute('data-meta', t.artist + ' · ' + t.producer);
    
    scrubSlider.value    = 0;
    currentText.textContent  = '0:00';
    durationText.textContent = '0:00';

    /* Update Media Session metadata for iOS/Android Control Centers */
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist.replace('ARTIST: ', ''),
        album: 'Son Dynasty',
        artwork: [
          { src: new URL(t.cover, window.location.href).href, sizes: '512x512', type: t.cover.endsWith('.png') ? 'image/png' : 'image/jpeg' }
        ]
      });
    }

    /* Highlight active library row */
    $$('.library-track-row').forEach((r, i) => {
      r.classList.toggle('is-active', i === index);
    });
  }

  /* ── PLAY / PAUSE ───────────────────────────────────────── */
  function playTrack() {
    const currentTrack = tracks[currentTrackIndex];
    if (!isTuned && previewedTracks.has(currentTrack.title)) {
      isPlaying = false;
      playIcon.classList.remove('is-hidden');
      pauseIcon.classList.add('is-hidden');
      if (discWrapper) discWrapper.classList.remove('spinning');
      if (waveform)    waveform.classList.remove('playing');
      $$('.library-track-waveform').forEach(w => w.classList.remove('playing'));
      if (window.showComingSoonModal) {
        window.showComingSoonModal('', true, currentTrack.title);
      }
      return;
    }

    isPlaying = true;
    audio.play().catch(() => {});
    playIcon.classList.add('is-hidden');
    pauseIcon.classList.remove('is-hidden');
    if (discWrapper) discWrapper.classList.add('spinning');
    if (waveform)    waveform.classList.add('playing');
    $$('.library-track-row.is-active .library-track-waveform').forEach(w => w.classList.add('playing'));
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  }

  function pauseTrack() {
    isPlaying = false;
    audio.pause();
    playIcon.classList.remove('is-hidden');
    pauseIcon.classList.add('is-hidden');
    if (discWrapper) discWrapper.classList.remove('spinning');
    if (waveform)    waveform.classList.remove('playing');
    $$('.library-track-waveform').forEach(w => w.classList.remove('playing'));
    
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  }

  function togglePlay() { isPlaying ? pauseTrack() : playTrack(); }

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

  /* ── SCRUB & TIME ───────────────────────────────────────── */
  audio.addEventListener('durationchange', () => {
    const d = audio.duration;
    if (d && isFinite(d)) {
      durationText.textContent = fmt(d);
      const dur = $('#lib-dur-' + currentTrackIndex);
      if (dur) dur.textContent = fmt(d);
    }
  });

  audio.addEventListener('timeupdate', () => {
    const c = audio.currentTime, d = audio.duration;
    
    // 30 seconds preview limit for catalog tracks
    if (!isTuned && c >= 30) {
      audio.currentTime = 30;
      pauseTrack();
      const currentTrack = tracks[currentTrackIndex];
      previewedTracks.add(currentTrack.title);
      if (window.showComingSoonModal) {
        window.showComingSoonModal('', true, currentTrack.title);
      }
      return;
    }

    if (d && isFinite(d)) {
      scrubSlider.value = (c / d) * 100;
      currentText.textContent = fmt(c);
      /* Animate waveform bars based on playback fraction */
      if (waveform && isPlaying) {
        const bars = waveform.querySelectorAll('span');
        const fraction = c / d;
        bars.forEach((bar, bi) => {
          bar.style.setProperty('--progress', (bi / bars.length) <= fraction ? '1' : '0');
        });
      }
    }
  });

  audio.addEventListener('ended', nextTrack);

  scrubSlider.addEventListener('input', () => {
    if (audio.duration) {
      let targetTime = (scrubSlider.value / 100) * audio.duration;
      if (!isTuned && targetTime > 30) {
        targetTime = 30;
      }
      audio.currentTime = targetTime;
    }
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = volumeSlider.value / 100;
  });

  /* ── RADIO TERMINAL ─────────────────────────────────────── */
  if (tuneBtn && visualizer && terminalText) {
    tuneBtn.addEventListener('click', () => {
      isTuned = !isTuned;
      if (isTuned) {
        tuneBtn.textContent = 'DISCONNECT FREQUENCY';
        tuneBtn.classList.add('active');
        visualizer.classList.add('animating');
        terminalText.textContent = 'DYNASTY RADIO BROADCAST · ONLINE';
        audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3';
        playTrack();
      } else {
        tuneBtn.textContent = 'TUNE IN FREQUENCY';
        tuneBtn.classList.remove('active');
        visualizer.classList.remove('animating');
        terminalText.textContent = 'DYNASTY RADIO BROADCAST · LIVE';
        pauseTrack();
        loadTrack(currentTrackIndex);
      }
    });
  }

  /* ── AUDIO DOWNLOAD PROTECTION ──────────────────────────── */
  // Prevent contextmenu downloads on player and hidden audio element
  const soundContainer = $('#sound');
  if (soundContainer) {
    soundContainer.addEventListener('contextmenu', e => e.preventDefault());
  }
  audio.addEventListener('contextmenu', e => e.preventDefault());

  /* ── MEDIA SESSION CONTROLS BINDING ─────────────────────── */
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', playTrack);
    navigator.mediaSession.setActionHandler('pause', pauseTrack);
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
  }

  /* ── HELPERS ────────────────────────────────────────────── */
  function fmt(secs) {
    const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ── INIT ───────────────────────────────────────────────── */
  renderLibrary();
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
   13. 3D WEBGL HERO CANVAS & MORPHING MATERIALS
   Initializes Three.js Medallion (Dragon Crest representation)
   and manages the premium refractive DIAMOND style and cursor interaction.
   ══════════════════════════════════════════════════════════════ */
(function initThreeDHero() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  let scene, camera, renderer, emblemGroup, coinMesh, logoMesh, lights = [];
  let materials = {};
  window.isCanvasActive = true; // Expose globally to pause calculations on subpages
  
  // Mouse tracking variables
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  
  // Timing variables
  let clock = new THREE.Clock();
  let lastTime = 0;

  // Raycasting & Transition variables
  let raycaster = new THREE.Raycaster();
  let mouseVector = new THREE.Vector2();
  let isHoveringMedallion = false;
  let isTransitioning = false;
  let isWaitingForReturnStart = false;
  let transitionStartTime = 0;
  let transitionDirection = 1; // 1 for zoom-in, -1 for zoom-out

  function init() {
    // 1. SCENE & CAMERA
    scene = new THREE.Scene();
    
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const aspect = width / height;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.z = 5.5;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
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

    const accentLight1 = new THREE.PointLight(0x00ffcc, 1.2, 25);
    accentLight1.position.set(6, -4, 5);
    scene.add(accentLight1);
    lights.push(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff0055, 0.8, 25);
    accentLight2.position.set(-6, 4, 4);
    scene.add(accentLight2);
    lights.push(accentLight2);

    // Interactive cursor-following spotlight to create dynamic hover glare
    const cursorLight = new THREE.PointLight(0xffffff, 1.8, 15);
    cursorLight.name = 'cursorLight';
    cursorLight.position.set(0, 0, 4);
    scene.add(cursorLight);

    // 4. PROCEDURAL TEXTURES & LOGO LOADING
    const envMapTexture = createProceduralEnvMap();
    
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('FAVICON-LOGO_NOBG-removebg-preview.png');

    // 5. DIAMOND MATERIAL SETUP (Crystal refracting coin)
    materials.diamondCoin = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 1.0,
      ior: 2.42,
      roughness: 0.02,
      metalness: 0.0,
      thickness: 1.2,
      transparent: true,
      envMap: envMapTexture,
      envMapIntensity: 2.6,
      clearcoat: 1.0
    });
    materials.diamondLogo = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: logoTexture,
      transparent: true,
      opacity: 0.95,
      roughness: 0.1,
      metalness: 0.8
    });

    // 6. GEOMETRY & EMBLEM MESH CREATION (Slightly larger sizing)
    emblemGroup = new THREE.Group();
    
    const cylinderGeom = new THREE.CylinderGeometry(1.75, 1.75, 0.08, 64);
    cylinderGeom.rotateX(Math.PI / 2); // orient flat face forward
    
    coinMesh = new THREE.Mesh(cylinderGeom, materials.diamondCoin);
    coinMesh.name = 'coinMesh';
    emblemGroup.add(coinMesh);

    // Front-facing logo texture plane (slightly larger M/dragon logo inside medallion)
    const logoGeometry = new THREE.PlaneGeometry(1.5, 1.5);
    logoMesh = new THREE.Mesh(logoGeometry, materials.diamondLogo);
    logoMesh.name = 'logoMesh';
    logoMesh.position.set(0, 0, 0.042); // offset forward
    emblemGroup.add(logoMesh);

    scene.add(emblemGroup);

    // 7. EVENT LISTENERS
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchstart', onTouchMove, { passive: false });
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
      homeSection.addEventListener('click', onHomeSectionClick);
    }
    
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', onLogoClick);
    }
    
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

  function onMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    // Normalized coordinates for raycaster
    mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onTouchMove(event) {
    if (document.body.classList.contains('is-locked')) {
      event.preventDefault();
    }
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      mouseX = (touch.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = (touch.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      
      // Normalized coordinates for raycaster
      mouseVector.x = (touch.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
  }

  function triggerEntryTransition() {
    if (isTransitioning) return;
    isTransitioning = true;
    transitionDirection = 1;
    transitionStartTime = clock.getElapsedTime();
    
    // Hide tooltip
    const prompt = document.getElementById('medallion-prompt');
    if (prompt) prompt.classList.remove('is-active');
    
    // Reset custom cursor hover status
    const ring = document.querySelector('.cursor-ring');
    if (ring) ring.classList.remove('is-hovering');
    
    // Trigger white screen flash fade-in (starts at 700ms, reaches solid white at 1500ms)
    setTimeout(() => {
      const flash = document.getElementById('flash-overlay');
      if (flash) flash.classList.add('is-active');
    }, 700);

    // At 1500ms (fully solid white): hide #home, unlock body, nav, scroll, and reset scene
    setTimeout(() => {
      // Hide the home section to lock scroll up capability
      const homeSection = document.getElementById('home');
      if (homeSection) homeSection.style.display = 'none';
      
      window.isCanvasActive = false; // Pause WebGL loop

      document.body.classList.remove('is-locked');
      
      const nav = document.getElementById('main-nav');
      if (nav) nav.classList.remove('is-landing');

      // Scroll to top instantly (since #home is hidden, top of #story is 0)
      window.scrollTo({ top: 0, behavior: 'auto' });
      
      // Reset medallion and camera parameters in Three.js scene (invisible under solid white)
      if (emblemGroup) {
        emblemGroup.scale.set(1, 1, 1);
        emblemGroup.position.set(0, 0, 0);
      }
      camera.position.z = 5.5;
      
      isTransitioning = false;
      isHoveringMedallion = false;
      
      // Fade out white flash overlay
      const flash = document.getElementById('flash-overlay');
      if (flash) flash.classList.remove('is-active');

      // Play entrance animation for story heading
      const storyHeading = document.querySelector('.story-heading');
      if (storyHeading) {
        storyHeading.classList.remove('play-entrance');
        void storyHeading.offsetWidth; // force reflow
        storyHeading.classList.add('play-entrance');
      }
      
    }, 1500);
  }

  window.triggerDynastyWorldEntry = triggerEntryTransition;

  function onHomeSectionClick(e) {
    // If user clicked nav or a button/link inside home, bypass
    if (e.target.closest('a, button')) return;

    // Touch devices handle entrance exclusively via tap/touchend check inside initCursor
    if (navigator.maxTouchPoints > 0) return;

    if (document.body.classList.contains('is-locked') && !isTransitioning) {
      triggerEntryTransition();
    }
  }

  function onLogoClick(e) {
    if (!document.body.classList.contains('is-locked') && !isTransitioning && !isWaitingForReturnStart) {
      e.preventDefault();
      isWaitingForReturnStart = true;

      // 1. Trigger white flash overlay fade-in (takes 800ms to go solid white)
      const flash = document.getElementById('flash-overlay');
      if (flash) {
        flash.classList.remove('is-fast'); // Ensure slow/smooth transition back to landing
        flash.classList.add('is-active');
      }

      // 2. At 800ms (fully white): restore #home, lock scroll, lock nav, scroll to top instantly, reset scene to zoom-in values
      setTimeout(() => {
        window.isCanvasActive = true; // Resume WebGL loop
        
        // Hide all SPA pages if active and restore main wrapper
        const pages = ['#dwi', '#story-page', '#modelling', '#visual-art', '#visual-art-gallery', '#sound', '#hox', '#contact'];
        pages.forEach(pageId => {
          const el = document.querySelector(pageId);
          if (el) {
            el.classList.remove('is-visible');
            el.style.display = 'none';
          }
        });
        const mainWrapper = document.getElementById('main-content-wrapper');
        if (mainWrapper) {
          mainWrapper.style.display = 'block';
        }

        // Restore home section in layout
        const homeSection = document.getElementById('home');
        if (homeSection) homeSection.style.display = 'block';

        const storyHeading = document.querySelector('.story-heading');
        if (storyHeading) {
          storyHeading.classList.remove('play-entrance');
        }

        document.body.classList.add('is-locked');
        
        const nav = document.getElementById('main-nav');
        if (nav) {
          nav.classList.add('is-landing');
          nav.classList.remove('is-dark-page');
        }

        const footer = document.querySelector('.site-footer');
        if (footer) footer.classList.remove('is-dark');

        // Scroll to top instantly
        window.scrollTo({ top: 0, behavior: 'auto' });

        // Cleanly wipe hash from browser address bar without reloading
        window.history.pushState("", document.title, window.location.pathname + window.location.search);

        // Force medallion and camera to zoom-in values to prepare for zoom-out
        camera.position.z = 1.2;
        if (emblemGroup) {
          emblemGroup.scale.set(3.2, 3.2, 3.2);
          
          // Snap rotation to starting transition values to prevent initial frame rotation jitter
          const elapsedTime = clock.getElapsedTime();
          const pivotY = Math.sin(elapsedTime * 0.6) * 0.28;
          emblemGroup.rotation.y = pivotY + targetX * 0.45 + Math.PI * 2;
          emblemGroup.rotation.x = targetY * 0.35 + Math.PI * 0.5;
        }

        // Render one frame immediately to draw the snapped state under the white veil
        renderer.render(scene, camera);

        // Start reverse zoom-out timeline and trigger fade-out after a minimal delay (e.g. 50ms)
        setTimeout(() => {
          transitionStartTime = clock.getElapsedTime();
          isTransitioning = true;
          transitionDirection = -1;
          isWaitingForReturnStart = false;

          if (flash) flash.classList.remove('is-active');
        }, 50);

      }, 800);
    }
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

    // Skip computations and rendering when canvas is inactive
    if (window.isCanvasActive === false) {
      return;
    }

    const elapsedTime = clock.getElapsedTime();
    const dt = elapsedTime - lastTime;
    lastTime = elapsedTime;

    // Frame-rate independent lerp for mouse tracking (exp-decay)
    const rate = 3.0;
    const lerpFactor = Math.min(Math.max(1.0 - Math.exp(-rate * dt), 0.0), 1.0);

    targetX += (mouseX - targetX) * lerpFactor;
    targetY += (mouseY - targetY) * lerpFactor;

    // Raycast hover tracking (only while landing page is locked active)
    if (emblemGroup && !isTransitioning && document.body.classList.contains('is-locked')) {
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects([coinMesh, logoMesh]);
      
      if (intersects.length > 0) {
        if (!isHoveringMedallion) {
          isHoveringMedallion = true;
          // Desktop hover tooltip activation (only if non-touch!)
          if (navigator.maxTouchPoints === 0) {
            const prompt = document.getElementById('medallion-prompt');
            if (prompt) prompt.classList.add('is-active');
          }
          const ring = document.querySelector('.cursor-ring');
          if (ring) ring.classList.add('is-hovering');
        }
      } else {
        if (isHoveringMedallion) {
          isHoveringMedallion = false;
          // Desktop hover tooltip deactivation (only if non-touch!)
          if (navigator.maxTouchPoints === 0) {
            const prompt = document.getElementById('medallion-prompt');
            if (prompt) prompt.classList.remove('is-active');
          }
          const ring = document.querySelector('.cursor-ring');
          if (ring) ring.classList.remove('is-hovering');
        }
      }
    } else {
      // Hide tooltip when not on landing page or transitioning
      const prompt = document.getElementById('medallion-prompt');
      if (prompt) prompt.classList.remove('is-active');
    }

    // Apply transformation logic
    const baseScale = window.innerWidth < 768 ? 1.35 : 1.0;
    const targetScale = 3.2;

    if (isTransitioning) {
      const t = clock.getElapsedTime() - transitionStartTime;
      const duration = 1.5; // 1.5s total transition
      const progress = Math.min(t / duration, 1.0);
      
      // Smooth easeInOutCubic curve
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      if (transitionDirection === 1) {
        // Zooming in (entering)
        camera.position.z = 5.5 - ease * 4.3; // zoom from 5.5 to 1.2
        const currentScale = baseScale + ease * (targetScale - baseScale);
        if (emblemGroup) {
          emblemGroup.scale.set(currentScale, currentScale, currentScale);
          const pivotY = Math.sin(elapsedTime * 0.6) * 0.28;
          emblemGroup.rotation.y = pivotY + targetX * 0.45 + ease * Math.PI * 2;
          emblemGroup.rotation.x = targetY * 0.35 + ease * Math.PI * 0.5;
        }
      } else {
        // Zooming out (returning)
        camera.position.z = 1.2 + ease * 4.3; // zoom out from 1.2 to 5.5
        const currentScale = targetScale - ease * (targetScale - baseScale);
        if (emblemGroup) {
          emblemGroup.scale.set(currentScale, currentScale, currentScale);
          const pivotY = Math.sin(elapsedTime * 0.6) * 0.28;
          emblemGroup.rotation.y = pivotY + targetX * 0.45 + (1.0 - ease) * Math.PI * 2;
          emblemGroup.rotation.x = targetY * 0.35 + (1.0 - ease) * Math.PI * 0.5;
        }
        
        // Complete reverse transition state reset
        if (progress >= 1.0) {
          isTransitioning = false;
          isHoveringMedallion = false;
        }
      }
    } else {
      // Normal hover levitation and swinging
      if (emblemGroup) {
        emblemGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
        const pivotY = Math.sin(elapsedTime * 0.6) * 0.28;
        emblemGroup.rotation.y = pivotY + targetX * 0.45;
        emblemGroup.rotation.x = targetY * 0.35;
        
        // Dynamic breathing pulse for organic interactive feel
        const pulse = 1.0 + Math.sin(elapsedTime * 2.0) * 0.035;
        emblemGroup.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);
      }
      if (camera) {
        camera.position.z = 5.5;
      }
    }

    // Dynamic spotlight tracking cursor coordinates
    const cursorLight = scene.getObjectByName('cursorLight');
    if (cursorLight) {
      cursorLight.position.x = targetX * 3.5;
      cursorLight.position.y = -targetY * 3.5;
    }

    renderer.render(scene, camera);
  }

  init();
})();

/* ══════════════════════════════════════════════════════════════
   15. BOTTOM MAGNIFICATION DOCK
   ══════════════════════════════════════════════════════════════ */
(function initMagnificationDock() {
  const container = document.getElementById('app-dock-container');
  const dock = document.querySelector('.magnification-dock');
  const items = document.querySelectorAll('.dock-item');
  if (!container || !dock || items.length === 0) return;

  const baseSize = 42;
  const maxSize = 72;
  const horizontalInfluence = 55;  // Only magnify when directly over/beside an item
  const verticalInfluence = 45;   // Only magnify when physically on the dock

  let mouseX = null;
  let mouseY = null;
  let rafId = null;

  function updateDock() {
    if (mouseX === null || mouseY === null) {
      document.body.classList.remove('hide-custom-cursor');
      items.forEach(item => {
        item.classList.add('is-resetting');
        item.style.width = '';
        item.style.height = '';
      });
      rafId = null;
      return;
    }

    // --- BATCHED READS ---
    const dockRect = dock.getBoundingClientRect();
    const dockCenterY = dockRect.top + dockRect.height / 2;
    const verticalDist = Math.abs(mouseY - dockCenterY);

    // If mouse is too far vertically, reset items and restore custom cursor
    if (verticalDist > verticalInfluence) {
      document.body.classList.remove('hide-custom-cursor');
      items.forEach(item => {
        item.classList.add('is-resetting');
        item.style.width = '';
        item.style.height = '';
      });
      rafId = null;
      return;
    }

    // Hide custom cursor and show browser cursor inside the active dock zone
    document.body.classList.add('hide-custom-cursor');

    // Smooth vertical scaling factor to damp/ease vertical transitions
    const verticalRatio = 1 - (verticalDist / verticalInfluence);
    const verticalEase = 0.5 - 0.5 * Math.cos(verticalRatio * Math.PI);

    // Read all item centers in one single batch to avoid layout thrashing
    const itemCenters = [];
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      itemCenters.push(rect.left + rect.width / 2);
    }

    // --- BATCHED WRITES ---
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const centerX = itemCenters[i];
      const dx = Math.abs(mouseX - centerX);

      if (dx < horizontalInfluence) {
        const horizontalRatio = 1 - (dx / horizontalInfluence);
        const horizontalEase = 0.5 - 0.5 * Math.cos(horizontalRatio * Math.PI);
        const totalEase = horizontalEase * verticalEase;

        if (totalEase > 0) {
          item.classList.remove('is-resetting');
          const size = baseSize + (maxSize - baseSize) * totalEase;
          item.style.width = `${size}px`;
          item.style.height = `${size}px`;
        } else {
          item.classList.add('is-resetting');
          item.style.width = '';
          item.style.height = '';
        }
      } else {
        item.classList.add('is-resetting');
        item.style.width = '';
        item.style.height = '';
      }
    }

    rafId = requestAnimationFrame(updateDock);
  }

  function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateDock);
    }
  }

  function handleMouseLeave() {
    mouseX = null;
    mouseY = null;
    if (!rafId) {
      rafId = requestAnimationFrame(updateDock);
    }
  }

  // Bind strictly to the dock element — no early triggering from across the page
  dock.addEventListener('mousemove', handleMouseMove, { passive: true });
  dock.addEventListener('mouseleave', handleMouseLeave, { passive: true });
  window.addEventListener('blur', handleMouseLeave, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   16. HOUSE OF XYON (HOX) INTERACTIVE ACCESS REGISTER
   ══════════════════════════════════════════════════════════════ */
(function initHoxInteractive() {
  const notifyBtn = document.getElementById('hox-notify-btn');
  const successNote = document.getElementById('hox-success-note');
  const hoxCard = document.querySelector('.hox-card-interactive');

  if (notifyBtn && successNote) {
    notifyBtn.addEventListener('click', () => {
      notifyBtn.classList.add('is-hidden');
      notifyBtn.style.display = 'none';
      successNote.classList.remove('is-hidden');
    });
  }

  // 3D Tilt Hover Effect on Interactive Card
  if (hoxCard) {
    hoxCard.addEventListener('mousemove', (e) => {
      const rect = hoxCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPct = (x / rect.width - 0.5) * 15; // Max 7.5 deg rotation
      const yPct = (y / rect.height - 0.5) * -15;

      hoxCard.style.transform = `perspective(1000px) rotateY(${xPct}deg) rotateX(${yPct}deg) translateY(-8px)`;
      
      // Update mouse light position CSS variables
      hoxCard.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      hoxCard.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    hoxCard.addEventListener('mouseleave', () => {
      hoxCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)';
      hoxCard.style.setProperty('--mouse-x', '50%');
      hoxCard.style.setProperty('--mouse-y', '50%');
    });
  }
})();

/* ══════════════════════════════════════════════════════════════
   17. HEADING TYPOGRAPHY AND SCROLL TEXT ANIMATIONS
   ══════════════════════════════════════════════════════════════ */
(function initHeadingAndScrollAnimations() {
  
  // Helper to split text/html into character spans wrapped in word blocks to prevent breaking words (preserving tags)
  function splitTextIntoLetters(element, delayStep, startDelay = 0) {
    if (!element) return;
    const html = element.innerHTML.trim();
    element.innerHTML = '';
    let charIndex = 0;
    
    function processWord(wordText) {
      let result = '';
      for (let j = 0; j < wordText.length; j++) {
        const char = wordText[j];
        const delay = startDelay + (charIndex * delayStep);
        result += `<span class="letter" style="--delay: ${delay}ms;">${char}</span>`;
        charIndex++;
      }
      return `<span class="word" style="display: inline-block; white-space: nowrap;">${result}</span>`;
    }

    let resultHtml = '';
    let i = 0;
    let currentWord = '';

    while (i < html.length) {
      if (html[i] === '<') {
        if (currentWord) {
          resultHtml += processWord(currentWord);
          currentWord = '';
        }
        let tag = '';
        while (i < html.length && html[i] !== '>') {
          tag += html[i];
          i++;
        }
        tag += '>';
        i++;
        resultHtml += tag;
      } else if (html[i] === ' ') {
        if (currentWord) {
          resultHtml += processWord(currentWord);
          currentWord = '';
        }
        resultHtml += ' ';
        i++;
      } else {
        currentWord += html[i];
        i++;
      }
    }
    if (currentWord) {
      resultHtml += processWord(currentWord);
    }
    element.innerHTML = resultHtml;
  }

  // Initialize letter splits
  const storyHeading = document.querySelector('.story-heading');
  if (storyHeading) {
    splitTextIntoLetters(storyHeading, 20); // 20ms stagger for blur slide-up
  }

  const contactHeading = document.querySelector('.contact-heading');
  if (contactHeading) {
    splitTextIntoLetters(contactHeading, 20);
  }

  const storyPageTitle = document.querySelector('.story-page-title');
  if (storyPageTitle) {
    storyPageTitle.classList.add('typing-heading');
    splitTextIntoLetters(storyPageTitle, 40, 0); // 40ms character typing delay
  }

  // Scroll-Driven Text Unfolding/Unblurring
  const scrollAnimateElements = document.querySelectorAll('.story-body p, .editorial-col p, .editorial-lead');
 
  // High-performance visible elements tracking (120Hz fluid scroll)
  const activeElements = new Set();
  
  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeElements.add(entry.target);
        updateElementAnim(entry.target);
      } else {
        activeElements.delete(entry.target);
        
        // Handle elements inside hidden display:none containers gracefully (bounding box width/height are 0)
        const rect = entry.target.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          entry.target.style.filter = 'blur(8px)';
          entry.target.style.opacity = '0.15';
          entry.target.style.transform = 'translateY(15px)';
          return;
        }

        // Reset to initial state when far out of view
        if (rect.top > window.innerHeight) {
          entry.target.style.filter = 'blur(8px)';
          entry.target.style.opacity = '0.15';
          entry.target.style.transform = 'translateY(15px)';
        } else {
          entry.target.style.filter = 'blur(0px)';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0px)';
        }
      }
    });
  }, { rootMargin: '120px 0px 120px 0px' });

  scrollAnimateElements.forEach(el => textObserver.observe(el));

  function updateElementAnim(el) {
    try {
      const rect = el.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Start unblurring at 95% viewport height, fully sharp at 75%
      const startPoint = viewHeight * 0.95;
      const endPoint = viewHeight * 0.75;
      const totalDistance = startPoint - endPoint;

      const currentDistance = startPoint - rect.top;
      const progress = Math.max(0, Math.min(1, currentDistance / totalDistance));

      const blurVal = (1 - progress) * 8; // 8px blur down to 0px
      const opacityVal = 0.15 + (progress * 0.85); // 0.15 opacity up to 1.0
      const translateYVal = (1 - progress) * 15; // 15px down to 0px

      el.style.filter = `blur(${blurVal}px)`;
      el.style.opacity = opacityVal;
      el.style.transform = `translateY(${translateYVal}px)`;
    } catch (e) {}
  }

  function updateScrollTextAnimation() {
    activeElements.forEach(updateElementAnim);
  }
 
  window.addEventListener('scroll', updateScrollTextAnimation, { passive: true });
  window.addEventListener('resize', updateScrollTextAnimation, { passive: true });
 
  // Expose update functions to window for routing triggers
  window.updateScrollJourneyPaths = () => {
    updateScrollTextAnimation();
  };
 
  // Initial trigger
  setTimeout(updateScrollTextAnimation, 150);
 
})();

/* ══════════════════════════════════════════════════════════════
   18. COMING SOON MODAL CONTROLLER
   ══════════════════════════════════════════════════════════════ */
(function initComingSoonModal() {
  const links = document.querySelectorAll('[data-coming-soon]');
  const modal = document.getElementById('coming-soon-modal');
  const platformLabel = document.getElementById('coming-soon-platform');
  if (!modal || !platformLabel) return;

  function showModal(platformName, isPreviewEnd = false, trackTitle = '') {
    const accentLabel = modal.querySelector('.modal-accent-label');
    const heading = modal.querySelector('.modal-heading');
    const message = modal.querySelector('.modal-message');
    const ackBtn = modal.querySelector('.modal-acknowledge-btn');
    const inputField = document.getElementById('coming-soon-email-input');
    const formGroup = modal.querySelector('.modal-email-form');

    // Reset default visibility for regular modal triggers
    if (inputField) inputField.style.display = 'block';
    if (formGroup) formGroup.style.display = 'flex';

    if (isPreviewEnd) {
      if (accentLabel) accentLabel.textContent = '( PRE-SAVE ACTIVE )';
      if (heading) heading.textContent = 'PRE-SAVE COMING SOON';
      if (message) {
        message.innerHTML = `You have finished your 30-second preview of <span class="modal-highlight">${trackTitle}</span>. Pre-save the official release now on Spotify, Apple Music, and SoundCloud to unlock the full track on launch day.`;
      }
      if (ackBtn) ackBtn.style.display = 'none'; // No button needed in this card view
    } else {
      if (accentLabel) accentLabel.textContent = '( TRANSMISSION DELAYED )';
      if (heading) heading.textContent = 'FREQUENCY COMING SOON';
      if (message) {
        message.innerHTML = `This channel is currently being calibrated. The official Son Dynasty frequency will launch on <span id="coming-soon-platform" class="modal-highlight">${platformName}</span> shortly.`;
      }
      if (ackBtn) {
        ackBtn.style.display = 'inline-block';
        ackBtn.textContent = 'SECURE ACCESS';
      }
    }

    modal.classList.remove('is-hidden');
    modal.offsetHeight; // force reflow
    modal.classList.add('is-active');
    document.body.classList.add('is-locked-modal');
  }

  window.showComingSoonModal = showModal;

  function hideModal() {
    modal.classList.remove('is-active');
    setTimeout(() => {
      modal.classList.add('is-hidden');
      document.body.classList.remove('is-locked-modal');
    }, 400);
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = link.getAttribute('data-coming-soon');
      showModal(platform);
    });
  });

  const closeBtn = document.getElementById('modal-close-btn');
  const ackBtn = document.getElementById('modal-ack-btn');
  const backdrop = modal.querySelector('.modal-backdrop');

  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (ackBtn) ackBtn.addEventListener('click', hideModal);
  if (backdrop) backdrop.addEventListener('click', hideModal);
})();

/* ══════════════════════════════════════════════════════════════
   19. DYNASTY WORLD ISSUE (DWI) BLOG FEED
   ══════════════════════════════════════════════════════════════ */
(function initLiveBlogFeed() {
  const container = document.getElementById('chronicle-feed-container');
  if (!container) return;

  fetch('assets/blog_feed.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(posts => {
      renderBlogPosts(posts);
      alignDwiTwitterFeedHeight();
    })
    .catch(error => {
      console.error('Error loading blog posts:', error);
      container.innerHTML = `<div class="dwi-chronicle-loading">Error loading blog feed.</div>`;
    });

  function renderBlogPosts(posts) {
    if (!posts || posts.length === 0) {
      container.innerHTML = `<div class="dwi-chronicle-loading">No blog posts found.</div>`;
      return;
    }

    container.innerHTML = posts.map(post => {
      return `
        <div class="chronicle-card">
          <div class="chronicle-card-meta">
            <span class="chronicle-tag">${post.tag}</span>
            <span class="chronicle-date">${post.date}</span>
          </div>
          <h4 class="chronicle-headline">${post.title}</h4>
          <p class="chronicle-body">${formatBlogText(post.content)}</p>
        </div>
      `;
    }).join('');
  }

  function formatBlogText(text) {
    return text
      .replace(/(#[a-zA-Z0-9_]+)/g, '<span class="chronicle-hashtag">$1</span>')
      .replace(/(@[a-zA-Z0-9_]+)/g, '<span class="chronicle-mention">$1</span>');
  }
})();
/* ══════════════════════════════════════════════════════════════
   20. DYNASTY WORLD ISSUE (DWI) INSTAGRAM FEED
   ══════════════════════════════════════════════════════════════ */
(function initInstagramFeed() {
  const container = document.getElementById('instagram-feed-container');
  if (!container) return;

  const mockPosts = [
    {
      id: 1,
      image: "assets/images/modelling/ZEBRA.jpeg",
      location: "Pretoria, South Africa",
      likes: 1248,
      liked: false,
      caption: "FORZA DYNASTY! 🦾 The ancestral cyberpunk realism in the new age. Cover story for the Dynasty World Issue. Concept & Art Direction by Son Dynasty Archive.",
      time: "2 HOURS AGO",
      comments: [
        { username: "q_sigudla", text: "hard 🔥" },
        { username: "gcwala_archive", text: "elite style." }
      ]
    },
    {
      id: 2,
      image: "assets/images/modelling/CIG.jpeg",
      location: "Johannesburg, South Africa",
      likes: 982,
      liked: false,
      caption: "Shadow play and editorial tones. Modelling for the new age archive. Styling by Msangambe.",
      time: "1 DAY AGO",
      comments: [
        { username: "sondynasty", text: "Classic look 🪐" }
      ]
    }
  ];

  function renderPosts() {
    container.innerHTML = mockPosts.map(post => {
      const commentsHtml = post.comments.map(c => `
        <div class="ig-comment">
          <span class="username">${c.username}</span>
          <span>${c.text}</span>
        </div>
      `).join('');

      return `
        <a href="https://www.instagram.com/msangambe_" target="_blank" rel="noopener noreferrer" class="instagram-post-card" data-id="${post.id}">
          <div class="ig-card-header">
            <img class="ig-avatar" src="assets/images/modelling/OG.jpeg" alt="Avatar">
            <div class="ig-post-meta">
              <span class="ig-username">msangambe_</span>
              <span class="ig-location">${post.location}</span>
            </div>
          </div>
          <div class="ig-media">
            <img src="${post.image}" alt="Instagram post">
          </div>
          <div class="ig-actions">
            <div class="ig-actions-left">
              <div class="ig-action-btn ig-action-btn--like" aria-label="Like">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </div>
              <div class="ig-action-btn" aria-label="Comment">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.064.065.093.155.076.244l-.38 2.056a.43.43 0 00.569.482l2.36-.93a.278.278 0 01.222.012c1.077.585 2.316.906 3.617.906z" /></svg>
              </div>
            </div>
          </div>
          <div class="ig-likes-count">${post.likes.toLocaleString()} likes</div>
          <div class="ig-caption">
            <span class="username">msangambe_</span>
            <span>${formatCaptionText(post.caption)}</span>
          </div>
          ${post.comments.length ? `<div class="ig-comments-list">${commentsHtml}</div>` : ''}
          <div class="ig-time">${post.time}</div>
        </a>
      `;
    }).join('');
  }

  function formatCaptionText(text) {
    return text
      .replace(/(#[a-zA-Z0-9_]+)/g, '<span class="tweet-hashtag">$1</span>')
      .replace(/(@[a-zA-Z0-9_]+)/g, '<span class="tweet-mention">$1</span>');
  }

  renderPosts();
})();

/* ══════════════════════════════════════════════════════════════
   21. VISUAL ART CARD SWAP DECK CONTROLLER (GSAP)
   ══════════════════════════════════════════════════════════════ */
(function initArtCardSwap() {
  const container = document.querySelector('.art-card-swap-container');
  if (!container) return;

  const cards = [...container.querySelectorAll('.art-cell')];
  const total = cards.length;
  if (total < 2) return;

  let order = Array.from({ length: total }, (_, i) => i);
  let isAnimating = false;
  let intervalId = 0;
  const swapDelay = 5000;

  function makeSlot(i, distX, distY, totalCount) {
    return {
      x: i * distX,
      y: -i * distY,
      z: -i * distX * 1.5,
      zIndex: totalCount - i
    };
  }

  function initPositions() {
    const isMobile = window.innerWidth <= 768;
    const distX = isMobile ? 20 : 40;
    const distY = isMobile ? 20 : 40;
    const skewAmount = isMobile ? 3 : 4;

    order.forEach((idx, i) => {
      const el = cards[idx];
      if (el) {
        gsap.killTweensOf(el);
        const slot = makeSlot(i, distX, distY, total);
        gsap.set(el, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          xPercent: -50,
          yPercent: -50,
          skewY: skewAmount,
          transformOrigin: 'center center',
          zIndex: slot.zIndex,
          force3D: true
        });
      }
    });
  }

  function swap(direction = 'down') {
    if (isAnimating || order.length < 2) return;
    isAnimating = true;

    const [front, ...rest] = order;
    const elFront = cards[front];
    if (!elFront) {
      isAnimating = false;
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const distX = isMobile ? 20 : 40;
    const distY = isMobile ? 20 : 40;
    const skewAmount = isMobile ? 3 : 4;

    const tl = gsap.timeline({
      onComplete: () => {
        order = [...rest, front];
        isAnimating = false;
        gsap.set(elFront, { rotation: 0 });
      }
    });

    // 1. Move/Swipe the front card away based on direction
    let animateProps = { duration: 0.45, ease: 'power3.inOut' };
    if (direction === 'left') {
      animateProps.x = '-=600';
      animateProps.rotation = -12;
    } else if (direction === 'right') {
      animateProps.x = '+=600';
      animateProps.rotation = 12;
    } else {
      animateProps.y = '+=600';
    }

    tl.to(elFront, animateProps);

    // 2. Slide the remaining cards forward
    tl.addLabel('promote', '-=0.25');
    rest.forEach((idx, i) => {
      const el = cards[idx];
      if (!el) return;
      const slot = makeSlot(i, distX, distY, total);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        skewY: skewAmount,
        duration: 0.45,
        ease: 'power3.out'
      }, `promote+=${i * 0.05}`);
    });

    // 3. Return the front card to the back slot
    const backSlot = makeSlot(total - 1, distX, distY, total);
    tl.addLabel('return', 'promote+=0.25');
    tl.call(() => {
      gsap.set(elFront, { zIndex: backSlot.zIndex });
    }, undefined, 'return');

    tl.to(elFront, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      skewY: skewAmount,
      duration: 0.45,
      ease: 'power3.out'
    }, 'return');
  }

  // Wheel scroll handler (for desktop scrolling)
  container.addEventListener('wheel', (e) => {
    if (isAnimating) return;

    // Filter out very small scroll inputs (trackpad drift)
    if (Math.abs(e.deltaY) > 5) {
      e.preventDefault();
      swap('down');
    }
  }, { passive: false });

  // Touch swipe handler (for mobile/tablet swipes on container)
  let touchStartX = 0;
  let touchStartY = 0;
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    if (isAnimating) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Check if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 35) {
        if (diffX > 0) {
          swap('right');
        } else {
          swap('left');
        }
      }
    } else {
      if (Math.abs(diffY) > 35) {
        swap('down');
      }
    }
  }, { passive: true });

  // Resize listener
  window.addEventListener('resize', () => {
    const visArt = document.querySelector('#visual-art');
    if (visArt && visArt.style.display !== 'none') {
      initPositions();
    }
  });

  // Global APIs for the click handler integration
  window.getFrontArtCard = () => cards[order[0]];
  window.bringArtCardToFront = (clickedCardIndex) => {
    const pos = order.indexOf(clickedCardIndex);
    if (pos <= 0 || isAnimating) return;
    isAnimating = true;

    const rest = order.slice(pos);
    const frontSegment = order.slice(0, pos);
    order = [...rest, ...frontSegment];

    const isMobile = window.innerWidth <= 768;
    const distX = isMobile ? 20 : 40;
    const distY = isMobile ? 20 : 40;
    const skewAmount = isMobile ? 3 : 4;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
      }
    });

    order.forEach((idx, i) => {
      const el = cards[idx];
      if (!el) return;
      const slot = makeSlot(i, distX, distY, total);
      tl.set(el, { zIndex: slot.zIndex }, 0);
      tl.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        skewY: skewAmount,
        duration: 0.45,
        ease: 'power3.out'
      }, 0);
    });
  };

  // Expose wrapper for transition re-init
  window.reinitArtCardSwapPositions = initPositions;

  // Initialize on page load (autoplay disabled)
  initPositions();
})();

/* ══════════════════════════════════════════════════════════════
   22. VISUAL ART GALLERY PARALLAX AND 3D TILT LOOP
   ══════════════════════════════════════════════════════════════ */
(function initGalleryParallax() {
  let ticking = false;

  function updateParallax() {
    const gallery = document.getElementById('visual-art-gallery');
    if (!gallery || gallery.style.display === 'none') {
      ticking = false;
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const scrollY = window.scrollY;
    const viewHeight = window.innerHeight;

    // 1. Column Parallax (Left: 1.2x, Center: 1.0x, Right: 1.4x)
    if (!isMobile) {
      const colLeft = document.querySelector('.gallery-column--left');
      const colRight = document.querySelector('.gallery-column--right');
      if (colLeft) {
        // Translate up by 20% of scroll position
        colLeft.style.transform = `translate3d(0, ${-scrollY * 0.2}px, 0)`;
      }
      if (colRight) {
        // Translate up by 40% of scroll position
        colRight.style.transform = `translate3d(0, ${-scrollY * 0.4}px, 0)`;
      }
    } else {
      // Reset translation on mobile stack
      document.querySelectorAll('.gallery-column').forEach(col => {
        col.style.transform = '';
      });
    }

    // 2. Scroll-Linked 3D Cell Tilt (lean forward as they enter from bottom, lean back as they exit top)
    const cells = document.querySelectorAll('.gallery-cell');
    cells.forEach(cell => {
      const rect = cell.getBoundingClientRect();
      
      // Calculate item center distance from viewport center
      const cellCenter = rect.top + rect.height / 2;
      const distanceFromCenter = cellCenter - viewHeight / 2;
      
      // Normalize distance between -1 and 1
      const maxDist = viewHeight / 2 + rect.height / 2;
      const normalized = Math.max(-1, Math.min(1, distanceFromCenter / maxDist));
      
      // Maximum tilt angle (leaning amount)
      const maxTilt = 12; // degrees
      const tiltAngle = normalized * maxTilt; // positive leans forward, negative leans back
      
      const mediaWrap = cell.querySelector('.gallery-media-wrap');
      if (mediaWrap) {
        mediaWrap.style.transform = `perspective(1000px) rotateX(${tiltAngle}deg)`;
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#visual-art-gallery') {
      setTimeout(updateParallax, 80);
    }
  });

  window.addEventListener('resize', () => {
    updateParallax();
  });

  /* ══════════════════════════════════════════════════════════════
     30. SIMULATED CART & STORE CONTROLLER
     ══════════════════════════════════════════════════════════════ */
  let cart = [];

  const cartDrawer = document.getElementById('shopping-cart-drawer');
  const cartBackdrop = cartDrawer ? cartDrawer.querySelector('.cart-drawer-backdrop') : null;
  const cartContent = cartDrawer ? cartDrawer.querySelector('.cart-drawer-content') : null;
  const cartCloseBtn = cartDrawer ? cartDrawer.querySelector('.cart-drawer-close') : null;
  const cartEmptyState = cartDrawer ? cartDrawer.querySelector('.cart-empty-state') : null;
  const cartItemsList = cartDrawer ? cartDrawer.querySelector('.cart-items-list') : null;
  const cartTotalPrice = cartDrawer ? cartDrawer.querySelector('.cart-total-price') : null;
  const cartCheckoutBtn = cartDrawer ? cartDrawer.querySelector('.cart-checkout-btn') : null;
  const cartContinueBtn = cartDrawer ? cartDrawer.querySelector('.cart-continue-shopping-btn') : null;

  // Toggle Cart Drawer
  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-active');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-active');
    cartDrawer.setAttribute('aria-hidden', 'true');
    if (!document.body.classList.contains('is-locked')) {
      document.body.style.overflow = '';
    }
  }

  // Bind Openers
  document.querySelectorAll('.nav-cart-trigger, .mobile-cart-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
      const mobileMenu = document.getElementById('mobile-menu');
      const burger = document.querySelector('.nav-burger');
      if (mobileMenu && mobileMenu.classList.contains('is-active')) {
        mobileMenu.classList.remove('is-active');
        if (burger) {
          burger.classList.remove('is-active');
          burger.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Bind Closers
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);
  if (cartContinueBtn) cartContinueBtn.addEventListener('click', closeCartDrawer);

  // Size Selector
  document.querySelectorAll('.dwi-size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.closest('.dwi-size-selector');
      if (parent) {
        parent.querySelectorAll('.dwi-size-btn').forEach(b => b.classList.remove('active'));
      }
      this.classList.add('active');
    });
  });

  // Render Cart contents
  function renderCart() {
    if (!cartItemsList || !cartEmptyState || !cartTotalPrice) return;

    cartItemsList.innerHTML = '';
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
      badge.textContent = `(${totalQty})`;
    });

    if (cart.length === 0) {
      cartEmptyState.style.display = 'flex';
      cartItemsList.style.display = 'none';
      cartTotalPrice.textContent = 'R0.00';
      return;
    }

    cartEmptyState.style.display = 'none';
    cartItemsList.style.display = 'flex';

    let subtotal = 0;

    cart.forEach((item, index) => {
      subtotal += parseFloat(item.price) * item.qty;

      const li = document.createElement('li');
      li.className = 'cart-item';
      
      const isTshirt = item.id === 'tshirt';
      const imgSrc = isTshirt ? 'assets/images/white_tshirt_mockup.png' : 'assets/images/white_poster_mockup.png';

      li.innerHTML = `
        <div class="cart-item-img-wrap">
          <img src="${imgSrc}" alt="${item.name}" class="cart-item-img">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title-row">
            <div>
              <h4 class="cart-item-name">${item.name}</h4>
              ${item.size ? `<span class="cart-item-size label">SIZE: ${item.size}</span>` : ''}
            </div>
            <span class="cart-item-price label">R${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
          </div>
          <div class="cart-item-qty-row">
            <div class="cart-qty-control">
              <button class="cart-qty-btn decrease-btn" data-index="${index}">-</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn increase-btn" data-index="${index}">+</button>
            </div>
            <button class="cart-item-remove-btn label" data-index="${index}">REMOVE</button>
          </div>
        </div>
      `;
      cartItemsList.appendChild(li);
    });

    cartTotalPrice.textContent = `R${subtotal.toFixed(2)}`;

    // Quantity events
    cartItemsList.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        cart[idx].qty++;
        renderCart();
      });
    });

    cartItemsList.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        if (cart[idx].qty > 1) {
          cart[idx].qty--;
        } else {
          cart.splice(idx, 1);
        }
        renderCart();
      });
    });

    cartItemsList.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  // Add to Bag buttons
  document.querySelectorAll('.dwi-add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-product-id');
      const name = this.getAttribute('data-product-name');
      const price = this.getAttribute('data-product-price');
      
      let size = null;
      if (id === 'tshirt') {
        const activeSizeBtn = document.querySelector('.dwi-size-btn.active');
        size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'M';
      }

      const existing = cart.find(item => item.id === id && item.size === size);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, price, qty: 1, size });
      }

      renderCart();
      
      // Delay drawer open for better micro-interaction feel
      setTimeout(openCartDrawer, 150);
    });
  });

  // Simulated Checkout Alert popup
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      
      const modal = document.getElementById('coming-soon-modal');
      if (modal) {
        const accentLabel = modal.querySelector('.modal-accent-label');
        const heading = modal.querySelector('.modal-heading');
        const message = modal.querySelector('.modal-message');
        const ackBtn = modal.querySelector('.modal-acknowledge-btn');
        const inputField = document.getElementById('coming-soon-email-input');
        const formGroup = modal.querySelector('.modal-email-form');
        
        if (accentLabel) accentLabel.textContent = '( DYNASTY STORE )';
        if (heading) heading.textContent = 'CHECKOUT SIMULATED';
        if (message) {
          message.innerHTML = 'This transaction is simulated for showroom review. The actual payment and order fulfillment integration is coming soon!';
        }
        
        if (inputField) inputField.style.display = 'none';
        if (formGroup) formGroup.style.display = 'none';
        
        if (ackBtn) {
          ackBtn.style.display = 'inline-block';
          ackBtn.textContent = 'SECURE ACCESS';
        }

        modal.classList.remove('is-hidden');
        modal.offsetHeight;
        modal.classList.add('is-active');
        document.body.classList.add('is-locked-modal');
      }
    });
  }

})();

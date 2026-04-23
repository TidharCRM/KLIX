(function () {
  'use strict';

  // ── HERO SCROLL ANIMATION ────────────────────────────────────
  (function () {
    var TOTAL      = 97;
    var SCROLL_TOT = 700; // virtual px needed to complete animation
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx    = canvas.getContext('2d');
    var frames = new Array(TOTAL);
    var currentFrame = 0;
    var accumDelta   = 0;
    var locked       = true;
    var touchStartY  = 0;

    function pad(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame(currentFrame);
    }

    function drawFrame(idx) {
      var img = frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = canvas.width, ch = canvas.height;
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale, dh = ih * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    function getIdx(accum) {
      var t = accum / SCROLL_TOT;
      var eased = t < 0.6 ? (t / 0.6) * 0.5 : 0.5 + ((t - 0.6) / 0.4) * 0.5;
      return Math.round(eased * (TOTAL - 1));
    }

    function advance(delta) {
      accumDelta = Math.max(0, Math.min(SCROLL_TOT, accumDelta + delta));
      var idx = getIdx(accumDelta);
      if (idx !== currentFrame) { currentFrame = idx; drawFrame(idx); }
      if (accumDelta >= SCROLL_TOT) unlock();
    }

    function lock() {
      locked = true;
      accumDelta = SCROLL_TOT; // re-entering from below: start at last frame
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel',      onWheel,      { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true  });
      window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    }

    function onScrollBack() {
      if (window.scrollY === 0) {
        window.removeEventListener('scroll', onScrollBack);
        lock();
      }
    }

    function unlock() {
      locked = false;
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      document.body.style.overflow = '';
      window.addEventListener('scroll', onScrollBack, { passive: true });
    }

    function onWheel(e) {
      e.preventDefault();
      advance(e.deltaY);
    }

    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
      e.preventDefault();
      var delta = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      advance(delta);
    }

    for (var i = 1; i <= TOTAL; i++) {
      (function (index) {
        var img = new Image();
        img.onload = function () { if (index === 1) resize(); };
        img.src = 'hero-frames/' + pad(index) + '.jpg';
        frames[index - 1] = img;
      })(i);
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('resize',     resize,       { passive: true  });
    resize();
  })();

  // ── SCROLL PROGRESS BAR ──────────────────────────────────────
  var progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    function updateProgress() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      progressBar.style.width = (Math.min(1, window.scrollY / max) * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  // ── NAV BLUR ON SCROLL ───────────────────────────────────────
  var nav = document.getElementById('nav');
  if (nav) {
    function updateNav() { nav.classList.toggle('is-scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ── MOBILE HAMBURGER ─────────────────────────────────────────
  var burger   = document.getElementById('nav-burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    function closeMobile() {
      burger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', closeMobile);
    });
  }

  // ── SCROLL-SPY NAV ───────────────────────────────────────────
  (function () {
    var links = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!links.length) return;
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) sections.push({ link: link, el: el, id: id });
    });
    function updateActive() {
      var anchor = window.scrollY + window.innerHeight * 0.35;
      var activeId = null;
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        if (anchor >= s.el.offsetTop && anchor < s.el.offsetTop + s.el.offsetHeight) { activeId = s.id; break; }
      }
      sections.forEach(function (s) { s.link.classList.toggle('is-active', s.id === activeId); });
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  })();

  // ── TESTIMONIALS MARQUEE CLONE ───────────────────────────────
  document.querySelectorAll('.testi__track').forEach(function (track) {
    var set = track.querySelector('.testi__set');
    if (!set) return;
    Array.from(set.querySelectorAll('.tcard')).forEach(function (card, i) {
      card.style.setProperty('--q-delay', '-' + (i * 0.55).toFixed(2) + 's');
    });
    var clone = set.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // ── SCROLL REVEAL ────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    var selectors = [
      '.section-heading__title', '.section-heading__sub',
      '.scard', '.why__card', '.stats__item',
      '.plan', '.work',
      '.faq__title', '.faq__sub', '.faq__item',
      '.contact__title', '.contact__sub', '.leadf__row', '.leadf__btn',
      '.logos__label'
    ];
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add('reveal');
        obs.observe(el);
      });
    });
  }

  // ── STATS COUNT-UP ───────────────────────────────────────────
  (function () {
    var items = document.querySelectorAll('.stats__num[data-target]');
    if (!items.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var target = parseFloat(el.dataset.target);
        if (target === 0) { el.textContent = '0'; return; }
        var start = 0;
        var duration = 1600;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(start + (target - start) * ease);
          el.textContent = current.toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    items.forEach(function (el) { io.observe(el); });
  })();

  // ── FAQ ACCORDION ────────────────────────────────────────────
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // ── CONTACT FORM ─────────────────────────────────────────────
  var form    = document.getElementById('lead-form');
  var success = document.getElementById('lead-success');
  var submit  = document.getElementById('lead-submit');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      submit.disabled = true;
      submit.textContent = 'שולח...';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (success) success.hidden = false;
        } else {
          submit.disabled = false;
          submit.textContent = 'שלחו לי פרטים';
          alert('שגיאה בשליחה — נסו שוב');
        }
      }).catch(function () {
        submit.disabled = false;
        submit.textContent = 'שלחו לי פרטים';
        alert('בעיית רשת — נסו שוב');
      });
    });
  }

})();

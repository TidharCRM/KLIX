(function () {
  'use strict';

  // ── SCROLL PROGRESS BAR ──────────────────────────────────────
  var progressBar = document.getElementById('scroll-progress-bar');
  if (progressBar) {
    function updateProgress() {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      var p = Math.min(1, Math.max(0, window.scrollY / max));
      progressBar.style.width = (p * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  // ── HERO HINT fade-out on scroll ─────────────────────────────
  var heroHint = document.getElementById('hero-hint');
  var heroPin  = document.getElementById('hero-pin');
  if (heroHint && heroPin) {
    function updateHeroHint() {
      var maxScroll = heroPin.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      var p = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      heroHint.style.opacity = Math.max(0, (1 - p * 5) * 0.45).toFixed(3);
    }
    window.addEventListener('scroll', updateHeroHint, { passive: true });
    updateHeroHint();
  }

  // ── NAV: blur on scroll ──────────────────────────────────────
  var nav = document.getElementById('nav');
  if (nav) {
    function updateNav() {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ── SCROLL REVEAL ────────────────────────────────────────────
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var selectors = [
      '.section-heading__title',
      '.section-heading__lead',
      '.section-heading__sub',
      '.bigcard',
      '.process__step',
      '.philosophy__card',
      '.stats__item',
      '.faq__title',
      '.faq__item',
      '.contact__title',
      '.contact__sub',
      '.leadf__row',
      '.leadf__btn',
      '.logos__label'
    ];
    var elements = [];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        el.classList.add('reveal');
        elements.push(el);
      });
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    elements.forEach(function (el) { obs.observe(el); });
  })();

  // ── PATH SCROLL ANIMATION (one-shot, forward only) ───────────
  (function () {
    var pin       = document.getElementById('path-pin');
    var marker    = document.getElementById('path-marker');
    var trackPath = document.getElementById('snake-track');
    var progPath  = document.getElementById('snake-progress');
    var nodeEls   = document.querySelectorAll('.path__node');
    if (!pin || !marker || !trackPath || !progPath) return;

    var p = 0, locked = false, completed = false, touchY = 0, progLen = 0;
    var rafPending = false;
    var SENS = 0.0012;
    var thresholds = [0, 0.25, 0.5, 0.75, 1.0];

    function setupProgress() {
      if (typeof progPath.getTotalLength !== 'function') return;
      progLen = progPath.getTotalLength();
      progPath.style.strokeDasharray  = progLen;
      progPath.style.strokeDashoffset = progLen;
      progPath.style.transition = 'none';
    }

    function getActive(v) {
      var a = 0;
      for (var i = 0; i < thresholds.length; i++) { if (v >= thresholds[i]) a = i; }
      return a;
    }

    function render() {
      if (typeof trackPath.getTotalLength === 'function') {
        var tl = trackPath.getTotalLength();
        var pt = trackPath.getPointAtLength(p * tl);
        marker.style.left = pt.x + '%';
        marker.style.top  = pt.y + '%';
      }
      var active = getActive(p);
      nodeEls.forEach(function (el, i) {
        el.classList.toggle('is-active', i === active);
        el.classList.toggle('is-done',   i < active);
      });
      if (progLen > 0) progPath.style.strokeDashoffset = String(progLen * (1 - p));
    }

    function scheduleRender() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () { rafPending = false; render(); });
    }

    function lock() {
      if (locked || completed) return;
      locked = true;
      window.scrollTo(0, pin.offsetTop);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      window.addEventListener('wheel',      onWheel,      { passive: false });
      window.addEventListener('touchstart', onTouchStart, { passive: true  });
      window.addEventListener('touchmove',  onTouchMove,  { passive: false });
      window.addEventListener('keydown',    onKey,        { passive: false });
    }

    function unlock() {
      if (!locked) return;
      locked = false;
      completed = true;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('keydown',    onKey);
      window.scrollTo(0, pin.offsetTop + pin.offsetHeight);
    }

    function addDelta(dy) {
      if (dy <= 0) return; // forward only — no yo-yo
      p = Math.min(1, p + dy * SENS);
      scheduleRender();
      if (p >= 1) unlock();
    }

    function onWheel(e) {
      e.preventDefault();
      var dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 20;
      if (e.deltaMode === 2) dy *= 400;
      addDelta(dy);
    }

    function onTouchStart(e) { touchY = e.touches[0].clientY; }
    function onTouchMove(e) {
      e.preventDefault();
      var dy = (touchY - e.touches[0].clientY) * 0.8;
      touchY = e.touches[0].clientY;
      addDelta(dy);
    }

    function onKey(e) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        addDelta(120);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') {
        e.preventDefault();
      }
    }

    // If the page loads already past the pin, mark completed and draw full state
    if (pin.getBoundingClientRect().bottom <= 1) {
      completed = true;
      p = 1;
    }

    window.addEventListener('scroll', function () {
      if (locked || completed) return;
      var rect = pin.getBoundingClientRect();
      if (rect.top < 1 && rect.bottom > 1) {
        p = 0; render(); lock();
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      setupProgress(); render();
    }, { passive: true });

    setupProgress();
    render();
  })();

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
        var top = s.el.offsetTop;
        var bottom = top + s.el.offsetHeight;
        if (anchor >= top && anchor < bottom) { activeId = s.id; break; }
      }
      sections.forEach(function (s) {
        s.link.classList.toggle('is-active', s.id === activeId);
      });
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive, { passive: true });
    updateActive();
  })();

  // ── FAQ ACCORDION ────────────────────────────────────────────
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  // ── TESTIMONIALS CAROUSEL ────────────────────────────────────
  var deck = document.getElementById('testi-deck');
  if (deck) {
    var cards = Array.from(deck.querySelectorAll('.tcard'));
    var current = 0;
    var direction = 1;
    var rots = [-2.5, 1.8, -1.2, 2.2, -2, 1.5, -1.8, 2];

    function layout() {
      cards.forEach(function (card, i) {
        var offset = (i - current + cards.length) % cards.length;
        var z = cards.length - offset;
        card.style.zIndex = z;
        if (offset === 0) {
          card.style.transform = 'translate(0, 0) rotate(' + (rots[i % rots.length] * 0.2) + 'deg) scale(1)';
          card.style.opacity = 1;
          card.style.pointerEvents = 'auto';
        } else if (offset <= 3) {
          var scale = 1 - offset * 0.05;
          var y = offset * 18;
          var rot = rots[i % rots.length] || 0;
          card.style.transform = 'translate(0, ' + y + 'px) rotate(' + rot + 'deg) scale(' + scale + ')';
          card.style.opacity = 1 - offset * 0.15;
          card.style.pointerEvents = 'none';
        } else {
          var exitX = direction > 0 ? -140 : 140;
          card.style.transform = 'translate(' + exitX + '%, 40px) rotate(' + (direction * -12) + 'deg) scale(.85)';
          card.style.opacity = 0;
          card.style.pointerEvents = 'none';
        }
      });
    }

    function next() { direction = 1;  current = (current + 1) % cards.length; layout(); }
    function prev() { direction = -1; current = (current - 1 + cards.length) % cards.length; layout(); }

    var auto = null;
    function startAuto() { stopAuto(); auto = setInterval(next, 6000); }
    function stopAuto()  { if (auto) { clearInterval(auto); auto = null; } }

    var tPrev = document.getElementById('t-prev');
    var tNext = document.getElementById('t-next');
    if (tPrev) tPrev.addEventListener('click', function () { stopAuto(); prev(); });
    if (tNext) tNext.addEventListener('click', function () { stopAuto(); next(); });

    layout();
    startAuto();
    deck.addEventListener('mouseenter', stopAuto);

    // Touch swipe
    var touchStartX = 0, touchStartY = 0, touchActive = false;
    deck.addEventListener('touchstart', function (e) {
      stopAuto();
      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (!touchActive) return;
      touchActive = false;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      var absX = Math.abs(dx), absY = Math.abs(dy);
      if (Math.max(absX, absY) < 30) return;
      if (absX > absY) {
        if (dx < 0) next(); else prev();
      } else {
        if (dy < 0) next(); else prev();
      }
    }, { passive: true });

    // Mouse drag
    var mouseDown = false, mouseStartX = 0, mouseStartY = 0;
    deck.addEventListener('mousedown', function (e) {
      stopAuto();
      mouseDown = true;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });
    window.addEventListener('mouseup', function (e) {
      if (!mouseDown) return;
      mouseDown = false;
      var dx = e.clientX - mouseStartX;
      var dy = e.clientY - mouseStartY;
      var absX = Math.abs(dx), absY = Math.abs(dy);
      if (Math.max(absX, absY) < 30) return;
      if (absX > absY) {
        if (dx < 0) next(); else prev();
      } else {
        if (dy < 0) next(); else prev();
      }
    });
  }

  // ── CONTACT FORM (Formspree) ─────────────────────────────────
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

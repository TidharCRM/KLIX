(function () {
  'use strict';

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

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

  // ── NAV: blur on scroll ──────────────────────────────────────
  var nav = document.getElementById('nav');
  if (nav) {
    function updateNav() {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ── TESTIMONIALS MARQUEE ─────────────────────────────────────
  (function () {
    document.querySelectorAll('.testi__track').forEach(function (track) {
      var set = track.querySelector('.testi__set');
      if (!set) return;
      // Stagger quote-mark pulse so cards don't all glow in sync
      Array.from(set.querySelectorAll('.tcard')).forEach(function (card, i) {
        card.style.setProperty('--q-delay', '-' + (i * 0.5).toFixed(1) + 's');
      });
      // Clone the set for seamless infinite loop
      var clone = set.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  })();

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

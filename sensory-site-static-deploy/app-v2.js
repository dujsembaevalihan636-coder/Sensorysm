/* SENSORY KIT v2 — shared interactions */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Always open landing / Kit at top — never restore scroll onto the map */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var hash = (location.hash || '').toLowerCase();
  var path = location.pathname || '';
  var isKitPage =
    /kit\.html$/i.test(path) || !!document.querySelector('.kit-hero');
  /* section anchors user intentionally opens; map hash also allowed only if explicit */
  var keepHash =
    hash &&
    hash !== '#top' &&
    hash !== '#kit-top' &&
    hash !== '#';
  function scrollTopNow() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
  function forceTopRepeated() {
    scrollTopNow();
    requestAnimationFrame(scrollTopNow);
    setTimeout(scrollTopNow, 0);
    setTimeout(scrollTopNow, 50);
    setTimeout(scrollTopNow, 150);
    setTimeout(scrollTopNow, 400);
    setTimeout(scrollTopNow, 800);
  }
  /* Kit / home without a real section hash → pin to top (map must not steal view) */
  if (!keepHash || hash === '#top' || hash === '#kit-top') {
    if (isKitPage && (!hash || hash === '#top' || hash === '#kit-top')) {
      if (history.replaceState) {
        try {
          history.replaceState(null, '', path.split('?')[0] + (location.search || '') + '#top');
        } catch (err) {}
      }
    }
    forceTopRepeated();
    window.addEventListener('load', forceTopRepeated, { once: true });
    window.addEventListener(
      'pageshow',
      function (ev) {
        if (ev.persisted || !keepHash) forceTopRepeated();
      },
      { once: true }
    );
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var isHomeTop =
      href === '#top' ||
      href === 'index.html' ||
      href === 'index.html#top' ||
      href === './index.html' ||
      href === './index.html#top' ||
      href === '../index.html' ||
      href === '../index.html#top' ||
      href === '/index.html' ||
      href === '/index.html#top';
    /* Kit product pill / brand links → always start of Kit, not map */
    var isKitTopLink =
      /kit\.html\/?(?:#top|#kit-top)?$/i.test(href.replace(/^\.\//, '')) ||
      href === 'kit.html' ||
      href === '/kit.html' ||
      href === './kit.html' ||
      href === 'kit.html#top' ||
      href === '/kit.html#top' ||
      href === 'kit.html#kit-top' ||
      href === '/kit.html#kit-top';
    var isKitSection =
      /kit\.html#(?:dlya-chego|primenenie|pochemu|mirovoy-opyt|etapy)/i.test(href);
    if (isKitTopLink && !isKitSection) {
      /* already on Kit → jump to hero without reload; map must not stay in view */
      if (isKitPage) {
        e.preventDefault();
        if (history.replaceState) {
          try {
            history.replaceState(
              null,
              '',
              (path.match(/kit\.html/i) ? path : '/kit.html') +
                (location.search || '') +
                '#top'
            );
          } catch (err) {}
        } else {
          location.hash = 'top';
        }
        forceTopRepeated();
        try {
          var linksK = document.getElementById('navLinks');
          var burgerK = document.getElementById('burger');
          if (linksK) linksK.classList.remove('open');
          if (burgerK) {
            burgerK.classList.remove('x');
            burgerK.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';
        } catch (err2) {}
        return;
      }
      /* leaving another page → ensure target is #top */
      if (href.indexOf('http') !== 0) {
        a.setAttribute(
          'href',
          href.charAt(0) === '/' ? '/kit.html#top' : 'kit.html#top'
        );
      }
    }
    if (!isHomeTop) return;
    /*
     * Only intercept when ALREADY on the main SRS landing.
     * Kit/other pages also use body#top — must NOT block navigation to index.
     */
    var onMainSrs =
      document.body.classList.contains('srs-home') ||
      /(?:^|\/)index\.html$/i.test(path) ||
      path === '/' ||
      path === '';
    if (onMainSrs) {
      e.preventDefault();
      if (history.replaceState) {
        try {
          history.replaceState(null, '', '/index.html#top');
        } catch (err) {
          location.hash = 'top';
        }
      } else {
        location.hash = 'top';
      }
      forceTopRepeated();
      try {
        var links = document.getElementById('navLinks');
        var burger = document.getElementById('burger');
        if (links) links.classList.remove('open');
        if (burger) {
          burger.classList.remove('x');
          burger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      } catch (err) {}
      return;
    }
    /* From Kit / Rooms / subpages: let the browser go to /index.html#top */
  });

  /* sticky header */
  var nav = document.getElementById('nav');
  if (nav) {
    var onS = function () { nav.classList.toggle('on', window.scrollY > 30); };
    onS(); window.addEventListener('scroll', onS, { passive: true });
  }

  /* burger */
  var burger = document.getElementById('burger'), links = document.getElementById('navLinks');
  if (burger && links) {
    var close = function () { links.classList.remove('open'); burger.classList.remove('x'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
    burger.addEventListener('click', function () {
      var o = links.classList.toggle('open'); burger.classList.toggle('x', o);
      burger.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* reveal on scroll */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(function (el, i) { el.style.transitionDelay = Math.min((i % 4) * 60, 180) + 'ms'; io.observe(el); });
  } else { rvs.forEach(function (el) { el.classList.add('in'); }); }

  /* count-up */
  var cs = document.querySelectorAll('[data-count]');
  var run = function (el) {
    var t = parseFloat(el.dataset.count), p = el.dataset.prefix || '', s = el.dataset.suffix || '';
    if (reduce) { el.textContent = p + t + s; return; }
    var st = performance.now(), d = 1300;
    (function step(n) {
      var k = Math.min((n - st) / d, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = p + Math.round(t * e) + s;
      if (k < 1) requestAnimationFrame(step);
    })(st);
  };
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    cs.forEach(function (el) { co.observe(el); });
  } else { cs.forEach(run); }

  /* kit box: tap toggle */
  var box = document.getElementById('kitbox');
  if (box) {
    box.addEventListener('click', function () { box.classList.toggle('open'); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.classList.toggle('open'); } });
    box.setAttribute('tabindex', '0');
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    var set = function (open) {
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', String(open));
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    };
    q.setAttribute('aria-expanded', 'false');
    q.addEventListener('click', function () { set(!item.classList.contains('open')); });
    if (item.classList.contains('open')) set(true);
  });

  /* mobile sticky CTA */
  var mcta = document.getElementById('mcta');
  if (mcta) {
    var onC = function () { mcta.classList.toggle('show', window.scrollY > 620); };
    onC(); window.addEventListener('scroll', onC, { passive: true });
  }
})();

/* living backgrounds: scroll + mouse parallax + interactive dots */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  var plx = [].slice.call(document.querySelectorAll('[data-plx]'));
  if (plx.length && !reduce) {
    var t = false;
    var run = function () {
      plx.forEach(function (el) {
        var sec = el.closest('section, footer') || el.parentElement;
        var r = sec.getBoundingClientRect();
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height) - 0.5;
        el.style.transform = 'translate3d(0,' + (p * 200 * parseFloat(el.dataset.plx)).toFixed(1) + 'px,0)';
      });
      t = false;
    };
    window.addEventListener('scroll', function () { if (!t) { requestAnimationFrame(run); t = true; } }, { passive: true });
    run();
  }

  var mx = [].slice.call(document.querySelectorAll('[data-mx]'));
  if (mx.length && !reduce && fine) {
    document.body.classList.add('mx-on');
    window.addEventListener('mousemove', function (e) {
      var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      mx.forEach(function (el) {
        var f = parseFloat(el.dataset.mx) || 20;
        el.style.transform = 'translate3d(' + (nx * f).toFixed(1) + 'px,' + (ny * f).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  }

  /* seed interactive dots into every section/footer .fx layer */
  var COLORS = [
    'rgba(177,90,248,.42)', 'rgba(255,137,81,.4)', 'rgba(31,0,255,.28)',
    'rgba(233,30,140,.38)', 'rgba(37,99,235,.36)', 'rgba(34,197,94,.32)'
  ];
  function seedDots(fx, n) {
    if (fx.querySelector('.fx-dot')) return;
    var dark = !!fx.closest('.science, .wx, .foot, .train');
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i');
      d.className = 'fx-dot';
      d.setAttribute('aria-hidden', 'true');
      var s = 10 + Math.random() * 16;
      d.style.setProperty('--s', s.toFixed(1) + 'px');
      d.style.setProperty('--x', (4 + Math.random() * 92).toFixed(1) + '%');
      d.style.setProperty('--y', (6 + Math.random() * 88).toFixed(1) + '%');
      var c = COLORS[i % COLORS.length];
      if (dark) c = c.replace(/([\d.]+)\)\s*$/, function (_, a) {
        return Math.min(0.55, parseFloat(a) + 0.12) + ')';
      });
      d.style.setProperty('--c', c);
      d._tx = 0; d._ty = 0;
      fx.appendChild(d);
    }
  }
  document.querySelectorAll('section .fx, footer .fx').forEach(function (fx) {
    seedDots(fx, window.innerWidth < 640 ? 8 : 14);
  });
  var hero = document.querySelector('section.hero');
  if (hero && !hero.querySelector('.fx')) {
    var hfx = document.createElement('div');
    hfx.className = 'fx'; hfx.setAttribute('aria-hidden', 'true');
    hero.insertBefore(hfx, hero.firstChild);
    seedDots(hfx, window.innerWidth < 640 ? 8 : 12);
  }

  var dots = [].slice.call(document.querySelectorAll('.fx-dot'));
  if (!dots.length) return;

  dots.forEach(function (d) {
    d.addEventListener('click', function (e) {
      e.preventDefault();
      d.classList.remove('is-hit');
      void d.offsetWidth;
      d.classList.add('is-hit');
      setTimeout(function () { d.classList.remove('is-hit'); }, 560);
    });
  });

  if (reduce || !fine) return;

  var mxPtr = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', function (e) {
    mxPtr.x = e.clientX; mxPtr.y = e.clientY;
  }, { passive: true });

  (function loop() {
    dots.forEach(function (d) {
      var r = d.getBoundingClientRect();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var dx = mxPtr.x - cx, dy = mxPtr.y - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var near = dist < 140;
      d.classList.toggle('is-near', near);
      var force = near ? (1 - dist / 140) * 28 : 0;
      var ang = Math.atan2(dy, dx);
      var wantX = near ? -Math.cos(ang) * force : 0;
      var wantY = near ? -Math.sin(ang) * force : 0;
      d._tx += (wantX - d._tx) * 0.12;
      d._ty += (wantY - d._ty) * 0.12;
      d.style.setProperty('--tx', d._tx.toFixed(1) + 'px');
      d.style.setProperty('--ty', d._ty.toFixed(1) + 'px');
      d.style.transform = 'translate3d(' + d._tx.toFixed(1) + 'px,' + d._ty.toFixed(1) + 'px,0)';
    });
    requestAnimationFrame(loop);
  })();
})();


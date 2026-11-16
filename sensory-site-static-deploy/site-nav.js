/* Shared site nav: context links + active state + burger */
(function () {
  'use strict';

  /* Support Vercel cleanUrls: /o-nas and /o-nas.html are the same page */
  var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
  var file = path.split('/').pop() || 'index.html';
  if (path === '' || path === '/') file = 'index.html';
  var base = file.replace(/\.html$/i, '') || 'index';

  var isRooms = /\/rooms(\/|$)/.test(path);
  var isKit =
    base === 'kit' ||
    base === 'napolnenie' ||
    base === 'tseny';
  var isHome =
    base === 'index' ||
    path === '/' ||
    path === '' ||
    document.body.classList.contains('srs-home');
  var isSrs = !isRooms && isHome;
  var isNapolKit = base === 'napolnenie' && !isRooms;
  var isNapolRooms = isRooms && base === 'napolnenie';
  var isOnas = base === 'o-nas';
  var isZay = base === 'zayavka';
  var isDlya =
    location.hash === '#dlya-chego' &&
    (base === 'kit' || isRooms);

  /* ── Context: «Для чего» / «Наполнение» depend on product ── */
  var dlyaHref = isRooms
    ? '/rooms/index.html#dlya-chego'
    : '/kit.html#dlya-chego';
  var napolHref = isRooms ? '/rooms/napolnenie.html' : '/napolnenie.html';

  /* Only rewrite links inside the main header nav — not footer/body notes */
  var navRoot = document.getElementById('navLinks') || document.querySelector('header.nav .nav-links');
  if (navRoot) {
    navRoot.querySelectorAll('a[href*="dlya-chego"], a[data-nav="dlya"]').forEach(function (a) {
      a.setAttribute('href', dlyaHref);
    });
    navRoot.querySelectorAll('a[href*="napolnenie"], a[data-nav="napol"]').forEach(function (a) {
      a.setAttribute('href', napolHref);
    });
  }

  function mark(sel, cond) {
    if (!cond) return;
    document.querySelectorAll(sel).forEach(function (el) {
      el.classList.add('act');
    });
  }

  mark('a.nav-prod.is-srs', isSrs);
  mark('a.nav-prod.is-kit', isKit && !isRooms);
  mark('a.nav-prod.is-rooms', isRooms);
  mark('a[href*="napolnenie"]', isNapolKit || isNapolRooms);
  mark('a[href*="o-nas"]', isOnas);
  mark('a[href*="zayavka"]', isZay);
  mark('a[href*="dlya-chego"]', isDlya);

  /* Logo + SRS always open the real homepage root (not o-nas, not mid-page) */
  document.querySelectorAll('a.nav-prod.is-srs, a.brand').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href') || '';
      var isHomeLink =
        a.classList.contains('is-srs') ||
        /index\.html/i.test(href) ||
        href === '/' ||
        href === '/#top' ||
        href === '#top';
      if (!isHomeLink) return;
      e.preventDefault();
      window.location.href = '/';
    });
  });

  /* Burger — only if not already bound */
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (burger && links && !burger.dataset.siteNavBound) {
    burger.dataset.siteNavBound = '1';
    var close = function () {
      links.classList.remove('open');
      burger.classList.remove('x');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', function () {
      var o = links.classList.toggle('open');
      burger.classList.toggle('x', o);
      burger.setAttribute('aria-expanded', String(o));
      document.body.style.overflow = o ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  var nav = document.getElementById('nav');
  if (nav && !nav.dataset.siteNavScroll) {
    nav.dataset.siteNavScroll = '1';
    var onS = function () {
      nav.classList.toggle('on', window.scrollY > 30);
    };
    onS();
    window.addEventListener('scroll', onS, { passive: true });
  }
})();

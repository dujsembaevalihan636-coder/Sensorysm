/* Animated Hero — cycling last word (slide + fade), no libraries */
(function () {
  'use strict';
  var root = document.querySelector('[data-ah-rotator]');
  if (!root) return;

  var words = (root.getAttribute('data-words') || '')
    .split('|')
    .map(function (w) { return w.trim(); })
    .filter(Boolean);
  if (words.length < 2) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var interval = parseInt(root.getAttribute('data-interval') || '2200', 10);
  var idx = 0;

  // build word elements
  root.innerHTML = '';
  root.setAttribute('data-width', words.reduce(function (a, b) {
    return a.length >= b.length ? a : b;
  }, words[0]));

  var els = words.map(function (w, i) {
    var span = document.createElement('span');
    span.className = 'ah-word' + (i === 0 ? ' is-in' : '');
    span.textContent = w;
    span.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    root.appendChild(span);
    return span;
  });

  // accessible live region
  var live = document.createElement('span');
  live.className = 'sr-only';
  live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0';
  root.parentNode.appendChild(live);
  live.textContent = words[0];

  if (reduce) return;

  setInterval(function () {
    var cur = els[idx];
    var next = (idx + 1) % els.length;
    cur.classList.remove('is-in');
    cur.classList.add('is-out');
    cur.setAttribute('aria-hidden', 'true');

    els[next].classList.remove('is-out');
    // force reflow so enter anim runs
    void els[next].offsetWidth;
    els[next].classList.add('is-in');
    els[next].setAttribute('aria-hidden', 'false');
    live.textContent = words[next];

    setTimeout(function () {
      cur.classList.remove('is-out');
    }, 560);

    idx = next;
  }, interval);
})();

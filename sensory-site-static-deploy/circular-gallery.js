/* Circular Gallery — autoplay, drag, pause on hover, inertia */
(function () {
  'use strict';
  var root = document.getElementById('circularGallery');
  if (!root) return;

  var ring = root.querySelector('.cg-ring');
  var cards = Array.prototype.slice.call(root.querySelectorAll('.cg-card'));
  var n = cards.length;
  if (!n || !ring) return;

  var step = 360 / n;
  var angle = 0;
  var velocity = 0;
  var dragging = false;
  var paused = false;
  var lastX = 0;
  var lastT = 0;
  var autoplay = 7; // deg/sec soft

  function radius() {
    var w = window.innerWidth;
    if (w < 480) return 230;
    if (w < 768) return 290;
    if (w < 1024) return 350;
    return 400;
  }

  function layout() {
    var r = radius();
    cards.forEach(function (card, i) {
      var rot = i * step;
      card.style.transform = 'rotateY(' + rot + 'deg) translateZ(' + r + 'px)';
    });
  }

  function setActive() {
    var normalized = ((-angle % 360) + 360) % 360;
    var idx = Math.round(normalized / step) % n;
    cards.forEach(function (c, i) {
      c.classList.toggle('is-front', i === idx);
      c.style.opacity = i === idx ? '1' : '0.72';
    });
  }

  function apply() {
    ring.style.transform = 'rotateY(' + angle + 'deg)';
    setActive();
  }

  function tick(t) {
    if (!lastT) lastT = t;
    var dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;

    if (!dragging) {
      if (!paused) {
        velocity += autoplay * dt * 0.14;
        var maxV = autoplay * 0.075;
        if (velocity > maxV) velocity = maxV;
        if (velocity < -maxV) velocity = -maxV;
      }
      velocity *= 0.96;
      if (Math.abs(velocity) < 0.002 && paused) velocity = 0;
      angle += velocity;
    }
    apply();
    requestAnimationFrame(tick);
  }

  root.addEventListener('pointerdown', function (e) {
    dragging = true;
    root.classList.add('is-drag');
    lastX = e.clientX;
    velocity = 0;
    try { root.setPointerCapture(e.pointerId); } catch (err) {}
  });
  root.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    lastX = e.clientX;
    var d = dx * 0.22;
    angle += d;
    velocity = d * 0.35;
    apply();
  });
  function endDrag(e) {
    dragging = false;
    root.classList.remove('is-drag');
    try { root.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
  root.addEventListener('pointerenter', function () {
    paused = true;
    velocity *= 0.3;
  });
  root.addEventListener('pointerleave', function () {
    paused = false;
  });

  window.addEventListener('resize', layout);
  layout();
  apply();
  requestAnimationFrame(tick);
})();

/* Hover footer text reveal */
(function () {
  var zone = document.getElementById('hfHoverText');
  if (!zone) return;
  zone.addEventListener('mousemove', function (e) {
    var r = zone.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width) * 100;
    var y = ((e.clientY - r.top) / r.height) * 100;
    zone.style.setProperty('--mx', x + '%');
    zone.style.setProperty('--my', y + '%');
  });
})();

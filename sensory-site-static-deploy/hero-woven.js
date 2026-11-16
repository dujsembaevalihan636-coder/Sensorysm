/* Woven Light Hero (21st.dev style) — three.js particle torus-knot, cursor reaction
   Mounts as BACKGROUND behind SRS home hero content. */
(function () {
  'use strict';

  var section =
    document.getElementById('hero-woven') ||
    document.querySelector('.srs-hero');
  if (!section) return;

  var mount =
    section.querySelector('.hw-canvas') ||
    section.querySelector('.srs-hero__woven');
  if (!mount) return;

  var fallback =
    section.querySelector('.hw-fallback') ||
    section.querySelector('.srs-hero__glow');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  if (!hasWebGL() || typeof THREE === 'undefined' || reduce) {
    if (fallback) fallback.hidden = false;
    mount.hidden = true;
    return;
  }

  var isMobile = window.innerWidth < 768;
  var particleCount = isMobile ? 10000 : 28000;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  /* further camera + smaller knot = calmer, less dominant background */
  camera.position.z = 5.4;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: isMobile ? 'low-power' : 'high-performance'
    });
  } catch (e) {
    if (fallback) fallback.hidden = false;
    mount.hidden = true;
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.4 : 2));
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.pointerEvents = 'none';
  mount.appendChild(renderer.domElement);

  var mouse = new THREE.Vector2(0, 0);
  var targetMouse = new THREE.Vector2(0, 0);
  var clock = new THREE.Clock();

  var positions = new Float32Array(particleCount * 3);
  var original = new Float32Array(particleCount * 3);
  var colors = new Float32Array(particleCount * 3);
  var velocities = new Float32Array(particleCount * 3);
  var geometry = new THREE.BufferGeometry();

  /* Smaller torus-knot — sits as accent, not full-bleed noise */
  var torus = new THREE.TorusKnotGeometry(
    isMobile ? 0.95 : 1.05,
    isMobile ? 0.28 : 0.32,
    isMobile ? 120 : 200,
    isMobile ? 18 : 28
  );
  var posAttr = torus.attributes.position;

  var magenta = new THREE.Color('#E91E8C');
  var blue = new THREE.Color('#2563EB');
  var violet = new THREE.Color('#b15af8');
  var soft = new THREE.Color('#f5d0e8');

  for (var i = 0; i < particleCount; i++) {
    var vi = i % posAttr.count;
    /* slight scatter off the mesh for a woven / luminous feel */
    var jx = (Math.random() - 0.5) * 0.08;
    var jy = (Math.random() - 0.5) * 0.08;
    var jz = (Math.random() - 0.5) * 0.08;
    var x = posAttr.getX(vi) + jx;
    var y = posAttr.getY(vi) + jy;
    var z = posAttr.getZ(vi) + jz;
    positions[i * 3] = original[i * 3] = x;
    positions[i * 3 + 1] = original[i * 3 + 1] = y;
    positions[i * 3 + 2] = original[i * 3 + 2] = z;

    var t = Math.random();
    var col =
      t < 0.34
        ? magenta.clone()
        : t < 0.62
          ? violet.clone()
          : t < 0.9
            ? blue.clone()
            : soft.clone();
    col.offsetHSL(0, 0, (Math.random() - 0.5) * 0.14);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: isMobile ? 0.02 : 0.016,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    sizeAttenuation: true
  });

  var points = new THREE.Points(geometry, material);
  points.rotation.x = 0.35;
  /* push slightly down/right so title stays clear in center */
  points.position.set(0, -0.05, 0);
  points.scale.set(0.9, 0.9, 0.9);
  scene.add(points);

  /* soft ambient glow plane behind knot */
  var glowGeo = new THREE.SphereGeometry(1.6, 20, 20);
  var glowMat = new THREE.MeshBasicMaterial({
    color: 0x1a0a28,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });
  var glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.set(0.15, -0.15, -1.0);
  scene.add(glowMesh);

  function resize() {
    var w = mount.clientWidth || section.clientWidth || window.innerWidth;
    var h = mount.clientHeight || section.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Track mouse over whole hero — canvas is pointer-events:none so content stays clickable */
  section.addEventListener(
    'pointermove',
    function (e) {
      var r = section.getBoundingClientRect();
      if (!r.width || !r.height) return;
      targetMouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      targetMouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    },
    { passive: true }
  );
  section.addEventListener(
    'pointerleave',
    function () {
      targetMouse.set(0, 0);
    },
    { passive: true }
  );

  var alive = true;
  var step = isMobile ? 2 : 1;
  var mouseWorld = new THREE.Vector3();

  function animate() {
    if (!alive) return;
    requestAnimationFrame(animate);

    var elapsed = clock.getElapsedTime();
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;
    mouseWorld.set(mouse.x * 2.6, mouse.y * 2.2, 0.4);

    for (var i = 0; i < particleCount; i += step) {
      var ix = i * 3;
      var iy = i * 3 + 1;
      var iz = i * 3 + 2;
      var cx = positions[ix];
      var cy = positions[iy];
      var cz = positions[iz];
      var ox = original[ix];
      var oy = original[iy];
      var oz = original[iz];
      var vx = velocities[ix];
      var vy = velocities[iy];
      var vz = velocities[iz];

      var dx = cx - mouseWorld.x;
      var dy = cy - mouseWorld.y;
      var dz = cz - mouseWorld.z;
      var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 1.65 && dist > 0.001) {
        var force = (1.65 - dist) * 0.014;
        vx += (dx / dist) * force;
        vy += (dy / dist) * force;
        vz += (dz / dist) * force;
      }

      /* spring back to woven surface */
      vx += (ox - cx) * 0.012;
      vy += (oy - cy) * 0.012;
      vz += (oz - cz) * 0.012;
      vx *= 0.92;
      vy *= 0.92;
      vz *= 0.92;

      positions[ix] = cx + vx;
      positions[iy] = cy + vy;
      positions[iz] = cz + vz;
      velocities[ix] = vx;
      velocities[iy] = vy;
      velocities[iz] = vz;
    }

    geometry.attributes.position.needsUpdate = true;
    points.rotation.y = elapsed * 0.12;
    points.rotation.x = 0.28 + Math.sin(elapsed * 0.2) * 0.08;
    points.rotation.z = Math.sin(elapsed * 0.15) * 0.05;
    glowMesh.rotation.y = -elapsed * 0.04;

    renderer.render(scene, camera);
  }
  animate();

  /* Pause when off-screen to save battery */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        var vis = entries[0] && entries[0].isIntersecting;
        if (vis && !alive) {
          alive = true;
          animate();
        } else if (!vis) {
          alive = false;
        }
      },
      { threshold: 0.05 }
    );
    io.observe(section);
  }

  window.addEventListener('beforeunload', function () {
    alive = false;
    geometry.dispose();
    material.dispose();
    torus.dispose();
    glowGeo.dispose();
    glowMat.dispose();
    renderer.dispose();
  });
})();

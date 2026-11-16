/* ═══════════════════════════════════════════════════════════════
   Sensory Room 3D — Гимназия №34  (pixel-accurate to photos)
   Photo A: ball pit, disco, door, aquarium, vertical tubes+mirrors,
            white platform, string curtain, blue star wash
   Photo B: green star projector, same layout darker
   Photo C: rainbow beanbag, horizontal tubes on white L-unit,
            mirror under tubes, moss panel, pink foam
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var mount = document.getElementById('room3d');
  if (!mount) return;
  var canvasHost = mount.querySelector('.r3d__canvas');
  var fallbackEl = mount.querySelector('.r3d__fallback');
  if (!canvasHost) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHOTOS = [
    '/rooms/img/34-shkola-sensori.jpg',
    '/rooms/img/34-second.jpg',
    '/rooms/img/34-third.jpg'
  ];

  function setStatus(t) {
    var el = mount.querySelector('.r3d__status');
    if (el) el.textContent = t || '';
  }
  function showFallback(reason) {
    console.warn('[room3d]', reason);
    if (fallbackEl) {
      fallbackEl.hidden = false;
      fallbackEl.removeAttribute('hidden');
    }
    canvasHost.style.display = 'none';
    mount.classList.add('is-fallback');
  }

  function C(w, h, fn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    if (t.colorSpace !== undefined) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function M(o) { return new THREE.MeshStandardMaterial(o); }

  function boot() {
    if (typeof THREE === 'undefined') return showFallback('THREE missing');
    try {
      if (fallbackEl) { fallbackEl.hidden = true; fallbackEl.setAttribute('hidden', ''); }
      canvasHost.style.display = '';

      var W = Math.max(canvasHost.clientWidth || 720, 300);
      var H = Math.max(canvasHost.clientHeight || 480, 260);

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0614);
      scene.fog = new THREE.FogExp2(0x0a0614, 0.042);

      var camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 40);
      // match photo A: standing at entrance looking in
      camera.position.set(0.35, 1.45, 3.85);
      camera.lookAt(0.2, 0.7, -0.6);

      var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(W, H, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
      if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.88;
      }
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      canvasHost.innerHTML = '';
      canvasHost.appendChild(renderer.domElement);
      var canvas = renderer.domElement;
      canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:none;border-radius:inherit;';

      var loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';

      /* ── lights: dark room + colored wash ── */
      scene.add(new THREE.AmbientLight(0x4a3a68, 0.22));
      scene.add(new THREE.HemisphereLight(0x6a80ff, 0x1a1020, 0.28));

      var blueCeil = new THREE.PointLight(0x4060ff, 2.2, 9, 1.3);
      blueCeil.position.set(-0.8, 2.55, 0.4);
      scene.add(blueCeil);

      var greenCeil = new THREE.PointLight(0x2dff70, 1.4, 8, 1.5);
      greenCeil.position.set(0.9, 2.5, -0.6);
      scene.add(greenCeil);

      var purpleFill = new THREE.PointLight(0xb060ff, 0.7, 7, 1.8);
      purpleFill.position.set(1.2, 1.4, 1.0);
      scene.add(purpleFill);

      var key = new THREE.DirectionalLight(0xc8c0e8, 0.28);
      key.position.set(2.5, 4, 2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5;
      key.shadow.camera.far = 14;
      key.shadow.camera.left = key.shadow.camera.bottom = -5;
      key.shadow.camera.right = key.shadow.camera.top = 5;
      key.shadow.bias = -0.0005;
      scene.add(key);

      // spotlight above tubes (photo A bright spot)
      var tubeSpot = new THREE.SpotLight(0xffffff, 1.4, 8, Math.PI / 7, 0.45, 1);
      tubeSpot.position.set(1.3, 2.6, -1.0);
      tubeSpot.target.position.set(1.2, 0.5, -1.6);
      scene.add(tubeSpot);
      scene.add(tubeSpot.target);

      var room = new THREE.Group();
      scene.add(room);

      var RW = 5.4, RD = 5.2, RH = 2.8;

      /* textures */
      var wallTex = C(512, 512, function (ctx, w, h) {
        ctx.fillStyle = '#e8e2ef';
        ctx.fillRect(0, 0, w, h);
        for (var i = 0; i < 2500; i++) {
          ctx.fillStyle = 'rgba(150,130,180,' + (Math.random() * 0.03) + ')';
          ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
        }
      });
      wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
      wallTex.repeat.set(2.2, 1.3);

      var floorTex = C(512, 512, function (ctx, w, h) {
        // dark grey tile like photos
        ctx.fillStyle = '#2e2a35';
        ctx.fillRect(0, 0, w, h);
        for (var y = 0; y < h; y += 32) {
          for (var x = 0; x < w; x += 32) {
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.strokeRect(x + 0.5, y + 0.5, 31, 31);
            ctx.fillStyle = ((x + y) / 32) % 2 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.06)';
            ctx.fillRect(x + 1, y + 1, 30, 30);
          }
        }
      });
      floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(5, 5);

      var wallMat = M({ map: wallTex, color: 0xffffff, roughness: 0.92, metalness: 0.02 });
      var floorMat = M({ map: floorTex, color: 0xffffff, roughness: 0.72, metalness: 0.04 });
      var ceilMat = M({ color: 0xeee8f5, roughness: 0.95 });

      /* ══════ SHELL ══════ */
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      room.add(floor);

      var ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.y = RH;
      room.add(ceil);

      // ceiling oval recessed panels (photo A/B)
      function ovalPanel(x, z, rx, rz) {
        var g = new THREE.Group();
        var plate = new THREE.Mesh(
          new THREE.CircleGeometry(rx, 32),
          M({ color: 0xf5f0fa, roughness: 0.85, transparent: true, opacity: 0.7 })
        );
        plate.rotation.x = Math.PI / 2;
        plate.scale.y = rz / rx;
        plate.position.set(x, RH - 0.015, z);
        g.add(plate);
        // dark rim
        var rim = new THREE.Mesh(
          new THREE.RingGeometry(rx * 0.92, rx, 32),
          M({ color: 0xc8bdd8, roughness: 0.6 })
        );
        rim.rotation.x = -Math.PI / 2;
        rim.scale.y = rz / rx;
        rim.position.set(x, RH - 0.012, z);
        g.add(rim);
        room.add(g);
      }
      ovalPanel(-0.3, 0.2, 0.55, 0.35);
      ovalPanel(0.9, -0.5, 0.4, 0.28);
      ovalPanel(-1.2, -0.8, 0.35, 0.25);

      // square acoustic tiles
      for (var ti = 0; ti < 8; ti++) {
        var sq = new THREE.Mesh(
          new THREE.PlaneGeometry(0.42, 0.42),
          M({ color: 0xe4dcee, roughness: 0.9, transparent: true, opacity: 0.5 })
        );
        sq.rotation.x = Math.PI / 2;
        sq.position.set(-1.5 + (ti % 4) * 0.7, RH - 0.008, -1.4 + Math.floor(ti / 4) * 0.7);
        room.add(sq);
      }

      function addWall(w, h, x, y, z, ry) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
        m.position.set(x, y, z);
        m.rotation.y = ry || 0;
        m.receiveShadow = true;
        room.add(m);
      }
      addWall(RW, RH, 0, RH / 2, -RD / 2, 0);
      addWall(RD, RH, -RW / 2, RH / 2, 0, Math.PI / 2);
      addWall(RD, RH, RW / 2, RH / 2, 0, -Math.PI / 2);

      /* ══════ DOOR left (brown panels + floor LED) ══════ */
      var doorG = new THREE.Group();
      doorG.position.set(-RW / 2 + 0.04, 0, -0.55);
      room.add(doorG);
      var door = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 2.1, 0.95),
        M({ color: 0x4a3d36, roughness: 0.72, metalness: 0.08 })
      );
      door.position.y = 1.05;
      door.castShadow = true;
      doorG.add(door);
      for (var d = 0; d < 4; d++) {
        var pan = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, 0.38, 0.72),
          M({ color: 0x3a302a, roughness: 0.68 })
        );
        pan.position.set(0.045, 0.4 + d * 0.42, 0);
        doorG.add(pan);
      }
      // LED floor strip
      var led = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.022, 1.15),
        M({ color: 0xffffff, emissive: 0xfff8e8, emissiveIntensity: 1.5, roughness: 0.25 })
      );
      led.position.set(-RW / 2 + 0.1, 0.015, -0.55);
      room.add(led);
      var ledL = new THREE.PointLight(0xfff0d0, 0.65, 2.8, 2);
      ledL.position.set(-RW / 2 + 0.3, 0.12, -0.55);
      room.add(ledL);

      /* ══════ DISCO BALL ══════ */
      var discoG = new THREE.Group();
      discoG.position.set(-0.55, RH - 0.28, 0.35);
      room.add(discoG);
      // black motor mount
      var motor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, 0.1, 12),
        M({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.4 })
      );
      motor.position.y = 0.22;
      discoG.add(motor);
      var rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.22, 8),
        M({ color: 0x666666, metalness: 0.8, roughness: 0.3 })
      );
      rod.position.y = 0.1;
      discoG.add(rod);

      var disco = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 20, 16),
        M({ color: 0xc8d0dc, metalness: 0.98, roughness: 0.08, emissive: 0x222830, emissiveIntensity: 0.2 })
      );
      disco.castShadow = true;
      discoG.add(disco);
      // mirror facets
      for (var f = 0; f < 56; f++) {
        var facet = new THREE.Mesh(
          new THREE.PlaneGeometry(0.035, 0.035),
          M({ color: 0xffffff, metalness: 1, roughness: 0.04, emissive: 0x8899aa, emissiveIntensity: 0.25 })
        );
        var phi = Math.acos(2 * Math.random() - 1);
        var theta = Math.random() * Math.PI * 2;
        facet.position.setFromSphericalCoords(0.152, phi, theta);
        facet.lookAt(0, 0, 0);
        disco.add(facet);
      }
      var discoL = new THREE.PointLight(0xa8c8ff, 0.85, 5, 2);
      discoG.add(discoL);

      /* ══════ STAR PROJECTOR DOTS ══════ */
      var stars = new THREE.Group();
      room.add(stars);
      var starGeo = new THREE.SphereGeometry(0.013, 6, 6);
      for (var s = 0; s < 140; s++) {
        var green = Math.random() > 0.25;
        var star = new THREE.Mesh(
          starGeo,
          new THREE.MeshBasicMaterial({
            color: green ? 0x55ff66 : 0x7799ff,
            transparent: true,
            opacity: 0.5 + Math.random() * 0.45
          })
        );
        var place = Math.random();
        if (place < 0.4) {
          star.position.set((Math.random() - 0.5) * RW * 0.92, RH - 0.02, (Math.random() - 0.5) * RD * 0.92);
        } else if (place < 0.6) {
          star.position.set((Math.random() - 0.5) * RW * 0.9, 0.45 + Math.random() * 1.9, -RD / 2 + 0.02);
        } else if (place < 0.8) {
          star.position.set(-RW / 2 + 0.02, 0.4 + Math.random() * 2, (Math.random() - 0.5) * RD * 0.85);
        } else {
          star.position.set(RW / 2 - 0.02, 0.4 + Math.random() * 2, (Math.random() - 0.5) * RD * 0.85);
        }
        star.userData.phase = Math.random() * Math.PI * 2;
        stars.add(star);
      }

      /* ══════ BALL PIT — multi-color soft walls (photo A/B) ══════
         Front: red | Left: blue | Right: blue | Back: red
         Corner wedges: yellow/green  */
      var pitG = new THREE.Group();
      pitG.position.set(0.05, 0, 0.65);
      room.add(pitG);

      var PS = 1.65, PH = 0.4, PT = 0.2;

      function softWall(ww, dd, col, x, z) {
        var m = new THREE.Mesh(new THREE.BoxGeometry(ww, PH, dd), M({ color: col, roughness: 0.9 }));
        m.position.set(x, PH / 2, z);
        m.castShadow = true;
        m.receiveShadow = true;
        pitG.add(m);
        return m;
      }
      softWall(PS, PT, 0xc73545, 0, PS / 2 - PT / 2);                    // front red
      softWall(PS, PT, 0xb82e3c, 0, -PS / 2 + PT / 2);                   // back red
      softWall(PT, PS - PT * 2, 0x2a55c4, -PS / 2 + PT / 2, 0);          // left blue
      softWall(PT, PS - PT * 2, 0x2a55c4, PS / 2 - PT / 2, 0);           // right blue

      // yellow/green corner cushions (photo A right side of pit)
      var yCorner = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.32, 0.28),
        M({ color: 0xe8b020, roughness: 0.88 })
      );
      yCorner.position.set(PS / 2 - 0.12, 0.16, -0.15);
      yCorner.castShadow = true;
      pitG.add(yCorner);
      var gCorner = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.28, 0.22),
        M({ color: 0x3cb86a, roughness: 0.88 })
      );
      gCorner.position.set(PS / 2 - 0.1, 0.14, 0.25);
      gCorner.castShadow = true;
      pitG.add(gCorner);
      // red inner pad front-left
      var rPad = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.12, 0.3),
        M({ color: 0xd04050, roughness: 0.9 })
      );
      rPad.position.set(-0.25, 0.08, PS / 2 - 0.35);
      pitG.add(rPad);

      var pitFloor = new THREE.Mesh(
        new THREE.BoxGeometry(PS - PT * 2, 0.05, PS - PT * 2),
        M({ color: 0x1a1522, roughness: 0.92 })
      );
      pitFloor.position.y = 0.025;
      pitFloor.receiveShadow = true;
      pitG.add(pitFloor);

      var ballCols = [0xff3b3b, 0xffd21a, 0x2ee66a, 0x3d8fff, 0xc44dff, 0xff8a2b, 0xff5aad, 0x2ad4d4, 0xa8ff3d];
      var balls = [];
      var bGeo = new THREE.SphereGeometry(1, 11, 9);
      for (var bi = 0; bi < 95; bi++) {
        var br = 0.052 + Math.random() * 0.038;
        var ball = new THREE.Mesh(bGeo, M({ color: ballCols[bi % ballCols.length], roughness: 0.3, metalness: 0.1 }));
        ball.scale.setScalar(br);
        var inn = (PS - PT * 2 - 0.18) / 2;
        ball.position.set((Math.random() - 0.5) * inn * 2, 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * inn * 2);
        ball.castShadow = true;
        ball.userData.baseY = ball.position.y;
        ball.userData.phase = Math.random() * Math.PI * 2;
        pitG.add(ball);
        balls.push(ball);
      }

      /* ══════ VERTICAL TUBES + WHITE PLATFORM + MIRRORS (photo A) ══════ */
      var tz = new THREE.Group();
      tz.position.set(1.25, 0, -1.65);
      room.add(tz);

      // white semi-circular raised platform
      var plat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 1.0, 0.2, 40, 1, false, 0, Math.PI * 1.15),
        M({ color: 0xf7f4fc, roughness: 0.4, metalness: 0.06 })
      );
      plat.position.set(0.05, 0.1, 0.05);
      plat.rotation.y = -0.35;
      plat.castShadow = true;
      plat.receiveShadow = true;
      tz.add(plat);
      // solid white top disc partial
      var platTop = new THREE.Mesh(
        new THREE.CircleGeometry(0.88, 40),
        M({ color: 0xffffff, roughness: 0.35 })
      );
      platTop.rotation.x = -Math.PI / 2;
      platTop.position.set(0.05, 0.205, 0.05);
      tz.add(platTop);

      // tall mirrors behind tubes (3 panels, full height — photo A)
      for (var mi = 0; mi < 3; mi++) {
        var mframe = new THREE.Mesh(
          new THREE.BoxGeometry(0.54, 1.9, 0.04),
          M({ color: 0xeeeaf5, roughness: 0.45 })
        );
        mframe.position.set(-0.55 + mi * 0.54, 1.2, -0.62);
        tz.add(mframe);
        var mirror = new THREE.Mesh(
          new THREE.PlaneGeometry(0.48, 1.82),
          M({
            color: 0xb8cce8,
            metalness: 0.97,
            roughness: 0.04,
            emissive: 0x1a2840,
            emissiveIntensity: 0.2
          })
        );
        mirror.position.set(-0.55 + mi * 0.54, 1.2, -0.595);
        tz.add(mirror);
      }

      function vTube(x, z, h, r) {
        var g = new THREE.Group();
        g.position.set(x, 0.22, z);
        // metal base ring
        var base = new THREE.Mesh(
          new THREE.CylinderGeometry(r * 1.35, r * 1.45, 0.06, 20),
          M({ color: 0xd8e4f0, metalness: 0.45, roughness: 0.3 })
        );
        base.position.y = 0.03;
        g.add(base);
        // glass
        var glass = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, h, 32, 1, true),
          M({
            color: 0xc8e4ff,
            transparent: true,
            opacity: 0.22,
            roughness: 0.08,
            metalness: 0.45,
            side: THREE.DoubleSide,
            emissive: 0x70b8ff,
            emissiveIntensity: 0.45
          })
        );
        glass.position.y = h / 2;
        glass.castShadow = true;
        g.add(glass);
        // bright core column
        var core = new THREE.Mesh(
          new THREE.CylinderGeometry(r * 0.22, r * 0.22, h * 0.96, 12),
          M({
            color: 0xd0ecff,
            emissive: 0x60b0ff,
            emissiveIntensity: 1.6,
            transparent: true,
            opacity: 0.92,
            roughness: 0.25
          })
        );
        core.position.y = h / 2;
        g.add(core);
        // top dome
        var top = new THREE.Mesh(
          new THREE.SphereGeometry(r * 1.02, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          M({ color: 0xe8f4ff, emissive: 0xa0d8ff, emissiveIntensity: 0.7, metalness: 0.35, roughness: 0.2 })
        );
        top.position.y = h;
        g.add(top);
        // dense bubbles rising
        var bub = new THREE.Group();
        for (var i = 0; i < 48; i++) {
          var br = 0.008 + Math.random() * 0.018;
          var b = new THREE.Mesh(
            new THREE.SphereGeometry(br, 8, 8),
            M({
              color: 0xffffff,
              emissive: 0xd0ecff,
              emissiveIntensity: 1.1,
              transparent: true,
              opacity: 0.85,
              roughness: 0.15
            })
          );
          b.position.set(
            (Math.random() - 0.5) * r * 1.3,
            0.08 + Math.random() * (h - 0.15),
            (Math.random() - 0.5) * r * 1.3
          );
          b.userData.speed = 0.3 + Math.random() * 0.55;
          b.userData.minY = 0.08;
          b.userData.maxY = h - 0.06;
          b.userData.phase = Math.random() * Math.PI * 2;
          bub.add(b);
        }
        g.add(bub);
        g.userData.bubbles = bub;
        var light = new THREE.PointLight(0x9ad4ff, 1.35, 3.8, 1.8);
        light.position.set(0, h * 0.45, 0);
        g.add(light);
        g.userData.light = light;
        return g;
      }
      // two tall tubes like photo — slightly different heights
      var vt1 = vTube(-0.18, -0.08, 1.65, 0.085);
      var vt2 = vTube(0.32, 0.02, 1.78, 0.095);
      tz.add(vt1);
      tz.add(vt2);

      /* ══════ AQUARIUM + CABINET ══════ */
      var aq = new THREE.Group();
      aq.position.set(-0.5, 0, -1.75);
      room.add(aq);
      var cab = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.48, 0.42),
        M({ color: 0x252230, roughness: 0.7 })
      );
      cab.position.y = 0.24;
      cab.castShadow = true;
      aq.add(cab);
      // small black bench left of aquarium
      var bench = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.3, 0.28),
        M({ color: 0x1a1822, roughness: 0.75 })
      );
      bench.position.set(-0.75, 0.15, 0.1);
      aq.add(bench);
      // glass tank
      var tank = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.38, 0.34),
        M({
          color: 0x88ccee,
          transparent: true,
          opacity: 0.3,
          roughness: 0.1,
          metalness: 0.25,
          emissive: 0xff5520,
          emissiveIntensity: 0.2
        })
      );
      tank.position.y = 0.67;
      aq.add(tank);
      var water = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.28, 0.28),
        M({ color: 0xff4a18, emissive: 0xff3a10, emissiveIntensity: 0.85, roughness: 0.5 })
      );
      water.position.y = 0.64;
      aq.add(water);
      // fake fish shapes
      for (var fi = 0; fi < 4; fi++) {
        var fish = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 8, 6),
          M({ color: 0xff8830, emissive: 0xff6600, emissiveIntensity: 0.5, roughness: 0.4 })
        );
        fish.scale.set(1.8, 0.7, 0.5);
        fish.position.set(-0.12 + fi * 0.1, 0.62 + (fi % 2) * 0.06, -0.02 + (fi % 3) * 0.04);
        aq.add(fish);
      }
      var aqL = new THREE.PointLight(0xff5a20, 1.5, 2.4, 2);
      aqL.position.set(0, 0.68, 0.15);
      aq.add(aqL);

      /* ══════ STRING CURTAIN (dense, photo A/B right) ══════ */
      var cg = new THREE.Group();
      cg.position.set(1.95, 0, 0.55);
      room.add(cg);
      var rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 1.85),
        M({ color: 0xd4cce0, metalness: 0.35, roughness: 0.4 })
      );
      rail.position.y = 2.52;
      cg.add(rail);
      var strands = [];
      for (var st = 0; st < 72; st++) {
        var sh = 2.25 + Math.random() * 0.2;
        var strand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0035, 0.0055, sh, 4),
          M({
            color: 0xf0e8ff,
            transparent: true,
            opacity: 0.38 + Math.random() * 0.2,
            roughness: 0.35,
            emissive: 0xb0a0e0,
            emissiveIntensity: 0.12
          })
        );
        strand.position.set(
          (Math.random() - 0.5) * 0.12,
          sh / 2 + 0.2,
          (st / 72 - 0.5) * 1.75
        );
        strand.userData.phase = Math.random() * Math.PI * 2;
        cg.add(strand);
        strands.push(strand);
      }

      /* ══════ RAINBOW BEANBAG (photo C) ══════ */
      var beanG = new THREE.Group();
      beanG.position.set(-1.7, 0, 1.45);
      room.add(beanG);
      var beanTex = C(256, 128, function (ctx, w, h) {
        // bold rainbow bands like photo: red/pink, yellow, green, blue, purple
        var cols = ['#e74c3c', '#e91e8c', '#f1c40f', '#27ae60', '#3498db', '#9b59b6'];
        var bw = w / cols.length;
        for (var i = 0; i < cols.length; i++) {
          ctx.fillStyle = cols[i];
          ctx.fillRect(i * bw, 0, bw + 1, h);
        }
        for (var n = 0; n < 800; n++) {
          ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')';
          ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
        }
      });
      var beanMat = M({ map: beanTex, roughness: 0.78, metalness: 0.03 });
      var bean = new THREE.Mesh(new THREE.SphereGeometry(0.6, 40, 30), beanMat);
      bean.scale.set(1.28, 0.82, 1.22);
      bean.position.y = 0.42;
      bean.rotation.y = 0.55;
      bean.castShadow = true;
      bean.receiveShadow = true;
      beanG.add(bean);
      var beanTop = new THREE.Mesh(new THREE.SphereGeometry(0.32, 28, 18), beanMat);
      beanTop.scale.set(1.25, 0.52, 1.15);
      beanTop.position.y = 0.78;
      beanTop.castShadow = true;
      beanG.add(beanTop);

      // pink foam mat left of bean (photo C)
      var pinkMat = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.18, 0.65),
        M({ color: 0xd4456a, roughness: 0.9 })
      );
      pinkMat.position.set(-1.75, 0.09, 0.7);
      pinkMat.castShadow = true;
      room.add(pinkMat);
      // blue foam block
      var blueBlk = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.32, 0.38),
        M({ color: 0x3a5fd4, roughness: 0.88 })
      );
      blueBlk.position.set(-0.95, 0.16, 1.55);
      blueBlk.castShadow = true;
      room.add(blueBlk);

      /* ══════ HORIZONTAL TUBES on white L-cabinet (photo C exact) ══════ */
      var hz = new THREE.Group();
      hz.position.set(0.85, 0, 1.65);
      room.add(hz);
      // white furniture mass
      var hCab = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.72, 0.52),
        M({ color: 0xf8f6fc, roughness: 0.4, metalness: 0.05 })
      );
      hCab.position.y = 0.36;
      hCab.castShadow = true;
      hCab.receiveShadow = true;
      hz.add(hCab);
      // curved corner piece (L shape feel)
      var hCurve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.72, 20, 1, false, 0, Math.PI / 2),
        M({ color: 0xf8f6fc, roughness: 0.4 })
      );
      hCurve.position.set(-0.7, 0.36, 0.1);
      hCurve.rotation.y = Math.PI;
      hz.add(hCurve);
      var hTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.7, 0.045, 0.55),
        M({ color: 0xffffff, roughness: 0.32 })
      );
      hTop.position.y = 0.74;
      hz.add(hTop);
      // mirror BELOW tubes on front of cabinet (photo C)
      var hMirFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.25, 0.48, 0.03),
        M({ color: 0xe8e4f0, roughness: 0.45 })
      );
      hMirFrame.position.set(0.05, 0.42, 0.275);
      hz.add(hMirFrame);
      var hMir = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 0.42),
        M({ color: 0xa8c0e0, metalness: 0.95, roughness: 0.05, emissive: 0x152030, emissiveIntensity: 0.15 })
      );
      hMir.position.set(0.05, 0.42, 0.295);
      hz.add(hMir);

      function hTube(len, r, y, zOff) {
        var g = new THREE.Group();
        g.position.set(0.05, y, zOff);
        var glass = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, len, 28, 1, true),
          M({
            color: 0xd0e8ff,
            transparent: true,
            opacity: 0.28,
            roughness: 0.1,
            metalness: 0.4,
            side: THREE.DoubleSide,
            emissive: 0x70b8ff,
            emissiveIntensity: 0.5
          })
        );
        glass.rotation.z = Math.PI / 2;
        g.add(glass);
        var core = new THREE.Mesh(
          new THREE.CylinderGeometry(r * 0.28, r * 0.28, len * 0.92, 12),
          M({
            color: 0xc0e4ff,
            emissive: 0x50a8ff,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.9
          })
        );
        core.rotation.z = Math.PI / 2;
        g.add(core);
        [-len / 2, len / 2].forEach(function (x) {
          var cap = new THREE.Mesh(
            new THREE.SphereGeometry(r * 1.08, 14, 12),
            M({ color: 0xe8f4ff, emissive: 0xa0d4ff, emissiveIntensity: 0.65, metalness: 0.3, roughness: 0.25 })
          );
          cap.position.x = x;
          g.add(cap);
        });
        var bub = new THREE.Group();
        for (var i = 0; i < 30; i++) {
          var b = new THREE.Mesh(
            new THREE.SphereGeometry(0.008 + Math.random() * 0.014, 6, 6),
            M({ color: 0xffffff, emissive: 0xd0ecff, emissiveIntensity: 1.2, transparent: true, opacity: 0.9, roughness: 0.15 })
          );
          b.position.set((Math.random() - 0.5) * len * 0.88, (Math.random() - 0.5) * r * 1.1, (Math.random() - 0.5) * r * 1.1);
          b.userData.phase = Math.random() * Math.PI * 2;
          b.userData.baseY = b.position.y;
          bub.add(b);
        }
        g.add(bub);
        g.userData.bubbles = bub;
        var pl = new THREE.PointLight(0x90c8ff, 0.85, 2.6, 2);
        g.add(pl);
        g.userData.light = pl;
        return g;
      }
      // two tubes: longer on top, shorter below (photo C)
      var ht1 = hTube(1.35, 0.072, 0.92, 0.1);
      var ht2 = hTube(1.1, 0.058, 1.1, 0.06);
      hz.add(ht1);
      hz.add(ht2);

      /* ══════ MOSS WALL (photo C lower right) ══════ */
      var mossTex = C(256, 256, function (ctx, w, h) {
        ctx.fillStyle = '#163520';
        ctx.fillRect(0, 0, w, h);
        for (var i = 0; i < 1000; i++) {
          ctx.beginPath();
          ctx.fillStyle = 'rgb(' + (25 + Math.random() * 80 | 0) + ',' + (70 + Math.random() * 140 | 0) + ',' + (25 + Math.random() * 55 | 0) + ')';
          ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      var moss = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.95, 0.95),
        M({ map: mossTex, color: 0xffffff, roughness: 0.95 })
      );
      moss.position.set(RW / 2 - 0.06, 0.78, -0.55);
      moss.castShadow = true;
      room.add(moss);
      var mossF = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 1.02, 1.02),
        M({ color: 0x2a2218, roughness: 0.7 })
      );
      mossF.position.set(RW / 2 - 0.1, 0.78, -0.55);
      room.add(mossF);

      /* ══════ wall shelf (photo C top left) ══════ */
      var shelf = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.06, 0.28),
        M({ color: 0xe8e4f0, roughness: 0.5 })
      );
      shelf.position.set(-1.6, 2.05, 1.9);
      room.add(shelf);

      /* ══════ small wall calendar near aquarium ══════ */
      var cal = new THREE.Mesh(
        new THREE.PlaneGeometry(0.22, 0.28),
        M({ color: 0xf5f0e8, roughness: 0.7, emissive: 0x332211, emissiveIntensity: 0.05 })
      );
      cal.position.set(-1.5, 1.55, -RD / 2 + 0.03);
      room.add(cal);

      /* ══════ floating reference photo (toggle) — small HUD not on wall ══════
         thumbs swap a picture-in-picture plane floating outside room view */
      var pipMat = M({ color: 0x555555, roughness: 0.5 });
      var pip = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.75), pipMat);
      pip.position.set(-2.6, 1.6, 1.2);
      pip.rotation.y = 0.9;
      scene.add(pip);
      var pipBorder = new THREE.Mesh(
        new THREE.PlaneGeometry(1.16, 0.81),
        M({ color: 0x1a1228, roughness: 0.8 })
      );
      pipBorder.position.copy(pip.position);
      pipBorder.position.z -= 0.01;
      pipBorder.rotation.copy(pip.rotation);
      // put border slightly behind
      scene.add(pipBorder);

      function setPip(url) {
        setStatus('Фото…');
        loader.load(url, function (tex) {
          if (tex.colorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          pipMat.map = tex;
          pipMat.color.set(0xffffff);
          pipMat.needsUpdate = true;
          setStatus('');
        }, undefined, function () { setStatus(''); });
      }
      setPip(PHOTOS[0]);

      /* ground void */
      var ground = new THREE.Mesh(
        new THREE.CircleGeometry(9, 48),
        new THREE.MeshBasicMaterial({ color: 0x06040c })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.04;
      scene.add(ground);

      /* ══════ ORBIT ══════ */
      var state = {
        rotY: 0.08, rotX: -0.12,
        tY: 0.08, tX: -0.12,
        dist: 4.9, tDist: 4.9,
        dragging: false, lastX: 0, lastY: 0,
        auto: !reduce, idle: 0
      };
      // photo-A style camera: slightly off-center looking at pit+tubes
      function applyCam() {
        // orbit around room center slightly toward tubes
        var cx = 0.15, cy = 0.75, cz = 0.1;
        var x = cx + Math.sin(state.rotY) * Math.cos(state.rotX) * state.dist;
        var y = cy + 0.55 + Math.sin(state.rotX) * state.dist * 0.45;
        var z = cz + Math.cos(state.rotY) * Math.cos(state.rotX) * state.dist;
        camera.position.set(x, Math.max(0.9, Math.min(2.9, y)), z);
        camera.lookAt(cx, cy, cz - 0.4);
      }
      applyCam();

      function onDown(e) {
        state.dragging = true; state.auto = false; state.idle = 0;
        state.lastX = e.clientX; state.lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        e.preventDefault();
      }
      function onMove(e) {
        if (!state.dragging) return;
        var dx = e.clientX - state.lastX, dy = e.clientY - state.lastY;
        state.lastX = e.clientX; state.lastY = e.clientY;
        state.tY -= dx * 0.006;
        state.tX += dy * 0.004;
        state.tX = Math.max(-0.38, Math.min(0.22, state.tX));
        state.tY = Math.max(-0.95, Math.min(1.15, state.tY));
      }
      function onUp() { state.dragging = false; canvas.style.cursor = 'grab'; }
      function onWheel(e) {
        e.preventDefault();
        state.auto = false; state.idle = 0;
        state.tDist += e.deltaY * 0.004;
        state.tDist = Math.max(3.2, Math.min(7.0, state.tDist));
      }
      canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      canvas.addEventListener('wheel', onWheel, { passive: false });

      var thumbs = mount.querySelectorAll('.r3d__thumb');
      thumbs.forEach(function (btn, idx) {
        btn.addEventListener('click', function () {
          setPip(PHOTOS[idx % PHOTOS.length]);
          thumbs.forEach(function (t, i) { t.classList.toggle('is-on', i === idx); });
        });
      });

      var section = mount.closest('.std-room') || document;
      var viewBtns = section.querySelectorAll('[data-r3d-view]');
      // presets matching photo angles
      var views = {
        corner: { y: 0.08, x: -0.12, d: 4.9 },  // photo A main
        tubes: { y: -0.35, x: -0.08, d: 3.6 }, // vertical tubes close
        pit: { y: 0.0, x: -0.25, d: 3.4 },     // ball pit
        bean: { y: 0.75, x: -0.1, d: 3.9 }     // bean + horizontal tubes (photo C)
      };
      viewBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var v = views[btn.getAttribute('data-r3d-view')];
          if (!v) return;
          state.auto = false; state.idle = 0;
          state.tY = v.y; state.tX = v.x; state.tDist = v.d;
          viewBtns.forEach(function (b) { b.classList.toggle('is-on', b === btn); });
        });
      });

      function resize() {
        var w = canvasHost.clientWidth || mount.clientWidth;
        var h = canvasHost.clientHeight || 480;
        if (w < 20 || h < 20) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      }
      window.addEventListener('resize', resize);
      if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(mount);

      /* ══════ ANIMATE ══════ */
      var t0 = performance.now();
      var visible = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
          visible = e[0] && e[0].isIntersecting;
        }, { threshold: 0.04 }).observe(mount);
      }

      function rise(group) {
        if (!group) return;
        group.children.forEach(function (b) {
          if (b.userData.maxY != null) {
            b.position.y += b.userData.speed * 0.014;
            if (b.position.y > b.userData.maxY) b.position.y = b.userData.minY;
            b.position.x += Math.sin(performance.now() * 0.002 + b.userData.phase) * 0.0004;
          } else if (b.userData.baseY != null) {
            b.position.y = b.userData.baseY + Math.sin(performance.now() * 0.0015 + b.userData.phase) * 0.018;
          }
        });
      }

      function frame(now) {
        requestAnimationFrame(frame);
        if (!visible && !state.dragging) return;
        var t = (now - t0) * 0.001;

        if (!state.dragging && !reduce) {
          state.idle += 0.016;
          if (state.idle > 3.5) state.auto = true;
        }
        if (state.auto && !reduce) {
          state.tY = 0.08 + Math.sin(t * 0.18) * 0.16;
          state.tX = -0.12 + Math.sin(t * 0.13) * 0.035;
        }
        state.rotY += (state.tY - state.rotY) * 0.09;
        state.rotX += (state.tX - state.rotX) * 0.09;
        state.dist += (state.tDist - state.dist) * 0.1;
        applyCam();

        disco.rotation.y += 0.012;
        disco.rotation.x = Math.sin(t * 0.6) * 0.1;

        rise(vt1.userData.bubbles);
        rise(vt2.userData.bubbles);
        rise(ht1.userData.bubbles);
        rise(ht2.userData.bubbles);
        if (vt1.userData.light) vt1.userData.light.intensity = 1.2 + Math.sin(t * 2.1) * 0.3;
        if (vt2.userData.light) vt2.userData.light.intensity = 1.3 + Math.sin(t * 2.4 + 1) * 0.35;
        if (ht1.userData.light) ht1.userData.light.intensity = 0.75 + Math.sin(t * 1.9) * 0.2;

        balls.forEach(function (b) {
          b.position.y = b.userData.baseY + Math.sin(t * 1.15 + b.userData.phase) * 0.014;
        });
        stars.children.forEach(function (st) {
          st.material.opacity = 0.28 + 0.62 * (0.5 + 0.5 * Math.sin(t * 2.6 + st.userData.phase));
        });
        strands.forEach(function (s, i) {
          s.rotation.z = Math.sin(t * 0.85 + s.userData.phase) * 0.028;
          s.rotation.x = Math.sin(t * 0.65 + i * 0.1) * 0.018;
        });

        blueCeil.intensity = 2.0 + Math.sin(t * 0.65) * 0.35;
        greenCeil.intensity = 1.25 + Math.sin(t * 0.85 + 1) * 0.3;
        aqL.intensity = 1.3 + Math.sin(t * 1.4) * 0.3;
        discoL.intensity = 0.7 + Math.sin(t * 1.1) * 0.2;
        bean.scale.y = 0.82 + Math.sin(t * 0.65) * 0.01;

        renderer.render(scene, camera);
      }
      requestAnimationFrame(frame);
      setStatus('');
      mount.classList.add('is-ready');
    } catch (err) {
      console.error('[room3d]', err);
      showFallback(err && err.message ? err.message : 'boot error');
    }
  }

  var SRCS = [
    '/rooms/vendor/three.min.js',
    'https://unpkg.com/three@0.160.0/build/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/three.min.js'
  ];
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = function () { res(src); };
      s.onerror = function () { rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function start() {
    setStatus('Загрузка 3D…');
    if (typeof THREE !== 'undefined') return boot();
    var i = 0;
    (function next() {
      if (i >= SRCS.length) return showFallback('Three.js offline');
      loadScript(SRCS[i++]).then(function () {
        if (typeof THREE === 'undefined') next(); else boot();
      }).catch(next);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();

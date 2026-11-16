/* World map — coverage fills along real country borders (Natural Earth) */
(function () {
  'use strict';
  var el = document.getElementById('wxMapLibre');
  if (!el || typeof maplibregl === 'undefined') return;

  var isMobile = function () {
    return window.matchMedia('(max-width:767px)').matches;
  };

  var CITIES = [
    { id: 'almaty', zone: 'kz', flag: '🇰🇿', city: 'Алматы', lng: 76.89, lat: 43.24, fact: 'Sensory Kit: первое системное решение в стране.', primary: true },
    { id: 'birmingham', zone: 'us', flag: '🇺🇸', city: 'Бирмингем', lng: -86.8, lat: 33.52, fact: 'KultureCity: 3000+ площадок, 1 млн наборов, арены NBA и NFL.' },
    { id: 'pittsburgh', zone: 'us', flag: '🇺🇸', city: 'Питтсбург', lng: -80.23, lat: 40.49, fact: 'Сенсорная комната в аэропорту, 140 м².' },
    { id: 'shannon', zone: 'eu', flag: '🇮🇪', city: 'Шеннон', lng: -8.92, lat: 52.7, fact: 'Первая в Европе сенсорная комната в аэропорту, 2017.' },
    { id: 'london', zone: 'eu', flag: '🇬🇧', city: 'Лондон', lng: -0.18, lat: 51.15, fact: 'Гатвик: первая сенсорная комната в аэропортах страны, 2018.' },
    { id: 'amsterdam', zone: 'eu', flag: '🇳🇱', city: 'Амстердам', lng: 4.76, lat: 52.31, fact: 'Нидерланды — родина методики снузелен, 1970-е.' },
    { id: 'geelong', zone: 'au', flag: '🇦🇺', city: 'Джилонг', lng: 144.47, lat: -38.03, fact: 'Стадион GMHBA — первая международная площадка KultureCity.' },
    { id: 'halifax', zone: 'ca', flag: '🇨🇦', city: 'Галифакс', lng: -63.51, lat: 44.88, fact: 'Библиотеки выдают сенсорные наборы на дом.' }
  ];

  /* ISO_A3 → zone + brand color */
  var ZONE_BY_ISO = {
    USA: { zone: 'us', color: '#F97316', label: 'США' },
    CAN: { zone: 'ca', color: '#3B82F6', label: 'Канада' },
    GBR: { zone: 'eu', color: '#6366F1', label: 'Европа' },
    IRL: { zone: 'eu', color: '#6366F1', label: 'Европа' },
    NLD: { zone: 'eu', color: '#6366F1', label: 'Европа' },
    AUS: { zone: 'au', color: '#10B981', label: 'Австралия' },
    KAZ: { zone: 'kz', color: '#E91E8C', label: 'Казахстан' }
  };

  var ZONE_VIEW = {
    us: { center: [-98, 39], zoom: 2.55 },
    ca: { center: [-96, 58], zoom: 2.2 },
    eu: { center: [0, 53], zoom: 3.6 },
    au: { center: [134, -25], zoom: 2.9 },
    kz: { center: [68, 48], zoom: 3.5 }
  };

  var ZONE_LABELS = {
    us: { label: 'США', coords: [-98.5, 39.5] },
    ca: { label: 'Канада', coords: [-96, 58] },
    eu: { label: 'Европа', coords: [-1, 53] },
    au: { label: 'Австралия', coords: [134, -25] },
    kz: { label: 'Казахстан', coords: [68, 48] }
  };

  /* 50m = cleaner full country shapes (islands, Alaska, etc.) */
  var GEO_URLS = [
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson',
    'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
    'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'
  ];

  var activeZone = 'kz';
  /* Do not let map canvas steal focus / scroll page to the map on load */
  var preferTop =
    !location.hash ||
    location.hash === '#' ||
    location.hash === '#top' ||
    location.hash === '#kit-top';
  function pinTopIfNeeded() {
    if (!preferTop) return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
  var map = new maplibregl.Map({
    container: el,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [40, 35],
    zoom: 1.45,
    attributionControl: true,
    trackResize: true,
    /* keyboard/tab should not jump viewport to map when page opens */
    cooperativeGestures: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  try {
    var canvas = map.getCanvas && map.getCanvas();
    if (canvas) {
      canvas.setAttribute('tabindex', '-1');
      canvas.setAttribute('aria-hidden', 'true');
    }
  } catch (err) {}
  map.on('load', function () {
    pinTopIfNeeded();
    setTimeout(pinTopIfNeeded, 0);
    setTimeout(pinTopIfNeeded, 100);
  });
  /* MapLibre sometimes focuses container after style load */
  el.addEventListener(
    'focusin',
    function () {
      if (preferTop && window.scrollY > 80) pinTopIfNeeded();
    },
    true
  );

  var mobileCard = document.getElementById('wxMobileCard');
  var mobileBody = document.getElementById('wxMobileBody');
  var mobileChips = document.getElementById('wxMobileChips');
  var openPopup = null;
  var legend = document.querySelector('.wxm__legend');
  var countriesFC = null;

  function getISO(props) {
    return (
      props.ISO_A3 ||
      props.ADM0_A3 ||
      props.iso_a3 ||
      props.ISO_A3_EH ||
      ''
    ).toUpperCase();
  }

  function filterCountries(geojson) {
    var feats = (geojson.features || []).filter(function (f) {
      var iso = getISO(f.properties || {});
      /* Natural Earth uses -99 for some; also match by name */
      if (ZONE_BY_ISO[iso]) return true;
      var name = (f.properties.ADMIN || f.properties.NAME || f.properties.name || '').toLowerCase();
      if (name === 'united states of america' || name === 'united states') return true;
      if (name === 'canada') return true;
      if (name === 'kazakhstan') return true;
      if (name === 'australia') return true;
      if (name === 'united kingdom' || name === 'ireland' || name === 'netherlands') return true;
      return false;
    }).map(function (f) {
      var p = f.properties || {};
      var iso = getISO(p);
      if (!ZONE_BY_ISO[iso]) {
        var name = (p.ADMIN || p.NAME || p.name || '').toLowerCase();
        if (name.indexOf('united states') !== -1) iso = 'USA';
        else if (name === 'canada') iso = 'CAN';
        else if (name === 'kazakhstan') iso = 'KAZ';
        else if (name === 'australia') iso = 'AUS';
        else if (name === 'united kingdom') iso = 'GBR';
        else if (name === 'ireland') iso = 'IRL';
        else if (name === 'netherlands') iso = 'NLD';
      }
      var z = ZONE_BY_ISO[iso];
      if (!z) return null;
      return {
        type: 'Feature',
        properties: {
          iso: iso,
          zone: z.zone,
          color: z.color,
          label: z.label,
          active: z.zone === activeZone ? 1 : 0
        },
        geometry: f.geometry
      };
    }).filter(Boolean);

    return { type: 'FeatureCollection', features: feats };
  }

  function withActive(fc, zoneId) {
    return {
      type: 'FeatureCollection',
      features: (fc.features || []).map(function (f) {
        return {
          type: 'Feature',
          properties: Object.assign({}, f.properties, {
            active: f.properties.zone === zoneId ? 1 : 0
          }),
          geometry: f.geometry
        };
      })
    };
  }

  function labelsFC() {
    return {
      type: 'FeatureCollection',
      features: Object.keys(ZONE_LABELS).map(function (id) {
        var z = ZONE_LABELS[id];
        var color =
          id === 'us' ? '#F97316' :
          id === 'ca' ? '#3B82F6' :
          id === 'eu' ? '#6366F1' :
          id === 'au' ? '#10B981' : '#E91E8C';
        return {
          type: 'Feature',
          properties: { id: id, label: z.label, color: color, active: id === activeZone ? 1 : 0 },
          geometry: { type: 'Point', coordinates: z.coords }
        };
      })
    };
  }

  function popupHTML(c) {
    return (
      '<div class="wx-pop">' +
      '<div class="wx-pop__t"><span>' + c.flag + '</span> ' + c.city + '</div>' +
      '<p class="wx-pop__d">' + c.fact + '</p></div>'
    );
  }

  function showMobile(c) {
    if (!mobileCard || !mobileBody) return;
    mobileCard.hidden = false;
    mobileBody.innerHTML =
      '<div class="wx-pop__t"><span>' + c.flag + '</span> ' + c.city +
      (c.primary ? ' <em>Казахстан</em>' : '') +
      '</div><p class="wx-pop__d">' + c.fact + '</p>';
    if (mobileChips) {
      mobileChips.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('is-on', b.dataset.id === c.id);
      });
    }
  }

  function syncLegend() {
    if (!legend) return;
    legend.querySelectorAll('li').forEach(function (li) {
      li.classList.toggle('is-active', li.getAttribute('data-zone') === activeZone);
    });
  }

  function setActiveZone(zoneId) {
    activeZone = zoneId || activeZone;
    if (countriesFC && map.getSource('zones')) {
      map.getSource('zones').setData(withActive(countriesFC, activeZone));
    }
    if (map.getSource('zone-labels')) {
      map.getSource('zone-labels').setData(labelsFC());
    }
    syncLegend();
  }

  function flyToZone(zoneId) {
    var v = ZONE_VIEW[zoneId];
    if (!v) return;
    map.easeTo({ center: v.center, zoom: v.zoom, duration: 750 });
  }

  function selectCity(c, fly) {
    setActiveZone(c.zone);
    if (fly !== false) flyToZone(c.zone);
    if (isMobile()) {
      showMobile(c);
      return;
    }
    if (openPopup) {
      openPopup.remove();
      openPopup = null;
    }
    openPopup = new maplibregl.Popup({
      offset: 18,
      closeButton: true,
      maxWidth: '260px',
      className: 'wx-popup'
    })
      .setLngLat([c.lng, c.lat])
      .setHTML(popupHTML(c))
      .addTo(map);
  }

  function cityForZone(zoneId) {
    return CITIES.find(function (c) { return c.zone === zoneId; }) || CITIES[0];
  }

  function addZoneLayers() {
    map.addSource('zones', {
      type: 'geojson',
      data: withActive(countriesFC, activeZone)
    });
    map.addSource('zone-labels', {
      type: 'geojson',
      data: labelsFC()
    });

    /* full solid country fill — entire border polygon painted */
    map.addLayer({
      id: 'zones-fill',
      type: 'fill',
      source: 'zones',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['==', ['get', 'active'], 1], 0.78,
          0.62
        ],
        'fill-antialias': true
      }
    });

    /* slightly darker core when active — still full area */
    map.addLayer({
      id: 'zones-fill-active',
      type: 'fill',
      source: 'zones',
      filter: ['==', ['get', 'active'], 1],
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.22
      }
    });

    map.addLayer({
      id: 'zones-outline-white',
      type: 'line',
      source: 'zones',
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'case',
          ['==', ['get', 'active'], 1], 3,
          2
        ],
        'line-opacity': 0.85
      },
      layout: { 'line-join': 'round', 'line-cap': 'round' }
    });

    map.addLayer({
      id: 'zones-outline',
      type: 'line',
      source: 'zones',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': [
          'case',
          ['==', ['get', 'active'], 1], 2.4,
          1.6
        ],
        'line-opacity': 1
      },
      layout: { 'line-join': 'round', 'line-cap': 'round' }
    });

    map.addLayer({
      id: 'zone-labels',
      type: 'symbol',
      source: 'zone-labels',
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 1, 11, 3.5, 15],
        'text-letter-spacing': 0.03,
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#0f172a',
        'text-halo-color': 'rgba(255,255,255,0.95)',
        'text-halo-width': 2,
        'text-halo-blur': 0.2,
        'text-opacity': 0.95
      }
    });

    function hitZone(e) {
      var feats = map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] });
      return feats && feats[0] ? feats[0].properties.zone : null;
    }

    map.on('click', function (e) {
      var z = hitZone(e);
      if (z) selectCity(cityForZone(z));
    });
    map.on('mousemove', function (e) {
      map.getCanvas().style.cursor = hitZone(e) ? 'pointer' : '';
    });
  }

  function addMarkers() {
    CITIES.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wx-m' + (c.primary ? ' wx-m--main' : '');
      btn.setAttribute('aria-label', c.city);
      btn.innerHTML = c.primary
        ? '<span class="wx-m__ring"></span><span class="wx-m__ping"></span><span class="wx-m__dot"></span>'
        : '<span class="wx-m__dot"></span>';
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        selectCity(c);
      });
      if (!isMobile()) {
        btn.addEventListener('mouseenter', function () {
          selectCity(c, false);
        });
      }
      new maplibregl.Marker({ element: btn, anchor: 'center' })
        .setLngLat([c.lng, c.lat])
        .addTo(map);
    });
  }

  function fetchGeo(i) {
    i = i || 0;
    if (i >= GEO_URLS.length) return Promise.reject(new Error('geo fetch failed'));
    return fetch(GEO_URLS[i])
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .catch(function () {
        return fetchGeo(i + 1);
      });
  }

  map.on('load', function () {
    el.classList.add('is-loading');
    fetchGeo(0)
      .then(function (geo) {
        countriesFC = filterCountries(geo);
        addZoneLayers();
        addMarkers();

        if (legend) {
          legend.querySelectorAll('li').forEach(function (li) {
            li.setAttribute('role', 'button');
            li.tabIndex = 0;
            li.addEventListener('click', function () {
              var z = li.getAttribute('data-zone');
              if (z) selectCity(cityForZone(z));
            });
            li.addEventListener('keydown', function (e) {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                li.click();
              }
            });
          });
        }

        if (!isMobile()) selectCity(CITIES[0], true);
        else {
          setActiveZone('kz');
          showMobile(CITIES[0]);
          flyToZone('kz');
        }
        syncLegend();
      })
      .catch(function (err) {
        console.warn('Zones geojson failed', err);
        addMarkers();
      })
      .finally(function () {
        el.classList.remove('is-loading');
      });
  });

  if (mobileChips) {
    CITIES.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.id = c.id;
      b.textContent = c.flag + ' ' + c.city;
      b.addEventListener('click', function () { selectCity(c); });
      mobileChips.appendChild(b);
    });
  }

  window.addEventListener('resize', function () { map.resize(); });
})();

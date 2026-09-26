/* Anole demo map. Observation metadata lives in the static list, not a remote feed. */
(() => {
  'use strict';
  const container = document.querySelector('#observation-map');
  if (!container) return;
  const status = document.querySelector('#map-status');
  if (!window.L) {
    container.textContent = 'Map unavailable. Use the observation list below.';
    status.textContent = 'The map library could not load. The list and category filters still work.';
    return;
  }
  container.replaceChildren();
  const map = L.map(container, { scrollWheelZoom: false, fadeAnimation: false, zoomAnimation: false, minZoom: 10, maxZoom: 17 });
  const home = [29.757, -95.384];
  map.setView(home, 13);
  // Normal browser requests retain provider caching and send the site Referer.
  // No prefetch, offline download, geolocation or official facility layer.
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  let tileFailed = false;
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      keepBuffer: 0,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.on('tileerror', () => {
      tileFailed = true;
      status.textContent = 'Basemap tiles unavailable. Demo pins and the observation list remain usable; retry when connected.';
    });
    tiles.on('load', () => {
      if (!tileFailed) status.textContent = 'Demo map ready. All four pins are fictional, not cooling centres.';
    });
    tiles.addTo(map);
    status.textContent = 'Loading basemap. Demo pins and list are ready.';
  } else {
    status.textContent = 'Use a local HTTP server to load the basemap. Demo pins and the list remain available.';
  }
  const markers = [...document.querySelectorAll('.observation')].map(card => {
    const category = card.dataset.category;
    const number = card.querySelector('.number').textContent;
    const title = card.querySelector('h3').textContent;
    const icon = L.divIcon({
      className: 'anole-map-marker ' + category,
      html: '<span>' + number + '</span>',
      iconSize: [44, 44], iconAnchor: [22, 22]
    });
    const popup = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = 'FICTIONAL DEMO ' + number + ' · ' + title;
    popup.append(label);
    for (const selector of ['.condition', '.observation-meta', '.follow-up']) {
      const p = document.createElement('p');
      p.textContent = card.querySelector(selector).textContent;
      popup.append(p);
    }
    const link = document.createElement('a');
    link.href = card.getAttribute('href');
    link.textContent = 'Read sample details →';
    popup.append(link);
    const marker = L.marker([Number(card.dataset.lat), Number(card.dataset.lng)], {
      icon, title: 'Fictional demo ' + number + ': ' + title,
      alt: 'Fictional demo ' + number + ': ' + title,
      keyboard: true
    }).bindPopup(popup, { maxWidth: 240, maxHeight: 240 });
    return { category, marker };
  });
  function syncMarkers() {
    const selected = document.querySelector('[data-filter][aria-pressed="true"]');
    const category = selected ? selected.dataset.filter : 'all';
    map.closePopup();
    markers.forEach(item => {
      if (category === 'all' || item.category === category) item.marker.addTo(map);
      else map.removeLayer(item.marker);
    });
  }
  // app.js owns filtering; read its finished state without changing Capture or list logic.
  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => syncMarkers());
  });
  window.addEventListener('hashchange', syncMarkers);
  syncMarkers();
  const reset = document.querySelector('#reset-map');
  reset.disabled = false;
  reset.addEventListener('click', () => { map.closePopup(); map.setView(home, 13); });
})();

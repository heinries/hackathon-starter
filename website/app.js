'use strict';
const filters = document.querySelectorAll('[data-filter]');
function filterObservations(category) {
  if (![...filters].some(button => button.dataset.filter === category)) category = 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  document.querySelectorAll('[data-category]').forEach(item => { item.hidden = category !== 'all' && item.dataset.category !== category; });
  const count = document.querySelector('#result-count');
  if (count) count.textContent = category === 'all' ? '4 samples' : '1 sample';
}
if (filters.length) {
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    history.replaceState(null, '', '#' + category);
    filterObservations(category);
  }));
  filterObservations(location.hash.slice(1) || 'all');
  window.addEventListener('hashchange', () => filterObservations(location.hash.slice(1)));
}
const captureForm = document.querySelector('#capture-form');
if (captureForm) {
  captureForm.querySelector('button[type="submit"]').disabled = false;
  const category = document.querySelector('#category');
  const hints = {
    walkways: 'surface, obstacles, ramps, last checked.',
    lighting: 'light condition, pole location, observation time.',
    preparedness: 'resource type, supplies, date, verification status.',
    spaces: 'condition, facilities, cleanup needs, possible activities.'
  };
  function updateTemplate() { document.querySelector('#template-hint').textContent = 'Template attributes: ' + hints[category.value]; }
  if (Object.hasOwn(hints, location.hash.slice(1))) category.value = location.hash.slice(1);
  const samplePlaces = { walkways: 'Bayou path', lighting: 'Neighbourhood corner', preparedness: 'Community room', spaces: 'Pocket green' };
  document.querySelector('#location').value = samplePlaces[category.value] + ' · fictional location';
  updateTemplate();
  category.addEventListener('change', updateTemplate);
  const review = document.querySelector('#capture-review');
  captureForm.addEventListener('submit', event => {
    event.preventDefault();
    const content = document.querySelector('#review-content');
    content.replaceChildren();
    const fields = {
      Place: document.querySelector('#location').value.trim() || 'No place entered',
      Template: category.options[category.selectedIndex].text,
      Condition: document.querySelector('#condition').value,
      Notes: document.querySelector('#notes').value.trim() || 'No notes added',
      'Verification status': 'Unverified concept preview'
    };
    Object.entries(fields).forEach(([label, value]) => {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      content.append(dt, dd);
    });
    captureForm.hidden = true;
    review.hidden = false;
    review.focus();
  });
  document.querySelector('#edit-preview').addEventListener('click', () => {
    review.hidden = true;
    captureForm.hidden = false;
    document.querySelector('#location').focus();
  });
}

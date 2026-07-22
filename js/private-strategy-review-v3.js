(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('[data-review-header]');
  var formFrame = document.querySelector('[data-srg-form-frame]');
  var formLoader = document.querySelector('[data-form-loader]');

  root.classList.remove('no-js');
  root.classList.add('js');

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 24);
  }

  if (formFrame && formLoader) {
    var revealForm = function () { formLoader.classList.add('is-hidden'); };
    formFrame.addEventListener('load', revealForm, { once: true });
    window.setTimeout(revealForm, 4500);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());

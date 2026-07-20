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



  function parseEmbeddedFormHeight(payload) {
    var value = payload;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); }
      catch (error) {
        var match = value.match(/(?:height|iframeHeight)[^0-9]{0,12}([0-9]{3,4})/i);
        return match ? Number(match[1]) : null;
      }
    }
    if (!value || typeof value !== 'object') return null;
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (/height/i.test(key) && Number.isFinite(Number(value[key]))) return Number(value[key]);
    }
    return null;
  }

  function installAdaptiveFormHeight(frame, minimum, maximum) {
    if (!frame) return;
    window.addEventListener('message', function (event) {
      if (!/leadconnectorhq\.com|msgsndr\.com/.test(event.origin || '')) return;
      var height = parseEmbeddedFormHeight(event.data);
      if (!height) return;
      height = Math.max(minimum, Math.min(maximum, Math.round(height + 8)));
      frame.style.height = height + 'px';
      frame.setAttribute('data-height', String(height));
    });
  }

  installAdaptiveFormHeight(formFrame, 760, 1500);

  if (formFrame && formLoader) {
    var revealForm = function () { formLoader.classList.add('is-hidden'); };
    formFrame.addEventListener('load', revealForm, { once: true });
    window.setTimeout(revealForm, 4500);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());

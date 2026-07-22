(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('[data-review-header]');
  var formFrame = document.querySelector('[data-srg-form-frame]');
  var formLoader = document.querySelector('[data-form-loader]');
  var formShell = document.querySelector('[data-form-shell]');
  var resizeFrame = 0;
  var pendingHeight = 0;

  root.classList.remove('no-js');
  root.classList.add('js');

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 20);
  }

  function findHeight(payload, depth) {
    var value = payload;
    var keys;
    var index;

    if (depth > 2) return null;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); }
      catch (error) {
        var match = value.match(/(?:height|iframeHeight|formHeight)[^0-9]{0,16}([0-9]{3,4})/i);
        return match ? Number(match[1]) : null;
      }
    }

    if (!value || typeof value !== 'object') return null;
    keys = Object.keys(value);

    for (index = 0; index < keys.length; index += 1) {
      if (/^(height|iframeHeight|formHeight)$/i.test(keys[index]) && isFinite(Number(value[keys[index]]))) {
        return Number(value[keys[index]]);
      }
    }

    for (index = 0; index < keys.length; index += 1) {
      if (value[keys[index]] && typeof value[keys[index]] === 'object') {
        var nestedHeight = findHeight(value[keys[index]], depth + 1);
        if (nestedHeight) return nestedHeight;
      }
    }

    return null;
  }

  function applyFrameHeight(height) {
    if (!formFrame || !height) return;
    pendingHeight = Math.max(640, Math.min(1800, Math.round(height + 12)));
    if (resizeFrame) return;

    resizeFrame = window.requestAnimationFrame(function () {
      formFrame.style.height = pendingHeight + 'px';
      formFrame.setAttribute('data-height', String(pendingHeight));
      resizeFrame = 0;
    });
  }

  function revealForm() {
    if (formLoader) formLoader.classList.add('is-hidden');
    if (formShell) {
      formShell.classList.add('is-form-loaded');
      formShell.setAttribute('aria-busy', 'false');
    }
  }

  if (formFrame) {
    formFrame.addEventListener('load', revealForm, { once: true });

    window.addEventListener('message', function (event) {
      if (!/^https:\/\/(?:[^.]+\.)?(?:leadconnectorhq\.com|msgsndr\.com)$/.test(event.origin || '')) return;
      var height = findHeight(event.data, 0);
      if (!height) return;
      applyFrameHeight(height);
      revealForm();
    });

    window.setTimeout(revealForm, 4500);
  } else {
    revealForm();
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}());

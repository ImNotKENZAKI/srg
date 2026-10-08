/* The GHL embed controls field logic, submission and automatic iframe sizing. */
(function () {
  'use strict';
  const frame = document.querySelector('[data-srg-form-frame]');
  const loader = document.querySelector('[data-form-loader]');
  const shell = document.querySelector('[data-form-shell]');
  function loaded() {
    if (loader) loader.hidden = true;
    if (shell) shell.setAttribute('aria-busy', 'false');
  }
  if (frame) frame.addEventListener('load', loaded, { once: true });
  // Leave the direct-form fallback visible if the remote embed is unavailable.
  window.setTimeout(loaded, 5000);
}());

(function () {
  'use strict';

  var statistic = document.querySelector('[data-savings-stat]');
  if (!statistic) return;

  var value = statistic.querySelector('[data-savings-value]');
  var target = 600000;
  var duration = 10000;
  var formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var started = false;
  var completed = false;
  var frame = null;
  var observer = null;
  var startedAt = 0;

  function finish() {
    completed = true;
    started = true;
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    if (observer) observer.disconnect();
    value.textContent = '$600,000+';
    statistic.dataset.countState = 'complete';
  }

  // Steady first 70%, then a continuous cubic deceleration to the exact target.
  function ease(progress) {
    if (progress <= 0.7) return progress * (0.8 / 0.7);
    var tail = (progress - 0.7) / 0.3;
    return 0.8 + (12 / 35) * tail - (3 / 35) * tail * tail - (2 / 35) * tail * tail * tail;
  }

  function tick(now) {
    if (completed) return;
    var progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
    if (progress >= 1) {
      finish();
      return;
    }
    var dollars = Math.min(target - 1, Math.floor(target * ease(progress)));
    value.textContent = '$' + formatter.format(dollars);
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    if (started || completed) return;
    if (motionQuery.matches) {
      finish();
      return;
    }
    started = true;
    statistic.dataset.countState = 'running';
    observer.disconnect();
    startedAt = performance.now();
    frame = window.requestAnimationFrame(tick);
  }

  if (motionQuery.matches || !('IntersectionObserver' in window)) {
    finish();
  } else {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) start();
      });
    }, { threshold: 0.55 });
    observer.observe(statistic);
  }

  function motionChanged(event) {
    if (event.matches) finish();
  }
  document.addEventListener('srg:motionchange', function (event) {
    if (event.detail && event.detail.paused) finish();
  });
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', motionChanged);
  else if (motionQuery.addListener) motionQuery.addListener(motionChanged);
})();

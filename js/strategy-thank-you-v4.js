(function () {
  'use strict';

  var root = document.documentElement;
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('no-js');
  root.classList.add('js');

  function show(item) {
    item.classList.add('is-visible');
  }

  if (!items.length || reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      show(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach(function (item) {
    observer.observe(item);
  });

  root.classList.add('motion-ready');

  window.requestAnimationFrame(function () {
    items.forEach(function (item) {
      var rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * .94 && rect.bottom > 0) show(item);
    });
  });
}());

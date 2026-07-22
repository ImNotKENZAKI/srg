(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('[data-booking-header]');
  var calendar = document.querySelector('[data-srg-calendar]');
  var calendarShell = document.querySelector('[data-calendar-shell]');
  var calendarLoader = document.querySelector('[data-calendar-loader]');
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var resizeFrame = 0;
  var pendingHeight = 0;

  root.classList.remove('no-js');
  root.classList.add('js');

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 20);
  }

  function revealCalendar() {
    if (calendarLoader) calendarLoader.classList.add('is-hidden');
    if (calendarShell) calendarShell.setAttribute('aria-busy', 'false');
  }

  function findHeight(payload, depth) {
    var value = payload;
    var keys;
    var index;

    if (depth > 2) return null;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); }
      catch (error) {
        var match = value.match(/(?:height|iframeHeight|calendarHeight)[^0-9]{0,16}([0-9]{3,4})/i);
        return match ? Number(match[1]) : null;
      }
    }

    if (!value || typeof value !== 'object') return null;
    keys = Object.keys(value);

    for (index = 0; index < keys.length; index += 1) {
      if (/^(height|iframeHeight|calendarHeight)$/i.test(keys[index]) && isFinite(Number(value[keys[index]]))) {
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

  function applyCalendarHeight(height) {
    if (!calendar || !height) return;
    pendingHeight = Math.max(640, Math.min(1600, Math.round(height + 12)));
    if (resizeFrame) return;

    resizeFrame = window.requestAnimationFrame(function () {
      calendar.style.height = pendingHeight + 'px';
      resizeFrame = 0;
    });
  }

  function initializeReveals() {
    var observer;

    if (!revealItems.length || reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

    revealItems.forEach(function (item) { observer.observe(item); });
    root.classList.add('motion-ready');
  }

  if (calendar) {
    if (calendarShell) calendarShell.setAttribute('aria-busy', 'true');
    calendar.addEventListener('load', revealCalendar, { once: true });

    window.addEventListener('message', function (event) {
      if (!/^https:\/\/(?:[^.]+\.)?(?:leadconnectorhq\.com|msgsndr\.com)$/.test(event.origin || '')) return;
      var height = findHeight(event.data, 0);
      if (height) applyCalendarHeight(height);
      revealCalendar();
    });

    window.setTimeout(revealCalendar, 5000);
  } else {
    revealCalendar();
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  initializeReveals();
}());

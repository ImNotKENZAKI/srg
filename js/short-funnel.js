(function () {
  'use strict';

  var root = document.documentElement;
  if (root.dataset.srgShortFunnelMounted === 'true') return;
  root.dataset.srgShortFunnelMounted = 'true';

  var motionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = Boolean(motionQuery && motionQuery.matches);
  var header = document.querySelector('[data-site-header]');
  var hero = document.querySelector('[data-hero]');
  var finalScene = document.querySelector('[data-final-scene]');
  var frameRequested = false;
  var headerScrolled = null;
  var reviewParams = new URLSearchParams(window.location.search);
  var localReviewMode = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && reviewParams.get('review') === '1';

  root.classList.remove('no-js');
  root.classList.add('js');
  root.classList.toggle('reduced-motion', reduceMotion);

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function createStageController(options) {
    var scene = document.querySelector(options.scene);
    var states = scene ? toArray(scene.querySelectorAll(options.states)) : [];
    var cues = scene && options.cues ? toArray(scene.querySelectorAll(options.cues)) : [];
    var backgrounds = scene && options.backgrounds ? toArray(scene.querySelectorAll(options.backgrounds)) : [];
    var activeIndex = 0;
    var targetIndex = 0;
    var exitTimer = null;
    var transitionTimer = null;
    var transitionToken = 0;

    function clearTransitionTimers() {
      if (exitTimer) window.clearTimeout(exitTimer);
      if (transitionTimer) window.clearTimeout(transitionTimer);
      exitTimer = null;
      transitionTimer = null;
    }

    function preloadAfter(index) {
      if (!options.preloadNext || !states.length) return;
      var nextIndex = Math.min(index + 1, states.length - 1);
      var images = toArray(states[nextIndex].querySelectorAll('img'));
      if (backgrounds[nextIndex]) images = images.concat(toArray(backgrounds[nextIndex].querySelectorAll('img')));
      images.forEach(function (image) {
        image.loading = 'eager';
        if (image.decode) image.decode().catch(function () {});
      });
    }

    function updateScenePosition(index) {
      var denominator = Math.max(states.length - 1, 1);
      var progress = index / denominator;
      scene.setAttribute('data-stage-index', String(index));
      scene.style.setProperty('--path-progress', progress.toFixed(3));
    }

    function reveal(index) {
      clearTransitionTimers();
      transitionToken += 1;

      states.forEach(function (state, stateIndex) {
        var isActive = stateIndex === index;
        state.classList.remove('is-entering', 'is-leaving', 'is-transitioning');
        state.classList.toggle('is-active', isActive);
        if (isActive) state.setAttribute('aria-current', 'step');
        else state.removeAttribute('aria-current');
      });

      cues.forEach(function (cue, cueIndex) {
        var isActive = cueIndex === index;
        cue.classList.remove('is-target');
        cue.classList.toggle('is-active', isActive);
        if (options.cueCurrent !== false) {
          if (isActive) cue.setAttribute('aria-current', 'step');
          else cue.removeAttribute('aria-current');
        }
      });

      backgrounds.forEach(function (background, backgroundIndex) {
        background.classList.remove('is-entering', 'is-transitioning');
        background.classList.toggle('is-active', backgroundIndex === index);
      });

      activeIndex = index;
      targetIndex = index;
      preloadAfter(index);
    }

    function goTo(index, immediate) {
      if (!scene || !states.length) return;
      index = clamp(Math.round(index), 0, states.length - 1);
      if (index === targetIndex && !immediate) return;

      targetIndex = index;
      updateScenePosition(index);
      clearTransitionTimers();

      cues.forEach(function (cue, cueIndex) {
        cue.classList.toggle('is-target', cueIndex === index && cueIndex !== activeIndex);
      });

      backgrounds.forEach(function (background, backgroundIndex) {
        background.classList.toggle('is-entering', backgroundIndex === index && backgroundIndex !== activeIndex);
      });

      if (immediate || reduceMotion || window.innerWidth <= 1024) {
        reveal(index);
        return;
      }

      transitionToken += 1;
      var token = transitionToken;
      var previousIndex = activeIndex;
      var previousState = states[previousIndex];
      var incomingState = states[index];

      states.forEach(function (state) {
        state.classList.remove('is-entering', 'is-leaving', 'is-transitioning');
        if (state !== previousState) state.classList.remove('is-active');
        state.removeAttribute('aria-current');
      });

      if (previousState && previousState !== incomingState) {
        previousState.classList.remove('is-active');
        previousState.classList.add('is-leaving', 'is-transitioning');
      }

      incomingState.classList.add('is-entering', 'is-transitioning');
      incomingState.setAttribute('aria-current', 'step');

      backgrounds.forEach(function (background, backgroundIndex) {
        background.classList.remove('is-entering', 'is-transitioning');
        if (backgroundIndex !== previousIndex) background.classList.remove('is-active');
        if (backgroundIndex === index) background.classList.add('is-entering', 'is-transitioning');
        if (backgroundIndex === previousIndex) background.classList.add('is-transitioning');
      });

      activeIndex = index;

      window.requestAnimationFrame(function () {
        if (token !== transitionToken) return;
        incomingState.classList.remove('is-entering');
        incomingState.classList.add('is-active');

        cues.forEach(function (cue, cueIndex) {
          var isActive = cueIndex === index;
          cue.classList.remove('is-target');
          cue.classList.toggle('is-active', isActive);
          if (options.cueCurrent !== false) {
            if (isActive) cue.setAttribute('aria-current', 'step');
            else cue.removeAttribute('aria-current');
          }
        });

        if (backgrounds[index]) backgrounds[index].classList.add('is-active');
      });

      exitTimer = window.setTimeout(function () {
        if (token !== transitionToken) return;
        if (previousState && previousState !== incomingState) previousState.classList.remove('is-leaving');
        if (backgrounds[previousIndex] && previousIndex !== index) backgrounds[previousIndex].classList.remove('is-active');
      }, 170);

      transitionTimer = window.setTimeout(function () {
        if (token !== transitionToken) return;
        states.forEach(function (state) { state.classList.remove('is-entering', 'is-leaving', 'is-transitioning'); });
        backgrounds.forEach(function (background, backgroundIndex) {
          background.classList.remove('is-entering', 'is-transitioning');
          background.classList.toggle('is-active', backgroundIndex === index);
        });
        preloadAfter(index);
        exitTimer = null;
        transitionTimer = null;
      }, 480);
    }

    function updateFromScroll() {
      if (!scene || reduceMotion || window.innerWidth <= 1024) return;
      var rect = scene.getBoundingClientRect();
      var distance = Math.max(scene.offsetHeight - window.innerHeight, 1);
      var progress = clamp(-rect.top / distance, 0, 1);
      var index = Math.round(progress * Math.max(states.length - 1, 0));
      goTo(index, false);
    }

    function scrollToIndex(index) {
      if (!scene || !states.length) return;
      index = clamp(Math.round(index), 0, states.length - 1);

      if (window.innerWidth <= 1024 || reduceMotion) {
        states[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        return;
      }

      var sceneTop = scene.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      var distance = Math.max(scene.offsetHeight - window.innerHeight, 1);
      var progress = states.length > 1 ? index / (states.length - 1) : 0;
      window.scrollTo({ top: sceneTop + (distance * progress), behavior: 'smooth' });
    }

    cues.forEach(function (cue, index) {
      if (!cue.matches('button, a')) return;
      cue.addEventListener('click', function () {
        scrollToIndex(index);
      });
    });

    if (scene && states.length) goTo(0, true);

    return {
      scene: scene,
      states: states,
      goTo: goTo,
      updateFromScroll: updateFromScroll,
      scrollToIndex: scrollToIndex
    };
  }

  var situationController = createStageController({
    scene: '[data-situation-scene]',
    states: '[data-situation-state]',
    cues: '.situation-cues span',
    cueCurrent: false
  });

  var servicesController = createStageController({
    scene: '[data-services-scene]',
    states: '[data-service-state]',
    backgrounds: '[data-service-background]',
    preloadNext: true
  });

  var processController = createStageController({
    scene: '[data-process-scene]',
    states: '[data-process-state]',
    cues: '[data-process-target]'
  });

  function updateHero() {
    if (!hero || reduceMotion || window.innerWidth <= 1024) return;
    var rect = hero.getBoundingClientRect();
    var distance = Math.max(hero.offsetHeight - window.innerHeight, 1);
    var progress = clamp(-rect.top / distance, 0, 1);
    hero.classList.toggle('is-handoff', progress >= .35);
    hero.classList.toggle('is-exiting', progress >= .72);
  }

  function updateVisibility() {
    if (!finalScene) return;
    var finalRect = finalScene.getBoundingClientRect();
    finalScene.classList.toggle('is-visible', finalRect.top < window.innerHeight * .78 && finalRect.bottom > window.innerHeight * .18);
  }

  function updateMotion() {
    frameRequested = false;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var shouldPinHeader = scrollY > 28;
    if (header && shouldPinHeader !== headerScrolled) {
      header.classList.toggle('is-scrolled', shouldPinHeader);
      headerScrolled = shouldPinHeader;
    }

    updateHero();
    if (!localReviewMode && situationController) situationController.updateFromScroll();
    if (!localReviewMode && servicesController) servicesController.updateFromScroll();
    if (!localReviewMode && processController) processController.updateFromScroll();
    updateVisibility();
  }

  function requestMotionUpdate() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateMotion);
  }

  function setupNaturalReveals() {
    if (reduceMotion || window.innerWidth > 1024) return;
    var revealItems = toArray(document.querySelectorAll('.situation-state, .service-state, .process-state'));
    if (!revealItems.length) return;

    revealItems.forEach(function (item) { item.classList.add('natural-reveal'); });

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) { item.classList.add('is-revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (item) { observer.observe(item); });
  }

  toArray(document.querySelectorAll('[data-scroll-to-form]')).forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href') || '';
      var targetId = href.charAt(0) === '#' ? href.slice(1) : '';
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (window.history && window.history.pushState) window.history.pushState(null, '', '#' + targetId);
    });
  });

  window.addEventListener('scroll', requestMotionUpdate, { passive: true });
  window.addEventListener('resize', requestMotionUpdate);

  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (event) {
      reduceMotion = event.matches;
      root.classList.toggle('reduced-motion', reduceMotion);
      if (reduceMotion) {
        toArray(document.querySelectorAll('.natural-reveal')).forEach(function (item) { item.classList.add('is-revealed'); });
      }
      requestMotionUpdate();
    });
  }

  var formFrame = document.querySelector('[data-srg-form-frame]');
  var formLoader = document.querySelector('[data-form-loader]');
  if (formFrame && formLoader) {
    var revealForm = function () { formLoader.classList.add('is-hidden'); };
    formFrame.addEventListener('load', revealForm, { once: true });
    window.setTimeout(revealForm, 4500);
  }

  if (localReviewMode) {
    if (reviewParams.has('situation')) situationController.goTo(Number(reviewParams.get('situation')), true);
    if (reviewParams.has('service')) servicesController.goTo(Number(reviewParams.get('service')), true);
    if (reviewParams.has('process')) processController.goTo(Number(reviewParams.get('process')), true);
    window.requestAnimationFrame(function () {
      var reviewTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      if (!reviewTarget) return;
      var reviewTop = reviewTarget.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo({ top: reviewTop, behavior: 'instant' });
    });
  }

  setupNaturalReveals();

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      root.classList.add('is-ready');
      updateMotion();
    });
  });

  window.__srgShortFunnel = {
    situation: situationController,
    services: servicesController,
    process: processController,
    update: updateMotion
  };
}());

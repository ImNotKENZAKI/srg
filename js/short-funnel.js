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
  var naturalRevealsInitialized = false;
  var editorialRevealsInitialized = false;
  var presentationMode = null;
  var ctaScrollFrame = null;
  var ctaScrollToken = 0;
  var hashCorrectionToken = 0;
  var hashAnchorActive = false;
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

  function isCinematicMode() {
    return root.classList.contains('cinematic-ready');
  }

  function currentScrollY() {
    return window.scrollY || window.pageYOffset || 0;
  }

  function targetScrollTop(target) {
    if (!target) return currentScrollY();
    return Math.max(0, Math.round(target.getBoundingClientRect().top + currentScrollY()));
  }

  function stopCtaScroll() {
    ctaScrollToken += 1;
    if (ctaScrollFrame !== null) window.cancelAnimationFrame(ctaScrollFrame);
    ctaScrollFrame = null;
    root.classList.remove('is-cta-scrolling');
  }

  function updateHash(hash) {
    if (!hash || window.location.hash === hash) return;
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
      return;
    }
    window.location.hash = hash;
  }

  function scrollToTarget(target, hash) {
    if (!target) return;

    stopCtaScroll();
    hashCorrectionToken += 1;
    root.classList.add('is-cta-scrolling');

    var startY = currentScrollY();
    var initialTargetY = targetScrollTop(target);
    var distance = Math.abs(initialTargetY - startY);

    if (reduceMotion || distance < 2) {
      window.scrollTo(0, initialTargetY);
      root.classList.remove('is-cta-scrolling');
      updateHash(hash);
      hashAnchorActive = true;
      requestMotionUpdate();
      return;
    }

    var token = ctaScrollToken;
    var startTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
    var duration = clamp(520 + (distance * .07), 620, 980);

    function step(timestamp) {
      if (token !== ctaScrollToken) return;

      var now = typeof timestamp === 'number' ? timestamp : Date.now();
      var progress = clamp((now - startTime) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      var liveTargetY = targetScrollTop(target);

      window.scrollTo(0, Math.round(startY + ((liveTargetY - startY) * eased)));
      requestMotionUpdate();

      if (progress < 1) {
        ctaScrollFrame = window.requestAnimationFrame(step);
        return;
      }

      ctaScrollFrame = null;
      window.scrollTo(0, liveTargetY);
      root.classList.remove('is-cta-scrolling');
      updateHash(hash);
      hashAnchorActive = true;
      requestMotionUpdate();
    }

    ctaScrollFrame = window.requestAnimationFrame(step);
  }

  function hashTarget() {
    if (!window.location.hash || window.location.hash.length < 2) return null;
    var id = window.location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch (error) {}
    return document.getElementById(id);
  }

  function scheduleHashCorrection() {
    var target = hashTarget();
    if (!target) return;

    hashCorrectionToken += 1;
    var token = hashCorrectionToken;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (token !== hashCorrectionToken || ctaScrollFrame !== null) return;
        if (Math.abs(target.getBoundingClientRect().top) < 2) return;

        root.classList.add('is-cta-scrolling');
        window.scrollTo(0, targetScrollTop(target));
        root.classList.remove('is-cta-scrolling');
        hashAnchorActive = true;
        requestMotionUpdate();
      });
    });
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
    var transitionFrame = null;
    var transitionToken = 0;

    function clearTransitionTimers() {
      if (exitTimer) window.clearTimeout(exitTimer);
      if (transitionTimer) window.clearTimeout(transitionTimer);
      if (transitionFrame !== null) window.cancelAnimationFrame(transitionFrame);
      exitTimer = null;
      transitionTimer = null;
      transitionFrame = null;
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
        background.classList.remove('is-entering', 'is-leaving', 'is-transitioning');
        background.classList.toggle('is-active', backgroundIndex === index);
      });

      activeIndex = index;
      targetIndex = index;
      preloadAfter(index);
    }

    function goTo(index, immediate) {
      if (!scene || !states.length) return;
      index = clamp(Math.round(index), 0, states.length - 1);

      var transitionInFlight = transitionFrame !== null || exitTimer !== null || transitionTimer !== null;
      if (index === targetIndex && !immediate) {
        if (!transitionInFlight && !states[index].classList.contains('is-active')) reveal(index);
        return;
      }

      if (transitionInFlight) reveal(activeIndex);

      targetIndex = index;
      updateScenePosition(index);
      clearTransitionTimers();

      cues.forEach(function (cue, cueIndex) {
        cue.classList.toggle('is-target', cueIndex === index && cueIndex !== activeIndex);
      });

      backgrounds.forEach(function (background, backgroundIndex) {
        background.classList.toggle('is-entering', backgroundIndex === index && backgroundIndex !== activeIndex);
      });

      if (immediate || !isCinematicMode()) {
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
        background.classList.remove('is-entering', 'is-leaving', 'is-transitioning');
        if (backgroundIndex !== previousIndex) background.classList.remove('is-active');
        if (backgroundIndex === index) background.classList.add('is-entering', 'is-transitioning');
        if (backgroundIndex === previousIndex) background.classList.add('is-transitioning');
      });

      transitionFrame = window.requestAnimationFrame(function () {
        if (token !== transitionToken) return;
        transitionFrame = null;
        incomingState.classList.remove('is-entering');
        incomingState.classList.add('is-active');
        activeIndex = index;

        cues.forEach(function (cue, cueIndex) {
          var isActive = cueIndex === index;
          cue.classList.remove('is-target');
          cue.classList.toggle('is-active', isActive);
          if (options.cueCurrent !== false) {
            if (isActive) cue.setAttribute('aria-current', 'step');
            else cue.removeAttribute('aria-current');
          }
        });

        if (backgrounds[index]) {
          backgrounds[index].classList.remove('is-entering', 'is-leaving');
          backgrounds[index].classList.add('is-active');
        }

        if (backgrounds[previousIndex] && previousIndex !== index) {
          backgrounds[previousIndex].classList.remove('is-active');
          backgrounds[previousIndex].classList.add('is-leaving');
        }

        exitTimer = window.setTimeout(function () {
          if (token !== transitionToken) return;
          if (previousState && previousState !== incomingState) previousState.classList.remove('is-leaving');
          exitTimer = null;
        }, 360);

        transitionTimer = window.setTimeout(function () {
          if (token !== transitionToken) return;
          transitionTimer = null;
          reveal(index);
        }, 640);
      });
    }

    function updateFromScroll() {
      if (!scene || !isCinematicMode()) return;
      var rect = scene.getBoundingClientRect();
      var distance = Math.max(scene.offsetHeight - window.innerHeight, 1);
      var progress = clamp(-rect.top / distance, 0, 1);
      var index = Math.min(Math.floor(progress * states.length), states.length - 1);
      goTo(index, false);
    }

    function scrollToIndex(index) {
      if (!scene || !states.length) return;
      index = clamp(Math.round(index), 0, states.length - 1);

      if (!isCinematicMode()) {
        states[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        return;
      }

      var sceneTop = scene.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      var distance = Math.max(scene.offsetHeight - window.innerHeight, 1);
      var progress = states.length > 1 ? (index + .5) / states.length : 0;
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
      scrollToIndex: scrollToIndex,
      settle: function () { reveal(activeIndex); }
    };
  }

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

  var controllersReady = Boolean(
    servicesController && servicesController.scene && servicesController.states.length &&
    processController && processController.scene && processController.states.length
  );

  function shouldUseCinematicMode() {
    return controllersReady && !reduceMotion && window.innerWidth > 1024 && window.innerHeight >= 720;
  }

  function syncPresentationMode() {
    var useCinematic = shouldUseCinematicMode();
    var modeChanged = presentationMode !== null && presentationMode !== useCinematic;
    presentationMode = useCinematic;
    root.classList.toggle('cinematic-ready', useCinematic);

    if (!useCinematic) {
      if (hero) hero.classList.remove('is-handoff', 'is-exiting');
      servicesController.settle();
      processController.settle();
      setupNaturalReveals();
    }

    return modeChanged;
  }

  function updateHero() {
    if (!hero || !isCinematicMode()) return;
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
    if (naturalRevealsInitialized || isCinematicMode()) return;
    naturalRevealsInitialized = true;
    var revealItems = toArray(document.querySelectorAll('.service-state, .process-state'));
    if (!revealItems.length) return;

    revealItems.forEach(function (item) { item.classList.add('natural-reveal'); });

    if (reduceMotion || !('IntersectionObserver' in window)) {
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

  function setupEditorialReveals() {
    if (editorialRevealsInitialized) return;
    editorialRevealsInitialized = true;
    var revealItems = toArray(document.querySelectorAll('.situation-point, .situation-outcome'));
    if (!revealItems.length) return;

    revealItems.forEach(function (item) { item.classList.add('editorial-reveal'); });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) { item.classList.add('is-revealed'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .16, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach(function (item) { observer.observe(item); });
  }

  toArray(document.querySelectorAll('[data-scroll-to-form]')).forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href') || '';
      var targetId = href.charAt(0) === '#' ? href.slice(1) : '';
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target, '#' + targetId);
    });
  });

  window.addEventListener('wheel', function () {
    if (ctaScrollFrame !== null) return;
    hashAnchorActive = false;
    hashCorrectionToken += 1;
  }, { passive: true });

  window.addEventListener('touchstart', function () {
    if (ctaScrollFrame !== null) return;
    hashAnchorActive = false;
    hashCorrectionToken += 1;
  }, { passive: true });

  window.addEventListener('keydown', function (event) {
    if (!/^(Escape|PageUp|PageDown|Home|End|ArrowUp|ArrowDown| )$/.test(event.key)) return;
    hashAnchorActive = false;
    hashCorrectionToken += 1;
    if (ctaScrollFrame !== null) stopCtaScroll();
  });

  window.addEventListener('hashchange', function () {
    hashAnchorActive = Boolean(hashTarget());
    scheduleHashCorrection();
  });

  window.addEventListener('scroll', requestMotionUpdate, { passive: true });
  window.addEventListener('resize', function () {
    var modeChanged = syncPresentationMode();
    if (modeChanged && hashAnchorActive && window.location.hash) scheduleHashCorrection();
    requestMotionUpdate();
  });

  if (motionQuery && motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (event) {
      reduceMotion = event.matches;
      root.classList.toggle('reduced-motion', reduceMotion);
      syncPresentationMode();
      if (reduceMotion) {
        toArray(document.querySelectorAll('.natural-reveal, .editorial-reveal')).forEach(function (item) { item.classList.add('is-revealed'); });
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
    if (reviewParams.has('service')) servicesController.goTo(Number(reviewParams.get('service')), true);
    if (reviewParams.has('process')) processController.goTo(Number(reviewParams.get('process')), true);
    window.requestAnimationFrame(function () {
      var reviewTarget = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      if (!reviewTarget) return;
      var reviewTop = reviewTarget.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
      window.scrollTo({ top: reviewTop, behavior: 'instant' });
    });
  }

  if (controllersReady) root.classList.add('motion-ready');
  syncPresentationMode();
  setupEditorialReveals();
  setupNaturalReveals();

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      root.classList.add('is-ready');
      updateMotion();
      if (!localReviewMode && window.location.hash) {
        hashAnchorActive = true;
        scheduleHashCorrection();
      }
    });
  });

  window.__srgShortFunnel = {
    services: servicesController,
    process: processController,
    update: updateMotion
  };
}());

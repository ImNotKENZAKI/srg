(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  root.classList.replace('no-js', 'js');
  const select = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const hero = select('.hero');
  const heroContent = select('.hero-content');
  const ledger = select('.ledger');
  const filmRail = select('[data-film-rail]');
  const audience = select('.audience');
  const propertyWorld = select('.property-world');
  const guidance = select('.guidance');
  const review = select('#private-review');
  const reviewGrid = select('.review-grid');
  const header = select('[data-header]');
  const motionButton = select('[data-motion-toggle]');
  const heroBottom = select('.hero-bottom');
  const progressBar = select('[data-page-progress]');
  const reviewDock = select('[data-review-dock]');
  const ledgerPanels = all('[data-ledger-panel]');
  const ledgerButtons = all('[data-ledger-jump]');
  const servicePanels = all('[data-service-panel]');
  const serviceButtons = all('[data-service-jump]');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const tallViewport = matchMedia('(min-height: 701px)');
  const desktopViewport = matchMedia('(min-width: 900px) and (min-height: 701px)');
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smooth = (from, to, value) => {
    const progress = clamp((value - from) / (to - from));
    return progress * progress * (3 - 2 * progress);
  };
  let preference = null;
  try { preference = localStorage.getItem('srg-str-reduce-motion'); } catch (_) { /* Motion does not require storage. */ }
  let reduced = preference === null ? systemMotion.matches : preference === 'true';
  let frameId = 0;
  let lastTime = 0;
  let ledgerIndex = -1;
  let serviceIndex = -1;
  let entry = null;
  let entryPlayed = false;
  let touchOrigin = null;
  let openingListenersOn = false;
  let needsMeasure = true;
  let lastWidth = innerWidth;
  let geometry = {};
  const previousActive = {hero:false, ledger:false, service:false, world:false};
  const styleValues = new WeakMap();
  const current = {hero: 0, ledger: 0, service: 0, world: 0};
  // Read layout once after resize/content changes, before any frame's style writes.
  function measure() {
    const y = scrollY;
    const box = element => { const bounds = element.getBoundingClientRect(); return {top:bounds.top + y, height:element.offsetHeight}; };
    geometry = {hero:box(hero), ledger:box(ledger), service:box(guidance), world:box(propertyWorld), audience:box(audience), review:box(review), reviewGrid:box(reviewGrid), panels:servicePanels.map(box), travel:filmRail.scrollWidth - ledger.clientWidth, documentHeight:root.scrollHeight};
    if (entry) entry.to = geometry.ledger.top;
    needsMeasure = false;
  }
  const sceneProgress = (box, y, viewport) => clamp((y - box.top) / Math.max(1, box.height - viewport));
  const style = (element, property, value) => {
    let values = styleValues.get(element);
    if (!values) { values = new Map(); styleValues.set(element, values); }
    if (values.get(property) !== value) { element.style.setProperty(property, value); values.set(property, value); }
  };
  const clearStyle = (element, property) => {
    if (styleValues.get(element)?.has(property)) { element.style.removeProperty(property); styleValues.get(element).delete(property); }
  };

  function setActive(panels, buttons, index, pinned) {
    panels.forEach((panel, number) => {
      panel.classList.toggle('is-active', number === index);
      if (pinned) panel.setAttribute('aria-hidden', String(number !== index));
      else panel.removeAttribute('aria-hidden');
    });
    buttons.forEach((button, number) => {
      button.classList.toggle('is-active', number === index);
      button.setAttribute('aria-pressed', String(number === index));
    });
  }

  function cancelEntry() {
    entry = null;
    body.classList.remove('is-entering');
    if (entryPlayed || reduced) setOpeningListeners(false);
  }

  function startEntry() {
    if (reduced || entryPlayed || !tallViewport.matches || scrollY > 35) return false;
    entryPlayed = true;
    entry = {start: performance.now(), from: scrollY, to: ledger.offsetTop, duration: 2700};
    body.classList.add('is-entering');
    requestFrame();
    return true;
  }

  function render(time, immediate = false) {
    frameId = 0;
    if (document.hidden) return;
    if (entry) {
      const progress = clamp((time - entry.start) / entry.duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      scrollTo({top: entry.from + (entry.to - entry.from) * eased, behavior: 'instant'});
      if (progress >= 1) cancelEntry();
    }
    if (needsMeasure) measure();
    const viewport = innerHeight;
    const y = scrollY;
    if (!entry && !entryPlayed && y > 35) { entryPlayed = true; setOpeningListeners(false); }
    const delta = Math.min(50, Math.max(1, time - (lastTime || time - 16.67)));
    lastTime = time;
    const blend = immediate || reduced ? 1 : 1 - Math.exp(-delta / 85);
    const filmPinned = body.classList.contains('has-film-pin');
    const servicePinned = body.classList.contains('has-service-pin');
    const near = box => y + viewport * 1.5 >= box.top && y - viewport * .5 <= box.top + box.height;
    const active = {hero:near(geometry.hero), ledger:near(geometry.ledger), service:near(geometry.service), world:near(geometry.world)};
    const draw = {};
    const target = {
      hero:reduced || !tallViewport.matches ? 0 : sceneProgress(geometry.hero, y, viewport),
      ledger:reduced || !filmPinned ? 0 : sceneProgress(geometry.ledger, y, viewport),
      service:reduced || !servicePinned ? 0 : sceneProgress(geometry.service, y, viewport),
      world:reduced ? .5 : clamp((y + viewport - geometry.world.top) / (viewport + geometry.world.height))
    };
    let unsettled = false;
    for (const key of Object.keys(current)) {
      draw[key] = immediate || active[key] || previousActive[key];
      current[key] = active[key] ? current[key] + (target[key] - current[key]) * blend : target[key];
      if (active[key] && Math.abs(target[key] - current[key]) > .00008) unsettled = true;
      else current[key] = target[key];
      previousActive[key] = active[key];
    }
    hero.classList.toggle('is-motion-active', !reduced && active.hero);
    ledger.classList.toggle('is-motion-active', !reduced && active.ledger);
    guidance.classList.toggle('is-motion-active', !reduced && active.service);
    audience.classList.toggle('is-motion-active', !reduced && active.world);

    if (draw.hero) {
      const portal = smooth(.19, .86, current.hero);
      const heroCopy = 1 - smooth(.04, .35, current.hero);
      style(hero, '--hero-p', current.hero.toFixed(5));
      style(hero, '--portal', portal.toFixed(5));
      style(hero, '--hero-copy', heroCopy.toFixed(5));
      style(hero, '--portal-copy', smooth(.53, .88, current.hero).toFixed(5));
      style(hero, '--camera', (1.025 + current.hero * .37).toFixed(5));
      style(hero, '--camera-x', `${(-current.hero * innerWidth * .045).toFixed(2)}px`);
      style(hero, '--camera-y', `${(-current.hero * viewport * .025).toFixed(2)}px`);
      if (heroContent.inert !== (heroCopy < .12)) heroContent.inert = heroCopy < .12;
      if (heroBottom.inert !== (heroCopy < .12)) heroBottom.inert = heroCopy < .12;
    }
    if (draw.ledger) {
      if (filmPinned) {
        style(filmRail, 'transform', `translate3d(${(-geometry.travel * current.ledger).toFixed(2)}px,0,0)`);
        style(ledger, '--curtain-x', `${(current.ledger * 100).toFixed(2)}px`);
      } else clearStyle(filmRail, 'transform');
      ledgerPanels.forEach((panel,index) => {
        const ready = !filmPinned || Math.abs(current.ledger * 2 - index) <= 1.01;
        panel.classList.toggle('is-scene-ready', ready);
        if (ready && filmPinned) style(panel, '--image-pan', `${clamp((current.ledger * 2 - index) * -80, -90, 90).toFixed(2)}px`);
      });
      const index = filmPinned ? Math.round(current.ledger * 2) : 0;
      if (index !== ledgerIndex) { ledgerIndex = index; setActive(ledgerPanels, ledgerButtons, index, filmPinned); }
    }
    if (draw.service) {
      if (servicePinned) {
        const position = current.service * 4;
        const index = Math.min(3, Math.floor(position));
        const phase = position - index;
        const wipe = index < 3 ? smooth(.54, .98, phase) : 0;
        servicePanels.forEach((panel,number) => {
          const ready = number === index || number === index + 1;
          panel.classList.toggle('is-scene-ready', ready);
          if (ready) {
            const left = number <= index ? 0 : (1 - wipe) * 100;
            style(panel, '--wipe', `${left.toFixed(3)}%`);
            style(panel, '--photo-pan', `${((clamp(position - number, 0, 1) - .5) * -65).toFixed(2)}px`);
            style(panel, '--photo-scale', (1.11 + clamp(position - number) * .04).toFixed(4));
          }
        });
        style(guidance, '--shutter-x', `${((1 - wipe) * 100).toFixed(3)}%`);
        style(guidance, '--shutter-opacity', wipe > .01 && wipe < .99 ? '1' : '0');
        if (index !== serviceIndex) { serviceIndex = index; setActive(servicePanels, serviceButtons, index, true); }
      } else {
        servicePanels.forEach((panel,index) => {
          const box = geometry.panels[index];
          const progress = clamp((y + viewport - box.top) / (viewport + box.height));
          panel.classList.add('is-scene-ready');
          style(panel, '--wipe', '0%');
          style(panel, '--photo-pan', reduced ? '0px' : `${((progress - .5) * -90).toFixed(2)}px`);
          style(panel, '--photo-scale', reduced ? '1' : '1.1');
        });
        if (serviceIndex !== 0) { serviceIndex = 0; setActive(servicePanels, serviceButtons, 0, false); }
      }
    }
    if (draw.world) {
      const mobile = innerWidth <= 700;
      style(audience, '--model-x', `${((.5 - current.world) * (mobile ? 130 : 340)).toFixed(2)}px`);
      style(audience, '--model-rotation', `${((current.world - .5) * 6).toFixed(3)}deg`);
      style(audience, '--model-scale', (1 + (current.world - .5) * .14).toFixed(4));
      style(audience, '--type-x', `${(-current.world * innerWidth * .35).toFixed(2)}px`);
    }
    const lightHeader = (geometry.audience.top <= y + 85 && geometry.audience.top + geometry.audience.height > y + 85) || geometry.reviewGrid.top <= y + 85;
    header.classList.toggle('is-light', lightHeader);
    header.classList.toggle('is-scrolled', y > 60);
    style(progressBar, 'transform', `scaleX(${clamp(y / Math.max(1, geometry.documentHeight - viewport))})`);
    reviewDock.classList.toggle('is-visible', y > geometry.hero.height * .45 && geometry.review.top - y > viewport * .9);
    if (entry || unsettled) requestFrame();
  }

  function requestFrame() {
    if (!frameId && !document.hidden) frameId = requestAnimationFrame(render);
  }

  function applyMotion() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    cancelEntry();
    root.classList.toggle('reduced-motion', reduced);
    body.classList.toggle('cinematic', !reduced);
    body.classList.toggle('motion-paused', reduced);
    body.classList.toggle('has-hero-pin', !reduced && tallViewport.matches);
    body.classList.toggle('has-film-pin', !reduced && tallViewport.matches);
    body.classList.toggle('has-service-pin', !reduced && desktopViewport.matches);
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.setAttribute('aria-label', reduced ? 'Enable cinematic motion' : 'Reduce motion');
    select('[data-motion-label]').textContent = reduced ? 'Enable motion' : 'Reduce motion';
    ledgerIndex = -1;
    serviceIndex = -1;
    setActive(ledgerPanels, ledgerButtons, 0, !reduced && tallViewport.matches);
    setActive(servicePanels, serviceButtons, 0, !reduced && desktopViewport.matches);
    needsMeasure = true;
    render(performance.now(), true);
    setOpeningListeners(!reduced && tallViewport.matches && !entryPlayed);
  }

  motionButton.addEventListener('click', () => {
    const chapters = all('.chapter');
    const chapter = chapters.find(element => element.getBoundingClientRect().bottom > innerHeight * .35) || hero;
    const offset = chapter.getBoundingClientRect().top;
    reduced = !reduced;
    try { localStorage.setItem('srg-str-reduce-motion', String(reduced)); } catch (_) { /* Preference remains usable for this visit. */ }
    applyMotion();
    scrollTo({top: Math.max(0, chapter.offsetTop - Math.max(0, offset)), behavior:'instant'});
    requestFrame();
  });
  systemMotion.addEventListener('change', event => {
    let saved = null;
    try { saved = localStorage.getItem('srg-str-reduce-motion'); } catch (_) { /* Use system preference if storage is unavailable. */ }
    if (saved === null) { reduced = event.matches; applyMotion(); }
  });
  tallViewport.addEventListener('change', applyMotion);
  desktopViewport.addEventListener('change', applyMotion);

  ledgerButtons.forEach((button, index) => button.addEventListener('click', () => {
    cancelEntry();
    const top = body.classList.contains('has-film-pin') ? ledger.offsetTop + (ledger.offsetHeight - innerHeight) * (index / 2) : ledgerPanels[index].offsetTop + ledger.offsetTop;
    scrollTo({top, behavior: reduced ? 'instant' : 'smooth'});
  }));
  serviceButtons.forEach((button, index) => button.addEventListener('click', () => {
    cancelEntry();
    const top = guidance.offsetTop + (guidance.offsetHeight - innerHeight) * ((index + .22) / 4);
    scrollTo({top, behavior:'smooth'});
  }));
  all('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    entryPlayed = true;
    cancelEntry();
    if (link.getAttribute('href') === '#private-review') {
      event.preventDefault();
      select('#review-title').focus({preventScroll:true});
      review.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block:'start'});
      try { history.replaceState(null, '', '#private-review'); } catch (_) { /* File previews may restrict history. */ }
    }
  }));

  const interactive = target => target instanceof Element && target.closest('a,button,input,select,textarea,[contenteditable="true"]');
  function onOpeningWheel(event) {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (entry) {
      if (event.deltaY < -2) cancelEntry();
      else if (event.cancelable) event.preventDefault();
      return;
    }
    if (event.deltaY > 8 && !interactive(event.target) && startEntry() && event.cancelable) event.preventDefault();
  }
  function onOpeningKey(event) {
    if (['Escape','ArrowUp','PageUp','Home'].includes(event.key)) { cancelEntry(); return; }
    if (!interactive(event.target) && ['ArrowDown','PageDown',' '].includes(event.key) && startEntry()) event.preventDefault();
  }
  function onOpeningTouchStart(event) {
    touchOrigin = event.touches.length === 1 && !interactive(event.target) ? {start:event.touches[0].clientY, last:event.touches[0].clientY} : null;
  }
  function onOpeningTouchMove(event) {
    if (touchOrigin === null || event.touches.length !== 1) return;
    const position = event.touches[0].clientY;
    const distance = touchOrigin.start - position;
    const reversal = position - touchOrigin.last;
    touchOrigin.last = position;
    if (entry) {
      if (reversal > 6) cancelEntry();
      else if (event.cancelable) event.preventDefault();
    } else if (distance > 24 && startEntry() && event.cancelable) event.preventDefault();
  }
  function onOpeningTouchEnd() { touchOrigin = null; }
  function setOpeningListeners(enabled) {
    if (enabled === openingListenersOn) return;
    openingListenersOn = enabled;
    const method = enabled ? 'addEventListener' : 'removeEventListener';
    window[method]('wheel', onOpeningWheel, {passive:false});
    window[method]('keydown', onOpeningKey);
    window[method]('touchstart', onOpeningTouchStart, {passive:true});
    window[method]('touchmove', onOpeningTouchMove, {passive:false});
    window[method]('touchend', onOpeningTouchEnd, {passive:true});
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(item => {
      if (item.isIntersecting) { item.target.classList.add('is-revealed'); observer.unobserve(item.target); }
    }), {threshold:.1, rootMargin:'0px 0px -30px 0px'});
    all('[data-reveal]').forEach(element => { element.classList.add('reveal-ready'); observer.observe(element); });
  }
  document.addEventListener('focusin', event => event.target.closest('[data-reveal]')?.classList.add('is-revealed'));
  window.addEventListener('scroll', requestFrame, {passive:true});
  window.addEventListener('resize', () => { if (innerWidth !== lastWidth) cancelEntry(); lastWidth = innerWidth; needsMeasure = true; requestFrame(); }, {passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(() => { needsMeasure = true; requestFrame(); }).observe(body);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelEntry(); else requestFrame(); });
  window.addEventListener('pageshow', () => { needsMeasure = true; lastTime = 0; requestFrame(); });
  if (document.fonts) document.fonts.ready.then(() => { needsMeasure = true; requestFrame(); });
  applyMotion();
})();

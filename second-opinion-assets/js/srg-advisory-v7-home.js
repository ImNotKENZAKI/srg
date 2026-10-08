/* The statistic keeps its original independent ten-second controller. */
(() => {
  'use strict';
  const section = document.querySelector('[data-home-mode]');
  const panel = section.querySelector('.home-panel');
  const copy = section.querySelector('.home-copy');
  const art = section.querySelector('.home-art');
  const details = [...section.querySelectorAll('.perspective-review-line')];
  const detailRules = details.map(detail => detail.querySelector('i'));
  const reviewRule = section.querySelector('.perspective-rule i');
  const progressLine = section.querySelector('.home-progress i');
  const header = document.querySelector('.site-header');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let ready = false, paused = false, savedProgress = 0, pausedInside = false;
  let geometry = {start:0,travel:1};
  let frame = 0, last = -1;
  const initialHash = location.hash;
  let initiallyAligned = false;
  const clamp = n => Math.max(0,Math.min(1,n));
  const ease = n => {n=clamp(n); return n*n*(3-2*n);};

  function render() {
    frame = 0;
    if(!ready || paused || media.matches || section.dataset.homeMode !== 'pinned') return;
    const raw = (scrollY-geometry.start)/geometry.travel;
    const p = clamp(raw);
    const pin = raw > 1.001 ? 'released' : raw < -.001 ? 'before' : 'holding';
    if(section.dataset.homePin !== pin) section.dataset.homePin = pin;
    if(Math.abs(p-last)<.00001) return;
    last=p; savedProgress=p;
    const review=ease(p);
    // Trace the three review areas while the reading surface stays still.
    detailRules.forEach((rule,index)=>{
      const reveal=ease((p-index*.18)/.60);
      rule.style.transform=`scaleX(${(.15+.85*reveal).toFixed(4)})`;
    });
    reviewRule.style.transform=`scaleX(${(.16+.84*review).toFixed(4)})`;
    progressLine.style.transform=`scaleX(${p})`;
    section.dataset.homeProgress=p.toFixed(5);
    const phase=p<1?'review':'complete';
    if(section.dataset.homePhase!==phase)section.dataset.homePhase=phase;
  }
  const queue=()=>{if(!ready||paused||media.matches||section.dataset.homeMode!=='pinned')return;const p=(scrollY-geometry.start)/geometry.travel;if((p<0&&last===0)||(p>1&&last===1))return;if(!frame)frame=requestAnimationFrame(render);};
  function alignInitialAnchor() {
    const gallery=document.querySelector('.industry-story'),review=document.querySelector('.review-story');
    if(initiallyAligned || document.readyState!=='complete' || !section.hasAttribute('data-home-ready') || !document.querySelector('.service-story').hasAttribute('data-ready') || (gallery && !gallery.hasAttribute('data-gallery-ready')) || (review && !review.hasAttribute('data-review-ready'))) return;
    initiallyAligned=true;
    if(!initialHash || initialHash==='#top' || location.hash!==initialHash) return;
    const id=initialHash.slice(1), target=document.getElementById(id);
    if(!target)return;
    if(id==='service-overview' || target.classList.contains('overview-card')) {
      document.dispatchEvent(new CustomEvent('srg:v7initialanchor',{detail:{id}}));
    } else target.scrollIntoView({block:'start',behavior:'instant'});
  }
  let anchorFrame=0;
  function queueInitialAnchor(){
    if(anchorFrame)return;
    anchorFrame=requestAnimationFrame(()=>{anchorFrame=requestAnimationFrame(()=>{anchorFrame=0;alignInitialAnchor();});});
  }
  document.addEventListener('srg:v7ready',queueInitialAnchor);
  window.addEventListener('load',queueInitialAnchor,{once:true});
  function clearMotion() {
    [...detailRules,reviewRule,progressLine].forEach(e=>e.removeAttribute('style'));
    section.dataset.homePin='normal-flow'; section.dataset.homePhase='complete'; last=-1;
  }
  function measure({restore=false}={}) {
    const oldProgress=savedProgress;
    const available=innerHeight-header.offsetHeight;
    document.documentElement.style.setProperty('--home-height',available+'px');
    section.dataset.homeMode='flow';
    const styles=getComputedStyle(panel);
    const paddingTop=parseFloat(styles.paddingTop), paddingBottom=parseFloat(styles.paddingBottom);
    // The desktop portrait follows the copy height. Measuring its absolute
    // container would feed the previous panel height back into the layout.
    const natural=copy.offsetHeight+paddingTop+paddingBottom;
    if(ready && !paused && !media.matches && innerWidth>900 && available>=natural+4) {
      // Fill the visible scene with the borderless portrait; content still
      // decides whether this scene can pin safely on a smaller display.
      const fitted=available;
      document.documentElement.style.setProperty('--home-height',fitted+'px');
      section.dataset.homeFitHeight=String(fitted);
      section.dataset.homeMode='pinned';
      section.dataset.homeFallback='';
      geometry={start:section.getBoundingClientRect().top+scrollY-header.offsetHeight,travel:section.offsetHeight-panel.offsetHeight};
    } else {
      section.dataset.homeFallback=paused?'paused':media.matches?'reduced-motion':!ready?'images-loading':innerWidth<=900?'small-screen':'content-needs-space';
      geometry={start:section.getBoundingClientRect().top+scrollY-header.offsetHeight,travel:Math.max(1,section.offsetHeight-header.offsetHeight)};
      clearMotion();document.dispatchEvent(new CustomEvent('srg:v7layout'));return;
    }
    last=-1;
    if(restore) window.scrollTo({top:geometry.start+oldProgress*geometry.travel,behavior:'instant'});
    queue();
    document.dispatchEvent(new CustomEvent('srg:v7layout'));
  }
  document.addEventListener('srg:motionchange',event=> {
    const next=Boolean(event.detail&&event.detail.paused);
    const rect=section.getBoundingClientRect();
    if(next&&!paused) pausedInside=rect.top<=header.offsetHeight+1&&rect.bottom>header.offsetHeight;
    if(next&&!paused) document.dispatchEvent(new CustomEvent('srg:v7willpause'));
    paused=next;
    measure({restore:!paused&&pausedInside});
    if(!paused)pausedInside=false;
  });
  let resize=0;
  window.addEventListener('resize',()=>{cancelAnimationFrame(resize);resize=requestAnimationFrame(()=>measure());},{passive:true});
  window.addEventListener('scroll',queue,{passive:true});
  media.addEventListener('change',()=>measure());
  Promise.allSettled([...section.querySelectorAll('img')].map(image=>image.decode()).concat(document.fonts.ready)).then(results=>{
    ready=results.every(result=>result.status==='fulfilled');
    paused=document.documentElement.classList.contains('motion-paused');
    measure();
    section.dataset.homeReady=String(ready);
    // Both preceding chapters must finish measuring before a direct intake anchor is restored.
    queueInitialAnchor();
  });
})();

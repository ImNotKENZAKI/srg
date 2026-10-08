/* CSS handles the motion. Visibility and the existing pause control gate it. */
(() => {
 'use strict';
 const page=document.querySelector('.v7-page'),closing=page.querySelector('.closing');
 const media=matchMedia('(prefers-reduced-motion:reduce)');
 function sync(){page.dataset.ambientMotion=!document.hidden&&!media.matches&&!document.documentElement.classList.contains('motion-paused')?'running':'paused';}
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  entry.target.dataset[entry.target===closing?'motionInView':'ambientInView']=String(entry.isIntersecting);
 }),{threshold:0});
 [closing,...page.querySelectorAll('.perspective-dossier,.leon-signature picture,.heather-core,.review-advisor picture,.service-symbol')].forEach(host=>observer.observe(host));
 document.addEventListener('visibilitychange',sync);
 document.addEventListener('srg:motionchange',sync);
 media.addEventListener('change',sync);
 sync();
})();

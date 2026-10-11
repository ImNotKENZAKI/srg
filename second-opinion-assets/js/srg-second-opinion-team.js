/* Keep the aggressive service band at a readable, constant pixel speed. */
(() => {
 'use strict';
 const page=document.querySelector('.srg-team-revision');
 if(!page)return;
 const ribbon=page.querySelector('.service-ribbon'),set=ribbon.querySelector('[data-ribbon-set]');
 let frame=0;
 function measure(){
  frame=0;
  if(document.documentElement.classList.contains('motion-paused')||ribbon.contains(document.activeElement))return;
  const width=set.getBoundingClientRect().width;
  if(!width)return;
  const speed=innerWidth<=600?42:56;
  ribbon.style.setProperty('--srg-ribbon-duration',(width/speed).toFixed(4)+'s');
  ribbon.dataset.ribbonPixelsPerSecond=String(speed);
 }
 function queue(){if(!frame)frame=requestAnimationFrame(measure);}
 document.fonts.load('400 32px "SRGImpact"').then(()=>document.fonts.ready).then(()=>{
  measure();ribbon.dataset.ribbonReady='true';
  new ResizeObserver(queue).observe(set);
 });
 window.addEventListener('resize',queue,{passive:true});
 document.fonts.addEventListener('loadingdone',queue);
 document.addEventListener('srg:motionchange',queue);
 ribbon.addEventListener('focusout',queue);
})();

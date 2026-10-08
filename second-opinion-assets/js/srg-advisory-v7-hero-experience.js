/* One entrance, then CSS motion gated by visibility and the shared pause state. */
(() => {
 'use strict';
 const section=document.querySelector('.home-story');
 if(!section)return;
 const button=section.querySelector('.hero-cta'),toggle=section.querySelector('.hero-motion-toggle');
 const sharedToggle=document.querySelector('[data-motion-toggle]');
 const media=matchMedia('(prefers-reduced-motion:reduce)');
 let inView=false,entered=false,animations=[];
 const stopped=()=>document.hidden||media.matches||document.documentElement.classList.contains('motion-paused');
 function finishEntrance(){animations.forEach(a=>a.cancel());animations=[];section.dataset.heroEntrance='complete';}
 function dismissEntrance(){entered=true;finishEntrance();}
 function enter(){
  if(entered||!inView||stopped())return;
  entered=true;
  if(typeof section.animate!=='function'){section.dataset.heroEntrance='complete';return;}
  section.dataset.heroEntrance='playing';
  const steps=[['.home-eyebrow',0,6],['h1',40,14],['.home-intro',100,10],['.hero-cta',150,10],['.home-trust',190,6],['.home-process',210,6],['.home-person-caption',100,8],['.perspective-dossier-heading',180,6],['.perspective-review-path',230,6]];
  animations=steps.map(([selector,delay,y])=>{
   const host=section.querySelector(selector);
   return host.animate([{opacity:.45,transform:`translate3d(0,${y}px,0)`},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:620,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'});
  });
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(section.dataset.heroEntrance==='playing')finishEntrance();});
 }
 function sync(){
  const paused=document.documentElement.classList.contains('motion-paused');
  section.dataset.heroRunning=String(inView&&!stopped());
  toggle.hidden=media.matches||!sharedToggle;
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.setAttribute('aria-label',paused?'Resume motion':'Pause motion');
  toggle.querySelector('[data-hero-motion-label]').textContent=paused?'Resume motion':'Pause motion';
  toggle.querySelector('[data-hero-motion-mark]').textContent=paused?'▷':'Ⅱ';
  if(stopped()||!inView)finishEntrance();else enter();
 }
 toggle.addEventListener('click',()=>sharedToggle?.click());
 section.addEventListener('focusin',dismissEntrance);
 section.addEventListener('pointerdown',dismissEntrance,{passive:true});
 window.addEventListener('scroll',()=>{if(animations.length)dismissEntrance();},{passive:true});
 window.addEventListener('wheel',event=>{if((inView||section.contains(event.target))&&Math.abs(event.deltaY)>=2)dismissEntrance();},{passive:true});
 window.addEventListener('keydown',event=>{if((inView||(!entered&&scrollY===0))&&['PageDown','PageUp','ArrowDown','ArrowUp',' ','Home','End'].includes(event.key))dismissEntrance();});
 document.addEventListener('visibilitychange',sync);
 document.addEventListener('srg:motionchange',sync);
 media.addEventListener('change',sync);
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.target===section)inView=entry.isIntersecting;
   else entry.target.dataset.heroVisible=String(entry.isIntersecting);
  });
  sync();
 },{threshold:0});
 observer.observe(section);observer.observe(button);
 observer.observe(section.querySelector('.hero-light-surface'));
 sync();
})();

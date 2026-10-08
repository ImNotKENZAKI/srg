/* One desktop wheel gesture advances one fitted chapter stage. Native scrolling
 * stays available outside chapters, on touch, and for keyboard/scrollbar access. */
(()=>{
 'use strict';
 const root=document.documentElement,header=document.querySelector('.site-header'),motion=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(pointer:fine)'),toggle=document.querySelector('[data-motion-toggle]');
 const specs=[
  {selector:'.home-story',panel:'.home-panel',mode:'homeMode',value:'pinned',stops:[0,1]},
  {selector:'.service-story',panel:'.story-panel',mode:'mode',value:'animated',stops:[0,1/3,2/3,1]},
  {selector:'.industry-story',panel:'.industry-panel',mode:'galleryMode',value:'animated',stops:[0,1]}
 ].map(spec=>({...spec,section:document.querySelector(spec.selector)}));
 let paused=false,animation=0,busy=false,lastWheel=-Infinity,gestureUntil=0,lastDirection=0,movingDirection=0;
 function cancel(){cancelAnimationFrame(animation);animation=0;busy=false;movingDirection=0;root.removeAttribute('data-stage-scrolling');}
 function cancelIntent(){cancel();lastWheel=-Infinity;gestureUntil=0;lastDirection=0;}
 function move(top){
  cancel();const from=scrollY,distance=top-from,started=performance.now(),duration=520;
  if(Math.abs(distance)<1)return;
  busy=true;movingDirection=Math.sign(distance);root.dataset.stageScrolling='true';
  function tick(now){const t=Math.min(1,(now-started)/duration),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo({top:from+distance*e,behavior:'instant'});if(t<1)animation=requestAnimationFrame(tick);else{animation=0;busy=false;movingDirection=0;root.removeAttribute('data-stage-scrolling');}}
  animation=requestAnimationFrame(tick);
 }
 function stage(direction,distance=innerHeight*.85){
  const h=header.offsetHeight;
  for(const spec of direction>0?specs:[...specs].reverse()){
   if(spec.section.dataset[spec.mode]!==spec.value)continue;
   const start=spec.section.getBoundingClientRect().top+scrollY-h,travel=spec.section.offsetHeight-spec.section.querySelector(spec.panel).offsetHeight,p=(scrollY-start)/travel;
   if(travel<=0)continue;
   // Browser anchor positions round to CSS pixels. Short fitted travel must
   // not turn a subpixel alignment difference into an extra entry gesture.
   const edgeTolerance=Math.max(.002,1/travel);
   // A large wheel event enters the next chapter at its first reading beat.
   if(direction>0&&p<-edgeTolerance&&start<=scrollY+distance){spec.section.dataset.scrollStage='0';move(start);return true;}
   if(direction<0&&p>1+edgeTolerance&&start+travel>=scrollY-distance){spec.section.dataset.scrollStage=String(spec.stops.length-1);move(start+travel);return true;}
   if(p<-edgeTolerance||p>1+edgeTolerance)continue;
   const next=direction>0?spec.stops.find(stop=>stop>p+.012):[...spec.stops].reverse().find(stop=>stop<p-.012);
   if(next===undefined){
    if(direction>0){
     // A finished scene exits on the next gesture rather than consuming an
     // extra viewport of ordinary wheel travel with no new information.
     const ribbon=spec.section.nextElementSibling?.matches('.service-ribbon')?spec.section.nextElementSibling.offsetHeight:0;
     spec.section.dataset.scrollStage='exit';move(start+travel+spec.section.querySelector(spec.panel).offsetHeight+ribbon);return true;
    }
    continue;
   }
   spec.section.dataset.scrollStage=String(spec.stops.indexOf(next));move(start+travel*next);return true;
  }
  return false;
 }
 function nestedScroller(target){
  if(target.closest('input,textarea,select,iframe,[contenteditable=true]'))return true;
  for(let node=target;node&&node!==document.body;node=node.parentElement)if(node.scrollHeight>node.clientHeight+2&&/auto|scroll/.test(getComputedStyle(node).overflowY))return true;
  return false;
 }
 window.addEventListener('wheel',event=>{
  if(paused||motion.matches||!fine.matches||event.ctrlKey||event.metaKey||event.altKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||Math.abs(event.deltaY)<2||nestedScroller(event.target))return;
  const now=performance.now(),direction=Math.sign(event.deltaY),reversed=(busy&&direction!==movingDirection)||(lastDirection&&direction!==lastDirection);
  // A direction change is a new intent, even while the previous stage is moving.
  if(reversed){cancel();gestureUntil=0;lastWheel=-Infinity;}
  const newGesture=now-lastWheel>180;lastWheel=now;lastDirection=direction;
  // Trackpad momentum belongs to the gesture that already selected a stage.
  if(busy||(!newGesture&&now<gestureUntil)){event.preventDefault();gestureUntil=now+180;return;}
  const distance=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if(stage(direction,distance)){event.preventDefault();gestureUntil=now+520;}
 },{passive:false});
 document.addEventListener('keydown',event=>{
  if(event.key==='Home'||event.key==='End'||event.key==='Escape'){cancelIntent();return;}
  if(paused||motion.matches||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,button,a,[contenteditable=true]'))return;
  const direction=['PageDown','ArrowDown',' '].includes(event.key)?(event.shiftKey?-1:1):['PageUp','ArrowUp'].includes(event.key)?-1:0;
  if(!direction)return;if(busy){if(direction===movingDirection){event.preventDefault();return;}cancelIntent();}if(stage(direction))event.preventDefault();
 });
 document.addEventListener('pointerdown',cancelIntent,{passive:true});
 document.addEventListener('click',event=>{if(event.target.closest('a,button'))cancelIntent();},true);
 window.addEventListener('hashchange',cancelIntent);window.addEventListener('resize',cancelIntent,{passive:true});
 function syncMotion(){cancelIntent();root.classList.toggle('motion-paused',paused||motion.matches);document.dispatchEvent(new CustomEvent('srg:motionchange',{detail:{paused:paused||motion.matches}}));toggle.hidden=motion.matches;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume motion':'Pause motion');toggle.querySelector('[data-motion-label]').textContent=paused?'Resume motion':'Pause motion';toggle.querySelector('svg path').setAttribute('d',paused?'M8 5l11 7-11 7z':'M8 5v14M16 5v14');}
 toggle.addEventListener('click',()=>{paused=!paused;syncMotion();});motion.addEventListener('change',syncMotion);
 document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-visible'));
 const ribbon=document.querySelector('[data-scroll-ribbon]'),track=ribbon.querySelector('.ribbon-track'),set=ribbon.querySelector('[data-ribbon-set]');
 function measureRibbon(){if(root.classList.contains('motion-paused')||ribbon.contains(document.activeElement))return;ribbon.style.removeProperty('--ribbon-set-width');const distance=Math.ceil(set.getBoundingClientRect().width);if(!distance)return;ribbon.style.setProperty('--ribbon-set-width',distance+'px');ribbon.style.setProperty('--ribbon-unit',distance+'px');while(track.children.length<Math.ceil(ribbon.clientWidth/distance)+2){const copy=set.cloneNode(true);copy.removeAttribute('data-ribbon-set');copy.setAttribute('aria-hidden','true');copy.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.appendChild(copy);}}
 new ResizeObserver(measureRibbon).observe(ribbon);document.fonts.ready.then(measureRibbon);ribbon.addEventListener('focusout',measureRibbon);document.addEventListener('srg:motionchange',()=>requestAnimationFrame(measureRibbon));
 const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.dataset.motionInView=String(entry.isIntersecting)),{rootMargin:'100px'});
 specs.forEach(spec=>visibility.observe(spec.section));visibility.observe(ribbon);
 syncMotion();
})();

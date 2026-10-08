/* One lightweight content transition beside a still original portrait. */
(()=>{
 'use strict';
 const section=document.querySelector('.service-story'),panel=section.querySelector('.story-panel'),header=document.querySelector('.site-header');
 const copies=[...section.querySelectorAll('[data-copy]')],reading=section.querySelector('.story-reading'),overview=section.querySelector('.service-overview'),cards=[...section.querySelectorAll('.overview-card')];
 const picker=section.querySelector('.scene-picker'),buttons=[...picker.querySelectorAll('button')],toggle=section.querySelector('.motion-toggle'),line=section.querySelector('.story-progress i'),media=matchMedia('(prefers-reduced-motion:reduce)');
 const stops=[0,1/3,2/3,1],phases=['planning','returns','cfo','resolution','overview'];
 let ready=false,paused=false,pausedInside=false,saved=0,last=-1,frame=0,selected=-1,overviewOpen=false,geometry={start:0,travel:1};
 function render(){
  frame=0;if(section.dataset.mode!=='animated')return;
  const raw=(scrollY-geometry.start)/geometry.travel,p=Math.max(0,Math.min(1,raw));
  if(Math.abs(p-last)<.00001)return;last=p;saved=p;
  section.dataset.pin=raw>1.001?'released':raw<-.001?'before':'holding';section.dataset.progress=p.toFixed(5);
  if(p<.98)overviewOpen=false;
  const position=p*3,index=overviewOpen?4:Math.min(3,Math.round(position));
  if(index!==selected){
   selected=index;section.dataset.phase=phases[index];
   // Keep the transparent surfaces ready for compositing; changing visibility
   // here forced a fresh text raster in the middle of each scroll gesture.
   copies.forEach((copy,i)=>{copy.setAttribute('aria-hidden',String(i!==index));copy.style.visibility='visible';copy.style.opacity='.001';copy.style.transform='';});
   buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
   reading.setAttribute('aria-hidden',String(index===4));overview.setAttribute('aria-hidden',String(index!==4));overview.dataset.visible=String(index===4);overview.style.opacity='.001';
   // Keep reading copy still while its single illustration completes the handoff.
   const target=index<4?copies[index]:overview;target.style.opacity='1';target.style.transform='none';
  }
  line.style.transform=`scaleX(${p})`;
 }
 function queue(){if(section.dataset.mode!=='animated')return;const p=(scrollY-geometry.start)/geometry.travel;if((p<0&&last===0)||(p>1&&last===1))return;if(!frame)frame=requestAnimationFrame(render);}
 function flow(reason){
  section.dataset.mode='static';section.dataset.staticReason=reason;section.dataset.pin='normal-flow';section.dataset.phase='overview';overviewOpen=false;
  [reading,overview,line,...copies,...cards].forEach(e=>e.removeAttribute('style'));overview.removeAttribute('aria-hidden');overview.removeAttribute('data-visible');reading.removeAttribute('aria-hidden');copies.forEach(c=>c.removeAttribute('aria-hidden'));picker.hidden=true;last=-1;selected=-1;
 }
 function measure({restore=false}={}){
  if(paused!==document.documentElement.classList.contains('motion-paused'))return;
  const old=saved,available=innerHeight-header.offsetHeight;document.documentElement.style.setProperty('--panel-height',available+'px');
  if(!ready||media.matches||paused||innerWidth<=900||available<540){flow(!ready?'images-loading':paused?'paused':media.matches?'reduced-motion':'content-needs-space');toggle.hidden=!ready||media.matches;document.dispatchEvent(new CustomEvent('srg:v7serviceslayout'));return;}
  section.dataset.mode='animated';delete section.dataset.staticReason;
  const style=getComputedStyle(panel),heading=section.querySelector('.story-heading'),portrait=section.querySelector('.leon-signature');
  const readingHeight=Math.max(section.querySelector('.service-copy-stack').offsetHeight,overview.offsetHeight,...copies.map(copy=>copy.scrollHeight));
  const backdrop=section.dataset.serviceTreatment==='backdrop';
  const natural=Math.max(heading.offsetHeight+parseFloat(style.rowGap)+readingHeight,backdrop?0:portrait.offsetHeight)+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
  if(natural>available-3||cards.some(card=>card.scrollHeight>card.clientHeight+1)){flow('content-needs-space');toggle.hidden=true;document.dispatchEvent(new CustomEvent('srg:v7serviceslayout'));return;}
  const fitted=backdrop?available:Math.min(available,Math.ceil(natural+4));
  document.documentElement.style.setProperty('--panel-height',fitted+'px');section.dataset.fitHeight=String(fitted);
  toggle.hidden=false;picker.hidden=false;geometry={start:section.getBoundingClientRect().top+scrollY-header.offsetHeight,travel:section.offsetHeight-panel.offsetHeight};last=-1;selected=-1;
  if(restore)scrollTo({top:geometry.start+old*geometry.travel,behavior:'instant'});cancelAnimationFrame(frame);render();document.dispatchEvent(new CustomEvent('srg:v7serviceslayout'));
 }
 function seek(p){if(section.dataset.mode!=='animated')return;scrollTo({top:geometry.start+geometry.travel*p,behavior:'instant'});cancelAnimationFrame(frame);last=-1;render();}
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{overviewOpen=false;seek(stops[i]);}));
 document.querySelectorAll('a[href="#service-overview"]').forEach(a=>a.addEventListener('click',event=>{if(section.dataset.mode!=='animated')return;event.preventDefault();overviewOpen=true;seek(1);document.getElementById('overview-title').focus({preventScroll:true});}));
 // Delegate so dynamically repeated marquee links retain the same destination.
 const ribbon=document.querySelector('[data-scroll-ribbon]');
 // Focus uses a wrapped keyboard layout. Keep pointer-down from moving the
 // link beneath the pointer before click; the destination receives focus.
 ribbon.addEventListener('pointerdown',event=>{if(event.button===0&&event.target.closest('[data-v7-service]'))event.preventDefault();});
 ribbon.addEventListener('click',event=>{
  const link=event.target.closest('[data-v7-service]');if(!link)return;
  const index=Number(link.dataset.v7Service);if(!Number.isInteger(index)||!buttons[index])return;
  event.preventDefault();
  if(section.dataset.mode==='animated'){overviewOpen=false;seek(stops[index]);buttons[index].focus({preventScroll:true});}
  else {cards[index].tabIndex=-1;cards[index].scrollIntoView({block:'start',behavior:'instant'});cards[index].focus({preventScroll:true});}
 });
 document.addEventListener('srg:v7willpause',()=>{const r=section.getBoundingClientRect();pausedInside=r.top<=header.offsetHeight+1&&r.bottom>header.offsetHeight;});
 document.addEventListener('srg:motionchange',event=>{
  const previous=saved;paused=Boolean(event.detail&&event.detail.paused);toggle.setAttribute('aria-pressed',String(paused));toggle.querySelector('[data-motion-label]').textContent=paused?'Resume motion':'Pause motion';toggle.querySelector('.motion-mark').textContent=paused?'▷':'Ⅱ';measure({restore:!paused&&pausedInside});
  if(paused){if(pausedInside)section.scrollIntoView({block:'start',behavior:'instant'});saved=previous;}else pausedInside=false;
 });
 toggle.addEventListener('click',()=>document.querySelector('[data-motion-toggle]').click());
 function followHash(){const id=location.hash.slice(1),target=document.getElementById(id);if(target&&(id==='service-overview'||target.classList.contains('overview-card'))){overviewOpen=true;seek(1);}}
 document.addEventListener('srg:v7initialanchor',event=>{if(section.dataset.mode==='animated'){overviewOpen=true;seek(1);}else document.getElementById(event.detail.id)?.scrollIntoView({block:'start',behavior:'instant'});});window.addEventListener('hashchange',followHash);
 document.addEventListener('srg:v7layout',()=>measure());window.addEventListener('scroll',queue,{passive:true});let resize=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resize);resize=requestAnimationFrame(()=>measure());},{passive:true});media.addEventListener('change',()=>measure());
 Promise.allSettled([...section.querySelectorAll('img')].map(i=>i.decode()).concat(document.fonts.ready)).then(results=>{ready=results.every(r=>r.status==='fulfilled');paused=document.documentElement.classList.contains('motion-paused');measure();section.dataset.ready=String(ready);document.dispatchEvent(new CustomEvent('srg:v7ready'));followHash();});
})();

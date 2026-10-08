/* Business settings assemble beside the original Heather photograph. */
(()=>{
  'use strict';
  const section=document.querySelector('.industry-chapter'),story=section.querySelector('.industry-story'),panel=story.querySelector('.industry-panel');
  const core=story.querySelector('.heather-core'),slot=story.querySelector('.gallery-core-slot'),copy=story.querySelector('.industry-intro-copy');
  const cells=[...story.querySelectorAll('[data-gallery-cell]')],header=document.querySelector('.site-header'),toggle=story.querySelector('.gallery-motion-toggle');
  const coreCaption=core.querySelector('figcaption');
  const cellMotion=cells.map((cell,i)=>({cell,caption:cell.querySelector('figcaption'),delay:[.08,.02,.10,.04,.06,.12,0,.14][i],row:[-1,-1,-.35,-.35,.35,.35,1,1][i],direction:i%2?1:-1,opacity:null,transform:null,captionOpacity:null,hidden:null}));
  const progressLine=story.querySelector('.gallery-progress i'),media=matchMedia('(prefers-reduced-motion: reduce)');
  const backdrop=story.dataset.galleryTreatment==='backdrop';
  let ready=false,paused=false,pausedInside=false,savedProgress=0,frame=0,last=-1,copyHidden=null;
  let geometry={start:0,travel:1,from:{x:0,y:0,w:1,h:1},to:{x:0,y:0,w:1,h:1}};
  const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},range=(p,a,b)=>ease((p-a)/(b-a));
  function render() {
    frame=0;if(story.dataset.galleryMode!=='animated')return;
    const raw=(scrollY-geometry.start)/geometry.travel,p=clamp(raw);
    const pin=raw>1.001?'released':raw<-.001?'before':'holding';
    if(story.dataset.galleryPin!==pin)story.dataset.galleryPin=pin;
    if(Math.abs(p-last)<.00001)return;
    last=p;savedProgress=p;
    if(!backdrop){
      const t=range(p,.05,.70),interpolate=key=>geometry.from[key]+(geometry.to[key]-geometry.from[key])*t;
      // The legacy portrait treatment rasterizes at the opening size, then
      // switches to the slot's natural size to keep the settled photo sharp.
      const settled=t>.9999,raster=settled?'settled':'opening';
      if(core.dataset.galleryRaster!==raster){core.dataset.galleryRaster=raster;core.style.width=(settled?geometry.to.w:geometry.from.w)+'px';core.style.height=(settled?geometry.to.h:geometry.from.h)+'px';}
      const sx=interpolate('w')/(settled?geometry.to.w:geometry.from.w),sy=interpolate('h')/(settled?geometry.to.h:geometry.from.h);
      core.style.transform='translate3d('+interpolate('x').toFixed(2)+'px,'+interpolate('y').toFixed(2)+'px,0) scale('+sx.toFixed(5)+','+sy.toFixed(5)+')';
      const compact=String(interpolate('w')<120);
      if(core.dataset.galleryCompact!==compact)core.dataset.galleryCompact=compact;
    }
    // Keep the introduction readable until the first business settings arrive.
    const disappear=range(p,.20,.46);
    copy.style.opacity=String(1-disappear);copy.style.transform='translateY('+(-26*disappear).toFixed(2)+'px)';
    const hidden=disappear>.999;
    if(hidden!==copyHidden){copyHidden=hidden;copy.style.visibility=hidden?'hidden':'visible';copy.setAttribute('aria-hidden',String(hidden));}
    cellMotion.forEach(state=>{
      // A short, ordered assembly keeps the gallery legible as it opens.
      const v=range(p,.24+state.delay,.66+state.delay);
      const opacity=String(range(v,0,.45)),transform='translate3d('+(state.direction*32*(1-v)).toFixed(2)+'px,'+(state.row*24*(1-v)).toFixed(2)+'px,0) scale('+(0.92+0.08*v).toFixed(5)+')';
      const captionOpacity=String(range(v,.45,.90)),cellHidden=p<.70;
      if(opacity!==state.opacity){state.opacity=opacity;state.cell.style.opacity=opacity;}
      if(transform!==state.transform){state.transform=transform;state.cell.style.transform=transform;}
      if(captionOpacity!==state.captionOpacity){state.captionOpacity=captionOpacity;state.caption.style.opacity=captionOpacity;}
      if(cellHidden!==state.hidden){state.hidden=cellHidden;state.cell.setAttribute('aria-hidden',String(cellHidden));}
    });
    const phase=p<.18?'reading':p<.70?'opening':p<.91?'settling':'gallery';
    if(story.dataset.galleryPhase!==phase)story.dataset.galleryPhase=phase;
    story.dataset.galleryProgress=p.toFixed(5);progressLine.style.transform='scaleX('+p+')';
  }
  function queue(){if(story.dataset.galleryMode!=='animated')return;const p=(scrollY-geometry.start)/geometry.travel;if((p<0&&last===0)||(p>1&&last===1))return;if(!frame)frame=requestAnimationFrame(render);}
  function staticLayout(reason) {
    story.dataset.galleryMode='static';story.dataset.galleryFallback=reason;story.dataset.galleryPin='normal-flow';story.dataset.galleryPhase='gallery';core.dataset.galleryRaster='static';
    [core,coreCaption,copy,progressLine,...cells,...cellMotion.map(state=>state.caption)].forEach(e=>e.removeAttribute('style'));
    copyHidden=null;cellMotion.forEach(state=>{state.opacity=null;state.transform=null;state.captionOpacity=null;state.hidden=null;});
    // Short-screen and paused galleries must retain the whole 4:5 portrait too.
    const cell=slot.getBoundingClientRect(),width=backdrop?cell.width:Math.min(cell.width,cell.height*.8),height=backdrop?cell.height:width/.8;
    if(width>0){core.style.width=width+'px';core.style.height=height+'px';core.style.left=(cell.width-width)/2+'px';core.style.top=(cell.height-height)/2+'px';core.style.translate='none';}
    copy.removeAttribute('aria-hidden');cells.forEach(c=>c.removeAttribute('aria-hidden'));last=-1;
    toggle.hidden=!ready||media.matches;
  }
  function measure({restore=false}={}) {
    // Earlier chapters change height first; wait for this controller's motion event before restoring.
    if(paused!==document.documentElement.classList.contains('motion-paused'))return;
    const oldProgress=savedProgress,available=innerHeight-header.offsetHeight;
    document.documentElement.style.setProperty('--gallery-height',available+'px');
    const minimum=innerWidth<=600?650:innerWidth<=900?690:520;
    if(!ready||paused||media.matches||innerWidth<=600||available<minimum) {staticLayout(!ready?'images-loading':paused?'paused':media.matches?'reduced-motion':innerWidth<=600?'phone-reading-layout':'short-viewport');return;}
    story.dataset.galleryMode='animated';delete story.dataset.galleryFallback;toggle.hidden=false;
    // Static layout centers with inline offsets. Reset those before measuring
    // the animated slot so resize and pause/resume use the same origin.
    core.style.left='0px';core.style.top='0px';core.style.translate='none';
    const heading=story.querySelector('.gallery-heading');
    story.style.setProperty('--gallery-top',(heading.offsetTop+heading.offsetHeight+24)+'px');
    story.style.setProperty('--gallery-copy-top',(heading.offsetTop+heading.offsetHeight+18)+'px');
    const panelRect=panel.getBoundingClientRect(),target=slot.getBoundingClientRect();
    if(backdrop) {
      // The portrait remains a sharp, stationary backdrop. Only the foreground
      // business settings assemble; no photograph is scaled on every frame.
      const pose={x:0,y:0,w:target.width,h:target.height};
      geometry={start:story.getBoundingClientRect().top+scrollY-header.offsetHeight,travel:story.offsetHeight-panel.offsetHeight,from:pose,to:pose};
      core.style.width=pose.w+'px';core.style.height=pose.h+'px';core.style.transform='none';core.dataset.galleryRaster='settled';core.dataset.galleryCompact='false';
      last=-1;if(restore)scrollTo({top:geometry.start+oldProgress*geometry.travel,behavior:'instant'});
      cancelAnimationFrame(frame);render();return;
    }
    const phone=innerWidth<=900,h=Math.min(680,available*(phone?.38:innerHeight<=760?.66:.70)),w=h*.8;
    const desiredY=phone?Math.max(available*.42,copy.offsetTop+copy.offsetHeight+24):(available-h)*.57;
    const limitY=story.querySelector('.gallery-footer').getBoundingClientRect().top-panelRect.top-h-20;
    if(phone&&desiredY>limitY){staticLayout('content-needs-space');return;}
    const openingY=Math.min(desiredY,limitY);
    // Both poses retain the source portrait's 4:5 ratio. A narrow phone grid
    // previously produced different X/Y scales and widened Heather's face.
    const endH=Math.min(target.height,target.width/.8),endW=endH*.8;
    geometry={start:story.getBoundingClientRect().top+scrollY-header.offsetHeight,travel:story.offsetHeight-panel.offsetHeight,
      from:{x:panelRect.width*(phone?.5:.74)-w/2-(target.x-panelRect.x),y:openingY-(target.y-panelRect.y),w,h},
      to:{x:(target.width-endW)/2,y:(target.height-endH)/2,w:endW,h:endH}};
    core.style.width=w+'px';core.style.height=h+'px';core.dataset.galleryRaster='opening';
    // The partner caption remains in the footer, outside the scaled photograph.
    last=-1;if(restore)scrollTo({top:geometry.start+oldProgress*geometry.travel,behavior:'instant'});
    cancelAnimationFrame(frame);render();
  }
  document.addEventListener('srg:v7willpause',()=>{
    const r=story.getBoundingClientRect();pausedInside=r.top<=header.offsetHeight+1&&r.bottom>header.offsetHeight;
  });
  document.addEventListener('srg:motionchange',event=>{
    const previous=savedProgress;paused=Boolean(event.detail&&event.detail.paused);
    toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume motion':'Pause motion');
    toggle.querySelector('[data-gallery-motion-label]').textContent=paused?'Resume motion':'Pause motion';
    toggle.querySelector('[data-gallery-motion-mark]').textContent=paused?'▷':'Ⅱ';
    measure({restore:!paused&&pausedInside});
    if(paused){if(pausedInside)story.scrollIntoView({block:'start',behavior:'instant'});savedProgress=previous;}
    else pausedInside=false;
  });
  toggle.addEventListener('click',()=>document.querySelector('[data-motion-toggle]').click());
  document.addEventListener('srg:v7layout',()=>measure());
  document.addEventListener('srg:v7serviceslayout',()=>measure());
  document.querySelectorAll('a[href="#industry-directory"]').forEach(a=>a.addEventListener('click',()=>{
    requestAnimationFrame(()=>document.getElementById('industry-directory').focus({preventScroll:true}));
  }));
  window.addEventListener('scroll',queue,{passive:true});
  let resize=0;window.addEventListener('resize',()=>{cancelAnimationFrame(resize);resize=requestAnimationFrame(()=>measure());},{passive:true});
  media.addEventListener('change',()=>measure());
  Promise.allSettled([...story.querySelectorAll('img')].map(i=>i.decode()).concat(document.fonts.ready)).then(results=>{
    ready=results.every(r=>r.status==='fulfilled');paused=document.documentElement.classList.contains('motion-paused');
    measure();story.dataset.galleryReady=String(ready);document.dispatchEvent(new CustomEvent('srg:v7ready'));
  });
})();

(()=>{
 'use strict';
 const header=document.querySelector('.site-header'),menu=header.querySelector('nav'),toggle=header.querySelector('.menu-toggle');
 const links=[...menu.querySelectorAll('[data-v7-nav-target]')],mobile=matchMedia('(max-width:900px)');
 let frame=0,lastCurrent=null;
 function close({focus=false}={}){header.dataset.menuOpen='false';toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
 function update(){
  frame=0;let current='top';const threshold=header.offsetHeight+12;
  for(const id of ['services','industries','review-process','private-review']){
   const target=document.getElementById(id);if(target&&target.getBoundingClientRect().top<=threshold)current=id;
  }
  if(current===lastCurrent)return;lastCurrent=current;
  links.forEach(link=>{if(link.dataset.v7NavTarget===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 toggle.hidden=false;header.dataset.navReady='true';close();
 toggle.addEventListener('click',()=>{const open=header.dataset.menuOpen!=='true';header.dataset.menuOpen=String(open);toggle.setAttribute('aria-expanded',String(open));if(open)links[0].focus();});
 header.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close()));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.dataset.menuOpen==='true')close({focus:true});});
 document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close();});
 header.addEventListener('focusout',()=>requestAnimationFrame(()=>{if(!header.contains(document.activeElement))close();}));
 mobile.addEventListener('change',()=>close());
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 document.addEventListener('srg:v7ready',update);document.addEventListener('srg:motionchange',()=>requestAnimationFrame(update));
 update();
})();

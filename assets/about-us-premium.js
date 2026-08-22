(function(){
  const isMob = window.innerWidth <= 768;
  const noMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function ldJS(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.async=true; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }

  Promise.all([
    ldJS('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
    ldJS('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')
  ]).then(()=>{
    if(!isMob && !noMotion){
      ldJS('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js').then(()=>{
        try {
          const l = new Lenis({duration:1.0, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true});
          l.on('scroll', ScrollTrigger.update);
          gsap.ticker.add(t=>l.raf(t*1000));
          gsap.ticker.lagSmoothing(0);
        } catch(e){}
      }).catch(()=>{});
    }
    gsap.registerPlugin(ScrollTrigger);
    noMotion ? showAll() : boot();
  });

  function boot(){
    const bar = document.getElementById('hpaBar');
    if(bar) window.addEventListener('scroll',()=>{ bar.style.width=(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100)+'%'; },{passive:true});

    if(!isMob && window.matchMedia('(pointer:fine)').matches){
      const dot=document.getElementById('hpaDot'), ring=document.getElementById('hpaRing');
      if(dot&&ring){ let mx=0,my=0,rx=0,ry=0;
        document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});
        (function loop(){ rx+=(mx-rx)*0.13; ry+=(my-ry)*0.13;
          dot.style.transform='translate('+(mx-3)+'px,'+(my-3)+'px)';
          ring.style.transform='translate('+(rx-24)+'px,'+(ry-24)+'px)';
          requestAnimationFrame(loop); })();
      }
    }

    const label = document.getElementById('hpaHeroLabel');
    const words = document.querySelectorAll('#hpaH1 .w');
    const sub   = document.getElementById('hpaHeroSub');
    const stats = document.querySelectorAll('.hpa-hero__stat');
    if(label) gsap.to(label,{opacity:1,duration:1,delay:0.1,ease:'power3.out'});
    words.forEach((w,i)=> gsap.to(w,{opacity:1,y:0,rotateX:0,filter:'blur(0px)',duration:1.1,delay:0.25+i*0.12,ease:'power4.out'}));
    if(sub) gsap.to(sub,{opacity:1,y:0,duration:1,delay:0.9,ease:'power3.out'});
    stats.forEach((s,i)=> gsap.to(s,{opacity:1,y:0,duration:0.8,delay:1.2+i*0.08,ease:'power3.out'}));

    const hpaHeroContent = document.querySelector('#hpaHero .hpa-hero__content');
    if (hpaHeroContent) {
      gsap.to(hpaHeroContent,{ scrollTrigger:{trigger:'#hpaHero',start:'top top',end:'bottom top',scrub:true}, y:-80, opacity:0.15, scale:0.97 });
    }

    const mLines = document.querySelectorAll('.hpa-manifesto__line');
    if(!isMob){
      mLines.forEach(l=>{
        l.addEventListener('mouseenter',()=>{ mLines.forEach(x=>x.classList.remove('is-lit')); l.classList.add('is-lit'); });
        l.addEventListener('mouseleave',()=>l.classList.remove('is-lit'));
      });
    }
    mLines.forEach(l=>{
      ScrollTrigger.create({trigger:l,start:'top 85%',onEnter:()=>{ l.classList.add('in'); if(isMob) l.classList.add('is-lit'); }});
    });

    document.querySelectorAll('.hpa-pc').forEach((c,i)=>{
      ScrollTrigger.create({trigger:c,start:'top 88%',
        onEnter:()=>{ setTimeout(()=>c.classList.add('is-in'), i%3 * 80); }
      });
    });

    const slides = document.querySelectorAll('.hpa-team__slide');
    const navDots = document.querySelectorAll('.hpa-team__nav-dot');
    const typedSlides = new Set();

    slides.forEach((sl,i)=>{
      ScrollTrigger.create({trigger:sl,start:'top 60%',
        onEnter:()=>activateSlide(i),
        onEnterBack:()=>activateSlide(i)
      });
    });

    navDots.forEach(d=>d.addEventListener('click',()=>{ const idx=+d.dataset.nav; const sl=slides[idx]; if(sl) sl.scrollIntoView({behavior:'smooth',block:'start'}); }));

    function activateSlide(idx){
      slides.forEach((s,i)=>s.classList.toggle('in-view',i===idx));
      navDots.forEach((d,i)=>d.classList.toggle('on',i===idx));

      const sl = slides[idx]; if(!sl) return;
      const idxEl=sl.querySelector('.hpa-team__idx');
      const nameEl=sl.querySelector('.hpa-team__name-inner');
      const roleEl=sl.querySelector('.hpa-team__role');
      const bioEl=sl.querySelector('.hpa-team__bio');
      const quoteEl=sl.querySelector('.hpa-team__quote');

      if(idxEl) gsap.to(idxEl,{opacity:1,duration:0.5,delay:0.05,ease:'power2.out'});
      if(nameEl) gsap.to(nameEl,{opacity:1,y:'0%',duration:0.8,delay:0.1,ease:'power4.out'});
      if(roleEl) gsap.to(roleEl,{opacity:1,duration:0.5,delay:0.4,ease:'power2.out'});
      if(bioEl)  gsap.to(bioEl, {opacity:1,y:0,duration:0.7,delay:0.7,ease:'power3.out'});

      if(quoteEl && !typedSlides.has(idx)){
        typedSlides.add(idx);
        const txt = quoteEl.getAttribute('data-tw') || '';
        quoteEl.innerHTML='<span class="tw"></span>';
        let ci=0;
        const iv=setInterval(()=>{
          if(ci<txt.length){ quoteEl.innerHTML='\u201C'+txt.slice(0,++ci)+'\u201D<span class="tw"></span>'; }
          else { clearInterval(iv); setTimeout(()=>{ const c=quoteEl.querySelector('.tw'); if(c)c.style.display='none'; },2500); }
        },36);
      }

      if(!isMob){
        const bg=sl.querySelector('.hpa-team__slide-bg');
        if(bg && !sl.dataset.pxb){ sl.dataset.pxb='1';
          sl.addEventListener('mousemove',e=>{
            const r=sl.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
            gsap.to(bg,{x:x*30,y:y*20,duration:1,ease:'power2.out'});
          });
        }
      }
    }
    activateSlide(0);

    document.querySelectorAll('.hpa-up').forEach(el=>{
      ScrollTrigger.create({trigger:el,start:'top 88%',onEnter:()=>el.classList.add('in')});
    });

    if(!isMob){ const btn=document.getElementById('hpaCtaBtn');
      if(btn){
        btn.addEventListener('mousemove',e=>{ const r=btn.getBoundingClientRect();
          gsap.to(btn,{x:(e.clientX-r.left-r.width/2)*0.18, y:(e.clientY-r.top-r.height/2)*0.26, duration:0.3, ease:'power2.out'}); });
        btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:0.7,ease:'elastic.out(1,0.3)'}));
      }
    }
  }

  function showAll(){
    document.querySelectorAll('.hpa-up,.hpa-hero__h1 .w,.hpa-hero__label,.hpa-hero__sub,.hpa-hero__stat,.hpa-team__idx,.hpa-team__name-inner,.hpa-team__role,.hpa-team__bio,.hpa-pc')
      .forEach(el=>{el.style.opacity='1';el.style.transform='none';el.style.filter='none';});
    document.querySelectorAll('.hpa-manifesto__line').forEach(l=>l.classList.add('is-lit','in'));
    document.querySelectorAll('.hpa-team__slide').forEach((s,i)=>{ if(i===0)s.classList.add('in-view'); });
    document.querySelectorAll('.hpa-team__quote').forEach(q=>{ q.textContent='\u201C'+(q.getAttribute('data-tw')||'')+'\u201D'; });
  }
})();

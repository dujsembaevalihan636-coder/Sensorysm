const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* mobile menu */
const burger=document.getElementById('burger'), navLinks=document.getElementById('navLinks');
if(burger && navLinks){
  burger.addEventListener('click',()=>{const o=navLinks.classList.toggle('open');burger.setAttribute('aria-expanded',o);});
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('open')));
}

/* puzzle (логотип-мозг есть только на главной странице) */
const brain=document.getElementById('brain'), tip=document.getElementById('senseTip');
if(brain){
  if(!reduce){brain.classList.add('assemble');setTimeout(()=>{brain.classList.remove('assemble');brain.classList.add('breathe');},1300);}
  brain.querySelectorAll('.piece').forEach(p=>{const l=p.getAttribute('data-sense');
    p.addEventListener('mouseenter',()=>{if(tip){tip.textContent=l;tip.classList.add('show');}});
    p.addEventListener('mouseleave',()=>{if(tip)tip.classList.remove('show');});});
}

/* reveal */
const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.14,rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* count-up */
function countUp(el){const t=+el.dataset.count,pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
  if(reduce){el.textContent=pre+t+suf;return;}
  const dur=1400,st=performance.now();
  function step(n){const k=Math.min(1,(n-st)/dur),e=1-Math.pow(1-k,3);el.textContent=pre+Math.round(t*e)+suf;if(k<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);}
const co=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){countUp(e.target);co.unobserve(e.target);}});},{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));

/* modals (есть только на главной странице) */
let lastFocus=null;
function openModal(id){const m=document.getElementById(id);if(!m)return;lastFocus=document.activeElement;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';const c=m.querySelector('.modal-close');if(c)c.focus();}
function closeModal(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.modal)));
document.querySelectorAll('.modal').forEach(m=>m.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>closeModal(m))));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=document.querySelector('.modal.open');if(o)closeModal(o);}});

/* box open + items fly out (есть только на странице "Подробнее") */
const boxwrap=document.getElementById('boxwrap'), spark=document.getElementById('spark');
if(boxwrap){
  const items=[...document.querySelectorAll('.item')];
  const openBtn=document.getElementById('openBtn'), openWrap=document.getElementById('openWrap'), replayBtn=document.getElementById('replayBtn');
  let opened=false, timers=[];
  function mouthCenter(){const r=boxwrap.getBoundingClientRect();return {x:r.left+r.width/2, y:r.top+r.height*0.40};}
  function resetItems(){timers.forEach(clearTimeout);timers=[];items.forEach(c=>{c.style.transition='none';c.style.transform='';c.style.opacity='0';c.classList.remove('shown');});}
  function fly(){
    if(reduce){items.forEach(c=>{c.style.opacity='1';c.classList.add('shown');});boxwrap.classList.add('open');return;}
    boxwrap.classList.add('open');
    const m=mouthCenter();
    items.forEach(c=>{const r=c.getBoundingClientRect();const dx=m.x-(r.left+r.width/2),dy=m.y-(r.top+r.height/2);const rot=(Math.random()*40-20).toFixed(1);
      c.style.transition='none';c.style.transform=`translate(${dx}px,${dy}px) scale(.18) rotate(${rot}deg)`;c.style.opacity='0';});
    void boxwrap.offsetWidth;
    items.forEach((c,i)=>{const t=setTimeout(()=>{
        c.style.transition='transform .68s cubic-bezier(.2,.9,.35,1.25), opacity .35s ease';
        c.style.transform='none';c.style.opacity='1';c.classList.add('shown');
        if(spark){spark.classList.remove('go');void spark.offsetWidth;spark.classList.add('go');}
      },380+i*300);timers.push(t);});
    timers.push(setTimeout(()=>{if(replayBtn)replayBtn.classList.add('show');},380+items.length*300+400));
  }
  function openBox(){if(opened)return;opened=true;if(openWrap)openWrap.style.display='none';fly();}
  if(openBtn)openBtn.addEventListener('click',openBox);
  if(replayBtn)replayBtn.addEventListener('click',()=>{boxwrap.classList.remove('open');replayBtn.classList.remove('show');resetItems();setTimeout(fly,350);});
}

/* FAQ accordion */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.closest('.faq-item'), a=item.querySelector('.faq-a');
    const open=item.classList.toggle('open');
    a.style.maxHeight=open?a.scrollHeight+'px':0;
  });
});
document.querySelectorAll('.faq-item.open .faq-a').forEach(a=>{a.style.maxHeight=a.scrollHeight+'px';});

/* заявка → выбор Бокс/Тренинг + mailto */
const zf=document.getElementById('zayavkaForm');
if(zf){
  const reqInput=document.getElementById('z-req');
  const qtyLabel=document.getElementById('z-qty-label');
  function selectReq(btn){
    document.querySelectorAll('#zToggle .ztoggle-btn').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    const r=btn.dataset.req;
    if(reqInput) reqInput.value=r;
    if(qtyLabel) qtyLabel.textContent = (r==='Тренинг') ? 'Количество участников' : 'Количество боксов';
  }
  document.querySelectorAll('#zToggle .ztoggle-btn').forEach(b=>{
    b.addEventListener('click',()=>selectReq(b));
  });
  /* предвыбор по ссылке ?req=training */
  if(/req=training/i.test(location.search)){
    const tb=document.querySelector('#zToggle .ztoggle-btn[data-req="Тренинг"]');
    if(tb) selectReq(tb);
  }
  const zhint = zf.querySelector('.zhint');
  function setHint(html, state){
    if(!zhint) return;
    zhint.innerHTML = html;
    zhint.style.color = state==='ok' ? 'var(--green-ink)' : (state==='err' ? '#e63946' : '');
  }

  zf.addEventListener('submit', async function(e){
    e.preventDefault();
    const v=id=>(document.getElementById(id)||{}).value||'';
    const payload={
      req_type:(v('z-req')||'Бокс'),
      name:v('z-name'),
      phone:v('z-phone'),
      who:v('z-type'),
      qty:(parseInt(v('z-qty'),10)||null),
      message:v('z-msg')
    };
    if(!payload.name || !payload.phone){ setHint('Заполните имя и телефон.','err'); return; }
    const btn=zf.querySelector('button[type="submit"]');
    const orig=btn?btn.textContent:'';
    if(btn){ btn.disabled=true; btn.textContent='Отправляем…'; }
    try{
      const r = await fetch('/api/zayavka',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      if(!r.ok) throw new Error('bad status');
      zf.reset();
      setHint('✅ Спасибо! Заявка отправлена — свяжемся в течение 24 часов.','ok');
    }catch(err){
      setHint('Не удалось отправить. Попробуйте ещё раз или напишите на <b>sensoryrs@outlook.com</b>','err');
    }finally{
      if(btn){ btn.disabled=false; btn.textContent=orig; }
    }
  });
}



/* ======== SQUISH GAME ======== */
(function(){
  const btn      = document.getElementById('sqbtn');
  const game     = document.getElementById('sqgame');
  const closeBtn = document.getElementById('sqgame-close');
  let rings = null; // cached after first use
  const ball     = document.getElementById('sqball');
  const face     = document.getElementById('sq-face');
  const wrap     = document.getElementById('sqball-wrap');
  const glowEl   = document.getElementById('sq-glow');
  const countEl  = document.getElementById('sq-count');
  const moodEl   = document.getElementById('sq-mood-name');
  const msgEl    = document.getElementById('sq-msg');
  const meterEl  = document.getElementById('sq-meter-fill');
  const celebrate = document.getElementById('sq-celebrate');
  if (!btn || !game || !ball) return;

  /* ---- MOOD STAGES ---- */
  const MOODS = [
    { name:'Напряжён',   face:'😤', ballFrom:'#ff6b6b', ballMid:'#e63946', ballTo:'#8b0000',
      glow:'rgba(230,57,70,.22)', ring:'rgba(230,57,70,.25)', count:0  },
    { name:'Немного лучше', face:'😬', ballFrom:'#ffb347', ballMid:'#F7951E', ballTo:'#8b4500',
      glow:'rgba(247,149,30,.20)', ring:'rgba(247,149,30,.25)', count:5 },
    { name:'Нейтрально', face:'😊', ballFrom:'#ffaad8', ballMid:'#EC2D8B', ballTo:'#6a0040',
      glow:'rgba(236,45,139,.22)', ring:'rgba(236,45,139,.25)', count:12 },
    { name:'Спокоен',    face:'😌', ballFrom:'#b3d9ff', ballMid:'#1FA9E6', ballTo:'#003d6b',
      glow:'rgba(31,169,230,.20)', ring:'rgba(31,169,230,.25)', count:22 },
    { name:'Дзен',       face:'🧘', ballFrom:'#c8f5b0', ballMid:'#7DBE3A', ballTo:'#2d5a00',
      glow:'rgba(125,190,58,.20)', ring:'rgba(125,190,58,.25)', count:35 },
  ];
  const MSGS_BY_MOOD = [
    ['Зажми и держи 🤏','Сильнее!','Давай ещё раз','Не сдавайся'],
    ['Уже лучше!','Чувствуешь? 🌿','Продолжай…','Ещё немного'],
    ['Хорошо 😌','Стресс уходит…','Ты на верном пути','Вот так!'],
    ['Так спокойно…','Почти дзен 🌊','Дыши ровно','Великолепно'],
    ['Абсолютный дзен 🌈','Ты расслабился!','Полная гармония ✨','Мастер покоя 🏆'],
  ];

  const STRESS_TOTAL = 35;
  let count = 0;
  let stress = 100;
  let moodIdx = 0;
  let pressing = false;
  let pressStart = 0;
  let pressRaf = null;
  let audioCtx = null;
  let celebrated = false;

  /* ---- AUDIO ---- */
  function getCtx() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){} }
    return audioCtx;
  }
  function playSquish(intensity) {
    const ctx = getCtx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(180 - intensity*60, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    o.start(); o.stop(ctx.currentTime + 0.22);
  }
  function playPop(intensity, moodI) {
    const ctx = getCtx(); if (!ctx) return;
    const freqs = [160, 200, 260, 340, 420];
    const base = freqs[moodI] || 260;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(base, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(base * (1.8 + intensity), ctx.currentTime + 0.18);
    g.gain.setValueAtTime(0.14 + intensity*0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    o.start(); o.stop(ctx.currentTime + 0.28);
  }
  function playCelebrate() {
    const ctx = getCtx(); if (!ctx) return;
    [0, 0.1, 0.2, 0.35].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      const f = [440, 554, 659, 880][i];
      o.frequency.value = f;
      g.gain.setValueAtTime(0.15, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.4);
    });
  }

  /* ---- MOOD UPDATE ---- */
  function getMoodIdx(c) {
    let idx = 0;
    MOODS.forEach((m, i) => { if (c >= m.count) idx = i; });
    return idx;
  }
  function applyMood(idx) {
    const m = MOODS[idx];
    ball.style.background = `radial-gradient(circle at 36% 30%,${m.ballFrom} 0%,${m.ballMid} 38%,${m.ballTo} 100%)`;
    ball.style.boxShadow = `0 20px 50px -12px ${m.glow},inset 0 -14px 22px rgba(0,0,0,.22),inset 0 10px 18px rgba(255,255,255,.16)`;
    glowEl.style.background = `radial-gradient(ellipse at 50% 60%, ${m.glow} 0%, transparent 60%)`;
    if (!rings) rings = [...document.querySelectorAll('.sq-ring')];
    rings.forEach(r => r.style.borderColor = m.ring);
    moodEl.textContent = m.name;
    moodEl.style.color = m.ballMid;
    moodEl.style.borderColor = m.ballMid + '40';
    countEl.style.textShadow = `0 4px 20px ${m.ballMid}80`;
  }

  /* ---- STRESS METER ---- */
  function updateMeter(c) {
    const pct = Math.max(0, 100 - (c / STRESS_TOTAL) * 100);
    meterEl.style.width = pct + '%';
    const pos = (1 - pct/100) * 100;
    meterEl.style.backgroundPosition = pos + '% 0%';
  }

  /* ---- PARTICLES ---- */
  function burst(cx, cy, intensity, moodI) {
    if (intensity < 0.2) return;
    const m = MOODS[moodI];
    const colors = [m.ballMid, m.ballFrom, '#FFCE00'];
    const n = Math.min(6, Math.round(3 + intensity * 4));
    const frag = document.createDocumentFragment();
    const toRemove = [];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'sq-p';
      const angle = (i / n) * Math.PI * 2;
      const dist  = 40 + Math.random() * 60 * intensity;
      const size  = 6 + Math.random() * 7;
      const dur   = 0.4 + Math.random() * 0.25;
      p.style.cssText = `width:${size}px;height:${size}px;background:${colors[i%colors.length]};left:${cx}px;top:${cy}px;--tx:${(Math.cos(angle)*dist).toFixed(1)}px;--ty:${(Math.sin(angle)*dist).toFixed(1)}px;--dur:${dur.toFixed(2)}s;--rot:${(Math.random()*180)|0}deg;contain:strict;`;
      frag.appendChild(p);
      toRemove.push([p, dur]);
    }
    wrap.appendChild(frag);
    toRemove.forEach(([p, dur]) => setTimeout(() => p.remove(), dur * 1000 + 60));
  }

  /* ---- OPEN / CLOSE ---- */
  function openGame() {
    game.classList.add('open');
    document.body.style.overflow = 'hidden';
    applyMood(0);
  }
  function closeGame() {
    game.classList.remove('open');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', openGame);
  closeBtn.addEventListener('click', closeGame);
  document.addEventListener('keydown', e => { if(e.key==='Escape' && game.classList.contains('open')) closeGame(); });

  /* ---- PRESS ANIMATION ---- */
  function startPress(e) {
    if (e.type !== 'keydown' || e.key === ' ' || e.key === 'Enter') e.preventDefault();
    if (pressing) return;
    pressing = true;
    pressStart = performance.now();
    ball.classList.remove('sq-bounce');
    ball.classList.add('sq-press');
    face.textContent = '😬';
    playSquish(0.5);
    animPress();
  }

  function animPress() {
    if (!pressing) return;
    const t = Math.min((performance.now() - pressStart) / 700, 1);
    const ease = 1 - Math.pow(1 - t, 2.2);
    const sx = 1 + ease * 0.40;
    const sy = 1 - ease * 0.34;
    ball.style.transform = `scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;
    pressRaf = requestAnimationFrame(animPress);
  }

  function endPress(e) {
    if (!pressing) return;
    pressing = false;
    cancelAnimationFrame(pressRaf);

    const held = Math.min((performance.now() - pressStart) / 700, 1);
    ball.style.setProperty('--sx', (1 + held * 0.40).toFixed(2));
    ball.style.setProperty('--sy', (1 - held * 0.34).toFixed(2));
    ball.style.transform = '';
    ball.style.borderRadius = '';
    ball.classList.remove('sq-press');
    ball.classList.add('sq-bounce');

    /* update count & mood */
    count++;
    const newMood = getMoodIdx(count);
    if (newMood !== moodIdx) {
      moodIdx = newMood; applyMood(moodIdx);
      face.classList.remove('pop');
      requestAnimationFrame(() => face.classList.add('pop'));
    }
    face.textContent = MOODS[moodIdx].face;

    /* update meter */
    updateMeter(count);

    /* messages */
    const msgs = MSGS_BY_MOOD[moodIdx];
    msgEl.textContent = msgs[(count - 1) % msgs.length];
    msgEl.classList.remove('flash');
    requestAnimationFrame(() => msgEl.classList.add('flash'));

    /* count display */
    countEl.textContent = count;

    /* sound */
    playPop(held, moodIdx);

    /* screen shake on hard squish */
    if (held > 0.6) { wrap.classList.remove('shake'); requestAnimationFrame(() => wrap.classList.add('shake')); if (navigator.vibrate) navigator.vibrate(40); }

    /* particles */
    const r = ball.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    burst(r.left - wr.left + r.width/2, r.top - wr.top + r.height/2, held, moodIdx);

    /* celebrate */
    if (!celebrated && count >= STRESS_TOTAL) {
      celebrated = true;
      setTimeout(() => {
        playCelebrate();
        celebrate.classList.add('show');
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        setTimeout(() => celebrate.classList.remove('show'), 3500);
      }, 400);
    }

    ball.addEventListener('animationend', () => {
      ball.classList.remove('sq-bounce');
      ball.style.transform = '';
    }, {once: true});
  }

  ball.addEventListener('mousedown',  startPress);
  ball.addEventListener('touchstart', startPress, {passive: false});
  window.addEventListener('mouseup',  endPress);
  window.addEventListener('touchend', endPress);
  ball.addEventListener('keydown', startPress);
  ball.addEventListener('keyup',   endPress);

  /* ---- SHAPE SWITCHER ---- */
  const SHAPES = {
    ball: {
      idle:'sq-idle 4s ease-in-out infinite', br:'50%',
      clip:null, size:190,
      grad: m => `radial-gradient(circle at 36% 30%,${m.ballFrom} 0%,${m.ballMid} 38%,${m.ballTo} 100%)`,
      squishBR: t => `${48+t*10}% ${52-t*10}% ${48+t*10}% ${52-t*10}%/${52-t*8}% ${48+t*8}% ${52-t*8}% ${48+t*8}%`,
    },
    egg: {
      idle:'sq-idle-egg 4s ease-in-out infinite', br:'50% 50% 50% 50%/60% 60% 40% 40%',
      clip:null, size:185,
      grad: () => 'radial-gradient(circle at 36% 30%,#a8f0c0 0%,#7DBE3A 42%,#2d5a10 100%)',
      glow:'rgba(125,190,58,.6)', ring:'rgba(125,190,58,.25)',
      squishBR: t => `${50+t*4}% ${50-t*4}% ${50+t*4}% ${50-t*4}%/${60-t*8}% ${60-t*8}% ${40+t*8}% ${40+t*8}%`,
    },
    blob: {
      idle:'sq-idle-blob 6s ease-in-out infinite', br:'62% 38% 72% 28%/34% 58% 42% 66%',
      clip:null, size:190,
      grad: () => 'radial-gradient(circle at 38% 34%,#d8c0ff 0%,#8A6CFF 42%,#3a1080 100%)',
      glow:'rgba(138,108,255,.6)', ring:'rgba(138,108,255,.25)',
      squishBR: () => '55% 45% 65% 35%/38% 62% 38% 62%',
    },
    star: {
      idle:'sq-idle-star 3s ease-in-out infinite', br:'0',
      clip:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
      size:185,
      grad: () => 'radial-gradient(circle at 40% 35%,#fffaaa 0%,#FFCE00 46%,#8b6000 100%)',
      glow:'rgba(255,206,0,.65)', ring:'rgba(255,206,0,.3)',
      squishBR: () => '0',
    },
    heart: {
      idle:'sq-idle-heart 1.6s ease-in-out infinite', br:'0',
      clip:'polygon(50% 95%, 18% 68%, 4% 42%, 6% 22%, 22% 12%, 38% 16%, 50% 32%, 62% 16%, 78% 12%, 94% 22%, 96% 42%, 82% 68%)',
      size:190,
      grad: () => 'radial-gradient(circle at 38% 32%,#ffb0cc 0%,#e63946 46%,#6a0018 100%)',
      glow:'rgba(230,57,70,.6)', ring:'rgba(230,57,70,.3)',
      squishBR: () => '0',
    },
    drop: {
      idle:'sq-idle-drop 3.5s ease-in-out infinite', br:'50% 50% 50% 50%/35% 35% 65% 65%',
      clip:null, w:145, h:195,
      grad: () => 'radial-gradient(circle at 38% 28%,#b8f4ff 0%,#1FA9E6 46%,#003d6b 100%)',
      glow:'rgba(31,169,230,.6)', ring:'rgba(31,169,230,.25)',
      squishTransform: e => `scaleX(${(1-e*0.32).toFixed(3)}) scaleY(${(1+e*0.65).toFixed(3)})`,
      squishSxSy: h => [1-h*0.32, 1+h*0.65],
      squishBR: e => `${50-e*8}% ${50+e*8}% ${50+e*8}% ${50-e*8}%/${35-e*10}% ${35-e*10}% ${65+e*10}% ${65+e*10}%`,
    },
    worm: {
      idle:'sq-idle-worm 2.8s ease-in-out infinite', br:'999px',
      clip:null, w:215, h:88,
      grad: () => 'radial-gradient(ellipse at 34% 34%,#ffcf8a 0%,#F7951E 46%,#7a3d00 100%)',
      glow:'rgba(247,149,30,.6)', ring:'rgba(247,149,30,.25)',
      squishTransform: e => `scaleX(${(1+e*0.62).toFixed(3)}) scaleY(${(1-e*0.48).toFixed(3)})`,
      squishSxSy: h => [1+h*0.62, 1-h*0.48],
      squishBR: () => '999px',
    },
    diamond: {
      idle:'sq-idle-diamond 3s ease-in-out infinite', br:'0',
      clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
      size:182,
      grad: () => 'radial-gradient(circle at 40% 38%,#e0c8ff 0%,#8A6CFF 46%,#2a0060 100%)',
      glow:'rgba(138,108,255,.6)', ring:'rgba(138,108,255,.25)',
      squishTransform: e => `scale(${(1+e*0.42).toFixed(3)}) rotate(${(e*20).toFixed(1)}deg)`,
      squishSxSy: h => [1+h*0.42, 1+h*0.42],
      squishBR: () => '0',
    },
  };

  let shapeId = 'ball';

  function applyShape(id) {
    const s = SHAPES[id] || SHAPES.ball;
    shapeId = id;
    ball.classList.remove('sq-press','sq-bounce');
    ball.style.cssText = '';
    const sz = s.size || 190;
    ball.style.width  = (s.w || sz) + 'px';
    ball.style.height = (s.h || sz) + 'px';
    ball.style.borderRadius = s.br;
    if (s.clip) { ball.style.clipPath = s.clip; ball.style.webkitClipPath = s.clip; }
    ball.style.animation = s.idle;

    const m = MOODS[moodIdx];
    ball.style.background = s.grad(m);
    const gc = s.glow || m.glow, rc = s.ring || m.ring;
    ball.style.boxShadow = `0 0 0 12px ${gc.replace('.6','.07')},0 0 0 28px ${gc.replace('.6','.03')},0 28px 60px -8px ${gc},inset 0 -18px 28px rgba(0,0,0,.25),inset 0 12px 22px rgba(255,255,255,.18)`;
    glowEl.style.background = `radial-gradient(ellipse at 50% 60%,${gc.replace('.6','.22')} 0%,transparent 60%)`;
    if (!rings) rings = [...document.querySelectorAll('.sq-ring')];
    rings.forEach(r => r.style.borderColor = rc);

    document.querySelectorAll('.sq-s-btn').forEach(b => b.classList.toggle('active', b.dataset.shape === id));
  }

  /* patch applyMood to respect shape's own palette */
  const _origApplyMood = applyMood;
  function applyMoodWithShape(idx) {
    const s = SHAPES[shapeId];
    const m = MOODS[idx];
    if (s && s.glow) {
      /* shape has own color — only update face/label/ambient, not ball bg */
      moodEl.textContent = m.name;
      moodEl.style.color = m.ballMid;
      moodEl.style.borderColor = m.ballMid + '40';
      countEl.style.textShadow = `0 4px 20px ${m.ballMid}80`;
    } else {
      _origApplyMood(idx);
    }
  }

  /* patch animPress to handle clip-path shapes and unique squish directions */
  const _origAnimPress = animPress;
  function animPressWithShape() {
    if (!pressing) return;
    const t = Math.min((performance.now() - pressStart) / 700, 1);
    const ease = 1 - Math.pow(1 - t, 2.2);
    const s = SHAPES[shapeId];
    if (s && s.squishTransform) {
      ball.style.transform = s.squishTransform(ease);
    } else {
      ball.style.transform = `scaleX(${(1+ease*0.40).toFixed(3)}) scaleY(${(1-ease*0.34).toFixed(3)})`;
    }
    if (s && !s.clip && s.squishBR) {
      ball.style.borderRadius = s.squishBR(ease);
    }
    pressRaf = requestAnimationFrame(animPressWithShape);
  }
  animPress = animPressWithShape;

  /* patch endPress bounce for clip-path shapes */
  const _origEndPress = endPress;
  function endPressWithShape(e) {
    if (!pressing) return;
    pressing = false;
    cancelAnimationFrame(pressRaf);
    const held = Math.min((performance.now() - pressStart) / 700, 1);
    const s = SHAPES[shapeId];
    if (s && s.squishSxSy) {
      const [cx, cy] = s.squishSxSy(held);
      ball.style.setProperty('--sx', cx.toFixed(2));
      ball.style.setProperty('--sy', cy.toFixed(2));
    } else {
      ball.style.setProperty('--sx', (1 + held * 0.40).toFixed(2));
      ball.style.setProperty('--sy', (1 - held * 0.34).toFixed(2));
    }
    ball.style.transform = '';
    ball.style.borderRadius = s ? s.br : '50%';
    if (s && s.clip) { ball.style.clipPath = s.clip; ball.style.webkitClipPath = s.clip; }
    ball.classList.remove('sq-press');
    ball.classList.add('sq-bounce');

    count++;
    const newMood = getMoodIdx(count);
    if (newMood !== moodIdx) { moodIdx = newMood; applyMoodWithShape(moodIdx); face.classList.remove('pop'); void face.offsetWidth; face.classList.add('pop'); }
    face.textContent = MOODS[moodIdx].face;
    updateMeter(count);
    const msgs = MSGS_BY_MOOD[moodIdx];
    msgEl.textContent = msgs[(count-1) % msgs.length];
    msgEl.classList.remove('flash'); void msgEl.offsetWidth; msgEl.classList.add('flash');
    countEl.textContent = count;
    playPop(held, moodIdx);
    if (held > 0.6) { wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake'); if(navigator.vibrate) navigator.vibrate(40); }
    const r = ball.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
    burst(r.left-wr.left+r.width/2, r.top-wr.top+r.height/2, held, moodIdx);
    if (!celebrated && count >= STRESS_TOTAL) {
      celebrated = true;
      setTimeout(() => { playCelebrate(); celebrate.classList.add('show'); if(navigator.vibrate) navigator.vibrate([80,40,80]); setTimeout(() => celebrate.classList.remove('show'), 3500); }, 400);
    }
    ball.addEventListener('animationend', () => {
      ball.classList.remove('sq-bounce');
      ball.style.transform = '';
      if (s && s.clip) { ball.style.clipPath = s.clip; ball.style.webkitClipPath = s.clip; }
      ball.style.borderRadius = s ? s.br : '50%';
    }, {once:true});
  }

  /* re-bind with patched handler */
  ball.removeEventListener('mousedown', startPress);
  ball.removeEventListener('touchstart', startPress);
  window.removeEventListener('mouseup', endPress);
  window.removeEventListener('touchend', endPress);
  endPress = endPressWithShape;
  ball.addEventListener('mousedown', startPress);
  ball.addEventListener('touchstart', startPress, {passive:false});
  window.addEventListener('mouseup', endPressWithShape);
  window.addEventListener('touchend', endPressWithShape);

  /* ===== ITEM SYSTEM ===== */
  const altEl   = document.getElementById('sq-alt');
  const labelEl = document.getElementById('sq-label');
  let currentItem = 'myalka';
  let altCleanup = null;

  const ITEM_LABELS = {myalka:'сжатий',popit:'пузырей',slime:'растяжек',clicker:'нажатий',bubbles:'пузырей'};
  const ITEM_TIPS   = {
    myalka: 'Сожми ритмично — снижает тревогу и напряжение',
    popit:  'Жми пузырьки по одному — ритм успокаивает нервную систему',
    slime:  'Тяни медленно в сторону — расслабляет мышечное напряжение',
    clicker:'Нажимай в ритм — быстрые движения снижают стресс',
    bubbles:'Лопай пузыри — каждый хлопок снимает напряжение',
  };
  const ITEM_GLOW = {
    myalka: 'rgba(236,45,139,.22)', popit:  'rgba(138,108,255,.22)',
    slime:  'rgba(125,190,58,.22)', clicker:'rgba(247,149,30,.22)', bubbles:'rgba(31,169,230,.22)',
  };
  const ITEM_SPIN_COLOR = {
    myalka:'#EC2D8B', popit:'#8A6CFF', slime:'#7DBE3A', clicker:'#F7951E', bubbles:'#1FA9E6',
  };

  /* shared counter update for non-ball items */
  function addPress(n, x, y) {
    for (let i = 0; i < n; i++) {
      count++;
      const nm = getMoodIdx(count);
      if (nm !== moodIdx) {
        moodIdx = nm; applyMoodWithShape(moodIdx);
        face.classList.remove('pop'); void face.offsetWidth; face.classList.add('pop');
      }
      face.textContent = MOODS[moodIdx].face;
      updateMeter(count);
      const msgs = MSGS_BY_MOOD[moodIdx];
      msgEl.textContent = msgs[(count-1)%msgs.length];
      msgEl.classList.remove('flash'); void msgEl.offsetWidth; msgEl.classList.add('flash');
      countEl.textContent = count;
      if (!celebrated && count >= STRESS_TOTAL) {
        celebrated = true;
        setTimeout(()=>{ playCelebrate(); celebrate.classList.add('show'); if(navigator.vibrate) navigator.vibrate([80,40,80]); setTimeout(()=>celebrate.classList.remove('show'),3500); },400);
      }
    }
    if (x != null) burst(x, y, 0.55, moodIdx);
    playPop(0.55, moodIdx);
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function updateItemSpinner(id) {
    const tipEl2 = document.getElementById('sq-use-tip');
    const spinEl2 = document.getElementById('sq-spinner');
    const glowEl3 = document.getElementById('sq-spin-glow');
    if (tipEl2) { tipEl2.style.opacity='0'; setTimeout(()=>{ tipEl2.textContent=ITEM_TIPS[id]||''; tipEl2.style.opacity='1'; },180); }
    const c = ITEM_SPIN_COLOR[id] || '#EC2D8B';
    if (spinEl2) { spinEl2.querySelectorAll('.lobe,.hub').forEach(l=>l.setAttribute('fill',c)); }
    if (glowEl3) glowEl3.style.boxShadow = `0 0 28px 14px ${c}55`;
  }

  /* ПОПИТ */
  function initPoppit(container) {
    const frame = document.createElement('div');
    frame.className = 'poppit-frame';
    const grid = document.createElement('div');
    grid.className = 'poppit-grid';
    frame.appendChild(grid);
    container.appendChild(frame);

    let poppedCount = 0;
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('div');
      b.className = 'pit-b';
      b.addEventListener('click', () => {
        if (b.classList.contains('popped') || b.classList.contains('clicking')) return;
        b.classList.add('clicking');
        poppedCount++;
        const wr=wrap.getBoundingClientRect(), br=b.getBoundingClientRect();
        addPress(1, br.left-wr.left+br.width/2, br.top-wr.top+br.height/2);
        setTimeout(() => { b.classList.remove('clicking'); b.classList.add('popped'); }, 180);
        if (poppedCount >= 12) {
          poppedCount = 0;
          setTimeout(() => {
            grid.querySelectorAll('.pit-b').forEach((p, idx) => {
              setTimeout(() => p.classList.remove('popped', 'clicking'), idx * 35);
            });
          }, 550);
        }
      });
      grid.appendChild(b);
    }
  }

  /* СЛАЙМ */
  function initSlime(container) {
    const body = document.createElement('div');
    body.className = 'slime-body';
    container.appendChild(body);
    let dragging=false, sx=0, sy=0;
    const mmH = e => {
      if (!dragging) return;
      const dx=e.clientX-sx, dy=e.clientY-sy;
      const dist=Math.hypot(dx,dy), cap=Math.min(dist,68), r=cap/68;
      const ang=Math.atan2(dy,dx);
      body.style.transform=`translate(${(Math.cos(ang)*cap*.28).toFixed(1)}px,${(Math.sin(ang)*cap*.28).toFixed(1)}px) rotate(${(ang*180/Math.PI).toFixed(0)}deg) scaleX(${(1+r*.42).toFixed(2)}) scaleY(${(1-r*.28).toFixed(2)})`;
    };
    const tmH = e => { if(e.touches[0]) { const t=e.touches[0]; mmH({clientX:t.clientX,clientY:t.clientY}); }};
    const upH = () => {
      if (!dragging) return; dragging=false;
      const wr=wrap.getBoundingClientRect(), sr=body.getBoundingClientRect();
      addPress(1, sr.left-wr.left+sr.width/2, sr.top-wr.top+sr.height/2);
      body.classList.add('snapping'); body.style.transform='';
      setTimeout(()=>body.classList.remove('snapping'),500);
    };
    body.addEventListener('mousedown', e=>{ dragging=true; sx=e.clientX; sy=e.clientY; body.style.transition='none'; e.preventDefault(); });
    body.addEventListener('touchstart', e=>{ dragging=true; const t=e.touches[0]; sx=t.clientX; sy=t.clientY; body.style.transition='none'; e.preventDefault(); },{passive:false});
    window.addEventListener('mousemove', mmH);
    window.addEventListener('touchmove', tmH, {passive:true});
    window.addEventListener('mouseup', upH);
    window.addEventListener('touchend', upH);
    altCleanup = ()=>{ window.removeEventListener('mousemove',mmH); window.removeEventListener('touchmove',tmH); window.removeEventListener('mouseup',upH); window.removeEventListener('touchend',upH); };
  }

  /* НАЖИМАЛКА */
  function initClicker(container) {
    container.innerHTML = '<div class="clicker-wrap"><div class="clicker-btn"></div><div class="clicker-base"></div></div>';
    const btn2 = container.querySelector('.clicker-btn');
    btn2.addEventListener('click', () => {
      btn2.classList.add('pressed');
      const wr=wrap.getBoundingClientRect(), br=btn2.getBoundingClientRect();
      addPress(1, br.left-wr.left+br.width/2, br.top-wr.top+br.height/2);
      setTimeout(()=>btn2.classList.remove('pressed'),85);
    });
  }

  /* ПУЗЫРИ */
  function initBubbles(container) {
    container.className += ' bubbles-wrap';
    const CONFIGS = [
      {x:18,y:8,s:52},{x:76,y:4,s:46},{x:142,y:10,s:56},
      {x:8,y:72,s:44},{x:66,y:64,s:60},{x:138,y:60,s:48},
      {x:22,y:138,s:50},{x:92,y:128,s:54},{x:158,y:120,s:42},
    ];
    function spawn() {
      container.innerHTML = '';
      CONFIGS.forEach(({x,y,s}) => {
        const b = document.createElement('div');
        b.className = 'bub';
        b.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px`;
        b.addEventListener('click', () => {
          if (b.classList.contains('popping')) return;
          b.classList.add('popping');
          const wr=wrap.getBoundingClientRect(), br=b.getBoundingClientRect();
          addPress(1, br.left-wr.left+br.width/2, br.top-wr.top+br.height/2);
          setTimeout(()=>{ b.remove(); if(!container.querySelector('.bub:not(.popping)')) spawn(); },240);
        });
        container.appendChild(b);
      });
    }
    spawn();
  }

  /* ITEM SWITCHER */
  function switchItem(id) {
    if (altCleanup) { altCleanup(); altCleanup=null; }
    currentItem = id;
    if (labelEl) labelEl.textContent = ITEM_LABELS[id]||'нажатий';
    document.querySelectorAll('.sq-s-btn').forEach(b=>b.classList.toggle('active',b.dataset.item===id));
    glowEl.style.background = `radial-gradient(ellipse at 50% 60%,${ITEM_GLOW[id]||'rgba(236,45,139,.22)'} 0%,transparent 60%)`;
    document.querySelectorAll('.sq-ring').forEach(r=>r.style.borderColor=ITEM_GLOW[id]||'rgba(236,45,139,.25)');
    if (id === 'myalka') {
      ball.style.display=''; altEl.style.display='none'; altEl.innerHTML='';
      applyShape('ball');
    } else {
      ball.style.display='none'; altEl.style.display='flex'; altEl.innerHTML='';
      if (id==='popit')   initPoppit(altEl);
      else if (id==='slime')   initSlime(altEl);
      else if (id==='clicker') initClicker(altEl);
      else if (id==='bubbles') initBubbles(altEl);
    }
    updateItemSpinner(id);
  }

  /* selector click → переключение формы сквиша */
  function selectShape(id){
    if (altCleanup) { altCleanup(); altCleanup=null; }
    ball.style.display='';
    if(altEl){ altEl.style.display='none'; altEl.innerHTML=''; }
    if (labelEl) labelEl.textContent='сжатий';
    applyShape(id);
  }
  document.querySelectorAll('.sq-s-btn').forEach(b => {
    b.addEventListener('click', () => switchItem(b.dataset.item));
  });

  /* ===== FIDGET SPINNER ===== */
  (function() {
    const spinEl   = document.getElementById('sq-spinner');
    const tipEl    = document.getElementById('sq-use-tip');
    const glowEl2  = document.getElementById('sq-spin-glow');
    if (!spinEl) return;

    const TIPS = {
      ball:  'Сжимай ритмично — снижает тревогу и напряжение',
      egg:   'Сожми яйцо ладонью — ощути как оно упруго возвращается',
      drop:  'Капля тянется вниз — держи вертикально и сжимай медленно',
      worm:  'Червяк расплющивается вширь — сожми с двух сторон сразу',
      diamond: 'Кристалл вращается при сжатии — подержи и отпусти резко',
      blob:  'Тяни и мни слизь — расслабляет мышечное напряжение',
      star:  'Сжимай кончики звезды — сенсорная стимуляция',
      heart: 'Держи в ладони — успокаивает сердечный ритм',
    };
    const COLORS = {
      ball:'#EC2D8B', egg:'#7DBE3A', blob:'#8A6CFF', star:'#FFCE00', heart:'#e63946',
      drop:'#1FA9E6', worm:'#F7951E', diamond:'#8A6CFF',
    };

    let angle = 0, velocity = 3, raf = null;
    let pDown = false, lastA = 0, lastT = 0, cx = 0, cy = 0;

    function ang(x, y) { return Math.atan2(y - cy, x - cx) * 180 / Math.PI; }
    function center() {
      const r = spinEl.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    }
    function tick() {
      if (!pDown) velocity *= 0.984;
      angle += velocity;
      spinEl.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
      if (Math.abs(velocity) > 0.05 || pDown) { raf = requestAnimationFrame(tick); }
      else { velocity = 0; raf = null; }
    }

    spinEl.addEventListener('mousedown', e => {
      e.preventDefault(); center();
      lastA = ang(e.clientX, e.clientY); lastT = performance.now(); pDown = true;
      spinEl.style.cursor = 'grabbing';
      if (!raf) raf = requestAnimationFrame(tick);
    });
    spinEl.addEventListener('touchstart', e => {
      e.preventDefault(); center();
      const t = e.touches[0]; lastA = ang(t.clientX, t.clientY);
      lastT = performance.now(); pDown = true;
      if (!raf) raf = requestAnimationFrame(tick);
    }, {passive:false});
    window.addEventListener('mousemove', e => {
      if (!pDown) return; e.preventDefault();
      const now = performance.now(), na = ang(e.clientX, e.clientY);
      let d = na - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
      velocity = d * 16 / Math.max(now - lastT, 1);
      angle += d; lastA = na; lastT = now;
    });
    window.addEventListener('touchmove', e => {
      if (!pDown) return; e.preventDefault();
      const t = e.touches[0], now = performance.now(), na = ang(t.clientX, t.clientY);
      let d = na - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
      velocity = d * 16 / Math.max(now - lastT, 1);
      angle += d; lastA = na; lastT = now;
    }, {passive:false});
    window.addEventListener('mouseup',  () => { pDown = false; spinEl.style.cursor = 'grab'; });
    window.addEventListener('touchend', () => { pDown = false; });

    function updateSpinner(id) {
      const c = COLORS[id] || COLORS.ball;
      spinEl.style.color = c;
      if (glowEl2) glowEl2.style.background = `radial-gradient(circle,${c}30 0%,transparent 70%)`;
      if (tipEl) {
        tipEl.style.opacity = '0';
        setTimeout(() => { tipEl.textContent = TIPS[id] || ''; tipEl.style.opacity = '1'; }, 180);
      }
      if (Math.abs(velocity) < 2) { velocity = 5; if (!raf) raf = requestAnimationFrame(tick); }
    }

    const _applyShape = applyShape;
    applyShape = function(id) { _applyShape(id); updateSpinner(id); };

    updateSpinner('ball');
    raf = requestAnimationFrame(tick);
  })();

  /* apply default shape on open */
  const origOpen = openGame;
  // redefine open to also init shape
  document.getElementById('sqbtn').removeEventListener('click', openGame);
  function openWithShape() {
    game.classList.add('open');
    document.body.style.overflow = 'hidden';
    applyMood(0);
    switchItem('myalka');
  }
  document.getElementById('sqbtn').addEventListener('click', openWithShape);
})();

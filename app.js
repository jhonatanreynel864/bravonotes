(function(){
  'use strict';

  // ============================================================
  // CONSTANTES
  // ============================================================
  const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  // Los "name" no cambian: así siguen funcionando las clases que ya tienes guardadas.
  const COLORS = [
    {name:'blue',   bg:'rgba(140,210,255,.20)', border:'#8fd3ff'},
    {name:'green',  bg:'rgba(170,245,200,.18)', border:'#a8f0c6'},
    {name:'purple', bg:'rgba(200,182,255,.20)', border:'#c9b6ff'},
    {name:'amber',  bg:'rgba(246,210,110,.22)', border:'#f6d26e'},
    {name:'pink',   bg:'rgba(255,178,215,.20)', border:'#ffb3d9'},
    {name:'rose',   bg:'rgba(255,140,155,.22)', border:'#ff8f9c'},
  ];
  const EXP_CATEGORIES = [
    {key:'transporte',   label:'Transporte',   icon:'car',  cls:'g-cat-transporte',   color:'#f6d26e'},
    {key:'alimentacion', label:'Alimentación', icon:'food', cls:'g-cat-alimentacion', color:'#ff9aa8'},
    {key:'fotocopias',   label:'Fotocopias',   icon:'copy', cls:'g-cat-fotocopias',   color:'#a9dcff'},
    {key:'otros',        label:'Otros',        icon:'dots', cls:'g-cat-otros',        color:'#fffaf0'},
  ];
  const WIDGET_OPTIONS = [
    {key:'clases',  label:'Clases de hoy',      icon:'calendar'},
    {key:'tareas',  label:'Tareas pendientes',  icon:'checksq'},
    {key:'gastos',  label:'Resumen de gastos',  icon:'wallet'},
    {key:'apuntes', label:'Apuntes recientes',  icon:'clip'},
  ];
  const MASCOT_DUENDE = '<img src="icons/mascot-duende.png" alt="">';   // mascota de Gastos (como en tu versión)
  const UNDO_MS = 4500;

  const $ = (id) => document.getElementById(id);
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2,10) + Date.now().toString(36));
  const finePointer = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  const ICON = {
    plus: '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    calendar: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    checksq: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><polyline points="8 12 11 15 16 9"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    clip: '<svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.13 17.1a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    pin: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    logout: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    imageIc: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    fileIc: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    align: '<svg class="icon" viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
    eyeSm: '<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    upload: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 16l-4-4-4 4"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
    wallet: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v5"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M18 13a2 2 0 1 0 0 4h3v-4Z"/></svg>',
    car: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 17h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 17Z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>',
    food: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8h1a3 3 0 0 1 0 6h-1"/><path d="M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z"/><line x1="6" y1="2" x2="6" y2="5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/></svg>',
    copy: '<svg class="icon" viewBox="0 0 24 24"><rect x="4" y="4" width="12" height="16" rx="1.5"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/><line x1="7" y1="17" x2="11" y2="17"/></svg>',
    dots: '<svg class="icon" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
    sliders: '<svg class="icon" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2.4" fill="currentColor"/><circle cx="15" cy="17" r="2.4" fill="currentColor"/></svg>',
    bell: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    flame: '<svg class="icon" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7.5 7.5 0 1 1-15 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    target: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
    sparkle: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7Z"/></svg>',
    external: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    note: '<svg class="icon" viewBox="0 0 24 24"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5Z"/><path d="M15 3v6h6"/></svg>',
  };
  function hydrateIcons(root){
    (root||document).querySelectorAll('[data-icon]').forEach(el=>{
      const name = el.getAttribute('data-icon');
      if(ICON[name]) el.innerHTML = ICON[name];
    });
  }
  hydrateIcons();

  // ============================================================
  // ARRANQUE: config y librería
  // ============================================================
  function bootMessage(title, html, retry){
    const el = $('intro-screen');
    el.classList.remove('hide');
    el.innerHTML = `<div class="boot-msg"><b>${title}</b>${html}${retry ? '<br><button class="btn btn-gold" id="boot-retry"><span>Reintentar</span></button>' : ''}</div>`;
    if(retry) $('boot-retry').addEventListener('click', ()=>location.reload());
  }
  if(!window.SUPABASE_URL || window.SUPABASE_URL.includes('TU-PROYECTO')){
    bootMessage('Falta configurar Supabase', 'Abre <code>config.js</code> y pon la URL y la anon key de tu proyecto.');
    return;
  }
  if(!window.supabase || typeof window.supabase.createClient !== 'function'){
    bootMessage('Sin conexión', 'No se pudo cargar Bravonotes. Revisa tu internet e inténtalo de nuevo.', true);
    return;
  }
  const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  // ============================================================
  // ESTADO
  // ============================================================
  function freshData(){
    return { user:null, schedule:[], tasks:[], notes:[], apuntesIndex:[], expenses:[], budget:null, monthlyTotals:[],
             widget:'clases', streakEnabled:false, streakCount:0, streakLoggedToday:false };
  }
  let data = freshData();
  let currentFilter = 'all';
  let selectedColor = 'purple';
  let editingNoteId = null;
  let editingClassId = null;
  let editingTaskId = null;
  let pendingFile = null;
  let selectedExpCategory = 'transporte';
  let renderedDay = null;
  let fetchFailed = false;

  // ============================================================
  // FECHAS Y FORMATOS
  // ============================================================
  function localDateStr(d){
    d = d || new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function addDays(d, n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  // "2026-11-09" se lee como fecha LOCAL (antes se leía en UTC y salía un día antes en Colombia).
  function toDate(v){
    if(v instanceof Date) return v;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    return m ? new Date(+m[1], +m[2]-1, +m[3]) : new Date(v);
  }
  function formatDate(v){
    const d = toDate(v);
    if(isNaN(d)) return '';
    return d.toLocaleDateString('es-CO', {day:'numeric', month:'short'}).replace(/\./g,'');
  }
  function relDay(v){
    const s = localDateStr(toDate(v));
    if(s === localDateStr()) return 'Hoy';
    if(s === localDateStr(addDays(new Date(), -1))) return 'Ayer';
    return formatDate(v);
  }
  // Postgres puede devolver "08:00:00": mostramos siempre "08:00".
  function formatTime(t){ return String(t || '').slice(0,5); }
  function timeToMin(t){ const [h,m] = formatTime(t).split(':').map(Number); return (h||0)*60 + (m||0); }
  function formatCOP(n){ return '$' + Math.round(n||0).toLocaleString('es-CO'); }
  function formatCompact(n){
    n = Math.round(n||0);
    if(n >= 1e6) return '$' + (n/1e6).toFixed(1).replace(/\.0$/,'').replace('.',',') + 'M';
    if(n >= 1e3) return '$' + Math.round(n/1e3) + 'k';
    return '$' + n;
  }
  function parseMoney(v){ return parseInt(String(v||'').replace(/\D/g,''), 10) || 0; }
  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
  function formatSize(bytes){
    if(!bytes) return '';
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
    return (bytes/1024/1024).toFixed(1).replace('.',',') + ' MB';
  }
  function escapeHtml(str){
    return String(str ?? '').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function currentMonthKey(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
  function monthRange(monthKey){
    const [y,m] = monthKey.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return { start:`${monthKey}-01`, end:`${monthKey}-${String(lastDay).padStart(2,'0')}` };
  }
  function monthLabel(key, withYear){
    const [y,m] = key.split('-').map(Number);
    const name = capitalize(new Date(y, m-1, 1).toLocaleDateString('es-CO', {month:'long'}));
    return withYear ? `${name} ${y}` : name;
  }
  function weekDates(){
    const now = new Date();
    const todayIdx = (now.getDay()+6)%7;
    const monday = addDays(now, -todayIdx);
    return DAYS.map((_, i)=>addDays(monday, i));
  }
  function todayIdx(){ return (new Date().getDay()+6)%7; }
  function byTime(a,b){ return formatTime(a.time).localeCompare(formatTime(b.time)); }
  function haptic(){ try{ navigator.vibrate && navigator.vibrate(12); }catch(e){} }

  // ============================================================
  // TOAST + DESHACER
  // ============================================================
  function hideToast(){ $('toast').classList.remove('show'); }
  function toast(msg, opts){
    opts = opts || {};
    const t = $('toast'), action = $('toast-action');
    $('toast-msg').textContent = msg;
    t.classList.toggle('no-tabbar', $('tabbar').hidden);
    if(opts.action){
      action.textContent = opts.action;
      action.hidden = false;
      action.onclick = ()=>{ hideToast(); opts.onAction && opts.onAction(); };
    } else {
      action.hidden = true; action.onclick = null;
    }
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(hideToast, opts.duration || 2400);
  }

  // Borrado con opción de deshacer: se quita de la pantalla al instante y
  // se borra de verdad a los pocos segundos (o al salir de la app).
  const pendingDeletes = new Map();
  function deleteWithUndo({ label, removeLocal, restoreLocal, commit }){
    const key = uid();
    removeLocal();
    const run = async ()=>{
      pendingDeletes.delete(key);
      let ok = false;
      try{ ok = await commit(); }catch(e){ ok = false; }
      if(!ok){ restoreLocal(); toast('No se pudo eliminar'); }
    };
    const timer = setTimeout(run, UNDO_MS);
    pendingDeletes.set(key, { timer, run });
    haptic();
    toast(label, {
      action:'Deshacer', duration:UNDO_MS,
      onAction:()=>{ clearTimeout(timer); pendingDeletes.delete(key); restoreLocal(); },
    });
  }
  function flushDeletes(){
    if(!pendingDeletes.size) return Promise.resolve();
    // Ya no se puede deshacer: se quita el aviso para que no quede un botón engañoso.
    if(!$('toast-action').hidden) hideToast();
    const jobs = [];
    pendingDeletes.forEach(p=>{ clearTimeout(p.timer); jobs.push(p.run()); });
    return Promise.all(jobs);
  }
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) flushDeletes(); });
  window.addEventListener('pagehide', ()=>{ flushDeletes(); });

  // Evita guardar dos veces si se toca "Guardar" rápido (antes duplicaba tareas y gastos).
  async function withBusy(btn, fn){
    if(!btn || btn.classList.contains('is-busy')) return;
    btn.classList.add('is-busy'); btn.disabled = true;
    try{ return await fn(); }
    finally{ btn.classList.remove('is-busy'); btn.disabled = false; }
  }

  // ============================================================
  // HOJAS / MODALES
  // ============================================================
  let lastFocus = null;
  function openModal(id){
    lastFocus = document.activeElement;
    const o = $(id);
    o.classList.add('active');
    o.setAttribute('aria-hidden','false');
    const m = o.querySelector('.modal'); if(m) m.scrollTop = 0;
    if(finePointer){
      const f = o.querySelector('input[type=text]:not([hidden]), textarea');
      if(f && f.offsetParent) setTimeout(()=>f.focus({preventScroll:true}), 260);
    }
  }
  function closeModals(){
    let closed = false;
    document.querySelectorAll('.overlay.active').forEach(o=>{ o.classList.remove('active'); o.setAttribute('aria-hidden','true'); closed = true; });
    if(closed && lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', closeModals));
  document.querySelectorAll('.overlay').forEach(o=>{
    o.addEventListener('click', (e)=>{ if(e.target === o) closeModals(); });
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      if($('img-fullscreen')){ $('img-fullscreen-close').click(); return; }
      closeModals();
    }
    if(e.key === 'Enter' && !e.isComposing){
      const t = e.target;
      if(t && t.tagName === 'INPUT' && t.type !== 'checkbox' && t.type !== 'file'){
        const primary = t.closest('.overlay.active') && t.closest('.modal').querySelector('[data-primary]');
        if(primary){ e.preventDefault(); primary.click(); }
      }
    }
  });

  // ============================================================
  // INTRO (video) + SESIÓN
  // ============================================================
  const introEl = $('intro-screen');
  const introVideo = $('intro-video');
  const introBtn = $('intro-btn');
  let revealed = false;
  let sessionUserId = null;
  let entering = null;
  let wantsEnter = false;      // el usuario ya tocó "Entrar"
  let autoEnter = false;       // vuelve de iniciar sesión con Google: entra solo al terminar el video
  let resolveAuth;
  const authChecked = new Promise(r=>{ resolveAuth = r; });

  // El video se reproduce completo, se queda congelado en el último cuadro
  // y entonces aparece el botón para entrar.
  function playIntro(){
    revealed = false;
    document.documentElement.classList.add('intro-on');
    introEl.classList.remove('hide', 'ready', 'loading', 'no-video');
    let settled = false;
    const finish = ()=>{ if(settled) return; settled = true; onIntroEnd(); };
    const noVideo = ()=>{ introEl.classList.add('no-video'); finish(); };
    introVideo.onended = finish;                  // al terminar, el video conserva su último cuadro
    introVideo.onerror = noVideo;
    setTimeout(finish, 9000);                      // si el video tarda mucho en cargar, el botón aparece igual
    try{
      introVideo.currentTime = 0;
      const p = introVideo.play();
      if(p && p.catch) p.catch(noVideo);           // reproducción automática bloqueada (p. ej. ahorro de batería)
    }catch(e){ noVideo(); }
  }
  function onIntroEnd(){
    if(revealed) return;
    if(autoEnter){ autoEnter = false; enterFromIntro(); return; }
    setIntroLabel('Toca para entrar');
    introEl.classList.add('ready');
  }
  function setIntroLabel(text){ $('intro-btn-label').textContent = text; }
  function freezeOnLastFrame(){
    try{
      introVideo.pause();
      if(introVideo.duration && !introVideo.ended) introVideo.currentTime = Math.max(0, introVideo.duration - 0.04);
    }catch(e){}
  }
  async function enterFromIntro(){
    if(introEl.classList.contains('loading') || revealed) return;
    introEl.classList.add('loading');
    setIntroLabel('Entrando…');
    await authChecked;
    if(sessionUserId){
      try{ await entering; }catch(e){}
      revealApp();
    } else {
      wantsEnter = true;
      startGoogleLogin();
    }
  }
  introBtn.addEventListener('click', (e)=>{ e.stopPropagation(); enterFromIntro(); });
  introEl.addEventListener('click', ()=>{ if(introEl.classList.contains('ready')) enterFromIntro(); });

  function revealApp(){
    if(revealed || !sessionUserId) return;
    revealed = true;
    introEl.classList.remove('ready', 'loading');
    introEl.classList.add('hide');
    document.documentElement.classList.remove('intro-on');
    moveNavIndicator();
    if(fetchFailed) setTimeout(()=>toast(navigator.onLine ? 'Algunos datos no se pudieron cargar' : 'Sin conexión: algunos datos no se cargaron'), 700);
  }
  async function startGoogleLogin(){
    sessionStorage.setItem('bn_login_try', String(Date.now()));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if(error){
      wantsEnter = false;
      introEl.classList.remove('loading');
      setIntroLabel('Toca para entrar');
      introEl.classList.add('ready');
      toast('No se pudo iniciar sesión: ' + error.message);
    }
  }
  $('btn-logout').addEventListener('click', async ()=>{
    closeModals();
    await flushDeletes();
    await supabase.auth.signOut();
  });

  // Supabase puede avisar "SIGNED_IN" varias veces (al volver a la pestaña, tras el
  // redireccionamiento de Google...). Antes eso recargaba y redibujaba todo cada vez.
  function enterOnce(user){
    if(sessionUserId === user.id && entering) return entering;
    sessionUserId = user.id;
    entering = enterApp(user);
    return entering;
  }
  supabase.auth.onAuthStateChange((event, session)=>{
    // setTimeout: Supabase recomienda no llamar a la base de datos dentro del callback.
    setTimeout(()=>{
      if(event === 'SIGNED_IN' && session){
        enterOnce(session.user).then(()=>{ if(wantsEnter){ wantsEnter = false; revealApp(); } });
      }
      if(event === 'SIGNED_OUT') showLogin();
    }, 0);
  });
  async function init(){
    playIntro();
    let session = null;
    try{ ({ data: { session } } = await supabase.auth.getSession()); }catch(e){}
    if(session){
      // Si acaba de iniciar sesión con Google ya tocó "Entrar": no se le pide otra vez.
      const last = parseInt(sessionStorage.getItem('bn_login_try') || '0', 10);
      if(last && Date.now() - last < 5*60*1000){
        autoEnter = true;
        if(introEl.classList.contains('ready')){ autoEnter = false; enterFromIntro(); }
      }
      sessionStorage.removeItem('bn_login_try');
      enterOnce(session.user);   // los datos se cargan mientras corre el video
    }
    resolveAuth();
  }
  function showLogin(){
    sessionUserId = null; entering = null; revealed = false; wantsEnter = false;
    data = freshData();
    $('app').classList.remove('active');
    $('tabbar').hidden = true;
    closeModals();
    freezeOnLastFrame();
    document.documentElement.classList.add('intro-on');
    introEl.classList.remove('hide', 'loading');
    setIntroLabel('Toca para entrar');
    introEl.classList.add('ready');
  }
  function setAvatar(){
    const initial = ((data.user.name || '').trim()[0] || '?').toUpperCase();
    [$('avatar-inner'), $('sheet-avatar')].forEach(el=>{
      el.textContent = initial;
      if(data.user.avatarUrl){
        const img = new Image();
        img.alt = ''; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
        img.onload = ()=>{ el.textContent = ''; el.appendChild(img); };
        img.src = data.user.avatarUrl;
      }
    });
  }
  async function enterApp(user){
    const meta = user.user_metadata || {};
    data.user = {
      name: meta.full_name || meta.name || (user.email || '').split('@')[0] || 'Estudiante',
      email: user.email || '',
      avatarUrl: meta.avatar_url || meta.picture || null,
    };
    $('app').classList.add('active');
    $('tabbar').hidden = false;
    setAvatar();
    $('sheet-name').textContent = data.user.name;
    $('sheet-mail').textContent = data.user.email;

    await fetchAll();
    renderAll();
    updateNotifBtnLabel();
    updateStreakBtnLabel();
    requestAnimationFrame(moveNavIndicator);
  }
  $('btn-avatar').addEventListener('click', ()=>openModal('user-sheet'));

  // ============================================================
  // NAVEGACIÓN
  // ============================================================
  function moveNavIndicator(){
    const activeBtn = document.querySelector('.nav-item.active');
    const indicator = $('nav-indicator');
    if(!activeBtn || !indicator || !activeBtn.offsetWidth) return;
    indicator.classList.toggle('gastos', activeBtn.dataset.page === 'gastos');
    indicator.style.width = activeBtn.offsetWidth + 'px';
    indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }
  window.addEventListener('resize', moveNavIndicator);
  // La fuente tarda un poco en cargar y cambia el ancho de los botones: recalculamos.
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(moveNavIndicator);

  // Cambio de pestaña instantáneo: las páginas ya están armadas, solo se muestra la elegida.
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const already = btn.classList.contains('active');
      // Antes se intentaba subir la ventana, pero lo que se desplaza es <main>.
      $('main').scrollTo({ top:0, behavior: already ? 'smooth' : 'auto' });
      if(already) return;
      document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      moveNavIndicator();
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      $('page-' + btn.dataset.page).classList.add('active');
    });
  });

  // ============================================================
  // CARGA DE DATOS
  // ============================================================
  async function fetchAll(){
    fetchFailed = false;
    await Promise.all([fetchSchedule(), fetchTasks(), fetchNotes(), fetchApuntes(), fetchExpenses(), fetchBudget(), fetchMonthlyTotals(), fetchPrefs(), fetchStreak()]);
  }
  const mapClass = (r)=>({ id:r.id, subject:r.subject, day:r.day, time:formatTime(r.time), color:r.color, hasPending:!!r.has_pending, pendingText:r.pending_text });
  const mapTask = (r)=>({ id:r.id, title:r.title, done:!!r.done, dueDate:r.due_date, day:r.day, createdAt:r.created_at || '' });
  const mapExpense = (r)=>({ id:r.id, category:r.category, amount:Number(r.amount), note:r.note, date:r.expense_date, createdAt:r.created_at || '' });

  async function fetchSchedule(){
    const { data: rows, error } = await supabase.from('schedule').select('*').order('day').order('time');
    if(error){ fetchFailed = true; data.schedule = []; return; }
    data.schedule = rows.map(mapClass);
  }
  async function fetchTasks(){
    const { data: rows, error } = await supabase.from('tasks').select('*').order('created_at', {ascending:false});
    if(error){ fetchFailed = true; data.tasks = []; return; }
    data.tasks = rows.map(mapTask);
  }
  async function fetchNotes(){
    const { data: rows, error } = await supabase.from('notes').select('*').order('created_at', {ascending:false});
    if(error){ fetchFailed = true; data.notes = []; return; }
    data.notes = rows.map(r=>({ id:r.id, title:r.title, content:r.content, createdAt:r.created_at || '' }));
  }
  async function fetchApuntes(){
    const { data: rows, error } = await supabase.from('apuntes').select('id,title,type,file_name,file_size,file_path,created_at').order('created_at', {ascending:false});
    if(error){ fetchFailed = true; data.apuntesIndex = []; return; }
    data.apuntesIndex = rows.map(r=>({ id:r.id, title:r.title, type:r.type, fileName:r.file_name, size:r.file_size, filePath:r.file_path, createdAt:r.created_at || '', thumbUrl:null }));
    const imageRows = data.apuntesIndex.filter(a=>a.type === 'image' && a.filePath);
    await Promise.all(imageRows.map(async a=>{
      try{
        const { data: signed } = await supabase.storage.from('apuntes-files').createSignedUrl(a.filePath, 6*3600);
        if(signed) a.thumbUrl = signed.signedUrl;
      }catch(e){}
    }));
  }
  async function fetchExpenses(){
    const { start, end } = monthRange(currentMonthKey());
    const { data: rows, error } = await supabase.from('expenses').select('*')
      .gte('expense_date', start).lte('expense_date', end)
      .order('expense_date', {ascending:false}).order('created_at', {ascending:false});
    if(error){ fetchFailed = true; data.expenses = []; return; }
    data.expenses = rows.map(mapExpense);
  }
  async function fetchBudget(){
    const { data: row, error } = await supabase.from('budgets').select('*').eq('month', currentMonthKey()).maybeSingle();
    if(error || !row){ data.budget = null; return; }
    data.budget = { id: row.id, amount: Number(row.amount) };
  }
  async function fetchMonthlyTotals(){
    const now = new Date();
    const monthsBack = 5;
    const fromStr = localDateStr(new Date(now.getFullYear(), now.getMonth()-monthsBack, 1));
    const { data: rows, error } = await supabase.from('expenses').select('amount,expense_date').gte('expense_date', fromStr);
    const totals = {};
    for(let i=monthsBack; i>=0; i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      totals[d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')] = 0;
    }
    if(!error && rows){
      rows.forEach(r=>{
        const key = String(r.expense_date).slice(0,7);
        if(totals[key] !== undefined) totals[key] += Number(r.amount);
      });
    }
    data.monthlyTotals = Object.entries(totals).map(([key, total])=>({ key, total }));
  }
  async function fetchPrefs(){
    try{
      const { data: row } = await supabase.from('user_prefs').select('*').maybeSingle();
      if(row && row.widget) data.widget = row.widget;
      if(row) data.streakEnabled = !!row.streak_enabled;
    }catch(e){ /* la tabla puede no existir aún */ }
  }
  // Racha permanente (como en tu versión): suma un día cada vez que completas una tarea
  // en un día nuevo y nunca se reinicia.
  async function fetchStreak(){
    try{
      const { count, error } = await supabase.from('streak_log').select('activity_date', { count:'exact', head:true });
      if(error) throw error;
      data.streakCount = count || 0;
      const { data: todayRow } = await supabase.from('streak_log').select('id').eq('activity_date', localDateStr()).maybeSingle();
      data.streakLoggedToday = !!todayRow;
    }catch(e){ data.streakCount = 0; data.streakLoggedToday = false; }
  }

  // ============================================================
  // TARJETA "HOY"
  // ============================================================
  function daysUntilXmas(){
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let xmas = new Date(now.getFullYear(), 11, 25);
    if(today > xmas) xmas = new Date(now.getFullYear()+1, 11, 25);
    return Math.round((xmas - today) / 86400000);
  }
  function renderHero(){
    const now = new Date();
    const h = now.getHours();
    $('hero-greet').textContent = h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
    $('hero-name').textContent = (data.user && data.user.name ? data.user.name.trim().split(/\s+/)[0] : '') || 'Hola';
    $('today-lbl').textContent = now.toLocaleDateString('es-CO', {weekday:'long', day:'numeric', month:'long'});

    const nClasses = data.schedule.filter(c=>c.day === todayIdx()).length;
    const today = localDateStr();
    const nTasks = data.tasks.filter(t=>!t.done && t.dueDate === today).length;
    const parts = [];
    if(nClasses) parts.push(nClasses === 1 ? '1 clase' : `${nClasses} clases`);
    if(nTasks) parts.push(nTasks === 1 ? '1 tarea vence hoy' : `${nTasks} tareas vencen hoy`);
    $('hero-note').textContent = parts.length ? 'Hoy: ' + parts.join(' · ') : 'Hoy no tienes nada pendiente ✨';

    const m = now.getMonth(), d = now.getDate();
    const orn = $('xmas-ornament');
    if(m === 11 && d === 24) orn.innerHTML = '<span class="big">✨</span><span class="lbl">Noche<br>buena</span>';
    else if(m === 11 && d === 25) orn.innerHTML = '<span class="big">🎄</span><span class="lbl">Feliz<br>Navidad</span>';
    else if((m === 11 && d > 25) || (m === 0 && d <= 6)) orn.innerHTML = '<span class="big">🎉</span><span class="lbl">Felices<br>fiestas</span>';
    else {
      const n = daysUntilXmas();
      orn.innerHTML = `<span class="num">${n}</span><span class="lbl">${n === 1 ? 'día para' : 'días para'}<br>Navidad</span>`;
    }
  }
  function widgetEmpty(text){ return `<div class="widget-empty">${text}</div>`; }
  function renderWidget(){
    const titleEl = $('widget-title');
    const body = $('widget-body');

    if(data.widget === 'tareas'){
      titleEl.textContent = 'Tareas pendientes';
      const pending = data.tasks.filter(t=>!t.done)
        .sort((a,b)=> (a.dueDate||'9999').localeCompare(b.dueDate||'9999')).slice(0,4);
      if(pending.length === 0){ body.innerHTML = widgetEmpty('No tienes tareas pendientes 🎉'); return; }
      body.innerHTML = pending.map(t=>`<div class="widget-row"><span class="t">${t.dueDate ? escapeHtml(dueInfo(t.dueDate).short) : '—'}</span><span class="s">${escapeHtml(t.title)}</span></div>`).join('');
    } else if(data.widget === 'gastos'){
      titleEl.textContent = 'Resumen de gastos';
      const spent = data.expenses.reduce((s,e)=>s+e.amount, 0);
      if(data.budget && data.budget.amount > 0){
        const pct = (spent / data.budget.amount) * 100;
        body.innerHTML = `<div class="widget-row"><span class="t">${Math.round(pct)}%</span><span class="s">${formatCOP(spent)} de ${formatCOP(data.budget.amount)}</span></div>
          <div class="widget-meter"><i class="${pct > 100 ? 'over' : ''}"></i></div>`;
        requestAnimationFrame(()=>{ const i = body.querySelector('.widget-meter i'); if(i) i.style.width = Math.min(pct, 100) + '%'; });
      } else {
        body.innerHTML = `<div class="widget-row"><span class="t">${monthLabel(currentMonthKey()).slice(0,3)}</span><span class="s">Llevas ${formatCOP(spent)} gastados</span></div>`;
      }
    } else if(data.widget === 'apuntes'){
      titleEl.textContent = 'Apuntes recientes';
      const recent = data.apuntesIndex.slice(0,3);
      if(recent.length === 0){ body.innerHTML = widgetEmpty('Aún no subes apuntes'); return; }
      body.innerHTML = recent.map(a=>`<div class="widget-row"><span class="t">${relDay(a.createdAt)}</span><span class="s">${escapeHtml(a.title)}</span></div>`).join('');
    } else {
      titleEl.textContent = 'Tus clases de hoy';
      const todays = data.schedule.filter(c=>c.day === todayIdx()).sort(byTime);
      if(todays.length === 0){ body.innerHTML = widgetEmpty('No tienes clases hoy. ¡Disfruta! 🎄'); return; }
      const now = new Date(), nowMin = now.getHours()*60 + now.getMinutes();
      let nextMarked = false;
      body.innerHTML = todays.map(c=>{
        const start = timeToMin(c.time);
        let chip = '', cls = '';
        if(nowMin >= start && nowMin - start < 60){ chip = '<span class="chip-next">Ahora</span>'; nextMarked = true; }
        else if(nowMin >= start + 60){ cls = ' past'; }
        else if(!nextMarked){ chip = '<span class="chip-next">Próxima</span>'; nextMarked = true; }
        return `<div class="widget-row${cls}"><span class="t">${formatTime(c.time)}</span><span class="s">${escapeHtml(c.subject)}</span>${chip}</div>`;
      }).join('');
    }
  }
  $('btn-widget-settings').addEventListener('click', ()=>{
    const wrap = $('widget-opts');
    wrap.innerHTML = '';
    WIDGET_OPTIONS.forEach(o=>{
      const el = document.createElement('button');
      el.className = 'opt' + (data.widget === o.key ? ' sel' : '');
      el.innerHTML = `<span class="icon-sq isq-gold">${ICON[o.icon]}</span><span>${o.label}</span><span class="opt-check">${ICON.check}</span>`;
      el.addEventListener('click', ()=>{
        data.widget = o.key;
        wrap.querySelectorAll('.opt').forEach(x=>x.classList.toggle('sel', x === el));
        renderWidget();
        setTimeout(closeModals, 160);
        supabase.from('user_prefs').upsert({ widget: o.key }, { onConflict:'user_id' }).then(()=>{}, ()=>{});
      });
      wrap.appendChild(el);
    });
    openModal('modal-widget');
  });

  // ============================================================
  // CALENDARIO
  // ============================================================
  function renderCalendar(){
    const tIdx = todayIdx();
    const dates = weekDates();
    $('week-range').textContent = `${formatDate(dates[0])} – ${formatDate(dates[6])}`;
    const wrap = $('week-list');
    wrap.innerHTML = '';
    DAYS.forEach((dname, idx)=>{
      const list = data.schedule.filter(c=>c.day === idx).sort(byTime);
      const hasPending = list.some(c=>c.hasPending);
      const card = document.createElement('div');
      card.className = 'glass day-card' + (idx === tIdx ? ' today' : '');
      card.innerHTML = `
        <div class="day-head">
          <div class="day-title">
            <span class="dname">${dname}</span><span class="ddate">${formatDate(dates[idx])}</span>
            ${idx === tIdx ? '<span class="dtag">Hoy</span>' : ''}
            ${hasPending ? '<span class="pending-dot" title="Tienes algo pendiente"></span>' : ''}
          </div>
          <div class="day-right">
            <span class="dcount">${list.length ? (list.length === 1 ? '1 clase' : list.length + ' clases') : 'Sin clases'}</span>
            <button class="icon-btn" data-add aria-label="Agregar clase el ${dname}">${ICON.plus}</button>
          </div>
        </div>
        ${list.length ? '<div class="day-body"></div>' : ''}`;
      const body = card.querySelector('.day-body');
      list.forEach(c=>{
        const col = COLORS.find(x=>x.name === c.color) || COLORS[2];
        const row = document.createElement('div');
        row.className = 'class-row';
        row.style.background = col.bg;
        row.innerHTML = `
          <span class="class-rail" style="background:${col.border};"></span>
          <span class="class-time">${formatTime(c.time)}</span>
          <div class="class-main">
            <div class="class-subject">${escapeHtml(c.subject)}</div>
            ${c.hasPending ? `<div class="class-pending">${ICON.pin}${escapeHtml(c.pendingText || 'Pendiente')}</div>` : ''}
          </div>
          <button class="row-del" aria-label="Eliminar clase">${ICON.x}</button>`;
        row.addEventListener('click', (e)=>{
          if(e.target.closest('.row-del')) return;
          openClassModal(c.day, c);
        });
        row.querySelector('.row-del').addEventListener('click', (e)=>{
          e.stopPropagation();
          removeClass(c);
        });
        body.appendChild(row);
      });
      card.querySelector('[data-add]').addEventListener('click', ()=>openClassModal(idx));
      wrap.appendChild(card);
    });
  }
  function removeClass(c){
    let idx = -1;
    deleteWithUndo({
      label: 'Clase eliminada',
      removeLocal: ()=>{ idx = data.schedule.indexOf(c); if(idx > -1) data.schedule.splice(idx, 1); renderCalendar(); renderWidget(); renderHero(); },
      restoreLocal: ()=>{ if(!data.schedule.includes(c)) data.schedule.splice(Math.max(0, Math.min(idx, data.schedule.length)), 0, c); renderCalendar(); renderWidget(); renderHero(); },
      commit: async ()=>{ const { error } = await supabase.from('schedule').delete().eq('id', c.id); return !error; },
    });
  }
  function buildSwatches(){
    const wrap = $('cl-swatches');
    wrap.innerHTML = '';
    COLORS.forEach(c=>{
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'swatch' + (c.name === selectedColor ? ' sel' : '');
      sw.style.background = c.bg;
      sw.style.boxShadow = 'inset 0 0 0 2.5px ' + c.border;
      sw.setAttribute('aria-label', 'Color ' + c.name);
      sw.addEventListener('click', ()=>{ selectedColor = c.name; buildSwatches(); });
      wrap.appendChild(sw);
    });
  }
  function setPendingOpen(open){ $('cl-pending-wrap').classList.toggle('open', open); }
  function openClassModal(dayIdx, existing){
    editingClassId = existing ? existing.id : null;
    $('cl-heading').textContent = existing ? 'Editar clase' : 'Nueva clase';
    $('cl-subject').value = existing ? existing.subject : '';
    $('cl-day').value = existing ? existing.day : dayIdx;
    $('cl-time').value = existing ? formatTime(existing.time) : '08:00';
    $('cl-has-pending').checked = existing ? existing.hasPending : false;
    $('cl-pending-text').value = existing ? (existing.pendingText || '') : '';
    setPendingOpen(!!(existing && existing.hasPending));
    selectedColor = existing ? (existing.color || 'purple') : 'purple';
    $('cl-delete').hidden = !existing;
    buildSwatches();
    openModal('modal-clase');
  }
  $('btn-add-class').addEventListener('click', ()=>openClassModal(todayIdx()));
  $('cl-has-pending').addEventListener('change', (e)=>{
    setPendingOpen(e.target.checked);
    if(e.target.checked) setTimeout(()=>$('cl-pending-text').focus({preventScroll:true}), 200);
  });
  $('cl-save').addEventListener('click', ()=>withBusy($('cl-save'), async ()=>{
    const subject = $('cl-subject').value.trim();
    if(!subject){ toast('Escribe el nombre de la materia'); $('cl-subject').focus(); return; }
    if(!$('cl-time').value){ toast('Elige la hora de la clase'); return; }
    const hasPending = $('cl-has-pending').checked;
    const payload = {
      subject, day: parseInt($('cl-day').value, 10), time: $('cl-time').value,
      color: selectedColor, has_pending: hasPending,
      pending_text: hasPending ? ($('cl-pending-text').value.trim() || null) : null,
    };
    if(editingClassId){
      const { data: row, error } = await supabase.from('schedule').update(payload).eq('id', editingClassId).select().single();
      if(error){ toast('No se pudo guardar'); return; }
      const idx = data.schedule.findIndex(x=>x.id === editingClassId);
      if(idx > -1) data.schedule[idx] = mapClass(row);
      toast('Clase actualizada');
    } else {
      const { data: row, error } = await supabase.from('schedule').insert(payload).select().single();
      if(error){ toast('No se pudo guardar la clase'); return; }
      data.schedule.push(mapClass(row));
      toast('Clase agregada');
    }
    closeModals(); renderCalendar(); renderWidget(); renderHero();
  }));
  $('cl-delete').addEventListener('click', ()=>{
    const c = data.schedule.find(x=>x.id === editingClassId);
    if(!c) return;
    closeModals();
    removeClass(c);
  });

  // ============================================================
  // TAREAS + RACHA
  // ============================================================
  function burstConfetti(el){
    const colors = ['#f6d26e','#ffffff','#2fbf71','#ff3b4a','#fff3cc'];
    for(let i=0; i<10; i++){
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const angle = (Math.PI*2*i/10) + (Math.random()*0.5 - 0.25);
      const dist = 26 + Math.random()*16;
      piece.style.setProperty('--tx', Math.cos(angle)*dist + 'px');
      piece.style.setProperty('--ty', Math.sin(angle)*dist + 'px');
      piece.style.background = colors[i % colors.length];
      el.appendChild(piece);
      setTimeout(()=>piece.remove(), 700);
    }
  }
  async function logStreakToday(){
    if(data.streakLoggedToday) return;
    try{
      const { error } = await supabase.from('streak_log').insert({ activity_date: localDateStr() });
      if(!error){ data.streakLoggedToday = true; data.streakCount++; }
      else if(String(error.code) === '23505') data.streakLoggedToday = true;   // ya estaba registrado hoy
    }catch(e){}
  }
  function renderStreakCard(){
    const card = $('streak-card');
    card.hidden = !data.streakEnabled;
    if(!data.streakEnabled) return;
    const n = data.streakCount;
    $('streak-num').textContent = n;
    $('streak-lbl').textContent = n === 0 ? 'Completa una tarea para empezar' : (n === 1 ? 'día de racha' : 'días de racha');
  }
  function updateStreakBtnLabel(){ $('streak-btn-label').textContent = data.streakEnabled ? 'Desactivar racha' : 'Activar racha'; }
  $('btn-streak').addEventListener('click', ()=>{
    data.streakEnabled = !data.streakEnabled;
    supabase.from('user_prefs').upsert({ streak_enabled: data.streakEnabled }, { onConflict:'user_id' }).then(()=>{}, ()=>{});
    updateStreakBtnLabel();
    renderStreakCard();
    toast(data.streakEnabled ? 'Racha activada 🔥' : 'Racha desactivada');
    closeModals();
  });

  function dueInfo(dateStr){
    const today = localDateStr();
    if(dateStr === today) return { cls:'today', text:'Hoy', short:'Hoy' };
    if(dateStr === localDateStr(addDays(new Date(), 1))) return { cls:'due', text:'Mañana', short:'Mañana' };
    if(dateStr < today) return { cls:'late', text:'Vencida · ' + formatDate(dateStr), short:formatDate(dateStr) };
    return { cls:'due', text:formatDate(dateStr), short:formatDate(dateStr) };
  }
  function setFilterThumb(){
    const btns = [...document.querySelectorAll('#task-filters .chip-filter')];
    const i = Math.max(0, btns.findIndex(b=>b.dataset.filter === currentFilter));
    document.querySelector('#task-filters .seg-thumb').style.setProperty('--i', i);
  }
  function emptyState(icon, title, text, ctaLabel, ctaId){
    return `<div class="empty-state stagger"><div class="empty-ic">${icon}</div><h4>${title}</h4><p>${text}</p>${ctaLabel ? `<button class="fab-btn btn-gold" data-cta="${ctaId}">${ICON.plus}${ctaLabel}</button>` : ''}</div>`;
  }
  function bindEmptyCta(root){
    root.querySelectorAll('[data-cta]').forEach(b=>b.addEventListener('click', ()=>$(b.dataset.cta).click()));
  }
  function renderTasks(){
    const list = $('task-list');
    let items = data.tasks.slice().sort((a,b)=> (a.done - b.done) || String(b.createdAt).localeCompare(String(a.createdAt)));
    if(currentFilter === 'pending') items = items.filter(t=>!t.done);
    if(currentFilter === 'done') items = items.filter(t=>t.done);
    const nPending = data.tasks.filter(t=>!t.done).length, nDone = data.tasks.length - nPending;
    $('tasks-count-lbl').textContent = `${nPending} pendiente${nPending === 1 ? '' : 's'} · ${nDone} hecha${nDone === 1 ? '' : 's'}`;
    if(items.length === 0){
      if(currentFilter === 'done') list.innerHTML = emptyState(ICON.checksq, 'Nada por aquí', 'Cuando completes una tarea aparecerá en esta lista.');
      else if(currentFilter === 'pending' && data.tasks.length) list.innerHTML = emptyState(ICON.sparkle, '¡Todo al día!', 'No tienes tareas pendientes. Disfruta la temporada.');
      else list.innerHTML = emptyState(ICON.checksq, 'Sin tareas todavía', 'Anota lo que tienes que entregar y no se te pasará nada.', 'Nueva tarea', 'btn-add-task');
      bindEmptyCta(list);
      return;
    }
    list.innerHTML = '';
    items.forEach(t=>{
      const row = document.createElement('div');
      row.className = 'glass task-row' + (t.done ? ' done' : '');
      let tags = '';
      if(t.dueDate){
        const info = dueInfo(t.dueDate);
        tags += `<span class="tag ${t.done ? 'due' : info.cls}">${ICON.calendar}${escapeHtml(info.text)}</span>`;
      }
      if(t.day !== null && t.day !== undefined && t.day !== '' && DAYS[t.day]) tags += `<span class="tag">${DAYS[t.day]}</span>`;
      row.innerHTML = `
        <button class="task-check ${t.done ? 'done' : ''}" aria-label="${t.done ? 'Marcar como pendiente' : 'Marcar como hecha'}">${ICON.check}</button>
        <div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-tags">${tags}</div></div>
        <button class="row-del" aria-label="Eliminar tarea">${ICON.x}</button>`;
      const checkEl = row.querySelector('.task-check');
      checkEl.addEventListener('click', async (e)=>{
        e.stopPropagation();
        if(checkEl.dataset.busy) return;
        checkEl.dataset.busy = '1';
        const newDone = !t.done;
        t.done = newDone;
        checkEl.classList.toggle('done', newDone);
        row.classList.toggle('done', newDone);
        if(newDone){ checkEl.classList.remove('pop'); void checkEl.offsetWidth; checkEl.classList.add('pop'); burstConfetti(checkEl); haptic(); }
        const { error } = await supabase.from('tasks').update({ done:newDone }).eq('id', t.id);
        delete checkEl.dataset.busy;
        if(error){ t.done = !newDone; toast('No se pudo actualizar'); renderTasks(); return; }
        if(newDone) await logStreakToday();
        setTimeout(()=>{ renderTasks(); renderWidget(); renderHero(); renderStreakCard(); }, newDone ? 480 : 0);
      });
      row.querySelector('.task-main').addEventListener('click', ()=>openTaskModal(t));
      row.querySelector('.row-del').addEventListener('click', ()=>{
        let idx = -1;
        deleteWithUndo({
          label: 'Tarea eliminada',
          removeLocal: ()=>{ idx = data.tasks.indexOf(t); if(idx > -1) data.tasks.splice(idx, 1); renderTasks(); renderWidget(); renderHero(); },
          restoreLocal: ()=>{ if(!data.tasks.includes(t)) data.tasks.splice(Math.max(0, Math.min(idx, data.tasks.length)), 0, t); renderTasks(); renderWidget(); renderHero(); },
          commit: async ()=>{ const { error } = await supabase.from('tasks').delete().eq('id', t.id); return !error; },
        });
      });
      list.appendChild(row);
    });
  }
  document.querySelectorAll('#task-filters .chip-filter').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('#task-filters .chip-filter').forEach(x=>x.classList.toggle('active', x === b));
      currentFilter = b.dataset.filter;
      setFilterThumb();
      renderTasks();
    });
  });
  function openTaskModal(existing){
    editingTaskId = existing ? existing.id : null;
    $('tk-heading').textContent = existing ? 'Editar tarea' : 'Nueva tarea';
    $('tk-title').value = existing ? existing.title : '';
    $('tk-date').value = existing && existing.dueDate ? String(existing.dueDate).slice(0,10) : '';
    $('tk-day').value = existing && existing.day !== null && existing.day !== undefined ? String(existing.day) : '';
    openModal('modal-tarea');
  }
  $('btn-add-task').addEventListener('click', ()=>openTaskModal(null));
  $('tk-save').addEventListener('click', ()=>withBusy($('tk-save'), async ()=>{
    const title = $('tk-title').value.trim();
    if(!title){ toast('Escribe el título de la tarea'); $('tk-title').focus(); return; }
    const payload = { title, due_date: $('tk-date').value || null, day: $('tk-day').value === '' ? null : parseInt($('tk-day').value, 10) };
    if(editingTaskId){
      const { data: row, error } = await supabase.from('tasks').update(payload).eq('id', editingTaskId).select().single();
      if(error){ toast('No se pudo guardar'); return; }
      const idx = data.tasks.findIndex(x=>x.id === editingTaskId);
      if(idx > -1) data.tasks[idx] = mapTask(row);
      toast('Tarea actualizada');
    } else {
      const { data: row, error } = await supabase.from('tasks').insert({ ...payload, done:false }).select().single();
      if(error){ toast('No se pudo guardar la tarea'); return; }
      data.tasks.unshift(mapTask(row));
      toast('Tarea creada');
    }
    closeModals(); renderTasks(); renderWidget(); renderHero();
  }));

  // ============================================================
  // NOTAS
  // ============================================================
  function renderNotes(){
    const grid = $('notes-grid');
    $('notes-count-lbl').textContent = `${data.notes.length} nota${data.notes.length === 1 ? '' : 's'}`;
    if(data.notes.length === 0){
      grid.innerHTML = emptyState(ICON.edit, 'Tu libreta está vacía', 'Guarda ideas, resúmenes o lo que no quieras olvidar.', 'Nueva nota', 'btn-add-note');
      bindEmptyCta(grid);
      return;
    }
    grid.innerHTML = '';
    data.notes.slice().sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt))).forEach(n=>{
      const card = document.createElement('div');
      card.className = 'glass note-card';
      // Se recorta ANTES de escapar (antes podían salir cosas como "&am" a medias).
      card.innerHTML = `
        <button class="row-del" aria-label="Eliminar nota">${ICON.x}</button>
        <h3>${escapeHtml(n.title)}</h3>
        <div class="prev">${escapeHtml(String(n.content || '').slice(0, 260))}</div>
        <div class="meta">${formatDate(n.createdAt)}</div>`;
      card.addEventListener('click', (e)=>{
        if(e.target.closest('.row-del')) return;
        editingNoteId = n.id;
        $('nt-heading').textContent = 'Editar nota';
        $('nt-title').value = n.title;
        $('nt-content').value = n.content || '';
        openModal('modal-nota');
      });
      card.querySelector('.row-del').addEventListener('click', (e)=>{
        e.stopPropagation();
        let idx = -1;
        deleteWithUndo({
          label: 'Nota eliminada',
          removeLocal: ()=>{ idx = data.notes.indexOf(n); if(idx > -1) data.notes.splice(idx, 1); renderNotes(); },
          restoreLocal: ()=>{ if(!data.notes.includes(n)) data.notes.splice(Math.max(0, Math.min(idx, data.notes.length)), 0, n); renderNotes(); },
          commit: async ()=>{ const { error } = await supabase.from('notes').delete().eq('id', n.id); return !error; },
        });
      });
      grid.appendChild(card);
    });
  }
  $('btn-add-note').addEventListener('click', ()=>{
    editingNoteId = null;
    $('nt-heading').textContent = 'Nueva nota';
    $('nt-title').value = ''; $('nt-content').value = '';
    openModal('modal-nota');
  });
  $('nt-save').addEventListener('click', ()=>withBusy($('nt-save'), async ()=>{
    const title = $('nt-title').value.trim();
    const content = $('nt-content').value.trim();
    if(!title){ toast('Escribe un título'); $('nt-title').focus(); return; }
    if(editingNoteId){
      const { error } = await supabase.from('notes').update({ title, content }).eq('id', editingNoteId);
      if(error){ toast('No se pudo guardar'); return; }
      const n = data.notes.find(x=>x.id === editingNoteId);
      if(n){ n.title = title; n.content = content; }
    } else {
      const { data: row, error } = await supabase.from('notes').insert({ title, content }).select().single();
      if(error){ toast('No se pudo guardar'); return; }
      data.notes.unshift({ id:row.id, title:row.title, content:row.content, createdAt:row.created_at || new Date().toISOString() });
    }
    closeModals(); renderNotes(); toast('Nota guardada');
  }));

  // ============================================================
  // APUNTES
  // ============================================================
  function fileExt(name){ const p = String(name || '').split('.'); return p.length > 1 ? p.pop().toLowerCase() : ''; }
  function iconFor(a){
    if(a.type === 'image') return { icon: ICON.imageIc, cls:'isq-ice', label:'Imagen' };
    if(a.type === 'text') return { icon: ICON.align, cls:'isq-ivory', label:'Texto' };
    const ext = fileExt(a.fileName);
    if(ext === 'pdf') return { icon: ICON.fileIc, cls:'isq-rose', label:'PDF' };
    return { icon: ICON.fileIc, cls:'isq-gold', label:(ext || 'doc').toUpperCase() };
  }
  function formatRelative(iso){
    const d = new Date(iso);
    if(isNaN(d)) return '';
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor((new Date(new Date().toDateString()) - new Date(d.toDateString())) / 86400000);
    if(diffDays <= 0){
      const diffHours = Math.floor(diffMs / 3600000);
      if(diffHours < 1) return 'Hace un momento';
      if(diffHours === 1) return 'Hace 1 hora';
      return `Hace ${diffHours} horas`;
    }
    if(diffDays === 1) return 'Ayer';
    if(diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(iso);
  }
  function triggerDownload(href, filename){
    const link = document.createElement('a');
    link.href = href;
    if(filename) link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);   // Firefox necesita que el enlace esté en la página
    link.click();
    setTimeout(()=>link.remove(), 0);
  }
  async function signedUrlFor(a, opts){
    let path = a.filePath, name = a.fileName;
    if(!path){
      const { data: row, error } = await supabase.from('apuntes').select('file_path,file_name').eq('id', a.id).single();
      if(error) throw error;
      path = row.file_path; name = row.file_name; a.filePath = path; a.fileName = name;
    }
    const { data: signed, error } = await supabase.storage.from('apuntes-files').createSignedUrl(path, 300, opts);
    if(error) throw error;
    return { url: signed.signedUrl, name };
  }
  async function downloadApunte(a){
    try{
      if(a.type === 'text'){
        const { data: row, error } = await supabase.from('apuntes').select('content').eq('id', a.id).single();
        if(error) throw error;
        const blobUrl = URL.createObjectURL(new Blob([row.content || ''], { type:'text/plain;charset=utf-8' }));
        triggerDownload(blobUrl, (a.title || 'apunte') + '.txt');
        setTimeout(()=>URL.revokeObjectURL(blobUrl), 4000);   // antes se revocaba al instante y a veces fallaba
      } else {
        // Con "download" Supabase envía el archivo como descarga real (el atributo
        // download de HTML se ignora en enlaces de otro dominio).
        const { url } = await signedUrlFor(a, { download: a.fileName || a.title || true });
        triggerDownload(url);
      }
      toast('Descarga iniciada');
    }catch(e){ toast('No se pudo descargar'); }
  }
  function renderApuntes(){
    const grid = $('apuntes-grid');
    $('apuntes-count-lbl').textContent = `${data.apuntesIndex.length} apunte${data.apuntesIndex.length === 1 ? '' : 's'}`;
    if(data.apuntesIndex.length === 0){
      grid.innerHTML = emptyState(ICON.clip, 'Sube tu primer apunte', 'Texto, foto del tablero o documento: todo queda guardado aquí.', 'Subir apunte', 'btn-add-apunte');
      bindEmptyCta(grid);
      return;
    }
    grid.innerHTML = '';
    data.apuntesIndex.slice().sort((a,b)=> String(b.createdAt).localeCompare(String(a.createdAt))).forEach(a=>{
      const card = document.createElement('div');
      card.className = 'glass apunte-card';
      const meta = iconFor(a);
      const fallback = `<div class="icon-sq ${meta.cls}">${meta.icon}</div>`;
      const thumbInner = (a.type === 'image' && a.thumbUrl) ? `<img src="${escapeHtml(a.thumbUrl)}" alt="" loading="lazy">` : fallback;
      card.innerHTML = `
        <button class="row-del" aria-label="Eliminar apunte">${ICON.x}</button>
        <div class="apunte-top">
          <div class="apunte-thumb">${thumbInner}</div>
          <div class="apunte-info">
            <h3>${escapeHtml(a.title)}</h3>
            <div class="meta">${formatRelative(a.createdAt)}</div>
            <div class="chips"><span class="chip">${meta.label}</span>${a.size && a.type !== 'text' ? `<span class="chip soft">${formatSize(a.size)}</span>` : ''}</div>
          </div>
        </div>
        <div class="apunte-actions">
          <button class="btn-soft view-btn">${ICON.eyeSm} Ver</button>
          <button class="btn-soft download-btn">${ICON.download} Descargar</button>
        </div>`;
      const img = card.querySelector('.apunte-thumb img');
      if(img) img.addEventListener('error', ()=>{ img.parentElement.innerHTML = fallback; }, { once:true });
      card.querySelector('.view-btn').addEventListener('click', ()=>viewApunte(a));
      card.querySelector('.download-btn').addEventListener('click', ()=>downloadApunte(a));
      card.querySelector('.row-del').addEventListener('click', ()=>{
        let idx = -1;
        deleteWithUndo({
          label: 'Apunte eliminado',
          removeLocal: ()=>{ idx = data.apuntesIndex.indexOf(a); if(idx > -1) data.apuntesIndex.splice(idx, 1); renderApuntes(); renderWidget(); },
          restoreLocal: ()=>{ if(!data.apuntesIndex.includes(a)) data.apuntesIndex.splice(Math.max(0, Math.min(idx, data.apuntesIndex.length)), 0, a); renderApuntes(); renderWidget(); },
          commit: async ()=>{
            if(a.type !== 'text'){
              let path = a.filePath;
              if(!path){ const { data: full } = await supabase.from('apuntes').select('file_path').eq('id', a.id).single(); path = full && full.file_path; }
              if(path) await supabase.storage.from('apuntes-files').remove([path]);
            }
            const { error } = await supabase.from('apuntes').delete().eq('id', a.id);
            return !error;
          },
        });
      });
      grid.appendChild(card);
    });
  }

  let fullscreenZoomOpen = false;
  function openFullscreenImage(url){
    fullscreenZoomOpen = true;
    const wrap = document.createElement('div');
    wrap.id = 'img-fullscreen';
    wrap.innerHTML = `
      <img id="img-fs-img" src="${escapeHtml(url)}" alt="" draggable="false">
      <button id="img-fullscreen-close" class="fs-close" aria-label="Cerrar">${ICON.x}</button>
      <div class="fs-hint">${finePointer ? 'Rueda o doble clic para hacer zoom' : 'Pellizca para hacer zoom · doble toque para acercar'}</div>`;
    document.body.appendChild(wrap);
    const img = $('img-fs-img');
    let scale=1, tx=0, ty=0, startDist=0, startScale=1, startTx=0, startTy=0, startX=0, startY=0, lastTapTime=0;
    function applyTransform(animate){ img.style.transition = animate ? 'transform .25s cubic-bezier(.23,1,.32,1)' : 'none'; img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; }
    function clamp(){ scale = Math.min(Math.max(scale, 1), 5); if(scale === 1){ tx = 0; ty = 0; } }
    function dist(t){ const dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY; return Math.sqrt(dx*dx + dy*dy); }
    wrap.addEventListener('touchstart', (e)=>{
      if(e.touches.length === 2){ startDist = dist(e.touches); startScale = scale; }
      else if(e.touches.length === 1){
        startX = e.touches[0].clientX; startY = e.touches[0].clientY; startTx = tx; startTy = ty;
        const now = Date.now();
        if(now - lastTapTime < 300){ scale = scale > 1 ? 1 : 2.4; tx = 0; ty = 0; clamp(); applyTransform(true); }
        lastTapTime = now;
      }
    }, { passive:true });
    wrap.addEventListener('touchmove', (e)=>{
      e.preventDefault();
      if(e.touches.length === 2){ scale = startScale * (dist(e.touches) / startDist); clamp(); applyTransform(false); }
      else if(e.touches.length === 1 && scale > 1){ tx = startTx + (e.touches[0].clientX - startX); ty = startTy + (e.touches[0].clientY - startY); applyTransform(false); }
    }, { passive:false });
    wrap.addEventListener('wheel', (e)=>{ e.preventDefault(); scale *= e.deltaY < 0 ? 1.15 : 1/1.15; clamp(); applyTransform(true); }, { passive:false });
    img.addEventListener('dblclick', ()=>{ scale = scale > 1 ? 1 : 2.4; tx = 0; ty = 0; applyTransform(true); });
    function close(){ fullscreenZoomOpen = false; wrap.remove(); }
    wrap.addEventListener('click', (e)=>{ if(e.target === wrap) close(); });
    $('img-fullscreen-close').addEventListener('click', close);
  }
  async function viewApunte(a){
    const body = $('modal-view-body');
    const head = `<div class="grabber"></div><h2>${escapeHtml(a.title)}</h2>`;
    body.innerHTML = head + '<p style="color:var(--ink-3);margin:0 0 8px;">Cargando…</p>';
    openModal('modal-view');
    const bindClose = ()=>body.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', closeModals));
    try{
      if(a.type === 'text'){
        const { data: row, error } = await supabase.from('apuntes').select('content').eq('id', a.id).single();
        if(error) throw error;
        body.innerHTML = head + `<div class="view-text">${escapeHtml(row.content || '')}</div>
          <div class="modal-actions"><button class="btn btn-ghost" data-dl>${ICON.download} Descargar</button><button class="btn btn-gold" data-close><span>Cerrar</span></button></div>`;
        body.querySelector('[data-dl]').addEventListener('click', ()=>downloadApunte(a));
      } else {
        const { url, name } = await signedUrlFor(a);
        if(a.type === 'image'){
          body.innerHTML = head + `<img src="${escapeHtml(url)}" class="view-img" id="apunte-img-preview" alt="">
            <p class="view-hint">Toca la imagen para verla en grande y hacer zoom</p>
            <div class="modal-actions"><button class="btn btn-ghost" data-dl>${ICON.download} Descargar</button><button class="btn btn-gold" data-close><span>Cerrar</span></button></div>`;
          $('apunte-img-preview').addEventListener('click', ()=>openFullscreenImage(url));
        } else {
          const ext = fileExt(name).toUpperCase();
          body.innerHTML = head + `<div class="doc-card"><div class="doc-badge">${escapeHtml(ext || 'DOC')}</div><p class="doc-name">${escapeHtml(name || 'documento')}</p></div>
            <div class="modal-actions"><a class="btn btn-ghost" href="${escapeHtml(url)}" target="_blank" rel="noopener">${ICON.external} Abrir</a><button class="btn btn-gold" data-dl>${ICON.download}<span>Descargar</span></button></div>`;
        }
        const dl = body.querySelector('[data-dl]');
        if(dl) dl.addEventListener('click', ()=>downloadApunte(a));
      }
      bindClose();
    }catch(e){
      body.innerHTML = head + `<p style="color:var(--ink-2);">No se pudo cargar el contenido.</p><div class="modal-actions"><button class="btn btn-ghost" data-close>Cerrar</button></div>`;
      bindClose();
    }
  }
  function resetDropzone(){
    pendingFile = null;
    $('ap-dropzone').classList.remove('has-file','drag');
    $('ap-dz-icon').innerHTML = ICON.upload;
    $('ap-dropzone-text').innerHTML = 'Toca para elegir un archivo<br><small>o arrástralo aquí · imágenes o documentos, máx. 8 MB</small>';
  }
  function setApTab(tab){
    document.querySelectorAll('#ap-toggle button').forEach(x=>x.classList.toggle('active', x.dataset.tab === tab));
    $('ap-tab-texto').hidden = tab !== 'texto';
    $('ap-tab-archivo').hidden = tab !== 'archivo';
  }
  $('btn-add-apunte').addEventListener('click', ()=>{
    $('ap-title-text').value = ''; $('ap-content-text').value = '';
    $('ap-title-file').value = ''; $('ap-file-input').value = '';
    resetDropzone();
    setApTab('texto');
    openModal('modal-apunte');
  });
  document.querySelectorAll('#ap-toggle button').forEach(b=>b.addEventListener('click', ()=>setApTab(b.dataset.tab)));
  const dz = $('ap-dropzone');
  dz.addEventListener('click', ()=>$('ap-file-input').click());
  dz.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); $('ap-file-input').click(); } });
  dz.addEventListener('dragover', (e)=>{ e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', ()=>dz.classList.remove('drag'));
  dz.addEventListener('drop', (e)=>{
    e.preventDefault(); dz.classList.remove('drag');
    if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  $('ap-file-input').addEventListener('change', (e)=>{ if(e.target.files[0]) handleFile(e.target.files[0]); });
  function handleFile(file){
    if(file.size > 8*1024*1024){ toast('El archivo es muy grande (máx. 8 MB)'); return; }
    pendingFile = file;
    dz.classList.add('has-file');
    $('ap-dz-icon').innerHTML = ICON.check;
    $('ap-dropzone-text').innerHTML = `${escapeHtml(file.name)}<br><small>${formatSize(file.size)} · toca para cambiar</small>`;
    if(!$('ap-title-file').value) $('ap-title-file').value = file.name.replace(/\.[^.]+$/, '');
  }
  $('ap-save').addEventListener('click', ()=>withBusy($('ap-save'), async ()=>{
    const activeTab = document.querySelector('#ap-toggle button.active').dataset.tab;
    if(activeTab === 'texto'){
      const title = $('ap-title-text').value.trim();
      const content = $('ap-content-text').value.trim();
      if(!title || !content){ toast('Completa título y contenido'); return; }
      const { data: row, error } = await supabase.from('apuntes').insert({ title, type:'text', content }).select('id,title,type,created_at').single();
      if(error){ toast('No se pudo guardar'); return; }
      data.apuntesIndex.unshift({ id:row.id, title:row.title, type:row.type, createdAt:row.created_at || new Date().toISOString(), size:null });
    } else {
      const title = $('ap-title-file').value.trim();
      if(!pendingFile){ toast('Elige un archivo'); return; }
      if(!title){ toast('Ponle un título al apunte'); $('ap-title-file').focus(); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if(!user){ toast('Tu sesión expiró, vuelve a entrar'); return; }
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `${user.id}/${uid()}-${safeName}`;
      const { error: upErr } = await supabase.storage.from('apuntes-files').upload(filePath, pendingFile, { contentType: pendingFile.type || 'application/octet-stream' });
      if(upErr){ console.error('Error subiendo archivo:', upErr); toast('No se pudo subir: ' + (upErr.message || 'error desconocido')); return; }
      const isImage = (pendingFile.type || '').startsWith('image/');
      const { data: row, error } = await supabase.from('apuntes').insert({
        title, type: isImage ? 'image' : 'document', file_path: filePath, file_name: pendingFile.name, file_size: pendingFile.size,
      }).select('id,title,type,file_name,file_size,created_at').single();
      if(error){
        await supabase.storage.from('apuntes-files').remove([filePath]);   // no dejar archivos huérfanos
        toast('No se pudo guardar'); return;
      }
      data.apuntesIndex.unshift({
        id:row.id, title:row.title, type:row.type, fileName:row.file_name, size:row.file_size,
        createdAt:row.created_at || new Date().toISOString(), filePath, thumbUrl: isImage ? URL.createObjectURL(pendingFile) : null,
      });
    }
    closeModals(); renderApuntes(); renderWidget(); toast('Apunte guardado');
  }));

  // ============================================================
  // GASTOS
  // ============================================================
  // Los montos se escriben con puntos de miles (15.000). Antes "15.000" se guardaba como $15.
  function bindMoneyInput(input){
    input.addEventListener('input', ()=>{
      const digits = input.value.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,12);
      input.value = digits ? Number(digits).toLocaleString('es-CO') : '';
    });
  }
  bindMoneyInput($('ge-amount'));
  bindMoneyInput($('gp-amount'));

  function renderGastos(){
    const monthKey = currentMonthKey();
    $('g-eyebrow').textContent = monthLabel(monthKey, true);
    $('g-budget-month').textContent = 'Gastado en ' + monthLabel(monthKey).toLowerCase();
    const spent = data.expenses.reduce((s,e)=>s + e.amount, 0);

    if(data.budget){
      $('g-budget-card').hidden = false;
      $('g-nobudget-card').hidden = true;
      $('g-spent-amt').textContent = formatCOP(spent);
      $('g-budget-amt').textContent = 'de ' + formatCOP(data.budget.amount) + ' de presupuesto';
      const pct = data.budget.amount > 0 ? (spent / data.budget.amount) * 100 : 0;
      const fill = $('g-bar-fill');
      fill.classList.toggle('over', pct > 100);
      requestAnimationFrame(()=>{ fill.style.width = Math.min(pct, 100) + '%'; });
      $('g-budget-pct').textContent = Math.round(pct) + '%';
      const remaining = data.budget.amount - spent;
      const remEl = $('g-budget-remaining');
      if(remaining >= 0){ remEl.textContent = 'Te quedan ' + formatCOP(remaining); remEl.className = 'ok'; }
      else { remEl.textContent = 'Te pasaste por ' + formatCOP(-remaining); remEl.className = 'warn'; }
    } else {
      $('g-budget-card').hidden = true;
      $('g-nobudget-card').hidden = false;
    }

    // Dona por categoría (con pequeña separación entre segmentos y animación)
    const totals = {};
    EXP_CATEGORIES.forEach(c=>totals[c.key] = 0);
    data.expenses.forEach(e=>{ totals[e.category] = (totals[e.category] || 0) + e.amount; });
    const r = 48, circumference = 2 * Math.PI * r;
    const segWrap = $('g-donut-segments');
    segWrap.innerHTML = '';
    if(spent > 0){
      const active = EXP_CATEGORIES.filter(c=>totals[c.key] > 0);
      const gap = active.length > 1 ? 2.5 : 0;
      let cumulative = 0;
      active.forEach(c=>{
        const segLen = (totals[c.key] / spent) * circumference;
        const visible = Math.max(segLen - gap, 0.5);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx','60'); circle.setAttribute('cy','60'); circle.setAttribute('r', r);
        circle.setAttribute('fill','none'); circle.setAttribute('stroke', c.color); circle.setAttribute('stroke-width','15');
        circle.style.strokeDasharray = `0 ${circumference}`;
        circle.style.strokeDashoffset = String(-cumulative);
        segWrap.appendChild(circle);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{ circle.style.strokeDasharray = `${visible} ${circumference - visible}`; }));
        cumulative += segLen;
      });
    }
    $('g-donut-total').textContent = formatCompact(spent);

    const legend = $('g-legend');
    legend.innerHTML = EXP_CATEGORIES.map(c=>`<div class="g-legend-row"><span class="g-legend-dot" style="background:${c.color};"></span><span class="g-legend-label">${c.label}</span><span class="g-legend-amt">${formatCOP(totals[c.key])}</span></div>`).join('');

    renderMonthlyBars();

    const list = $('g-expenses-list');
    if(data.expenses.length === 0){
      list.innerHTML = `<div class="g-empty"><div class="g-mascot">${MASCOT_DUENDE}</div><p>Aún no registras gastos este mes.</p></div>`;
      return;
    }
    list.innerHTML = '';
    data.expenses.forEach(e=>{
      const cat = EXP_CATEGORIES.find(c=>c.key === e.category) || EXP_CATEGORIES[3];
      const row = document.createElement('div');
      row.className = 'g-expense-row';
      row.innerHTML = `
        <div class="g-cat-ic ${cat.cls}">${ICON[cat.icon]}</div>
        <div class="g-expense-main">
          <div class="g-expense-cat">${e.note ? escapeHtml(e.note) : cat.label}</div>
          <div class="g-expense-date">${e.note ? cat.label + ' · ' : ''}${relDay(e.date)}</div>
        </div>
        <div class="g-expense-amt">${formatCOP(e.amount)}</div>
        <button class="row-del" aria-label="Eliminar gasto">${ICON.x}</button>`;
      row.querySelector('.row-del').addEventListener('click', ()=>{
        let idx = -1;
        const adjustMonth = (sign)=>{
          const m = data.monthlyTotals.find(x=>x.key === String(e.date).slice(0,7));
          if(m) m.total = Math.max(0, m.total + sign * e.amount);
        };
        deleteWithUndo({
          label: 'Gasto eliminado',
          removeLocal: ()=>{ idx = data.expenses.indexOf(e); if(idx > -1) data.expenses.splice(idx, 1); adjustMonth(-1); renderGastos(); renderWidget(); },
          restoreLocal: ()=>{ if(!data.expenses.includes(e)){ data.expenses.splice(Math.max(0, Math.min(idx, data.expenses.length)), 0, e); adjustMonth(1); } renderGastos(); renderWidget(); },
          commit: async ()=>{ const { error } = await supabase.from('expenses').delete().eq('id', e.id); return !error; },
        });
      });
      list.appendChild(row);
    });
  }
  function renderMonthlyBars(){
    const wrap = $('g-bars-row');
    if(!data.monthlyTotals || data.monthlyTotals.length === 0){ wrap.innerHTML = ''; return; }
    const max = Math.max(...data.monthlyTotals.map(m=>m.total), 1);
    const currentKey = currentMonthKey();
    wrap.innerHTML = '';
    data.monthlyTotals.forEach(m=>{
      const [y, mo] = m.key.split('-').map(Number);
      const label = new Date(y, mo-1, 1).toLocaleDateString('es-CO', {month:'short'}).replace(/\./g,'');
      const heightPct = Math.max((m.total / max) * 82, m.total > 0 ? 5 : 3);
      const col = document.createElement('div');
      col.className = 'g-bar-col' + (m.key === currentKey ? ' current' : '');
      col.innerHTML = `<span class="val">${m.total > 0 ? formatCompact(m.total) : ''}</span><div class="bar" style="height:0%;" data-h="${heightPct}"></div><div class="lbl">${label}</div>`;
      wrap.appendChild(col);
    });
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ wrap.querySelectorAll('.bar').forEach(b=>{ b.style.height = b.dataset.h + '%'; }); }));
  }
  $('btn-set-budget').addEventListener('click', openBudgetModal);
  $('btn-edit-budget').addEventListener('click', openBudgetModal);
  function openBudgetModal(){
    $('gp-amount').value = data.budget ? Math.round(data.budget.amount).toLocaleString('es-CO') : '';
    openModal('modal-presupuesto');
    if(finePointer) setTimeout(()=>$('gp-amount').focus({preventScroll:true}), 260);
  }
  $('gp-save').addEventListener('click', ()=>withBusy($('gp-save'), async ()=>{
    const amount = parseMoney($('gp-amount').value);
    if(!amount || amount <= 0){ toast('Escribe un presupuesto válido'); return; }
    const { data: row, error } = await supabase.from('budgets').upsert({ month: currentMonthKey(), amount }, { onConflict: 'user_id,month' }).select().single();
    if(error){ toast('No se pudo guardar el presupuesto'); return; }
    data.budget = { id: row.id, amount: Number(row.amount) };
    closeModals(); renderGastos(); renderWidget(); toast('Presupuesto guardado');
  }));
  function buildCatSelect(){
    const wrap = $('ge-cat-select');
    wrap.innerHTML = '';
    EXP_CATEGORIES.forEach(c=>{
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'g-cat-opt' + (c.key === selectedExpCategory ? ' sel' : '');
      opt.innerHTML = `<span class="g-cat-ic ${c.cls}">${ICON[c.icon]}</span><span>${c.label}</span>`;
      opt.addEventListener('click', ()=>{ selectedExpCategory = c.key; buildCatSelect(); });
      wrap.appendChild(opt);
    });
  }
  $('btn-add-gasto').addEventListener('click', ()=>{
    selectedExpCategory = 'transporte';
    buildCatSelect();
    $('ge-amount').value = ''; $('ge-note').value = '';
    $('ge-date').value = localDateStr();
    openModal('modal-gasto');
    if(finePointer) setTimeout(()=>$('ge-amount').focus({preventScroll:true}), 260);
  });
  $('ge-save').addEventListener('click', ()=>withBusy($('ge-save'), async ()=>{
    const amount = parseMoney($('ge-amount').value);
    if(!amount || amount <= 0){ toast('Escribe un monto válido'); $('ge-amount').focus(); return; }
    const payload = { category: selectedExpCategory, amount, note: $('ge-note').value.trim() || null, expense_date: $('ge-date').value || localDateStr() };
    const { data: row, error } = await supabase.from('expenses').insert(payload).select().single();
    if(error){ toast('No se pudo guardar el gasto'); return; }
    const { start, end } = monthRange(currentMonthKey());
    const inThisMonth = row.expense_date >= start && row.expense_date <= end;
    if(inThisMonth){
      data.expenses.unshift(mapExpense(row));
      data.expenses.sort((a,b)=> String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt)));
    }
    await fetchMonthlyTotals();
    closeModals(); renderGastos(); renderWidget();
    toast(inThisMonth ? 'Gasto agregado' : 'Gasto agregado a ' + monthLabel(String(row.expense_date).slice(0,7)).toLowerCase());
  }));

  // ============================================================
  // NOTIFICACIONES PUSH
  // ============================================================
  function urlBase64ToUint8Array(base64String){
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c=>c.charCodeAt(0)));
  }
  const pushSupported = ()=> ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window);
  async function updateNotifBtnLabel(){
    const btn = $('btn-notifications');
    if(!pushSupported()){
      $('notif-label').textContent = 'Notificaciones';
      $('notif-end').textContent = 'No disponible';
      btn.disabled = true;
      return;
    }
    try{
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      $('notif-label').textContent = sub ? 'Notificaciones' : 'Activar notificaciones';
      $('notif-end').textContent = sub ? 'Activadas ✓' : '';
    }catch(e){}
  }
  $('btn-notifications').addEventListener('click', async ()=>{
    if(!pushSupported()){ toast('Tu navegador no soporta notificaciones push'); return; }
    if(!window.VAPID_PUBLIC_KEY || window.VAPID_PUBLIC_KEY.includes('TU-')){ toast('Falta configurar la llave VAPID'); return; }
    const perm = await Notification.requestPermission();
    if(perm !== 'granted'){ toast('No se activaron las notificaciones'); return; }
    try{
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if(!sub){ sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: urlBase64ToUint8Array(window.VAPID_PUBLIC_KEY) }); }
      const json = sub.toJSON();
      const { error } = await supabase.from('push_subscriptions').upsert({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }, { onConflict:'endpoint' });
      if(error){ toast('No se pudo guardar la suscripción'); return; }
      toast('Notificaciones activadas 🔔');
      updateNotifBtnLabel();
    }catch(e){ toast('No se pudo activar: ' + e.message); }
    closeModals();
  });

  // ============================================================
  // RENDER GENERAL
  // ============================================================
  function renderAll(){
    renderHero(); renderCalendar(); renderTasks(); renderNotes(); renderApuntes(); renderGastos(); renderWidget(); renderStreakCard(); setFilterThumb();
    renderedDay = localDateStr();
  }
  // Si la app queda abierta y cambia el día (o el mes), se actualiza al volver.
  document.addEventListener('visibilitychange', async ()=>{
    if(document.hidden || !sessionUserId || !revealed) return;
    if(renderedDay && renderedDay !== localDateStr()){
      await fetchAll();
      renderAll();
    }
  });

  init();

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); });
  }

  // Bloquea el zoom con pellizco en iOS (excepto en el visor de imágenes).
  // El doble toque ya lo bloquea el CSS (touch-action), sin "comerse" toques rápidos como antes.
  document.addEventListener('gesturestart', (e)=>{ if(!fullscreenZoomOpen) e.preventDefault(); });
  document.addEventListener('gesturechange', (e)=>{ if(!fullscreenZoomOpen) e.preventDefault(); });
})();

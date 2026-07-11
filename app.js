(function(){
  const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const COLORS = [
    {name:'blue', bg:'var(--blue-soft)', border:'#2563eb'},
    {name:'green', bg:'var(--green-soft)', border:'#15803d'},
    {name:'purple', bg:'var(--p-100)', border:'#5f22b3'},
    {name:'amber', bg:'var(--amber-soft)', border:'#b45309'},
    {name:'pink', bg:'var(--pink-soft)', border:'#db2777'},
    {name:'rose', bg:'var(--rose-soft)', border:'#be123c'},
  ];

  const EXP_CATEGORIES = [
    {key:'transporte', label:'Transporte', icon:'car', cls:'g-cat-transporte', color:'#10b981'},
    {key:'alimentacion', label:'Alimentación', icon:'food', cls:'g-cat-alimentacion', color:'#84cc16'},
    {key:'fotocopias', label:'Fotocopias', icon:'copy', cls:'g-cat-fotocopias', color:'#14b8a6'},
    {key:'otros', label:'Otros', icon:'dots', cls:'g-cat-otros', color:'#f59e0b'},
  ];

  function mascotSvg(fillOuter, fillInner){
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,6 C72,4 94,22 92,46 C90,70 74,92 48,94 C24,96 6,76 8,50 C10,26 28,8 50,6 Z" fill="${fillOuter}"/>
      <circle cx="52" cy="54" r="26" fill="${fillInner}"/>
      <circle cx="43" cy="50" r="3.2" fill="#0f2e1c"/>
      <circle cx="61" cy="50" r="3.2" fill="#0f2e1c"/>
      <path d="M44 62 Q52 68 60 62" stroke="#0f2e1c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M78 18 l3 7 l7 3 l-7 3 l-3 7 l-3-7 l-7-3 l7-3 Z" fill="#f59e0b"/>
    </svg>`;
  }
  const MASCOT_A = mascotSvg('#bbf7d0', '#16a34a');
  const MASCOT_B = mascotSvg('#99f6e4', '#0d9488');

  // ---------- Supabase client ----------
  if(!window.SUPABASE_URL || window.SUPABASE_URL.includes('TU-PROYECTO')){
    document.addEventListener('DOMContentLoaded', ()=>{
      const el = document.getElementById('login-screen');
      if(el) el.innerHTML = `<div style="max-width:380px;text-align:center;color:#fff;font-family:sans-serif;padding:24px;background:#5f22b3;border-radius:20px;">
        Falta configurar Supabase.<br><br>Abre <code>config.js</code> y pon la URL y la anon key de tu proyecto.
      </div>`;
    });
    return;
  }
  const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  let data = { user:null, schedule:[], tasks:[], notes:[], apuntesIndex:[], expenses:[], budget:null };
  let currentFilter = 'all';
  let selectedColor = 'purple';
  let editingNoteId = null;
  let pendingFile = null; // raw File object waiting to be uploaded
  let selectedExpCategory = 'transporte';

  const $ = (id) => document.getElementById(id);
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2,10) + Date.now().toString(36));

  const ICON = {
    plus: '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    calendar: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    checksq: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="8 12 11 15 16 9"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    clip: '<svg class="icon" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.13 17.1a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    pin: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    logout: '<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    check: '<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    imageIc: '<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
    fileIc: '<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    align: '<svg class="icon" viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
    eyeSm: '<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    trashSm: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    upload: '<svg class="icon" viewBox="0 0 24 24"><path d="M16 16l-4-4-4 4"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
    wallet: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v5"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3"/><path d="M18 13a2 2 0 1 0 0 4h3v-4Z"/></svg>',
    plusSm: '<svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    car: '<svg class="icon" viewBox="0 0 24 24"><path d="M5 17h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 17Z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>',
    food: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 8h1a3 3 0 0 1 0 6h-1"/><path d="M2 8h16v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z"/><line x1="6" y1="2" x2="6" y2="5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/></svg>',
    copy: '<svg class="icon" viewBox="0 0 24 24"><rect x="4" y="4" width="12" height="16" rx="1.5"/><line x1="7" y1="9" x2="13" y2="9"/><line x1="7" y1="13" x2="13" y2="13"/><line x1="7" y1="17" x2="11" y2="17"/></svg>',
    dots: '<svg class="icon" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
    google: '<svg viewBox="0 0 24 24" width="19" height="19"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-2.98c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.71-4.94H1.28v3.09C3.25 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.29 14.33A7.19 7.19 0 0 1 4.91 12c0-.81.14-1.6.38-2.33V6.58H1.28A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.28 5.42l4.01-3.09z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.58l4.01 3.09C6.24 6.84 8.88 4.77 12 4.77z"/></svg>',
  };
  ICON.calendarSm = ICON.calendar;
  document.querySelectorAll('[data-icon]').forEach(el=>{
    const name = el.getAttribute('data-icon');
    if(ICON[name]) el.innerHTML = ICON[name];
  });

  function toast(msg){
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  // ============================================================
  // AUTH
  // ============================================================
  $('btn-google-login').addEventListener('click', async ()=>{
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if(error) toast('No se pudo iniciar sesión: ' + error.message);
  });

  $('btn-logout').addEventListener('click', async ()=>{
    $('user-sheet').classList.remove('active');
    await supabase.auth.signOut();
  });

  supabase.auth.onAuthStateChange((event, session)=>{
    if(event === 'SIGNED_IN' && session) enterApp(session.user);
    if(event === 'SIGNED_OUT') showLogin();
  });

  async function init(){
    const { data: { session } } = await supabase.auth.getSession();
    if(session) await enterApp(session.user);
  }

  function showLogin(){
    $('login-screen').style.display = 'flex';
    $('app').classList.remove('active');
    $('tabbar').style.display = 'none';
  }

  async function enterApp(user){
    data.user = {
      name: user.user_metadata?.full_name || user.user_metadata?.name || (user.email||'').split('@')[0],
      email: user.email,
      avatarUrl: user.user_metadata?.avatar_url || null,
    };
    $('login-screen').style.display = 'none';
    $('app').classList.add('active');
    $('tabbar').style.display = 'flex';

    const initial = (data.user.name||'?').trim()[0].toUpperCase();
    if(data.user.avatarUrl){
      $('btn-avatar').innerHTML = `<img src="${data.user.avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      $('sheet-avatar').innerHTML = `<img src="${data.user.avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      $('btn-avatar').textContent = initial;
      $('sheet-avatar').textContent = initial;
    }
    $('sheet-name').textContent = data.user.name;
    $('sheet-mail').textContent = data.user.email;
    const opts = {weekday:'long', day:'numeric', month:'long'};
    $('today-lbl').textContent = 'Hoy es ' + new Date().toLocaleDateString('es-ES', opts);

    await fetchAll();
    renderAll();
  }

  $('btn-avatar').addEventListener('click', ()=> $('user-sheet').classList.add('active'));
  $('user-sheet').querySelector('.scrim').addEventListener('click', ()=> $('user-sheet').classList.remove('active'));

  // ============================================================
  // NAV / MODALS
  // ============================================================
  document.querySelectorAll('.nav-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
      $('page-'+btn.dataset.page).classList.add('active');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
  function closeModals(){ document.querySelectorAll('.overlay').forEach(o=>o.classList.remove('active')); }
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', closeModals));
  document.querySelectorAll('.overlay').forEach(o=>{
    o.addEventListener('click', (e)=>{ if(e.target===o) closeModals(); });
  });

  // ============================================================
  // FETCH ALL DATA FROM SUPABASE
  // ============================================================
  async function fetchAll(){
    await Promise.all([fetchSchedule(), fetchTasks(), fetchNotes(), fetchApuntes(), fetchExpenses(), fetchBudget()]);
  }
  function currentMonthKey(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
  }
  function monthRange(monthKey){
    const [y,m] = monthKey.split('-').map(Number);
    const start = `${monthKey}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${monthKey}-${String(lastDay).padStart(2,'0')}`;
    return {start, end};
  }
  async function fetchExpenses(){
    const {start, end} = monthRange(currentMonthKey());
    const { data: rows, error } = await supabase.from('expenses').select('*')
      .gte('expense_date', start).lte('expense_date', end)
      .order('expense_date', {ascending:false}).order('created_at', {ascending:false});
    if(error){ data.expenses = []; return; }
    data.expenses = rows.map(r=>({ id:r.id, category:r.category, amount:Number(r.amount), note:r.note, date:r.expense_date, createdAt:r.created_at }));
  }
  async function fetchBudget(){
    const { data: row, error } = await supabase.from('budgets').select('*').eq('month', currentMonthKey()).maybeSingle();
    if(error || !row){ data.budget = null; return; }
    data.budget = { id: row.id, amount: Number(row.amount) };
  }
  async function fetchSchedule(){
    const { data: rows, error } = await supabase.from('schedule').select('*').order('day').order('time');
    if(error){ toast('Error cargando el calendario'); return; }
    data.schedule = rows.map(r=>({ id:r.id, subject:r.subject, day:r.day, time:r.time, color:r.color, hasPending:r.has_pending, pendingText:r.pending_text }));
  }
  async function fetchTasks(){
    const { data: rows, error } = await supabase.from('tasks').select('*').order('created_at', {ascending:false});
    if(error){ toast('Error cargando tareas'); return; }
    data.tasks = rows.map(r=>({ id:r.id, title:r.title, done:r.done, dueDate:r.due_date, day:r.day, createdAt:r.created_at }));
  }
  async function fetchNotes(){
    const { data: rows, error } = await supabase.from('notes').select('*').order('created_at', {ascending:false});
    if(error){ toast('Error cargando notas'); return; }
    data.notes = rows.map(r=>({ id:r.id, title:r.title, content:r.content, createdAt:r.created_at }));
  }
  async function fetchApuntes(){
    const { data: rows, error } = await supabase.from('apuntes').select('id,title,type,file_name,file_size,created_at').order('created_at', {ascending:false});
    if(error){ toast('Error cargando apuntes'); return; }
    data.apuntesIndex = rows.map(r=>({ id:r.id, title:r.title, type:r.type, fileName:r.file_name, size:r.file_size, createdAt:r.created_at }));
  }

  // ============================================================
  // CALENDARIO
  // ============================================================
  function renderCalendar(){
    const todayIdx = (new Date().getDay()+6)%7;
    const wrap = $('week-list');
    wrap.innerHTML = '';
    DAYS.forEach((dname, idx)=>{
      const classesForDay = data.schedule.filter(c=>c.day===idx).sort((a,b)=>a.time.localeCompare(b.time));
      const hasPending = classesForDay.some(c=>c.hasPending);
      const card = document.createElement('div');
      card.className = 'glass-card day-card' + (idx===todayIdx ? ' today' : '');
      card.innerHTML = `
        <div class="day-card-head">
          <div class="left">
            <span class="dname">${dname}</span>
            ${idx===todayIdx ? '<span class="dtoday-tag">Hoy</span>' : ''}
            ${hasPending ? '<span class="pending-dot" title="Tienes algo pendiente"></span>' : ''}
          </div>
          <button class="add-class-btn" data-day="${idx}">${ICON.plus}Clase</button>
        </div>
        <div class="day-body"></div>
      `;
      const body = card.querySelector('.day-body');
      if(classesForDay.length===0){
        body.innerHTML = '<div class="day-empty">Sin clases este día</div>';
      } else {
        classesForDay.forEach(c=>{
          const col = COLORS.find(x=>x.name===c.color) || COLORS[2];
          const row = document.createElement('div');
          row.className = 'class-row';
          row.style.background = col.bg;
          row.innerHTML = `
            <div style="width:4px;align-self:stretch;border-radius:4px;background:${col.border};"></div>
            <div class="class-main">
              <div class="class-time">${c.time}</div>
              <div class="class-subject">${escapeHtml(c.subject)}</div>
              ${c.hasPending ? `<div class="class-pending">${ICON.pin}${escapeHtml(c.pendingText||'Pendiente')}</div>` : ''}
            </div>
            <button class="class-del" data-id="${c.id}">${ICON.x}</button>
          `;
          row.querySelector('.class-del').addEventListener('click', async (e)=>{
            e.stopPropagation();
            const { error } = await supabase.from('schedule').delete().eq('id', c.id);
            if(error){ toast('No se pudo eliminar'); return; }
            data.schedule = data.schedule.filter(x=>x.id!==c.id);
            renderCalendar();
          });
          body.appendChild(row);
        });
      }
      card.querySelector('.add-class-btn').addEventListener('click', ()=>openClassModal(idx));
      wrap.appendChild(card);
    });
  }

  function buildSwatches(){
    const wrap = $('cl-swatches');
    wrap.innerHTML = '';
    COLORS.forEach(c=>{
      const sw = document.createElement('div');
      sw.className = 'swatch' + (c.name===selectedColor ? ' sel' : '');
      sw.style.background = c.bg;
      sw.style.boxShadow = 'inset 0 0 0 2px ' + c.border;
      sw.addEventListener('click', ()=>{ selectedColor = c.name; buildSwatches(); });
      wrap.appendChild(sw);
    });
  }
  function openClassModal(dayIdx){
    $('cl-subject').value = '';
    $('cl-day').value = dayIdx;
    $('cl-time').value = '08:00';
    $('cl-has-pending').checked = false;
    $('cl-pending-text').value = '';
    $('cl-pending-wrap').style.display = 'none';
    selectedColor = 'purple';
    buildSwatches();
    $('modal-clase').classList.add('active');
  }
  $('btn-add-class').addEventListener('click', ()=>openClassModal(0));
  $('cl-has-pending').addEventListener('change', (e)=>{
    $('cl-pending-wrap').style.display = e.target.checked ? 'block' : 'none';
  });
  $('cl-save').addEventListener('click', async ()=>{
    const subject = $('cl-subject').value.trim();
    if(!subject){ toast('Escribe el nombre de la materia'); return; }
    const payload = {
      subject, day: parseInt($('cl-day').value,10), time: $('cl-time').value,
      color: selectedColor, has_pending: $('cl-has-pending').checked,
      pending_text: $('cl-pending-text').value.trim() || null,
    };
    const { data: row, error } = await supabase.from('schedule').insert(payload).select().single();
    if(error){ toast('No se pudo guardar la clase'); return; }
    data.schedule.push({ id:row.id, subject:row.subject, day:row.day, time:row.time, color:row.color, hasPending:row.has_pending, pendingText:row.pending_text });
    closeModals(); renderCalendar(); toast('Clase agregada');
  });

  // ============================================================
  // TAREAS
  // ============================================================
  function renderTasks(){
    const list = $('task-list');
    let items = data.tasks.slice().sort((a,b)=> (a.done - b.done) || (a.createdAt<b.createdAt?1:-1));
    if(currentFilter==='pending') items = items.filter(t=>!t.done);
    if(currentFilter==='done') items = items.filter(t=>t.done);
    $('tasks-count-lbl').textContent = `${data.tasks.filter(t=>!t.done).length} pendientes · ${data.tasks.filter(t=>t.done).length} hechas`;
    if(items.length===0){
      list.innerHTML = emptyState(ICON.checksq, 'isq-purple', 'No hay tareas aquí todavía.');
      return;
    }
    list.innerHTML = '';
    items.forEach(t=>{
      const row = document.createElement('div');
      row.className = 'glass-card task-row' + (t.done ? ' done' : '');
      let tags = '';
      if(t.dueDate) tags += `<span class="tag due">${ICON.calendarSm}${formatDate(t.dueDate)}</span>`;
      if(t.day!==null && t.day!==undefined && t.day!=='') tags += `<span class="tag">${DAYS[t.day]}</span>`;
      row.innerHTML = `
        <div class="task-check ${t.done?'done':''}" data-id="${t.id}">${t.done ? ICON.check : ''}</div>
        <div class="task-main">
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="task-tags">${tags}</div>
        </div>
        <button class="task-del" data-id="${t.id}">${ICON.x}</button>
      `;
      row.querySelector('.task-check').addEventListener('click', async ()=>{
        const newDone = !t.done;
        const { error } = await supabase.from('tasks').update({done:newDone}).eq('id', t.id);
        if(error){ toast('No se pudo actualizar'); return; }
        t.done = newDone; renderTasks();
      });
      row.querySelector('.task-del').addEventListener('click', async ()=>{
        const { error } = await supabase.from('tasks').delete().eq('id', t.id);
        if(error){ toast('No se pudo eliminar'); return; }
        data.tasks = data.tasks.filter(x=>x.id!==t.id); renderTasks();
      });
      list.appendChild(row);
    });
  }
  document.querySelectorAll('.chip-filter').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.chip-filter').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); currentFilter = b.dataset.filter; renderTasks();
    });
  });
  $('btn-add-task').addEventListener('click', ()=>{
    $('tk-title').value=''; $('tk-date').value=''; $('tk-day').value='';
    $('modal-tarea').classList.add('active');
  });
  $('tk-save').addEventListener('click', async ()=>{
    const title = $('tk-title').value.trim();
    if(!title){ toast('Escribe el título de la tarea'); return; }
    const payload = {
      title, done:false,
      due_date: $('tk-date').value || null,
      day: $('tk-day').value===''? null : parseInt($('tk-day').value,10),
    };
    const { data: row, error } = await supabase.from('tasks').insert(payload).select().single();
    if(error){ toast('No se pudo guardar la tarea'); return; }
    data.tasks.unshift({ id:row.id, title:row.title, done:row.done, dueDate:row.due_date, day:row.day, createdAt:row.created_at });
    closeModals(); renderTasks(); toast('Tarea creada');
  });

  // ============================================================
  // NOTAS
  // ============================================================
  function renderNotes(){
    const grid = $('notes-grid');
    $('notes-count-lbl').textContent = `${data.notes.length} nota${data.notes.length===1?'':'s'}`;
    if(data.notes.length===0){
      grid.innerHTML = emptyState(ICON.edit, 'isq-pink', 'Aún no tienes notas.');
      return;
    }
    grid.innerHTML = '';
    data.notes.slice().sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).forEach(n=>{
      const card = document.createElement('div');
      card.className = 'glass-card note-card';
      card.innerHTML = `
        <button class="del" data-id="${n.id}">${ICON.x}</button>
        <h3>${escapeHtml(n.title)}</h3>
        <div class="prev">${escapeHtml(n.content||'').slice(0,140)}</div>
        <div class="meta">${formatDate(n.createdAt)}</div>
      `;
      card.addEventListener('click', (e)=>{
        if(e.target.closest('.del')) return;
        editingNoteId = n.id;
        $('nt-heading').textContent = 'Editar nota';
        $('nt-title').value = n.title;
        $('nt-content').value = n.content || '';
        $('modal-nota').classList.add('active');
      });
      card.querySelector('.del').addEventListener('click', async (e)=>{
        e.stopPropagation();
        const { error } = await supabase.from('notes').delete().eq('id', n.id);
        if(error){ toast('No se pudo eliminar'); return; }
        data.notes = data.notes.filter(x=>x.id!==n.id); renderNotes();
      });
      grid.appendChild(card);
    });
  }
  $('btn-add-note').addEventListener('click', ()=>{
    editingNoteId = null;
    $('nt-heading').textContent = 'Nueva nota';
    $('nt-title').value=''; $('nt-content').value='';
    $('modal-nota').classList.add('active');
  });
  $('nt-save').addEventListener('click', async ()=>{
    const title = $('nt-title').value.trim();
    const content = $('nt-content').value.trim();
    if(!title){ toast('Escribe un título'); return; }
    if(editingNoteId){
      const { error } = await supabase.from('notes').update({title, content}).eq('id', editingNoteId);
      if(error){ toast('No se pudo guardar'); return; }
      const n = data.notes.find(x=>x.id===editingNoteId);
      n.title = title; n.content = content;
    } else {
      const { data: row, error } = await supabase.from('notes').insert({title, content}).select().single();
      if(error){ toast('No se pudo guardar'); return; }
      data.notes.unshift({ id:row.id, title:row.title, content:row.content, createdAt:row.created_at });
    }
    closeModals(); renderNotes(); toast('Nota guardada');
  });

  // ============================================================
  // APUNTES (texto, foto o documento)
  // ============================================================
  function iconFor(type, fileName){
    if(type==='image') return {icon: ICON.imageIc, cls:'isq-blue'};
    if(type==='text') return {icon: ICON.align, cls:'isq-purple'};
    const ext = (fileName||'').split('.').pop().toLowerCase();
    if(ext==='pdf') return {icon: ICON.fileIc, cls:'isq-rose'};
    return {icon: ICON.fileIc, cls:'isq-amber'};
  }
  function renderApuntes(){
    const grid = $('apuntes-grid');
    $('apuntes-count-lbl').textContent = `${data.apuntesIndex.length} apunte${data.apuntesIndex.length===1?'':'s'}`;
    if(data.apuntesIndex.length===0){
      grid.innerHTML = emptyState(ICON.clip, 'isq-amber', 'Sube tu primer apunte: texto, foto o documento.');
      return;
    }
    grid.innerHTML = '';
    data.apuntesIndex.slice().sort((a,b)=> b.createdAt.localeCompare(a.createdAt)).forEach(a=>{
      const card = document.createElement('div');
      card.className = 'glass-card apunte-card';
      const meta = iconFor(a.type, a.fileName);
      card.innerHTML = `
        <div class="apunte-thumb"><div class="icon-sq ${meta.cls}">${meta.icon}</div></div>
        <div class="apunte-body">
          <h3>${escapeHtml(a.title)}</h3>
          <div class="meta">${formatDate(a.createdAt)}${a.size?' · '+formatSize(a.size):''}</div>
          <div class="apunte-actions">
            <button class="btn-ghost-sm view-btn">${ICON.eyeSm} Ver</button>
            <button class="btn-ghost-sm del-btn">${ICON.trashSm} Eliminar</button>
          </div>
        </div>
      `;
      card.querySelector('.view-btn').addEventListener('click', ()=>viewApunte(a));
      card.querySelector('.del-btn').addEventListener('click', async ()=>{
        if(a.type!=='text'){
          const { data: full } = await supabase.from('apuntes').select('file_path').eq('id', a.id).single();
          if(full && full.file_path){
            await supabase.storage.from('apuntes-files').remove([full.file_path]);
          }
        }
        const { error } = await supabase.from('apuntes').delete().eq('id', a.id);
        if(error){ toast('No se pudo eliminar'); return; }
        data.apuntesIndex = data.apuntesIndex.filter(x=>x.id!==a.id);
        renderApuntes();
      });
      grid.appendChild(card);
    });
  }
  async function viewApunte(a){
    const body = $('modal-view-body');
    body.innerHTML = `<h2>${escapeHtml(a.title)}</h2><p style="color:var(--ink-mute);">Cargando…</p>`;
    $('modal-view').classList.add('active');
    try{
      if(a.type==='text'){
        const { data: row, error } = await supabase.from('apuntes').select('content').eq('id', a.id).single();
        if(error) throw error;
        body.innerHTML = `<h2>${escapeHtml(a.title)}</h2><div style="white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;font-size:14px;line-height:1.6;max-height:55vh;overflow-y:auto;">${escapeHtml(row.content||'')}</div>
          <div class="modal-actions"><button class="btn btn-ghost" data-close>Cerrar</button></div>`;
      } else {
        const { data: row, error } = await supabase.from('apuntes').select('file_path,file_name').eq('id', a.id).single();
        if(error) throw error;
        const { data: signed, error: signErr } = await supabase.storage.from('apuntes-files').createSignedUrl(row.file_path, 300);
        if(signErr) throw signErr;
        const url = signed.signedUrl;
        if(a.type==='image'){
          body.innerHTML = `<h2>${escapeHtml(a.title)}</h2><img src="${url}" style="width:100%;border-radius:14px;max-height:55vh;object-fit:contain;background:var(--p-50);">
            <div class="modal-actions"><a class="btn btn-ghost" href="${url}" download="${escapeHtml(row.file_name||a.title)}">${ICON.download} Descargar</a><button class="btn btn-dark" data-close>Cerrar</button></div>`;
        } else {
          body.innerHTML = `<h2>${escapeHtml(a.title)}</h2><p style="color:var(--ink-mute);font-size:13.5px;">${escapeHtml(row.file_name||'documento')}</p>
            <div class="modal-actions"><a class="btn btn-dark" href="${url}" download="${escapeHtml(row.file_name||a.title)}">${ICON.download} Descargar archivo</a></div>`;
        }
      }
      body.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', closeModals));
    }catch(e){
      body.innerHTML = `<h2>${escapeHtml(a.title)}</h2><p>No se pudo cargar el contenido.</p><div class="modal-actions"><button class="btn btn-ghost" data-close>Cerrar</button></div>`;
      body.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click', closeModals));
    }
  }

  $('btn-add-apunte').addEventListener('click', ()=>{
    $('ap-title-text').value=''; $('ap-content-text').value='';
    $('ap-title-file').value=''; pendingFile=null;
    $('ap-dz-icon').innerHTML = ICON.upload;
    $('ap-dropzone-text').innerHTML = 'Arrastra un archivo aquí o toca para elegir<br><span style="font-size:11px;">Imágenes o documentos, máx. 8 MB</span>';
    document.querySelectorAll('.tabbar-toggle button').forEach(b=>b.classList.remove('active'));
    document.querySelector('.tabbar-toggle button[data-tab="texto"]').classList.add('active');
    $('ap-tab-texto').style.display='block'; $('ap-tab-archivo').style.display='none';
    $('modal-apunte').classList.add('active');
  });
  document.querySelectorAll('.tabbar-toggle button').forEach(b=>{
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.tabbar-toggle button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      $('ap-tab-texto').style.display = b.dataset.tab==='texto' ? 'block':'none';
      $('ap-tab-archivo').style.display = b.dataset.tab==='archivo' ? 'block':'none';
    });
  });
  const dz = $('ap-dropzone');
  dz.addEventListener('click', ()=>$('ap-file-input').click());
  dz.addEventListener('dragover', (e)=>{ e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', ()=> dz.classList.remove('drag'));
  dz.addEventListener('drop', (e)=>{
    e.preventDefault(); dz.classList.remove('drag');
    if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  $('ap-file-input').addEventListener('change', (e)=>{ if(e.target.files[0]) handleFile(e.target.files[0]); });
  function handleFile(file){
    if(file.size > 8*1024*1024){ toast('El archivo es muy grande (máx. 8MB)'); return; }
    pendingFile = file;
    $('ap-dz-icon').innerHTML = ICON.check;
    $('ap-dropzone-text').innerHTML = `${escapeHtml(file.name)}<br><span style="font-size:11px;">${formatSize(file.size)} — toca para cambiar</span>`;
    if(!$('ap-title-file').value) $('ap-title-file').value = file.name.replace(/\.[^.]+$/, '');
  }
  $('ap-save').addEventListener('click', async ()=>{
    const activeTab = document.querySelector('.tabbar-toggle button.active').dataset.tab;
    if(activeTab==='texto'){
      const title = $('ap-title-text').value.trim();
      const content = $('ap-content-text').value.trim();
      if(!title || !content){ toast('Completa título y contenido'); return; }
      const { data: row, error } = await supabase.from('apuntes').insert({ title, type:'text', content }).select('id,title,type,created_at').single();
      if(error){ toast('No se pudo guardar'); return; }
      data.apuntesIndex.unshift({ id:row.id, title:row.title, type:row.type, createdAt:row.created_at, size:content.length });
      closeModals(); renderApuntes(); toast('Apunte guardado');
    } else {
      const title = $('ap-title-file').value.trim();
      if(!title || !pendingFile){ toast('Elige un archivo y ponle título'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user.id}/${uid()}-${pendingFile.name}`;
      const { error: upErr } = await supabase.storage.from('apuntes-files').upload(filePath, pendingFile);
      if(upErr){ toast('No se pudo subir el archivo'); return; }
      const isImage = pendingFile.type.startsWith('image/');
      const { data: row, error } = await supabase.from('apuntes').insert({
        title, type: isImage ? 'image' : 'document',
        file_path: filePath, file_name: pendingFile.name, file_size: pendingFile.size,
      }).select('id,title,type,file_name,file_size,created_at').single();
      if(error){ toast('No se pudo guardar'); return; }
      data.apuntesIndex.unshift({ id:row.id, title:row.title, type:row.type, fileName:row.file_name, size:row.file_size, createdAt:row.created_at });
      closeModals(); renderApuntes(); toast('Apunte guardado');
    }
  });

  // ============================================================
  // GASTOS UNIVERSITARIOS
  // ============================================================
  function formatCOP(n){
    return '$' + Math.round(n||0).toLocaleString('es-CO');
  }
  function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

  function renderGastos(){
    $('g-mascot-head').innerHTML = MASCOT_A;
    $('g-mascot-nobudget').innerHTML = MASCOT_B;

    const monthLabel = capitalize(new Date().toLocaleDateString('es-ES', {month:'long', year:'numeric'}));
    $('g-budget-month').textContent = monthLabel;

    const spent = data.expenses.reduce((s,e)=> s + e.amount, 0);

    if(data.budget){
      $('g-budget-card').style.display = 'block';
      $('g-nobudget-card').style.display = 'none';
      $('g-spent-amt').textContent = formatCOP(spent);
      $('g-budget-amt').textContent = 'de ' + formatCOP(data.budget.amount);
      const pct = data.budget.amount > 0 ? (spent / data.budget.amount) * 100 : 0;
      const fill = $('g-bar-fill');
      fill.classList.toggle('over', pct > 100);
      requestAnimationFrame(()=>{ fill.style.width = Math.min(pct, 100) + '%'; });
      $('g-budget-pct').textContent = Math.round(pct) + '%';
      const remaining = data.budget.amount - spent;
      const remEl = $('g-budget-remaining');
      if(remaining >= 0){
        remEl.textContent = 'Te quedan ' + formatCOP(remaining);
        remEl.className = 'ok';
      } else {
        remEl.textContent = 'Superaste el presupuesto por ' + formatCOP(-remaining);
        remEl.className = 'warn';
      }
    } else {
      $('g-budget-card').style.display = 'none';
      $('g-nobudget-card').style.display = 'block';
    }

    // ---- donut chart ----
    const totals = {};
    EXP_CATEGORIES.forEach(c=> totals[c.key] = 0);
    data.expenses.forEach(e=>{ totals[e.category] = (totals[e.category]||0) + e.amount; });

    const r = 50, circumference = 2 * Math.PI * r;
    const segWrap = $('g-donut-segments');
    segWrap.innerHTML = '';
    if(spent > 0){
      let cumulative = 0;
      EXP_CATEGORIES.forEach(c=>{
        const amt = totals[c.key];
        if(amt <= 0) return;
        const segLen = (amt / spent) * circumference;
        const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        circle.setAttribute('cx','60'); circle.setAttribute('cy','60'); circle.setAttribute('r', r);
        circle.setAttribute('fill','none');
        circle.setAttribute('stroke', c.color);
        circle.setAttribute('stroke-width','16');
        circle.setAttribute('stroke-dasharray', `${segLen} ${circumference - segLen}`);
        circle.setAttribute('stroke-dashoffset', String(-cumulative));
        circle.style.transition = 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)';
        segWrap.appendChild(circle);
        cumulative += segLen;
      });
    }
    $('g-donut-total').textContent = formatCOP(spent);

    const legend = $('g-legend');
    legend.innerHTML = '';
    EXP_CATEGORIES.forEach(c=>{
      const row = document.createElement('div');
      row.className = 'g-legend-row';
      row.innerHTML = `<span class="g-legend-dot" style="background:${c.color};"></span><span class="g-legend-label">${c.label}</span><span class="g-legend-amt">${formatCOP(totals[c.key])}</span>`;
      legend.appendChild(row);
    });

    // ---- expenses list ----
    const list = $('g-expenses-list');
    if(data.expenses.length === 0){
      list.innerHTML = `<div class="g-empty"><div class="g-mascot" style="width:60px;height:60px;">${MASCOT_B}</div><p>Aún no registras gastos este mes.</p></div>`;
    } else {
      list.innerHTML = '';
      data.expenses.forEach(e=>{
        const cat = EXP_CATEGORIES.find(c=>c.key===e.category) || EXP_CATEGORIES[3];
        const row = document.createElement('div');
        row.className = 'g-expense-row';
        row.innerHTML = `
          <div class="g-cat-ic ${cat.cls}">${ICON[cat.icon]}</div>
          <div class="g-expense-main">
            <div class="g-expense-cat">${cat.label}${e.note ? ' · ' + escapeHtml(e.note) : ''}</div>
            <div class="g-expense-date">${formatDateLong(e.date)}</div>
          </div>
          <div class="g-expense-amt">${formatCOP(e.amount)}</div>
          <button class="g-expense-del" data-id="${e.id}">${ICON.x}</button>
        `;
        row.querySelector('.g-expense-del').addEventListener('click', async ()=>{
          const { error } = await supabase.from('expenses').delete().eq('id', e.id);
          if(error){ toast('No se pudo eliminar'); return; }
          data.expenses = data.expenses.filter(x=>x.id!==e.id);
          renderGastos();
        });
        list.appendChild(row);
      });
    }
  }
  function formatDateLong(iso){
    const d = new Date(iso + 'T00:00:00');
    if(isNaN(d)) return '';
    return d.toLocaleDateString('es-ES', {day:'numeric', month:'short'});
  }

  $('btn-set-budget').addEventListener('click', openBudgetModal);
  $('btn-edit-budget').addEventListener('click', openBudgetModal);
  function openBudgetModal(){
    $('gp-amount').value = data.budget ? data.budget.amount : '';
    $('modal-presupuesto').classList.add('active');
  }
  $('gp-save').addEventListener('click', async ()=>{
    const amount = parseFloat($('gp-amount').value);
    if(!amount || amount <= 0){ toast('Escribe un presupuesto válido'); return; }
    const { data: row, error } = await supabase.from('budgets')
      .upsert({ month: currentMonthKey(), amount }, { onConflict: 'user_id,month' })
      .select().single();
    if(error){ toast('No se pudo guardar el presupuesto'); return; }
    data.budget = { id: row.id, amount: Number(row.amount) };
    closeModals(); renderGastos(); toast('Presupuesto guardado');
  });

  function buildCatSelect(){
    const wrap = $('ge-cat-select');
    wrap.innerHTML = '';
    EXP_CATEGORIES.forEach(c=>{
      const opt = document.createElement('div');
      opt.className = 'g-cat-opt' + (c.key===selectedExpCategory ? ' sel' : '');
      opt.innerHTML = `<div class="g-cat-ic ${c.cls}">${ICON[c.icon]}</div><span>${c.label}</span>`;
      opt.addEventListener('click', ()=>{ selectedExpCategory = c.key; buildCatSelect(); });
      wrap.appendChild(opt);
    });
  }
  $('btn-add-gasto').addEventListener('click', ()=>{
    selectedExpCategory = 'transporte';
    buildCatSelect();
    $('ge-amount').value = '';
    $('ge-note').value = '';
    $('ge-date').value = new Date().toISOString().slice(0,10);
    $('modal-gasto').classList.add('active');
  });
  $('ge-save').addEventListener('click', async ()=>{
    const amount = parseFloat($('ge-amount').value);
    if(!amount || amount <= 0){ toast('Escribe un monto válido'); return; }
    const payload = {
      category: selectedExpCategory, amount,
      note: $('ge-note').value.trim() || null,
      expense_date: $('ge-date').value || new Date().toISOString().slice(0,10),
    };
    const { data: row, error } = await supabase.from('expenses').insert(payload).select().single();
    if(error){ toast('No se pudo guardar el gasto'); return; }
    const {start, end} = monthRange(currentMonthKey());
    if(row.expense_date >= start && row.expense_date <= end){
      data.expenses.unshift({ id:row.id, category:row.category, amount:Number(row.amount), note:row.note, date:row.expense_date, createdAt:row.created_at });
      data.expenses.sort((a,b)=> b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
    }
    closeModals(); renderGastos(); toast('Gasto agregado');
  });

  // ---------- helpers ----------
  function escapeHtml(str){
    return String(str||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function formatDate(iso){
    const d = new Date(iso);
    if(isNaN(d)) return '';
    return d.toLocaleDateString('es-ES', {day:'numeric', month:'short'});
  }
  function formatSize(bytes){
    if(!bytes) return '';
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
    return (bytes/1024/1024).toFixed(1) + ' MB';
  }
  function emptyState(icon, cls, text){
    return `<div class="empty-state" style="grid-column:1/-1;"><div class="icon-sq ${cls}">${icon}</div><p>${text}</p></div>`;
  }
  function renderAll(){ renderCalendar(); renderTasks(); renderNotes(); renderApuntes(); renderGastos(); }

  init();

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    });
  }
})();

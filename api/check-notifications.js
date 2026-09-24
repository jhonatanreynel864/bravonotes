// api/check-notifications.js
//
// Esta función NO la llama la app — la llama un servicio externo de "cron"
// (cron-job.org) cada minuto. Revisa si alguien tiene una clase por empezar
// o una tarea que vence hoy, y le manda una notificación push de verdad.

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const TIMEZONE = 'America/Bogota';

// Mensajes de "buenos días" de Halloween — cada día del año usa uno distinto
// al del día anterior, rotando en orden por esta lista.
const GOOD_MORNING_MESSAGES = [
  '🎃 Buenos días, pequeña criatura.',
  '👻 Buenos días, que la magia comience.',
  '🧙 Despierta, la magia te espera.',
  '🌙 Un día mágico comienza hoy.',
  '🎃 Hoy será un día de miedo… ¡de bonito!',
  '👻 Buenos días, alma encantada.',
  '🕷️ Que nada atrape tu alegría.',
  '🌙 Un hechizo de buenas vibras para ti.',
  '🌙 Sonríe, hoy hay magia en el aire.',
];

function getBogotaParts(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  });
  const parts = {};
  fmt.formatToParts(date).forEach(p => { parts[p.type] = p.value; });
  const weekdayMap = { Mon:0, Tue:1, Wed:2, Thu:3, Fri:4, Sat:5, Sun:6 };
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    dayIdx: weekdayMap[parts.weekday],
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
  };
}

function dayOfYear(year, month, day) {
  const start = new Date(Date.UTC(year, 0, 1));
  const current = new Date(Date.UTC(year, month - 1, day));
  return Math.floor((current - start) / 86400000) + 1;
}

module.exports = async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  webpush.setVapidDetails(
    'mailto:contacto@bravonotes.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const now = new Date();
  const { dateStr: todayStr, hour, minute, dayIdx, year, month, day } = getBogotaParts(now);
  const nowMinutes = hour * 60 + minute;

  const results = { classes: 0, tasks: 0, buenosdias: 0, sent: 0, errors: 0 };

  async function alreadyNotified(refType, refId) {
    const { data } = await supabase
      .from('notification_log')
      .select('id')
      .eq('ref_type', refType)
      .eq('ref_id', refId)
      .eq('notif_date', todayStr)
      .maybeSingle();
    return !!data;
  }
  async function markNotified(userId, refType, refId) {
    await supabase.from('notification_log').insert({ user_id: userId, ref_type: refType, ref_id: refId, notif_date: todayStr });
  }
  async function sendToUser(userId, title, body) {
    const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId);
    if (!subs || subs.length === 0) return;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body })
        );
        results.sent++;
      } catch (err) {
        results.errors++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }
  }

  // ---------- Clases que empiezan en los próximos 10 minutos ----------
  const { data: classes } = await supabase.from('schedule').select('*').eq('day', dayIdx);
  for (const c of (classes || [])) {
    const [h, m] = c.time.split(':').map(Number);
    const diff = (h * 60 + m) - nowMinutes;
    if (diff >= 0 && diff <= 10) {
      results.classes++;
      if (!(await alreadyNotified('clase', c.id))) {
        await sendToUser(c.user_id, 'Clase en 10 minutos', `${c.subject} a las ${c.time}`);
        await markNotified(c.user_id, 'clase', c.id);
      }
    }
  }

  // ---------- Tareas que vencen hoy y no están hechas ----------
  const { data: tasks } = await supabase.from('tasks').select('*').eq('due_date', todayStr).eq('done', false);
  for (const t of (tasks || [])) {
    results.tasks++;
    if (!(await alreadyNotified('tarea', t.id))) {
      await sendToUser(t.user_id, 'Tarea pendiente para hoy', t.title);
      await markNotified(t.user_id, 'tarea', t.id);
    }
  }

  // ---------- Buenos días, todos los días a las 6:00 a.m. ----------
  if (hour === 6 && minute < 5) {
    const doy = dayOfYear(year, month, day);
    const message = GOOD_MORNING_MESSAGES[doy % GOOD_MORNING_MESSAGES.length];
    const { data: allSubs } = await supabase.from('push_subscriptions').select('user_id');
    const uniqueUserIds = [...new Set((allSubs || []).map(s => s.user_id))];
    for (const uid of uniqueUserIds) {
      if (!(await alreadyNotified('buenosdias', uid))) {
        await sendToUser(uid, 'Bravonotes', message);
        await markNotified(uid, 'buenosdias', uid);
        results.buenosdias++;
      }
    }
  }

  res.status(200).json({ ok: true, ...results, checkedAt: `${todayStr} ${hour}:${String(minute).padStart(2,'0')}` });
};

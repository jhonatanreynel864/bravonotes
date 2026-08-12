// api/check-notifications.js
//
// Esta función NO la llama la app — la llama un servicio externo de "cron"
// (cron-job.org) cada minuto. Revisa si alguien tiene una clase por empezar
// o una tarea que vence hoy, y le manda una notificación push de verdad
// (funciona con el celular bloqueado o la app cerrada).

const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const TIMEZONE = 'America/Bogota';

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
  };
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
  const { dateStr: todayStr, hour, minute, dayIdx } = getBogotaParts(now);
  const nowMinutes = hour * 60 + minute;

  const results = { classes: 0, tasks: 0, sent: 0, errors: 0 };

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
    await supabase.from('notification_log').insert({
      user_id: userId, ref_type: refType, ref_id: refId, notif_date: todayStr,
    });
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
    const classMinutes = h * 60 + m;
    const diff = classMinutes - nowMinutes;
    if (diff >= 0 && diff <= 10) {
      results.classes++;
      const already = await alreadyNotified('clase', c.id);
      if (!already) {
        await sendToUser(c.user_id, 'Clase en 10 minutos', `${c.subject} a las ${c.time}`);
        await markNotified(c.user_id, 'clase', c.id);
      }
    }
  }

  // ---------- Tareas que vencen hoy y no están hechas ----------
  const { data: tasks } = await supabase.from('tasks').select('*').eq('due_date', todayStr).eq('done', false);
  for (const t of (tasks || [])) {
    results.tasks++;
    const already = await alreadyNotified('tarea', t.id);
    if (!already) {
      await sendToUser(t.user_id, 'Tarea pendiente para hoy', t.title);
      await markNotified(t.user_id, 'tarea', t.id);
    }
  }

  res.status(200).json({ ok: true, ...results, checkedAt: `${todayStr} ${hour}:${String(minute).padStart(2,'0')}` });
};

# Bravonotes

## Qué hay nuevo en esta actualización

1. **Editar clases**: toca cualquier clase ya creada (no solo la ✕) para abrir el formulario con sus datos y modificarla, o eliminarla desde ahí mismo.
2. **Widget "Tu resumen de hoy"**: arriba del todo en Agenda. Toca el ícono de engranaje para elegir qué quieres ver ahí (clases de hoy, tareas pendientes, resumen de gastos, o apuntes recientes).
3. **Comparativa mensual de gastos**: gráfico de barras en la sección de Gastos, con los últimos 6 meses.
4. **Notificaciones**: activables desde tu foto de perfil (arriba a la derecha) → "Activar notificaciones". Lee la sección de abajo, porque tienen una limitación importante que debes conocer.

## Paso extra en Supabase (antes de usar el widget)

El widget necesita una tabla nueva para recordar tu elección:

1. Ve a Supabase → **SQL Editor** → **New query**.
2. Copia y pega el contenido de `supabase/schema_widget.sql`.
3. Dale **Run**.

(Los otros dos archivos SQL de la carpeta `supabase/` son los mismos que ya corriste antes — los dejé ahí solo de referencia, no hace falta correrlos de nuevo.)

## Sobre las notificaciones — léelo antes de confiar en ellas

Implementé la versión que se puede hacer **sin backend adicional**: mientras tienes Bravonotes abierta (en primer o segundo plano reciente), la app revisa cada 30 segundos si tienes una clase en los próximos 10 minutos o una tarea que vence hoy, y te muestra una notificación nativa del sistema.

**La limitación real**: en iPhone, si cierras la app completamente (la deslizas para cerrarla) o pasa mucho rato en segundo plano, iOS "duerme" la página y las notificaciones dejan de dispararse — no es una limitación mía, es como funciona Safari en iOS. Para que de verdad te avisen con el teléfono bloqueado o la app cerrada, se necesita **notificaciones push reales**, que requieren:

- Un servidor que mande el aviso en el momento exacto (no puede hacerlo tu celular si la app está cerrada).
- Llaves de seguridad especiales (VAPID) y una función que revise la base de datos cada minuto.

Es una funcionalidad real y se puede hacer, pero es un proyecto aparte con más piezas técnicas (un servicio externo gratuito tipo cron-job.org, o Supabase Edge Functions). Si te interesa que lo armemos, dímelo y seguimos desde ahí — no quise mezclarlo con esta entrega para no dejarte algo a medias sin que lo supieras.

## Cómo aplicar esta actualización

1. Reemplaza `index.html` y `app.js` en tu proyecto por los que vienen en este zip.
2. **No toques** `config.js` (ya tiene tus llaves de Supabase) — el que viene aquí es solo un ejemplo en blanco.
3. Corre el SQL nuevo (ver arriba).
4. Sube los cambios:

```bash
git add .
git commit -m "Editar clases, widget de inicio, comparativa mensual y notificaciones"
git push
```

5. Como siempre: borra la app de tu pantalla de inicio y vuelve a agregarla después de que Vercel termine de desplegar.

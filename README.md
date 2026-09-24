# Bravonotes — Edición de Halloween 🎃

## Qué cambió

1. **Tema visual completo** — fondo oscuro morado/negro con acentos naranjas, murciélagos y telarañas decorativas, inspirado en la imagen que mandaste. Aplica a toda la app, incluida Gastos (que ahora usa un verde oscuro en vez de tonos claros, pero conserva su identidad propia).
2. **Mascota nueva** — la vampira que mandaste, usada tal cual (sin modificar), tanto en la racha (Tareas) como en Gastos.
3. **Logo nuevo** — el que me pasaste, tal cual, en el ícono de la app, la pantalla de login y el encabezado.
4. **Vestuario eliminado** — quité por completo el sistema de moños y gorros. Ahora en Tareas solo se ve la mascota con la racha, sin ropa ni clóset.
5. **Mensajes de "buenos días" nuevos y rotativos** — usé los 9 mensajes que me pasaste. Cada día se manda uno distinto al del día anterior (van rotando en el orden de tu lista, y se repite el ciclo después del noveno).

## Qué reemplazar en tu proyecto

Reemplaza estos archivos por los de este zip:
- `index.html`
- `app.js`
- `sw.js`
- `manifest.json`
- `api/check-notifications.js`
- La carpeta `icons/` completa (trae el logo y la mascota nuevos)

## Qué NO tocar

- **`config.js`** — no lo reemplaces, ya tiene tus llaves de Supabase y la llave VAPID configuradas. El de este zip es un ejemplo en blanco, si lo pegas encima se rompe la conexión con tu base de datos.
- **`package.json`** — no cambió, no hace falta tocarlo.
- Los archivos `.sql` en `supabase/` — ninguno cambió, no hace falta correr nada nuevo esta vez.

## Subir los cambios

```bash
git add .
git commit -m "Edicion de Halloween: tema visual, mascota, logo y buenos dias rotativos"
git push
```

No hace falta tocar nada en Vercel ni en cron-job.org — todo lo demás sigue igual.

Como siempre: después de que Vercel despliegue, **borra la app de tu pantalla de inicio y vuélvela a agregar** para que tome el ícono y el tema nuevos (iOS cachea agresivamente el ícono viejo si no reinstalas).

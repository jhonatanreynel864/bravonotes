# Bravonotes — Notificaciones push reales

Esta actualización agrega notificaciones que llegan **aunque tengas el celular bloqueado o la app cerrada**. Requiere configurar unas piezas nuevas — sigue los pasos en orden.

## Tus llaves (ya generadas, cópialas de aquí)

```
VAPID_PUBLIC_KEY  = BKTXa479LuQWkC30DqAn7mbTefHLjqs4bA0fvNdxk13fgvz_hOptRJjrddsYl8lMrcZ0P7EdmYCnWi8DKGQeWCQ
VAPID_PRIVATE_KEY = t2G_joLAszySa5pBMlleg8YJ18igmPpO0ttP73Zf_Kw
CRON_SECRET       = 5c08d7d02faab0daedb9d7a3b6cc48744d9e6f22ba995bab
```

Guárdalas en algún lado (una nota o gestor de contraseñas) — las vas a necesitar en el Paso 3.

---

## Paso 1 — Correr el SQL nuevo en Supabase

1. Supabase → **SQL Editor** → **New query**.
2. Copia y pega el contenido de `supabase/schema_push.sql`.
3. **Run**.

## Paso 2 — Conseguir tu Service Role Key

Esta es distinta a la "anon key" que ya tienes en `config.js` — esta es secreta y **nunca va en el código**, solo en la configuración del servidor.

1. Supabase → **Project Settings → API**.
2. Busca la sección **"service_role"** (dice "secret", con un botón "Reveal").
3. Cópiala.

## Paso 3 — Configurar las variables de entorno en Vercel

1. En tu proyecto de Vercel → **Settings → Environment Variables**.
2. Agrega estas 5, una por una (Name / Value), dejando marcado el entorno por defecto (Production, Preview, Development):

| Name | Value |
|---|---|
| `SUPABASE_URL` | La misma URL que usas en `config.js` (`https://xxxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | La que copiaste en el Paso 2 |
| `VAPID_PUBLIC_KEY` | `BKTXa479LuQWkC30DqAn7mbTefHLjqs4bA0fvNdxk13fgvz_hOptRJjrddsYl8lMrcZ0P7EdmYCnWi8DKGQeWCQ` |
| `VAPID_PRIVATE_KEY` | `t2G_joLAszySa5pBMlleg8YJ18igmPpO0ttP73Zf_Kw` |
| `CRON_SECRET` | `5c08d7d02faab0daedb9d7a3b6cc48744d9e6f22ba995bab` |

3. Guarda cada una.

## Paso 4 — Subir el código

Este es el mismo de siempre, pero esta vez importa porque Vercel necesita ver la carpeta `api/` y el `package.json` nuevo para crear la función del servidor:

```bash
git add .
git commit -m "Agregar notificaciones push reales"
git push
```

Espera a que el deploy en Vercel diga "Ready".

## Paso 5 — Activar el "cron" que dispara la función cada minuto

Sin este paso, la función existe pero nadie la llama, y nunca se manda ningún aviso.

1. Ve a **https://cron-job.org** y crea una cuenta gratis.
2. **Create cronjob**.
3. En **URL**, pon (reemplaza `bravonotes` si tu dominio es distinto):
   ```
   https://bravonotes.vercel.app/api/check-notifications?secret=5c08d7d02faab0daedb9d7a3b6cc48744d9e6f22ba995bab
   ```
4. En la frecuencia, elige que se ejecute **cada 1 minuto** (o el intervalo más corto que te deje el plan gratis).
5. Guarda y actívalo.

## Paso 6 — Probarlo

1. Abre Bravonotes en tu celular (agregada a la pantalla de inicio).
2. Toca tu foto de perfil → **"Activar notificaciones"** → acepta el permiso que te pida el sistema.
3. Crea una **tarea con fecha de hoy**.
4. Espera hasta 1 minuto (lo que tarde el cron en volver a ejecutarse) — te debería llegar la notificación **aunque hayas cerrado la app o bloqueado el celular**.
5. Para probar la de clases: crea una clase para el día de hoy, con la hora puesta a menos de 10 minutos en el futuro.

Si después de un par de minutos no te llega nada, dime y revisamos juntos — lo más común en estos casos es una variable de entorno mal copiada o el cron mal configurado.

---

## Resto del proyecto (sin cambios)

Las otras funciones (editar clases, widget de inicio, comparativa mensual de gastos) siguen igual que en la entrega anterior. El resto de archivos SQL en `supabase/` ya los corriste antes, no hace falta repetirlos.

# Bravonotes — Animación de tareas, buenos días, y racha

## Qué hay nuevo

1. **Animación al completar una tarea**: el check hace un pequeño rebote y suelta un mini confeti de colores.
2. **"Buenos días" automático a las 6:00 a.m.**: se suma a las notificaciones que ya tenías (clase en 10 min, tarea pendiente). No necesitas hacer nada extra en cron-job.org — usa el mismo cron que ya configuraste, solo se agregó la lógica dentro de la misma función.
3. **Racha de tareas (opcional)**: apagada por defecto. Se activa desde tu foto de perfil → "Activar racha". Cuenta los días seguidos en que completaste al menos una tarea, con tu mascota mostrando el número en una burbuja, arriba de la lista de Tareas.

## Paso obligatorio — correr el SQL nuevo

1. Supabase → **SQL Editor** → **New query**.
2. Copia y pega el contenido de `supabase/schema_streak.sql`.
3. **Run**.

Esto crea la tabla de racha y le agrega una columna nueva a la tabla de preferencias que ya tenías (no le hace nada a tus datos existentes).

## Subir los cambios

```bash
git add .
git commit -m "Animacion al completar tareas, buenos dias y racha opcional"
git push
```

No hace falta tocar nada en Vercel ni en cron-job.org — ambos ya estaban configurados y esta actualización reutiliza esa misma infraestructura.

## Sobre la mascota de la racha

Usé la imagen exacta que me mandaste (recortada solo el personaje, sin la burbuja original) — la burbuja de "racha" la armé yo con HTML/CSS para que el número se actualice solo con tu progreso real, en vez de quedar fijo en "23".

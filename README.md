# Bravonotes — Vestuario de la mascota + racha permanente

## Importante: esta actualización incluye la de la vez pasada

La actualización anterior (racha que ya no se reinicia) todavía no la habías subido — quedó incluida aquí también, así que con subir esta ya te quedan las dos aplicadas juntas.

## Qué hay nuevo

1. **Racha permanente**: suma +1 la primera vez que completas una tarea cada día, y no se resetea si te saltas un día.
2. **Vestuario de la mascota**: 10 moños + 15 gorros, usando tus imágenes exactas. Se desbloquean con los días de racha (los primeros 3 de cada tipo a los 2 días, el resto a los 5). Se abre tocando el botón del gancho junto a la racha, o tocando la mascota directamente.
3. **Mascota nueva en Gastos**: reemplacé la mascota morada/naranja que había por la verde que me mandaste, en el encabezado y en el estado vacío.

## Paso obligatorio — correr el SQL nuevo

1. Supabase → **SQL Editor** → **New query**.
2. Copia y pega el contenido de `supabase/schema_wardrobe.sql`.
3. **Run**.

(Si por alguna razón tampoco corriste `schema_streak.sql` de la entrega anterior, corre ese primero — sin él la racha no funciona.)

## Subir los cambios

```bash
git add .
git commit -m "Vestuario de la mascota, racha permanente, y mascota nueva en gastos"
git push
```

No hace falta tocar nada en Vercel ni en cron-job.org.

## Sobre las imágenes

Recorté cada moño y cada gorro de tus dos imágenes de referencia (sin modificarlos), y usé la mascota verde exactamente como me la mandaste. La posición de cada accesorio sobre la mascota la calibré a mano comparándola con las fotos de ejemplo que mandaste de cómo se ve cada uno puesto.

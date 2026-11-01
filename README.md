# Bravonotes — Edición de Navidad 🎄

## Qué cambió

1. **Fondo rojo sólido** en toda la app, con **nieve cayendo** (tu código: 600 copos, velocidad media). La nieve va *detrás* de todo el contenido: cae sobre el rojo, nunca encima de las tarjetas de horarios, tareas, notas, gastos ni modales (`snow.js`).
2. **Liquid glass verde translúcido**: las tarjetas y la barra superior dejan ver el fondo desenfocado (la nieve se ve como luces suaves detrás), con bordes de luz y reflejo especular. La barra de pestañas y los modales son algo más oscuros para que el texto se lea bien. Botones en dorado, pestaña activa en rojo con "gorrito" de nieve.
3. **Logo nuevo** tal cual (solo redimensionado) en ícono de la app, ícono de iOS, favicon y encabezado.
4. **Mascota nueva (Santa)** en los dos lugares donde estaba la mascota: racha (Tareas) y Gastos (cabecera, sin presupuesto y lista vacía). Se le quitó el fondo de cuadritos para que quede transparente.
5. **Sin pantalla de login con Google**: ahora al abrir la app se reproduce tu video de entrada (`intro.mp4`).
6. Se quitaron murciélagos, telarañas y calabazas. Gastos ya no tiene su fondo propio: usa el mismo rojo.
7. Los 9 mensajes de "buenos días" son ahora navideños (`api/check-notifications.js`; edítalos si quieres otros).

## Cómo funciona la entrada ahora

- **Con sesión iniciada:** video → entra directo a la app.
- **Sin sesión (primera vez o tras cerrar sesión):** video → se abre directamente la cuenta de Google. No hay tarjeta de login. Si algo falla o cierras sesión, sobre el video aparece "Toca para entrar".
- Supabase sigue necesitando una sesión para guardar los datos de cada usuario, por eso Google se mantiene detrás, solo que sin su pantalla.

## Qué reemplazar en tu proyecto

Reemplaza / agrega:
- `index.html`, `app.js`, `sw.js`, `manifest.json`
- **Nuevos:** `snow.js`, `intro.mp4`, `intro-poster.jpg`
- `api/check-notifications.js`
- La carpeta `icons/` completa (logo y mascota nuevos; ya no existen los PNG de Halloween)

## Qué NO tocar

- **`config.js`**: no lo reemplaces (tiene tus llaves de Supabase y VAPID).
- `package.json` y los `.sql` de `supabase/`: no cambiaron.

## Subir los cambios

```bash
git add .
git commit -m "Edicion de Navidad: tema rojo/verde, nieve, Santa, logo y video de entrada"
git push
```

Después de que Vercel despliegue, **borra la app de tu pantalla de inicio y vuélvela a agregar** para que iOS tome el ícono nuevo.

Nota: el video se reproduce sin sonido (los navegadores bloquean el audio automático).

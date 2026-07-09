# Bravonotes

Dashboard para estudiantes: login con Google, calendario de clases, tareas, notas y apuntes (texto, fotos o documentos). Ahora usa **Supabase** como backend (login, base de datos y almacenamiento de archivos) y se despliega en **Vercel**.

## Estructura del proyecto

```
bravonotes-app/
├── index.html          ← estructura y estilos (glassmorfismo morado)
├── app.js              ← toda la lógica de la app (auth, calendario, tareas, notas, apuntes)
├── config.js           ← aquí van tus credenciales de Supabase
└── supabase/
    └── schema.sql       ← script para crear las tablas y permisos en Supabase
```

---

## Paso 1 — Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea una cuenta (gratis).
2. Clic en **New project**. Ponle un nombre (ej. `bravonotes`) y una contraseña de base de datos (guárdala, no la necesitarás casi nunca).
3. Espera 1-2 minutos a que se cree.

## Paso 2 — Crear las tablas

1. En el menú lateral, ve a **SQL Editor**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor.
3. Dale a **Run**. Esto crea las tablas `schedule`, `tasks`, `notes`, `apuntes`, activa la seguridad por usuario (RLS) y crea el bucket privado `apuntes-files` para fotos y documentos.

## Paso 3 — Activar el login con Google

1. En Supabase, ve a **Authentication → Providers → Google** y actívalo.
2. Necesitas un **Client ID** y **Client Secret** de Google. Para conseguirlos:
   - Ve a https://console.cloud.google.com/apis/credentials
   - Crea un proyecto (o usa uno existente).
   - **Create credentials → OAuth client ID → Web application**.
   - En **Authorized redirect URIs** pega la URL que Supabase te muestra en esa misma pantalla (algo como `https://TU-PROYECTO.supabase.co/auth/v1/callback`).
   - Copia el Client ID y Client Secret que Google te da, y pégalos en Supabase.
3. Guarda los cambios en Supabase.
4. En **Authentication → URL Configuration**, agrega la URL donde vas a probar la app (por ejemplo `http://localhost:5500` mientras pruebas en VS Code, y luego la URL de Vercel cuando la publiques) en **Redirect URLs**.

## Paso 4 — Conectar tu app con tu proyecto de Supabase

1. En Supabase, ve a **Project Settings → API**.
2. Copia el **Project URL** y la **anon public key**.
3. Abre `config.js` en este proyecto y reemplaza los valores:

```js
window.SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
window.SUPABASE_ANON_KEY = "tu-anon-key-aqui";
```

Esta anon key es pública y segura de exponer en el frontend — la seguridad real la dan las políticas de RLS que ya quedaron activas en el Paso 2.

## Paso 5 — Probarlo en VS Code

1. Abre la carpeta `bravonotes-app` en VS Code.
2. Instala la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.
4. Debería aparecer el botón "Continuar con Google" y, al iniciar sesión, entrar directo al dashboard.

> Importante: agrega la URL que te dé Live Server (ej. `http://127.0.0.1:5500`) a **Redirect URLs** en Supabase (Paso 3.4), o el login redirigirá pero no te dejará entrar.

## Paso 6 — Subir el proyecto a GitHub

1. Crea un repositorio nuevo en https://github.com/new
2. Desde la carpeta del proyecto en tu computador:

```bash
git init
git add .
git commit -m "Bravonotes con Supabase"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bravonotes.git
git push -u origin main
```

## Paso 7 — Desplegar en Vercel

1. Entra a https://vercel.com y crea una cuenta con GitHub.
2. **Add New → Project** y elige el repositorio `bravonotes`.
3. Como es HTML/CSS/JS puro, Vercel no necesita configuración de build — déjalo por defecto y dale **Deploy**.
4. Cuando termine, te da una URL como `https://bravonotes.vercel.app`.
5. Copia esa URL y agrégala en Supabase → **Authentication → URL Configuration → Redirect URLs**, para que el login con Google funcione también en producción.

¡Listo! Ya tienes Bravonotes con login real de Google, base de datos y almacenamiento de archivos, publicado en la web.

## Notas

- Los archivos (fotos/documentos) se guardan en un bucket privado de Supabase Storage; cada quien solo puede ver los suyos.
- Si algo no carga después de desplegar, revisa la consola del navegador (F12) — casi siempre es una URL de redirect que falta agregar en Supabase.

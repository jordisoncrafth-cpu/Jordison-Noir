# JORDISON NOIR — Cómo poner tu página en línea

Son 4 partes. Hazlas desde una computadora y en este orden. Calcula unos 30 minutos.

---

## Parte 1 · Supabase (base de datos, tu usuario y tus fotos)

1. Entra a https://supabase.com/dashboard y pulsa **New project**.
   - Name: `jordison-noir`
   - Database Password: pulsa **Generate a password** y guárdala en un lugar seguro.
   - Region: **East US** o **West US** (las más cercanas a México).
   - Pulsa **Create new project** y espera 1–2 minutos.
2. En el menú de la izquierda abre **SQL Editor** y pulsa **New query**.
3. Abre el archivo `supabase/schema.sql` de esta carpeta, copia **todo** su contenido, pégalo y pulsa **Run**. Debe decir *Success*.
4. **Bloquea los registros** para que nadie más pueda crear una cuenta:
   **Authentication → Sign In / Providers** → desactiva **Allow new users to sign up** → **Save**.
5. **Crea tu usuario**: **Authentication → Users → Add user → Create new user**.
   - Escribe tu correo y una contraseña larga (mínimo 12 caracteres, que no uses en otro lado).
   - Marca **Auto Confirm User** y pulsa **Create user**.
6. **Hazte administrador**: vuelve a **SQL Editor → New query**, pega esta línea con TU correo y pulsa **Run**:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO@ejemplo.com';
   ```
7. Ve a **Project Settings → API** (o **Data API**) y deja abierta esa pantalla. Vas a necesitar:
   - **Project URL**
   - **anon public key** (la clave pública; nunca uses la *service_role*)

## Parte 2 · Subir el código a GitHub

1. Descomprime el archivo `jordison-noir.zip` en tu computadora.
2. Abre tu repositorio: https://github.com/jordisoncrafth-cpu/Jordison-Noir
3. Pulsa **Add file → Upload files** (o el enlace *uploading an existing file*).
4. Abre la carpeta descomprimida, selecciona **todo lo que hay dentro** (las carpetas `app`, `components`, `lib`, `public`, `supabase` y todos los archivos) y arrástralo a la página.
   *Importante: arrastra el contenido, no la carpeta completa.*
5. Abajo pulsa **Commit changes**.

## Parte 3 · Publicar con Vercel

1. Entra a https://vercel.com/new e importa el repositorio **Jordison-Noir** (si no aparece, pulsa *Adjust GitHub App Permissions* y dale acceso).
2. Antes de pulsar Deploy, abre **Environment Variables** y agrega estas tres:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | tu Project URL de Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu anon public key |
   | `VISITAS_SAL` | cualquier frase larga inventada, por ejemplo `noir-cuervo-lluvia-2026-fotografia` |

3. Pulsa **Deploy** y espera 2–3 minutos. Al terminar te dará una dirección tipo `jordison-noir.vercel.app`.
4. Vuelve a Supabase → **Authentication → URL Configuration** y en **Site URL** pon esa dirección. Guarda.

## Parte 4 · Entrar a tu panel

1. Abre `https://TU-DIRECCION.vercel.app/entrar`
2. Escribe tu correo y contraseña.
3. Desde el panel controlas todo:
   - **Resumen y visitas**: cuántas personas entran, qué ven, desde qué país y dispositivo.
   - **Fotografía**: colecciones, subir fotos, descripciones, datos de cámara.
   - **Textos y diario**: reflexiones, proceso creativo y diario (borrador, programada o publicada; pública, solo con enlace o privada).
   - **Lecturas**: libros, frases, interpretaciones y reflexiones.
   - **Comentarios**: ocultar o borrar lo que no te guste.
   - **Portada, secciones y redes**: todos los textos, nombres y orden de las secciones, foto de portada, Sobre mí, redes y aviso de privacidad.
   - **Diseño**: colores, tipografías, tamaños, logo y grano, con vista previa y botón para volver atrás.
   - **Descargar copia**: baja todo tu contenido en un archivo.

---

## Bueno saber

- **Tus fotos no se retocan.** Al subirlas solo se reducen a 2560 px para que la página cargue rápido, y se les quita la ubicación GPS. Guarda tus originales en tu computadora.
- **Videos**: puedes subir videos de hasta 50 MB. Para videos más largos, súbelos a YouTube (puede ser *no listado*) y pega el enlace.
- **Visitas**: se registran sin cookies y sin guardar direcciones IP. Tus propias visitas con sesión iniciada no cuentan.
- **Plan gratuito de Supabase**: si nadie entra a la página en 7 días, el proyecto se pausa; se reactiva desde el panel de Supabase con un clic.
- **Dominio propio** (por ejemplo `jordisonnoir.com`): cuando lo compres, se agrega en Vercel → Settings → Domains.
- **Contraseña olvidada**: Supabase → Authentication → Users → tu usuario → *Send password recovery*.

## Si algo falla

- *"Correo o contraseña incorrectos"*: revisa que creaste el usuario con **Auto Confirm**.
- *"Esta cuenta no tiene permiso"*: falta el paso 6 de la Parte 1 (hacerte administrador), o el correo de esa línea no coincide.
- *La página sale en blanco o con error*: revisa en Vercel → Settings → Environment Variables que las tres variables estén bien escritas, y vuelve a publicar (Deployments → ⋯ → Redeploy).
- *No se suben fotos*: verifica que corriste todo `schema.sql` (crea el espacio "media" para archivos).

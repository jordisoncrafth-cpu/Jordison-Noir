-- =====================================================================
-- JORDISON NOIR — Base de datos
-- Pega TODO este archivo en Supabase > SQL Editor > New query > Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Administradores: solo los usuarios en esta tabla pueden editar.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creado timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins se ven a sí mismos" on public.admins;
create policy "admins se ven a sí mismos" on public.admins
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Ajustes del sitio (una sola fila): diseño, textos, secciones, redes.
-- ---------------------------------------------------------------------
create table if not exists public.ajustes (
  id int primary key default 1 check (id = 1),
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
insert into public.ajustes (id, datos) values (1, '{}'::jsonb) on conflict (id) do nothing;
alter table public.ajustes enable row level security;

drop policy if exists "ajustes lectura pública" on public.ajustes;
create policy "ajustes lectura pública" on public.ajustes for select using (true);
drop policy if exists "ajustes edita admin" on public.ajustes;
create policy "ajustes edita admin" on public.ajustes for all using (public.es_admin()) with check (public.es_admin());

-- Historial para poder volver a un diseño anterior.
create table if not exists public.ajustes_historial (
  id bigserial primary key,
  datos jsonb not null,
  creado timestamptz not null default now()
);
alter table public.ajustes_historial enable row level security;
drop policy if exists "historial solo admin" on public.ajustes_historial;
create policy "historial solo admin" on public.ajustes_historial for all using (public.es_admin()) with check (public.es_admin());

-- ---------------------------------------------------------------------
-- Fotografía: colecciones y fotos.
-- ---------------------------------------------------------------------
create table if not exists public.colecciones (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text not null default '',
  portada_url text,
  orden int not null default 0,
  publicada boolean not null default true,
  creado timestamptz not null default now()
);
alter table public.colecciones enable row level security;
drop policy if exists "colecciones públicas" on public.colecciones;
create policy "colecciones públicas" on public.colecciones for select using (publicada or public.es_admin());
drop policy if exists "colecciones admin" on public.colecciones;
create policy "colecciones admin" on public.colecciones for all using (public.es_admin()) with check (public.es_admin());

create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  coleccion_id uuid references public.colecciones(id) on delete set null,
  url text not null,
  ruta_archivo text,
  ancho int,
  alto int,
  titulo text not null default '',
  descripcion text not null default '',
  lugar text not null default '',
  fecha date,
  camara text not null default '',
  ajustes_tecnicos text not null default '',
  orden int not null default 0,
  publicada boolean not null default true,
  creado timestamptz not null default now()
);
alter table public.fotos enable row level security;
drop policy if exists "fotos públicas" on public.fotos;
create policy "fotos públicas" on public.fotos for select using (publicada or public.es_admin());
drop policy if exists "fotos admin" on public.fotos;
create policy "fotos admin" on public.fotos for all using (public.es_admin()) with check (public.es_admin());

-- ---------------------------------------------------------------------
-- Entradas: reflexiones, proceso creativo y diario.
-- estado: borrador | programada | publicada
-- visibilidad: publica | no_listada | privada
-- ---------------------------------------------------------------------
create table if not exists public.entradas (
  id uuid primary key default gen_random_uuid(),
  seccion text not null check (seccion in ('reflexiones','proceso','diario')),
  slug text unique not null,
  titulo text not null,
  resumen text not null default '',
  cuerpo text not null default '',
  portada_url text,
  video_url text,
  etiquetas text[] not null default '{}',
  disciplina text,
  estado text not null default 'borrador' check (estado in ('borrador','programada','publicada')),
  visibilidad text not null default 'publica' check (visibilidad in ('publica','no_listada','privada')),
  publicado_en timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table public.entradas enable row level security;
drop policy if exists "entradas visibles" on public.entradas;
create policy "entradas visibles" on public.entradas for select using (
  public.es_admin()
  or (
    estado in ('publicada','programada')
    and publicado_en is not null and publicado_en <= now()
    and visibilidad = 'publica'
  )
);

-- Las entradas "solo con enlace" no se pueden listar: solo se entregan si se conoce su dirección exacta.
create or replace function public.entrada_no_listada(p_seccion text, p_slug text)
returns setof public.entradas
language sql stable security definer set search_path = public
as $$
  select * from public.entradas
  where seccion = p_seccion and slug = p_slug
    and visibilidad = 'no_listada'
    and estado in ('publicada','programada')
    and publicado_en is not null and publicado_en <= now()
  limit 1;
$$;
grant execute on function public.entrada_no_listada(text, text) to anon, authenticated;
drop policy if exists "entradas admin" on public.entradas;
create policy "entradas admin" on public.entradas for all using (public.es_admin()) with check (public.es_admin());

-- ---------------------------------------------------------------------
-- Diario de lecturas: libros y notas.
-- ---------------------------------------------------------------------
create table if not exists public.libros (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  autor text not null default '',
  estado text not null default 'leyendo' check (estado in ('pendiente','leyendo','leido')),
  portada_url text,
  descripcion text not null default '',
  orden int not null default 0,
  visible boolean not null default true,
  creado timestamptz not null default now()
);
alter table public.libros enable row level security;
drop policy if exists "libros públicos" on public.libros;
create policy "libros públicos" on public.libros for select using (visible or public.es_admin());
drop policy if exists "libros admin" on public.libros;
create policy "libros admin" on public.libros for all using (public.es_admin()) with check (public.es_admin());

create table if not exists public.notas_libro (
  id uuid primary key default gen_random_uuid(),
  libro_id uuid not null references public.libros(id) on delete cascade,
  frase text not null default '',
  referencia text not null default '',
  interpretacion text not null default '',
  reflexion text not null default '',
  visible boolean not null default true,
  creado timestamptz not null default now()
);
alter table public.notas_libro enable row level security;
drop policy if exists "notas públicas" on public.notas_libro;
create policy "notas públicas" on public.notas_libro for select using (visible or public.es_admin());
drop policy if exists "notas admin" on public.notas_libro;
create policy "notas admin" on public.notas_libro for all using (public.es_admin()) with check (public.es_admin());

-- ---------------------------------------------------------------------
-- Comentarios de visitantes.
-- Los visitantes solo pueden comentar a través de la función comentar(),
-- que valida el texto y limita la cantidad de comentarios por persona.
-- ---------------------------------------------------------------------
create table if not exists public.comentarios (
  id uuid primary key default gen_random_uuid(),
  destino_tipo text not null check (destino_tipo in ('entrada','coleccion','libro')),
  destino_id uuid not null,
  nombre text not null,
  texto text not null,
  oculto boolean not null default false,
  huella text not null default '',
  creado timestamptz not null default now()
);
create index if not exists comentarios_destino on public.comentarios (destino_tipo, destino_id, creado);
alter table public.comentarios enable row level security;
drop policy if exists "comentarios visibles" on public.comentarios;
create policy "comentarios visibles" on public.comentarios for select using (not oculto or public.es_admin());
drop policy if exists "comentarios admin" on public.comentarios;
create policy "comentarios admin" on public.comentarios for all using (public.es_admin()) with check (public.es_admin());
-- Los visitantes no pueden ver la huella anónima.
revoke select on public.comentarios from anon;
grant select (id, destino_tipo, destino_id, nombre, texto, oculto, creado) on public.comentarios to anon;

create or replace function public.comentar(
  p_destino_tipo text, p_destino_id uuid, p_nombre text, p_texto text, p_huella text
) returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_recientes int;
begin
  p_nombre := btrim(coalesce(p_nombre, ''));
  p_texto := btrim(coalesce(p_texto, ''));
  if length(p_nombre) < 1 or length(p_nombre) > 60 then raise exception 'nombre_invalido'; end if;
  if length(p_texto) < 2 or length(p_texto) > 1500 then raise exception 'texto_invalido'; end if;
  if p_destino_tipo not in ('entrada','coleccion','libro') then raise exception 'destino_invalido'; end if;

  select count(*) into v_recientes from public.comentarios
    where huella = p_huella and creado > now() - interval '10 minutes';
  if v_recientes >= 3 then raise exception 'demasiados_comentarios'; end if;

  insert into public.comentarios (destino_tipo, destino_id, nombre, texto, huella)
    values (p_destino_tipo, p_destino_id, p_nombre, p_texto, coalesce(p_huella, ''))
    returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.comentar(text, uuid, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Visitas: se registran de forma anónima (sin IP ni datos personales).
-- ---------------------------------------------------------------------
create table if not exists public.visitas (
  id bigserial primary key,
  ruta text not null,
  pais text,
  dispositivo text,
  navegador text,
  referente text,
  visitante text not null,
  creado timestamptz not null default now()
);
create index if not exists visitas_creado on public.visitas (creado);
alter table public.visitas enable row level security;
drop policy if exists "visitas solo admin" on public.visitas;
create policy "visitas solo admin" on public.visitas for select using (public.es_admin());
drop policy if exists "visitas borra admin" on public.visitas;
create policy "visitas borra admin" on public.visitas for delete using (public.es_admin());

create or replace function public.registrar_visita(
  p_ruta text, p_pais text, p_dispositivo text, p_navegador text, p_referente text, p_visitante text
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_ruta is null or length(p_ruta) > 300 or p_ruta like '/panel%' or p_ruta like '/entrar%' then
    return;
  end if;
  insert into public.visitas (ruta, pais, dispositivo, navegador, referente, visitante)
    values (left(p_ruta, 300), left(p_pais, 8), left(p_dispositivo, 20), left(p_navegador, 30), left(p_referente, 120), left(p_visitante, 64));
end;
$$;
grant execute on function public.registrar_visita(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.total_visitas()
returns bigint
language sql stable security definer set search_path = public
as $$ select count(*) from public.visitas; $$;
grant execute on function public.total_visitas() to anon, authenticated;

-- ---------------------------------------------------------------------
-- Almacenamiento de archivos (fotos y videos).
-- Tipos permitidos y tamaño máximo los valida el propio Supabase.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media lectura pública" on storage.objects;
create policy "media lectura pública" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media sube admin" on storage.objects;
create policy "media sube admin" on storage.objects for insert with check (bucket_id = 'media' and public.es_admin());
drop policy if exists "media edita admin" on storage.objects;
create policy "media edita admin" on storage.objects for update using (bucket_id = 'media' and public.es_admin());
drop policy if exists "media borra admin" on storage.objects;
create policy "media borra admin" on storage.objects for delete using (bucket_id = 'media' and public.es_admin());

-- =====================================================================
-- ÚLTIMO PASO (después de crear tu usuario en Authentication > Users):
-- cambia el correo y ejecuta SOLO esta línea:
--
-- insert into public.admins (user_id) select id from auth.users where email = 'TU_CORREO@ejemplo.com';
-- =====================================================================

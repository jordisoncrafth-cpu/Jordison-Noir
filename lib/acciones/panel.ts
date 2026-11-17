'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigirAdmin } from '@/lib/auth';
import { AJUSTES_BASE, completarAjustes, FUENTES, type Ajustes, type ClaveSeccion } from '@/lib/ajustes';
import { crearSlug, sufijoAleatorio, texto, urlImagen, urlSegura } from '@/lib/util';
import { supabaseServidor } from '@/lib/supabase/server';

function refrescarTodo() {
  revalidatePath('/', 'layout');
}

/* ------------------------------ Sesión ------------------------------ */

export async function salir() {
  const supabase = await supabaseServidor();
  await supabase.auth.signOut();
  redirect('/entrar');
}

/* ------------------------------ Ajustes ------------------------------ */

async function guardarAjustes(cambiar: (actual: Ajustes) => Ajustes) {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from('ajustes').select('datos').eq('id', 1).maybeSingle();
  const actual = completarAjustes(data?.datos);
  // Guarda la versión anterior para poder volver a ella.
  await supabase.from('ajustes_historial').insert({ datos: actual });
  const nuevo = cambiar(actual);
  const { error } = await supabase.from('ajustes').upsert({ id: 1, datos: nuevo, actualizado: new Date().toISOString() });
  if (error) throw new Error('No se pudo guardar: ' + error.message);
  // Conserva solo las últimas 40 versiones.
  const { data: viejas } = await supabase.from('ajustes_historial').select('id').order('creado', { ascending: false }).range(40, 500);
  if (viejas?.length) await supabase.from('ajustes_historial').delete().in('id', viejas.map((v) => v.id));
  refrescarTodo();
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function guardarDiseno(fd: FormData) {
  const fuente = (campo: string, base: string) => {
    const v = texto(fd, campo, 60);
    return FUENTES.some((f) => f.nombre === v) ? v : base;
  };
  const color = (campo: string, base: string) => {
    const v = texto(fd, campo, 7);
    return HEX.test(v) ? v : base;
  };
  await guardarAjustes((a) => ({
    ...a,
    diseno: {
      fondo: color('fondo', a.diseno.fondo),
      superficie: color('superficie', a.diseno.superficie),
      lineas: color('lineas', a.diseno.lineas),
      texto: color('texto', a.diseno.texto),
      textoSecundario: color('textoSecundario', a.diseno.textoSecundario),
      acento: color('acento', a.diseno.acento),
      fuenteTitulos: fuente('fuenteTitulos', a.diseno.fuenteTitulos),
      fuenteTexto: fuente('fuenteTexto', a.diseno.fuenteTexto),
      fuenteDatos: fuente('fuenteDatos', a.diseno.fuenteDatos),
      tamanoTexto: Math.min(24, Math.max(15, Number(fd.get('tamanoTexto')) || 19)),
      escalaTitulos: Math.min(1.4, Math.max(0.7, Number(fd.get('escalaTitulos')) || 1)),
      grano: fd.get('grano') === 'on',
    },
    marca: {
      ...a.marca,
      logoUrl: urlImagen(texto(fd, 'logoUrl', 600)) || '',
    },
  }));
  redirect('/panel/diseno?ok=1');
}

export async function restaurarVersion(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = Number(fd.get('id'));
  const { data } = await supabase.from('ajustes_historial').select('datos').eq('id', id).maybeSingle();
  if (!data) redirect('/panel/diseno?error=1');
  await guardarAjustes(() => completarAjustes(data.datos));
  redirect('/panel/diseno?ok=restaurado');
}

export async function restaurarDisenoOriginal() {
  await guardarAjustes((a) => ({ ...a, diseno: { ...AJUSTES_BASE.diseno } }));
  redirect('/panel/diseno?ok=original');
}

export async function guardarTextos(fd: FormData) {
  const claves = AJUSTES_BASE.secciones.map((s) => s.clave);
  const secciones = claves
    .map((clave) => ({
      clave: clave as ClaveSeccion,
      nombre: texto(fd, `sec_nombre_${clave}`, 60) || AJUSTES_BASE.secciones.find((s) => s.clave === clave)!.nombre,
      descripcion: texto(fd, `sec_desc_${clave}`, 200),
      visible: fd.get(`sec_visible_${clave}`) === 'on',
      orden: Number(fd.get(`sec_orden_${clave}`)) || 0,
    }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ orden: _o, ...s }) => s);

  const redes = [0, 1, 2, 3, 4, 5]
    .map((i) => ({
      nombre: texto(fd, `red_nombre_${i}`, 40),
      url: urlSegura(texto(fd, `red_url_${i}`, 300)) || '',
      usuario: texto(fd, `red_usuario_${i}`, 60),
    }))
    .filter((r) => r.nombre);

  await guardarAjustes((a) => ({
    ...a,
    marca: { ...a.marca, nombre: texto(fd, 'marca_nombre', 60) || a.marca.nombre, lema: texto(fd, 'marca_lema', 80) },
    portada: {
      imagenUrl: urlImagen(texto(fd, 'portada_imagen', 600)) || '',
      etiqueta: texto(fd, 'portada_etiqueta', 80),
      titulo: texto(fd, 'portada_titulo', 60),
      subtitulo: texto(fd, 'portada_subtitulo', 60),
      texto: texto(fd, 'portada_texto', 300),
      datosFoto: texto(fd, 'portada_datos', 120),
      posicion: /^\d{1,3}% \d{1,3}%$/.test(texto(fd, 'portada_posicion', 12)) ? texto(fd, 'portada_posicion', 12) : '50% 20%',
    },
    sobreMi: { imagenUrl: urlImagen(texto(fd, 'sobre_imagen', 600)) || '', texto: texto(fd, 'sobre_texto', 6000) },
    privacidad: { texto: texto(fd, 'privacidad_texto', 8000) || a.privacidad.texto },
    secciones,
    redes,
    mostrarContador: fd.get('mostrar_contador') === 'on',
  }));
  redirect('/panel/textos?ok=1');
}

/* ------------------------------ Fotografía ------------------------------ */

async function slugLibre(tabla: string, base: string, ignorarId?: string) {
  const { supabase } = await exigirAdmin();
  let slug = base;
  for (let i = 2; i < 50; i++) {
    let q = supabase.from(tabla).select('id').eq('slug', slug);
    if (ignorarId) q = q.neq('id', ignorarId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${sufijoAleatorio(4)}`;
}

export async function guardarColeccion(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const titulo = texto(fd, 'titulo', 120) || 'Sin título';
  const fila = {
    titulo,
    descripcion: texto(fd, 'descripcion', 2000),
    portada_url: urlSegura(texto(fd, 'portada_url', 600)),
    orden: Number(fd.get('orden')) || 0,
    publicada: fd.get('publicada') === 'on',
    slug: await slugLibre('colecciones', crearSlug(texto(fd, 'slug', 80) || titulo), id || undefined),
  };
  const { error } = id
    ? await supabase.from('colecciones').update(fila).eq('id', id)
    : await supabase.from('colecciones').insert(fila);
  refrescarTodo();
  redirect(`/panel/fotos?${error ? 'error=' + encodeURIComponent(error.message) : 'ok=1'}`);
}

export async function borrarColeccion(fd: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from('colecciones').delete().eq('id', texto(fd, 'id', 40));
  refrescarTodo();
  redirect('/panel/fotos?ok=borrada');
}

export async function crearFotos(coleccionId: string | null, fotos: { url: string; ruta: string; ancho: number; alto: number; titulo: string }[]) {
  const { supabase } = await exigirAdmin();
  const filas = fotos
    .filter((f) => urlSegura(f.url))
    .map((f, i) => ({
      coleccion_id: coleccionId || null,
      url: f.url,
      ruta_archivo: f.ruta,
      ancho: Math.round(f.ancho) || null,
      alto: Math.round(f.alto) || null,
      titulo: (f.titulo || '').slice(0, 120),
      orden: Date.now() % 100000 + i,
    }));
  if (!filas.length) return { ok: false };
  const { error } = await supabase.from('fotos').insert(filas);
  // Si la colección no tiene portada, usa la primera foto.
  if (!error && coleccionId) {
    const { data: c } = await supabase.from('colecciones').select('portada_url').eq('id', coleccionId).maybeSingle();
    if (c && !c.portada_url) await supabase.from('colecciones').update({ portada_url: filas[0].url }).eq('id', coleccionId);
  }
  refrescarTodo();
  return { ok: !error, mensaje: error?.message };
}

export async function guardarFoto(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const fecha = texto(fd, 'fecha', 10);
  await supabase
    .from('fotos')
    .update({
      titulo: texto(fd, 'titulo', 120),
      descripcion: texto(fd, 'descripcion', 2000),
      lugar: texto(fd, 'lugar', 120),
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null,
      camara: texto(fd, 'camara', 120),
      ajustes_tecnicos: texto(fd, 'ajustes_tecnicos', 120),
      orden: Number(fd.get('orden')) || 0,
      publicada: fd.get('publicada') === 'on',
      coleccion_id: texto(fd, 'coleccion_id', 40) || null,
    })
    .eq('id', id);
  refrescarTodo();
  redirect(`/panel/fotos?ver=${encodeURIComponent(texto(fd, 'volver', 40))}&ok=foto`);
}

export async function borrarFoto(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const { data } = await supabase.from('fotos').select('ruta_archivo').eq('id', id).maybeSingle();
  await supabase.from('fotos').delete().eq('id', id);
  if (data?.ruta_archivo) await supabase.storage.from('media').remove([data.ruta_archivo]);
  refrescarTodo();
  redirect(`/panel/fotos?ver=${encodeURIComponent(texto(fd, 'volver', 40))}&ok=borrada`);
}

/* ------------------------------ Entradas ------------------------------ */

export async function guardarEntrada(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const titulo = texto(fd, 'titulo', 200) || 'Sin título';
  const seccion = texto(fd, 'seccion', 20);
  if (!['reflexiones', 'proceso', 'diario'].includes(seccion)) redirect('/panel/entradas?error=seccion');
  const visibilidad = texto(fd, 'visibilidad', 20);
  const accion = texto(fd, 'accion', 20); // borrador | publicar | programar
  const fechaProg = texto(fd, 'publicado_en', 30);

  let estado: 'borrador' | 'programada' | 'publicada' = 'borrador';
  let publicado_en: string | null = texto(fd, 'publicado_en_actual', 40) || null;
  if (accion === 'publicar') {
    estado = 'publicada';
    publicado_en = publicado_en && new Date(publicado_en) <= new Date() ? publicado_en : new Date().toISOString();
  } else if (accion === 'programar' && fechaProg) {
    // La fecha del formulario viene en hora local de México (UTC-6).
    const offset = texto(fd, 'zona', 10) || '-06:00';
    const d = new Date(`${fechaProg}:00${offset}`);
    if (!isNaN(d.getTime())) {
      estado = 'programada';
      publicado_en = d.toISOString();
    }
  }

  let slugBase = crearSlug(texto(fd, 'slug', 90) || titulo);
  const vis = (['publica', 'no_listada', 'privada'].includes(visibilidad) ? visibilidad : 'publica') as
    | 'publica'
    | 'no_listada'
    | 'privada';
  // Las entradas "no listadas" llevan una clave al final para que nadie adivine la dirección.
  if (vis === 'no_listada' && !/-[a-z2-9]{8}$/.test(slugBase)) slugBase = `${slugBase}-${sufijoAleatorio(8)}`;
  const slug = await slugLibre('entradas', slugBase, id || undefined);

  const fila = {
    seccion,
    titulo,
    slug,
    resumen: texto(fd, 'resumen', 400),
    cuerpo: texto(fd, 'cuerpo', 100000),
    portada_url: urlSegura(texto(fd, 'portada_url', 600)),
    video_url: urlSegura(texto(fd, 'video_url', 600)),
    etiquetas: texto(fd, 'etiquetas', 300)
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)
      .slice(0, 12),
    disciplina: texto(fd, 'disciplina', 40) || null,
    estado,
    visibilidad: vis,
    publicado_en,
    actualizado: new Date().toISOString(),
  };

  let nuevoId = id;
  if (id) {
    const { error } = await supabase.from('entradas').update(fila).eq('id', id);
    if (error) redirect(`/panel/entradas/${id}?error=${encodeURIComponent(error.message)}`);
  } else {
    const { data, error } = await supabase.from('entradas').insert(fila).select('id').single();
    if (error || !data) redirect(`/panel/entradas?error=${encodeURIComponent(error?.message || 'error')}`);
    nuevoId = data.id;
  }
  refrescarTodo();
  redirect(`/panel/entradas/${nuevoId}?ok=${estado}`);
}

export async function borrarEntrada(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  await supabase.from('entradas').delete().eq('id', id);
  await supabase.from('comentarios').delete().eq('destino_tipo', 'entrada').eq('destino_id', id);
  refrescarTodo();
  redirect('/panel/entradas?ok=borrada');
}

/* ------------------------------ Lecturas ------------------------------ */

export async function guardarLibro(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const titulo = texto(fd, 'titulo', 200) || 'Sin título';
  const estado = texto(fd, 'estado', 20);
  const fila = {
    titulo,
    autor: texto(fd, 'autor', 120),
    estado: ['pendiente', 'leyendo', 'leido'].includes(estado) ? estado : 'leyendo',
    portada_url: urlSegura(texto(fd, 'portada_url', 600)),
    descripcion: texto(fd, 'descripcion', 6000),
    orden: Number(fd.get('orden')) || 0,
    visible: fd.get('visible') === 'on',
    slug: await slugLibre('libros', crearSlug(titulo), id || undefined),
  };
  const { error } = id ? await supabase.from('libros').update(fila).eq('id', id) : await supabase.from('libros').insert(fila);
  refrescarTodo();
  redirect(`/panel/lecturas?${error ? 'error=' + encodeURIComponent(error.message) : 'ok=1'}`);
}

export async function borrarLibro(fd: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from('libros').delete().eq('id', texto(fd, 'id', 40));
  refrescarTodo();
  redirect('/panel/lecturas?ok=borrado');
}

export async function guardarNota(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const fila = {
    libro_id: texto(fd, 'libro_id', 40),
    frase: texto(fd, 'frase', 2000),
    referencia: texto(fd, 'referencia', 120),
    interpretacion: texto(fd, 'interpretacion', 8000),
    reflexion: texto(fd, 'reflexion', 8000),
    visible: fd.get('visible') === 'on',
  };
  const { error } = id ? await supabase.from('notas_libro').update(fila).eq('id', id) : await supabase.from('notas_libro').insert(fila);
  refrescarTodo();
  redirect(`/panel/lecturas?libro=${fila.libro_id}&${error ? 'error=' + encodeURIComponent(error.message) : 'ok=nota'}`);
}

export async function borrarNota(fd: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from('notas_libro').delete().eq('id', texto(fd, 'id', 40));
  refrescarTodo();
  redirect(`/panel/lecturas?libro=${texto(fd, 'libro_id', 40)}&ok=borrada`);
}

/* ------------------------------ Comentarios ------------------------------ */

export async function alternarComentario(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(fd, 'id', 40);
  const ocultar = fd.get('ocultar') === '1';
  await supabase.from('comentarios').update({ oculto: ocultar }).eq('id', id);
  refrescarTodo();
  redirect('/panel/comentarios?ok=1');
}

export async function borrarComentario(fd: FormData) {
  const { supabase } = await exigirAdmin();
  await supabase.from('comentarios').delete().eq('id', texto(fd, 'id', 40));
  refrescarTodo();
  redirect('/panel/comentarios?ok=borrado');
}

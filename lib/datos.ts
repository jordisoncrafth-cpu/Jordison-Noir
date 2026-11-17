import { supabaseServidor } from './supabase/server';

export type Coleccion = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  portada_url: string | null;
  orden: number;
  publicada: boolean;
};

export type Foto = {
  id: string;
  coleccion_id: string | null;
  url: string;
  ruta_archivo: string | null;
  ancho: number | null;
  alto: number | null;
  titulo: string;
  descripcion: string;
  lugar: string;
  fecha: string | null;
  camara: string;
  ajustes_tecnicos: string;
  orden: number;
  publicada: boolean;
  creado: string;
};

export type SeccionEntrada = 'reflexiones' | 'proceso' | 'diario';

export type Entrada = {
  id: string;
  seccion: SeccionEntrada;
  slug: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  portada_url: string | null;
  video_url: string | null;
  etiquetas: string[];
  disciplina: string | null;
  estado: 'borrador' | 'programada' | 'publicada';
  visibilidad: 'publica' | 'no_listada' | 'privada';
  publicado_en: string | null;
  creado: string;
  actualizado: string;
};

export type Libro = {
  id: string;
  slug: string;
  titulo: string;
  autor: string;
  estado: 'pendiente' | 'leyendo' | 'leido';
  portada_url: string | null;
  descripcion: string;
  orden: number;
  visible: boolean;
};

export type Nota = {
  id: string;
  libro_id: string;
  frase: string;
  referencia: string;
  interpretacion: string;
  reflexion: string;
  visible: boolean;
  creado: string;
};

export type Comentario = {
  id: string;
  destino_tipo: 'entrada' | 'coleccion' | 'libro';
  destino_id: string;
  nombre: string;
  texto: string;
  oculto: boolean;
  creado: string;
};

export const ESTADO_LIBRO: Record<Libro['estado'], string> = {
  pendiente: 'Pendiente',
  leyendo: 'Leyendo',
  leido: 'Leído',
};

export const DISCIPLINAS = ['Fotografía', 'Cinematografía', 'Edición', 'Dron', 'Otro'];

/* ---------- Lecturas públicas (las reglas de la base de datos filtran lo privado) ---------- */

export async function colecciones(): Promise<Coleccion[]> {
  const s = await supabaseServidor();
  const { data } = await s.from('colecciones').select('*').eq('publicada', true).order('orden').order('creado', { ascending: false });
  return (data as Coleccion[]) || [];
}

export async function fotosDe(coleccionId: string): Promise<Foto[]> {
  const s = await supabaseServidor();
  const { data } = await s
    .from('fotos')
    .select('*')
    .eq('coleccion_id', coleccionId)
    .eq('publicada', true)
    .order('orden')
    .order('creado');
  return (data as Foto[]) || [];
}

export async function fotosRecientes(n = 6): Promise<Foto[]> {
  const s = await supabaseServidor();
  const { data } = await s.from('fotos').select('*').eq('publicada', true).order('creado', { ascending: false }).limit(n);
  return (data as Foto[]) || [];
}

export async function entradas(seccion: SeccionEntrada, n = 100): Promise<Entrada[]> {
  const s = await supabaseServidor();
  const ahora = new Date().toISOString();
  const { data } = await s
    .from('entradas')
    .select('*')
    .eq('seccion', seccion)
    .in('estado', ['publicada', 'programada'])
    .eq('visibilidad', 'publica')
    .lte('publicado_en', ahora)
    .order('publicado_en', { ascending: false })
    .limit(n);
  return (data as Entrada[]) || [];
}

export async function entradasRecientes(n = 3): Promise<Entrada[]> {
  const s = await supabaseServidor();
  const ahora = new Date().toISOString();
  const { data } = await s
    .from('entradas')
    .select('*')
    .in('estado', ['publicada', 'programada'])
    .eq('visibilidad', 'publica')
    .lte('publicado_en', ahora)
    .order('publicado_en', { ascending: false })
    .limit(n);
  return (data as Entrada[]) || [];
}

/** Devuelve la entrada solo si es visible para el público (o si eres el admin). */
export async function entradaPorSlug(seccion: SeccionEntrada, slug: string): Promise<Entrada | null> {
  const s = await supabaseServidor();
  const { data } = await s.from('entradas').select('*').eq('seccion', seccion).eq('slug', slug).maybeSingle();
  if (data) return data as Entrada;
  const { data: oculta } = await s.rpc('entrada_no_listada', { p_seccion: seccion, p_slug: slug });
  return Array.isArray(oculta) && oculta.length ? (oculta[0] as Entrada) : null;
}

export async function libros(): Promise<Libro[]> {
  const s = await supabaseServidor();
  const { data } = await s.from('libros').select('*').eq('visible', true).order('orden').order('creado', { ascending: false });
  return (data as Libro[]) || [];
}

export async function libroPorSlug(slug: string): Promise<{ libro: Libro; notas: Nota[] } | null> {
  const s = await supabaseServidor();
  const { data } = await s.from('libros').select('*').eq('slug', slug).maybeSingle();
  if (!data) return null;
  const { data: notas } = await s.from('notas_libro').select('*').eq('libro_id', data.id).eq('visible', true).order('creado');
  return { libro: data as Libro, notas: (notas as Nota[]) || [] };
}

export async function comentariosDe(tipo: Comentario['destino_tipo'], id: string): Promise<Comentario[]> {
  const s = await supabaseServidor();
  const { data } = await s
    .from('comentarios')
    .select('id, destino_tipo, destino_id, nombre, texto, oculto, creado')
    .eq('destino_tipo', tipo)
    .eq('destino_id', id)
    .eq('oculto', false)
    .order('creado');
  return (data as Comentario[]) || [];
}

export async function totalVisitas(): Promise<number | null> {
  const s = await supabaseServidor();
  const { data, error } = await s.rpc('total_visitas');
  if (error) return null;
  return Number(data) || 0;
}

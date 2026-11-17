'use server';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseServidor } from '@/lib/supabase/server';

export type EstadoComentario = { ok: boolean; mensaje: string };

const PALABRAS_SPAM = /(https?:\/\/|www\.|\.com\/|casino|crypto|bitcoin|viagra|loan|porn)/i;

export async function enviarComentario(_prev: EstadoComentario, fd: FormData): Promise<EstadoComentario> {
  // Campo trampa: las personas no lo ven; los robots lo llenan.
  if (String(fd.get('sitio_web') || '')) return { ok: true, mensaje: 'Gracias, tu comentario se publicó.' };

  // Un robot envía al instante; una persona tarda al menos unos segundos.
  const inicio = Number(fd.get('inicio') || 0);
  if (!inicio || Date.now() - inicio < 3000) return { ok: false, mensaje: 'Espera un momento antes de enviar.' };

  const tipo = String(fd.get('destino_tipo') || '');
  const id = String(fd.get('destino_id') || '');
  const nombre = String(fd.get('nombre') || '').trim();
  const texto = String(fd.get('texto') || '').trim();
  const ruta = String(fd.get('ruta') || '/');

  if (!nombre || nombre.length > 60) return { ok: false, mensaje: 'Escribe un nombre (máximo 60 caracteres).' };
  if (texto.length < 2 || texto.length > 1500) return { ok: false, mensaje: 'El comentario debe tener entre 2 y 1500 caracteres.' };
  if (PALABRAS_SPAM.test(texto)) return { ok: false, mensaje: 'Por seguridad, los comentarios no pueden incluir enlaces.' };

  const h = await headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim();
  const huella = createHash('sha256')
    .update(`${process.env.VISITAS_SAL || 'jordison'}|c|${ip}|${h.get('user-agent') || ''}`)
    .digest('hex')
    .slice(0, 32);

  const supabase = await supabaseServidor();
  const { error } = await supabase.rpc('comentar', {
    p_destino_tipo: tipo,
    p_destino_id: id,
    p_nombre: nombre,
    p_texto: texto,
    p_huella: huella,
  });
  if (error) {
    if (error.message.includes('demasiados')) return { ok: false, mensaje: 'Has enviado varios comentarios seguidos. Intenta en unos minutos.' };
    return { ok: false, mensaje: 'No se pudo publicar el comentario. Intenta de nuevo.' };
  }
  if (ruta.startsWith('/')) revalidatePath(ruta);
  return { ok: true, mensaje: 'Gracias, tu comentario se publicó.' };
}

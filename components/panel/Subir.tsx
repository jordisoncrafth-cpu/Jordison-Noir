'use client';
import { useState } from 'react';
import { supabaseNavegador } from '@/lib/supabase/client';

export type Subido = { url: string; ruta: string; ancho: number; alto: number; nombre: string };

const MAX_LADO = 2560;
const MAX_VIDEO = 50 * 1024 * 1024;

/**
 * Prepara una foto para la web: la reduce a un máximo de 2560 px y la guarda en JPEG de alta calidad.
 * Al pasar por el lienzo se eliminan los metadatos ocultos (incluida la ubicación GPS).
 * No se aplica ningún filtro ni retoque.
 */
async function prepararImagen(archivo: File): Promise<{ blob: Blob; ancho: number; alto: number }> {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: 'from-image' } as ImageBitmapOptions);
  const escala = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const lienzo = document.createElement('canvas');
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no pudo procesar la imagen.');
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/jpeg', 0.92));
  if (!blob) throw new Error('No se pudo preparar la imagen.');
  return { blob, ancho, alto };
}

export async function subirArchivo(archivo: File, carpeta: string): Promise<Subido> {
  const supabase = supabaseNavegador();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (archivo.type.startsWith('image/')) {
    const { blob, ancho, alto } = await prepararImagen(archivo);
    const ruta = `${carpeta}/${id}.jpg`;
    const { error } = await supabase.storage.from('media').upload(ruta, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
    if (error) throw new Error(error.message);
    const url = supabase.storage.from('media').getPublicUrl(ruta).data.publicUrl;
    return { url, ruta, ancho, alto, nombre: archivo.name.replace(/\.[^.]+$/, '') };
  }
  if (archivo.type.startsWith('video/')) {
    if (archivo.size > MAX_VIDEO) throw new Error('El video pesa más de 50 MB. Súbelo a YouTube o Vimeo y pega el enlace.');
    const ext = (archivo.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
    const ruta = `${carpeta}/${id}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(ruta, archivo, { contentType: archivo.type, cacheControl: '31536000' });
    if (error) throw new Error(error.message);
    const url = supabase.storage.from('media').getPublicUrl(ruta).data.publicUrl;
    return { url, ruta, ancho: 0, alto: 0, nombre: archivo.name };
  }
  throw new Error('Solo se aceptan fotos (JPG, PNG, WebP) o videos (MP4, MOV, WebM).');
}

/** Campo de un solo archivo: sube y guarda la dirección en un campo oculto del formulario. */
export default function Subir({
  nombre,
  valor,
  etiqueta,
  carpeta = 'general',
  acepta = 'image/*',
}: {
  nombre: string;
  valor?: string | null;
  etiqueta: string;
  carpeta?: string;
  acepta?: string;
}) {
  const [url, setUrl] = useState(valor || '');
  const [estado, setEstado] = useState('');
  const esVideo = /\.(mp4|webm|mov)$/i.test(url);

  return (
    <div className="campo">
      <span>{etiqueta}</span>
      <div className="subida">
        {url ? (
          esVideo ? <video className="miniatura" src={url} controls /> : <img className="miniatura" src={url} alt="" />
        ) : null}
        <input type="hidden" name={nombre} value={url} />
        <input
          type="file"
          accept={acepta}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setEstado('Subiendo…');
            try {
              const r = await subirArchivo(f, carpeta);
              setUrl(r.url);
              setEstado('Listo. Recuerda guardar los cambios.');
            } catch (err) {
              setEstado(err instanceof Error ? err.message : 'No se pudo subir.');
            }
            e.target.value = '';
          }}
        />
        <div className="acciones">
          <input type="text" inputMode="url" placeholder="…o pega una dirección https://" value={url} onChange={(e) => setUrl(e.target.value)} />
          {url ? <button type="button" className="btn sec" onClick={() => setUrl('')}>Quitar</button> : null}
        </div>
        {estado ? <div className="estado">{estado}</div> : null}
      </div>
    </div>
  );
}

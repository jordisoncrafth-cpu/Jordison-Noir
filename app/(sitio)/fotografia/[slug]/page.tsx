import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabaseServidor } from '@/lib/supabase/server';
import { fotosDe, type Coleccion } from '@/lib/datos';
import Galeria from '@/components/Galeria';
import Comentarios from '@/components/Comentarios';

async function buscar(slug: string) {
  const s = await supabaseServidor();
  const { data } = await s.from('colecciones').select('*').eq('slug', slug).eq('publicada', true).maybeSingle();
  return data as Coleccion | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await buscar((await params).slug);
  return c ? { title: c.titulo, description: c.descripcion, openGraph: { images: c.portada_url ? [c.portada_url] : [] } } : {};
}

export default async function ColeccionPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await buscar(slug);
  if (!c) notFound();
  const fotos = await fotosDe(c.id);
  return (
    <div className="wrap">
      <div className="cabecera aparece">
        <Link className="mono volver" href="/fotografia">← Fotografía</Link>
        <h1>{c.titulo}</h1>
        {c.descripcion ? <p>{c.descripcion}</p> : null}
        <span className="mono">{fotos.length} fotografías</span>
      </div>
      {fotos.length ? <Galeria fotos={fotos} /> : <div className="vacio mono">Esta colección aún no tiene fotos</div>}
      <Comentarios tipo="coleccion" id={c.id} ruta={`/fotografia/${c.slug}`} />
    </div>
  );
}

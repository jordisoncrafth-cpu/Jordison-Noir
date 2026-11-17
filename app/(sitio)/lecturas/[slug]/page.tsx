import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ESTADO_LIBRO, libroPorSlug } from '@/lib/datos';
import { aHtml } from '@/lib/markdown';
import Comentarios from '@/components/Comentarios';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await libroPorSlug((await params).slug);
  return r ? { title: `${r.libro.titulo} — ${r.libro.autor}` } : {};
}

export default async function LibroPagina({ params }: { params: Promise<{ slug: string }> }) {
  const r = await libroPorSlug((await params).slug);
  if (!r) notFound();
  const { libro, notas } = r;
  return (
    <div className="wrap">
      <div className="lectura cabecera aparece">
        <Link className="mono volver" href="/lecturas">← Lecturas</Link>
        <h1>{libro.titulo}</h1>
        <span className="mono">{libro.autor} · {ESTADO_LIBRO[libro.estado]}</span>
      </div>
      <div className="lectura">
        {libro.descripcion ? <div className="contenido" dangerouslySetInnerHTML={{ __html: aHtml(libro.descripcion) }} /> : null}
        {notas.length ? (
          notas.map((n) => (
            <div className="nota" key={n.id}>
              {n.frase ? (
                <blockquote>
                  {n.frase}
                  {n.referencia ? <cite>{n.referencia}</cite> : null}
                </blockquote>
              ) : null}
              {n.interpretacion ? (
                <>
                  <h4 className="mono">Interpretación</h4>
                  <div className="contenido" dangerouslySetInnerHTML={{ __html: aHtml(n.interpretacion) }} />
                </>
              ) : null}
              {n.reflexion ? (
                <>
                  <h4 className="mono">Reflexión personal</h4>
                  <div className="contenido" dangerouslySetInnerHTML={{ __html: aHtml(n.reflexion) }} />
                </>
              ) : null}
            </div>
          ))
        ) : (
          <div className="vacio mono">Aún no hay notas de este libro</div>
        )}
      </div>
      <Comentarios tipo="libro" id={libro.id} ruta={`/lecturas/${libro.slug}`} />
    </div>
  );
}

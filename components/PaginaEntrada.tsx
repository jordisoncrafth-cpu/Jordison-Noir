import Link from 'next/link';
import { notFound } from 'next/navigation';
import { leerAjustes, seccion } from '@/lib/ajustes';
import { entradaPorSlug, type SeccionEntrada } from '@/lib/datos';
import { aHtml } from '@/lib/markdown';
import { enlaceVideo, fechaCorta } from '@/lib/util';
import Comentarios from './Comentarios';

export default async function PaginaEntrada({ clave, slug }: { clave: SeccionEntrada; slug: string }) {
  const [aj, e] = await Promise.all([leerAjustes(), entradaPorSlug(clave, slug)]);
  if (!e) notFound();
  const s = seccion(aj, clave);
  const visiblePublico =
    (e.estado === 'publicada' || e.estado === 'programada') &&
    !!e.publicado_en &&
    new Date(e.publicado_en) <= new Date() &&
    e.visibilidad !== 'privada';
  const video = enlaceVideo(e.video_url);

  return (
    <div className="wrap">
      <div className="lectura cabecera aparece">
        <Link className="mono volver" href={`/${clave}`}>← {s.nombre}</Link>
        {!visiblePublico ? (
          <p className="aviso-privado mono">Solo tú ves esta entrada ({e.visibilidad === 'privada' ? 'privada' : e.estado}).</p>
        ) : null}
        <h1>{e.titulo}</h1>
        <span className="mono">{[e.disciplina, fechaCorta(e.publicado_en)].filter(Boolean).join(' · ')}</span>
      </div>
      <article className="lectura">
        {e.portada_url ? <img className="portada-entrada" src={e.portada_url} alt="" /> : null}
        {video ? (
          <div className="video-principal">
            {video.tipo === 'video' ? (
              <video src={video.src} controls playsInline preload="metadata" />
            ) : (
              <iframe src={video.src} title="Video" loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen />
            )}
          </div>
        ) : null}
        <div className="contenido" dangerouslySetInnerHTML={{ __html: aHtml(e.cuerpo) }} />
        {e.etiquetas?.length ? (
          <div className="etiquetas">{e.etiquetas.map((t) => <span key={t} className="mono">#{t}</span>)}</div>
        ) : null}
      </article>
      {visiblePublico ? <Comentarios tipo="entrada" id={e.id} ruta={`/${clave}/${e.slug}`} /> : null}
    </div>
  );
}

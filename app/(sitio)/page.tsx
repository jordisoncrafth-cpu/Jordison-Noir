import Link from 'next/link';
import { leerAjustes } from '@/lib/ajustes';
import { entradasRecientes, fotosRecientes } from '@/lib/datos';
import { fechaCorta } from '@/lib/util';

export default async function Inicio() {
  const aj = await leerAjustes();
  const [fotos, textos] = await Promise.all([fotosRecientes(6), entradasRecientes(3)]);
  const visibles = aj.secciones.filter((s) => s.visible);
  const p = aj.portada;

  return (
    <>
      <div className="hero">
        {p.imagenUrl ? <img src={p.imagenUrl} alt="" style={{ objectPosition: p.posicion }} /> : null}
        {p.datosFoto ? <div className="pie-foto mono">{p.datosFoto}</div> : null}
        <div className="texto aparece">
          {p.etiqueta ? <span className="mono">{p.etiqueta}</span> : null}
          <h1>
            {p.titulo}
            {p.subtitulo ? <small>{p.subtitulo}</small> : null}
          </h1>
          {p.texto ? <p className="lema">{p.texto}</p> : null}
        </div>
      </div>

      <div className="wrap bloque">
        <div className="rotulo"><h2>Contenido</h2><span className="mono">{visibles.length} secciones</span></div>
        <div className="toc">
          {visibles.map((s, i) => (
            <Link key={s.clave} href={`/${s.clave}`}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <strong>{s.nombre}</strong>
              <em>{s.descripcion}</em>
            </Link>
          ))}
        </div>
      </div>

      {fotos.length ? (
        <div className="wrap" style={{ paddingBottom: 'clamp(56px,10vw,120px)' }}>
          <div className="rotulo"><h2>Fotografía reciente</h2><Link className="mono" href="/fotografia">Ver todo →</Link></div>
          <div className="mosaico">
            {fotos.map((f) => (
              <Link key={f.id} href="/fotografia"><img src={f.url} alt={f.titulo || 'Fotografía'} loading="lazy" /></Link>
            ))}
          </div>
        </div>
      ) : null}

      {textos.length ? (
        <div className="wrap" style={{ paddingBottom: 'clamp(56px,10vw,120px)' }}>
          <div className="rotulo"><h2>Lo más reciente</h2></div>
          <div className="lista">
            {textos.map((e) => (
              <article key={e.id}>
                <span className="mono">{fechaCorta(e.publicado_en)}</span>
                <div>
                  <h3><Link href={`/${e.seccion}/${e.slug}`}>{e.titulo}</Link></h3>
                  {e.resumen ? <p>{e.resumen}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {aj.marca.logoUrl ? (
        <div className="wrap bloque sello">
          <img src={aj.marca.logoUrl} alt={`Sello de ${aj.marca.nombre}`} />
          <span className="mono">{aj.marca.lema}</span>
        </div>
      ) : null}
    </>
  );
}

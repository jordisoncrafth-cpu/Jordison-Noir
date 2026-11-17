import Link from 'next/link';
import { notFound } from 'next/navigation';
import { leerAjustes, seccion } from '@/lib/ajustes';
import { DISCIPLINAS, entradas, type SeccionEntrada } from '@/lib/datos';
import { fechaCorta } from '@/lib/util';

export default async function ListaEntradas({ clave, filtro }: { clave: SeccionEntrada; filtro?: string }) {
  const aj = await leerAjustes();
  const s = seccion(aj, clave);
  if (!s.visible) notFound();
  let lista = await entradas(clave);
  if (clave === 'proceso' && filtro) lista = lista.filter((e) => e.disciplina === filtro);
  return (
    <div className="wrap">
      <div className="cabecera aparece">
        <span className="mono">{s.nombre}</span>
        <h1>{s.nombre}</h1>
        <p>{s.descripcion}</p>
      </div>
      {clave === 'proceso' ? (
        <div className="filtros">
          <Link href="/proceso" className={!filtro ? 'on' : ''}>Todo</Link>
          {DISCIPLINAS.map((d) => (
            <Link key={d} href={`/proceso?disciplina=${encodeURIComponent(d)}`} className={filtro === d ? 'on' : ''}>{d}</Link>
          ))}
        </div>
      ) : null}
      {lista.length ? (
        <div className="lista">
          {lista.map((e) => (
            <article key={e.id} className="aparece">
              <span className="mono">{[e.disciplina, fechaCorta(e.publicado_en)].filter(Boolean).join(' · ')}</span>
              <div>
                <h3><Link href={`/${clave}/${e.slug}`}>{e.titulo}</Link></h3>
                {e.resumen ? <p>{e.resumen}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="vacio mono">Pronto habrá entradas aquí</div>
      )}
    </div>
  );
}

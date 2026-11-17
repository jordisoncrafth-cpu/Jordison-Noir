import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { leerAjustes, seccion } from '@/lib/ajustes';
import { ESTADO_LIBRO, libros } from '@/lib/datos';

export async function generateMetadata(): Promise<Metadata> {
  return { title: seccion(await leerAjustes(), 'lecturas').nombre };
}

export default async function Lecturas() {
  const aj = await leerAjustes();
  const s = seccion(aj, 'lecturas');
  if (!s.visible) notFound();
  const lista = await libros();
  return (
    <div className="wrap">
      <div className="cabecera aparece">
        <span className="mono">{s.nombre}</span>
        <h1>{s.nombre}</h1>
        <p>{s.descripcion}</p>
      </div>
      {lista.length ? (
        <div className="estante">
          {lista.map((l, i) => (
            <Link key={l.id} href={`/lecturas/${l.slug}`} className="libro aparece" style={{ opacity: l.estado === 'pendiente' ? 0.6 : 1 }}>
              <div className="tapa">
                {l.portada_url ? (
                  <img src={l.portada_url} alt="" loading="lazy" />
                ) : (
                  <>
                    <span className="caps" style={{ fontSize: 11 }}>{l.autor}</span>
                    <strong>{l.titulo}</strong>
                    <span className="mono">Libro {String(i + 1).padStart(2, '0')}</span>
                  </>
                )}
              </div>
              <span className={`mono${l.estado === 'leyendo' ? ' acento' : ''}`}>{ESTADO_LIBRO[l.estado]}</span>
              <h3>{l.titulo}</h3>
              <span className="mono">{l.autor}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="vacio mono">Pronto habrá libros aquí</div>
      )}
    </div>
  );
}

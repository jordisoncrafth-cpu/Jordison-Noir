import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { leerAjustes, seccion } from '@/lib/ajustes';
import { colecciones } from '@/lib/datos';

export async function generateMetadata(): Promise<Metadata> {
  return { title: seccion(await leerAjustes(), 'fotografia').nombre };
}

export default async function Fotografia() {
  const aj = await leerAjustes();
  const s = seccion(aj, 'fotografia');
  if (!s.visible) notFound();
  const lista = await colecciones();
  return (
    <div className="wrap">
      <div className="cabecera aparece">
        <span className="mono">{s.nombre}</span>
        <h1>{s.nombre}</h1>
        <p>{s.descripcion}</p>
      </div>
      {lista.length ? (
        <div className="colecciones">
          {lista.map((c, i) => (
            <Link key={c.id} href={`/fotografia/${c.slug}`} className="aparece">
              {c.portada_url ? <img src={c.portada_url} alt="" loading="lazy" /> : <div className="sin-imagen" />}
              <span className="mono">Colección {String(i + 1).padStart(2, '0')}</span>
              <h2>{c.titulo}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="vacio mono">Pronto habrá colecciones aquí</div>
      )}
    </div>
  );
}

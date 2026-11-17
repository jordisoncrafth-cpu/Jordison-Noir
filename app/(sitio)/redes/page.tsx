import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { leerAjustes, seccion } from '@/lib/ajustes';

export async function generateMetadata(): Promise<Metadata> {
  return { title: seccion(await leerAjustes(), 'redes').nombre };
}

export default async function Redes() {
  const aj = await leerAjustes();
  const s = seccion(aj, 'redes');
  if (!s.visible) notFound();
  const redes = aj.redes.filter((r) => r.url);
  return (
    <div className="wrap">
      <div className="cabecera aparece"><span className="mono">{s.nombre}</span><h1>{s.nombre}</h1><p>{s.descripcion}</p></div>
      <div className="redes aparece">
        {redes.map((r) => (
          <a key={r.nombre + r.url} href={r.url} target="_blank" rel="noopener noreferrer">
            {r.nombre}
            <span className="mono">{r.usuario || 'Visitar'} ↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

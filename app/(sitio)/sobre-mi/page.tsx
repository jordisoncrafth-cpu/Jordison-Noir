import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { leerAjustes, seccion } from '@/lib/ajustes';
import { parrafos } from '@/lib/markdown';

export async function generateMetadata(): Promise<Metadata> {
  return { title: seccion(await leerAjustes(), 'sobre-mi').nombre };
}

export default async function SobreMi() {
  const aj = await leerAjustes();
  const s = seccion(aj, 'sobre-mi');
  if (!s.visible) notFound();
  return (
    <div className="wrap">
      <div className="cabecera aparece"><span className="mono">{s.nombre}</span><h1>{s.nombre}</h1></div>
      <div className="sobre aparece">
        {aj.sobreMi.imagenUrl ? (
          <figure><img src={aj.sobreMi.imagenUrl} alt={`Retrato de ${aj.marca.nombre}`} /></figure>
        ) : null}
        <div>
          {parrafos(aj.sobreMi.texto).map((p, i) => <p key={i}>{p}</p>)}
          <Link className="enlace" href="/redes">Mis redes →</Link>
        </div>
      </div>
    </div>
  );
}

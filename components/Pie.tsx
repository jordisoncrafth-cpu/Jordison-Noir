import Link from 'next/link';
import type { Ajustes } from '@/lib/ajustes';
import { totalVisitas } from '@/lib/datos';

export default async function Pie({ aj }: { aj: Ajustes }) {
  const total = aj.mostrarContador ? await totalVisitas() : null;
  const visibles = aj.secciones.filter((s) => s.visible && (s.clave === 'sobre-mi' || s.clave === 'redes'));
  return (
    <footer className="pie">
      <Link className="marca" href="/">
        {aj.marca.logoUrl ? <img src={aj.marca.logoUrl} alt="" /> : null}
        <span>{aj.marca.nombre}</span>
      </Link>
      <nav className="mono">
        {visibles.map((s) => (
          <Link key={s.clave} href={`/${s.clave}`}>{s.nombre}</Link>
        ))}
        <Link href="/privacidad">Privacidad</Link>
      </nav>
      <div className="mono" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {total !== null ? <span>{total.toLocaleString('es-MX')} visitas</span> : null}
        <span>© {new Date().getFullYear()} {aj.marca.nombre}</span>
      </div>
    </footer>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Red, Seccion } from '@/lib/ajustes';

export default function Encabezado({
  nombre,
  logoUrl,
  secciones,
  redes,
}: {
  nombre: string;
  logoUrl: string;
  secciones: Seccion[];
  redes: Red[];
}) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  useEffect(() => setAbierto(false), [ruta]);
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto]);

  const visibles = secciones.filter((s) => s.visible);

  return (
    <>
      <header className="top">
        <Link className="marca" href="/" aria-label="Inicio">
          {logoUrl ? <img src={logoUrl} alt="" /> : null}
          <span>{nombre}</span>
        </Link>
        <button className="btn-indice" onClick={() => setAbierto(true)} aria-expanded={abierto} aria-controls="indice">
          Índice <i />
        </button>
      </header>

      <div className={`indice${abierto ? ' abierto' : ''}`} id="indice" role="dialog" aria-modal="true" aria-label="Índice">
        <div className="fila">
          <span className="caps" style={{ fontSize: 13 }}>Índice</span>
          <button className="btn-indice" onClick={() => setAbierto(false)}>Cerrar ✕</button>
        </div>
        <nav>
          <Link href="/" aria-current={ruta === '/' ? 'page' : undefined}>
            <span className="mono">00</span>Inicio
          </Link>
          {visibles.map((s, i) => (
            <Link key={s.clave} href={`/${s.clave}`} aria-current={ruta.startsWith(`/${s.clave}`) ? 'page' : undefined}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {s.nombre}
            </Link>
          ))}
        </nav>
        <div className="pie mono">
          {redes.filter((r) => r.url).map((r) => (
            <a key={r.nombre} href={r.url} target="_blank" rel="noopener noreferrer">
              {r.nombre} ↗
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

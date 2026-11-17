'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { salir } from '@/lib/acciones/panel';

const LINKS = [
  ['/panel', 'Resumen y visitas'],
  ['/panel/fotos', 'Fotografía'],
  ['/panel/entradas', 'Textos y diario'],
  ['/panel/lecturas', 'Lecturas'],
  ['/panel/comentarios', 'Comentarios'],
  ['/panel/textos', 'Portada, secciones y redes'],
  ['/panel/diseno', 'Diseño'],
] as const;

export default function NavPanel() {
  const ruta = usePathname();
  return (
    <nav className="panel-nav">
      <div className="titulo">Panel · Jordison Noir</div>
      {LINKS.map(([href, txt]) => (
        <Link key={href} href={href} className={(href === '/panel' ? ruta === href : ruta.startsWith(href)) ? 'on' : ''}>{txt}</Link>
      ))}
      <a href="/" target="_blank" rel="noopener" className="separar">Ver mi página ↗</a>
      <a href="/panel/exportar">Descargar copia</a>
      <form action={salir}><button>Salir</button></form>
    </nav>
  );
}

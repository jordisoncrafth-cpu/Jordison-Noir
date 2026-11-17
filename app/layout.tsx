import type { Metadata } from 'next';
import './globals.css';
import { leerAjustes, urlFuentes, variablesCss } from '@/lib/ajustes';
import RegistroVisita from '@/components/RegistroVisita';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const aj = await leerAjustes();
  return {
    title: { default: aj.marca.nombre, template: `%s · ${aj.marca.nombre}` },
    description: aj.portada.texto,
    openGraph: {
      title: aj.marca.nombre,
      description: aj.portada.texto,
      images: aj.portada.imagenUrl ? [aj.portada.imagenUrl] : [],
    },
    icons: aj.marca.logoUrl ? { icon: aj.marca.logoUrl } : undefined,
  };
}

export default async function Raiz({ children }: { children: React.ReactNode }) {
  const aj = await leerAjustes();
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={urlFuentes(aj.diseno)} />
        <style dangerouslySetInnerHTML={{ __html: variablesCss(aj.diseno) }} />
      </head>
      <body className={aj.diseno.grano ? 'grano' : ''}>
        {children}
        <RegistroVisita />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { entradaPorSlug } from '@/lib/datos';
import PaginaEntrada from '@/components/PaginaEntrada';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await entradaPorSlug('diario', (await params).slug);
  if (!e) return {};
  return {
    title: e.titulo,
    description: e.resumen,
    robots: e.visibilidad !== 'publica' ? { index: false, follow: false } : undefined,
    openGraph: { images: e.portada_url ? [e.portada_url] : [] },
  };
}

export default async function EntradaDiario({ params }: { params: Promise<{ slug: string }> }) {
  return <PaginaEntrada clave="diario" slug={(await params).slug} />;
}

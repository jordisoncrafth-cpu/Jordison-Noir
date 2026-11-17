import type { Metadata } from 'next';
import { leerAjustes, seccion } from '@/lib/ajustes';
import ListaEntradas from '@/components/ListaEntradas';

export async function generateMetadata(): Promise<Metadata> {
  return { title: seccion(await leerAjustes(), 'diario').nombre };
}

export default async function Diario({ searchParams }: { searchParams: Promise<{ disciplina?: string }> }) {
  const { disciplina } = await searchParams;
  return <ListaEntradas clave="diario" filtro={disciplina} />;
}

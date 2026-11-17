import { NextResponse } from 'next/server';
import { esAdmin } from '@/lib/auth';
import { supabaseServidor } from '@/lib/supabase/server';

/** Descarga una copia de todo tu contenido (textos, fotos, libros, comentarios, ajustes) en un archivo JSON. */
export async function GET() {
  if (!(await esAdmin())) return new NextResponse('No autorizado', { status: 401 });
  const s = await supabaseServidor();
  const tablas = ['ajustes', 'colecciones', 'fotos', 'entradas', 'libros', 'notas_libro', 'comentarios'] as const;
  const copia: Record<string, unknown> = { exportado: new Date().toISOString() };
  for (const t of tablas) {
    const { data } = await s.from(t).select('*');
    copia[t] = data || [];
  }
  const { count } = await s.from('visitas').select('id', { count: 'exact', head: true });
  copia.total_visitas = count || 0;
  const fecha = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(copia, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="jordison-noir-copia-${fecha}.json"`,
    },
  });
}

import Link from 'next/link';
import { exigirAdmin } from '@/lib/auth';
import type { Entrada } from '@/lib/datos';
import { fechaCorta } from '@/lib/util';
import Aviso from '@/components/panel/Aviso';

const SECCIONES = { reflexiones: 'Reflexiones', proceso: 'Proceso creativo', diario: 'Diario' } as const;
const VIS = { publica: 'Pública', no_listada: 'Solo con enlace', privada: 'Privada' } as const;

export default async function Entradas({ searchParams }: { searchParams: Promise<{ s?: string; ok?: string; error?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { s, ok, error } = await searchParams;
  let q = supabase.from('entradas').select('id, seccion, titulo, slug, estado, visibilidad, publicado_en, actualizado').order('actualizado', { ascending: false });
  if (s && s in SECCIONES) q = q.eq('seccion', s);
  const { data } = await q;
  const lista = (data as Entrada[]) || [];

  return (
    <>
      <h1>Textos y diario</h1>
      <p className="ayuda">Reflexiones, proceso creativo y diario personal. Cada entrada puede ser borrador, programada o publicada, y pública, solo con enlace o privada.</p>
      <Aviso ok={ok} error={error} textos={{ borrada: 'Entrada borrada.' }} />
      <div className="acciones" style={{ marginBottom: 16 }}>
        <Link className="btn" href="/panel/entradas/nueva?seccion=reflexiones">+ Reflexión</Link>
        <Link className="btn" href="/panel/entradas/nueva?seccion=proceso">+ Proceso creativo</Link>
        <Link className="btn" href="/panel/entradas/nueva?seccion=diario">+ Entrada de diario</Link>
      </div>
      <div className="acciones" style={{ marginBottom: 12 }}>
        <Link className={`btn ${!s ? '' : 'sec'}`} href="/panel/entradas">Todas</Link>
        {Object.entries(SECCIONES).map(([k, v]) => (
          <Link key={k} className={`btn ${s === k ? '' : 'sec'}`} href={`/panel/entradas?s=${k}`}>{v}</Link>
        ))}
      </div>
      <div className="tarjeta">
        {lista.length ? (
          <table className="tabla">
            <thead><tr><th>Título</th><th>Sección</th><th>Estado</th><th>Visibilidad</th><th>Fecha</th></tr></thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id}>
                  <td><Link href={`/panel/entradas/${e.id}`}><b>{e.titulo}</b></Link></td>
                  <td>{SECCIONES[e.seccion]}</td>
                  <td>
                    <span className={`chip ${e.estado === 'publicada' ? 'ok' : e.estado === 'programada' ? 'ambar' : ''}`}>
                      {e.estado === 'publicada' ? 'Publicada' : e.estado === 'programada' ? 'Programada' : 'Borrador'}
                    </span>
                  </td>
                  <td>{VIS[e.visibilidad]}</td>
                  <td>{fechaCorta(e.publicado_en || e.actualizado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="ayuda">Aún no hay entradas.</p>
        )}
      </div>
    </>
  );
}

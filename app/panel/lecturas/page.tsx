import Link from 'next/link';
import { exigirAdmin } from '@/lib/auth';
import { ESTADO_LIBRO, type Libro, type Nota } from '@/lib/datos';
import { borrarLibro, borrarNota, guardarLibro, guardarNota } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';
import Subir from '@/components/panel/Subir';

function CamposNota({ n }: { n?: Nota }) {
  return (
    <>
      <label className="campo"><span>Frase breve del libro</span><textarea name="frase" defaultValue={n?.frase} style={{ minHeight: 70 }} /></label>
      <label className="campo"><span>Referencia (p. ej. Libro X, 16)</span><input type="text" name="referencia" defaultValue={n?.referencia} /></label>
      <label className="campo"><span>Tu interpretación</span><textarea name="interpretacion" defaultValue={n?.interpretacion} /></label>
      <label className="campo"><span>Reflexión personal</span><textarea name="reflexion" defaultValue={n?.reflexion} /></label>
      <label className="campo" style={{ display: 'flex', gap: 10 }}><input type="checkbox" name="visible" defaultChecked={n ? n.visible : true} /><span style={{ margin: 0 }}>Visible en la página</span></label>
    </>
  );
}

export default async function Lecturas({ searchParams }: { searchParams: Promise<{ libro?: string; ok?: string; error?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { libro: libroId, ok, error } = await searchParams;
  const { data } = await supabase.from('libros').select('*').order('orden').order('creado', { ascending: false });
  const libros = (data as Libro[]) || [];
  const libro = libros.find((l) => l.id === libroId);
  let notas: Nota[] = [];
  if (libro) {
    const { data: n } = await supabase.from('notas_libro').select('*').eq('libro_id', libro.id).order('creado');
    notas = (n as Nota[]) || [];
  }

  return (
    <>
      <h1>Diario de lecturas</h1>
      <p className="ayuda">Registra libros y, dentro de cada uno, frases, interpretaciones y reflexiones.</p>
      <Aviso ok={ok} error={error} textos={{ '1': 'Libro guardado.', borrado: 'Libro borrado.', nota: 'Nota guardada.', borrada: 'Nota borrada.' }} />

      {!libro ? (
        <>
          <div className="tarjeta">
            <table className="tabla">
              <tbody>
                {libros.map((l) => (
                  <tr key={l.id}>
                    <td><b>{l.titulo}</b><br /><small style={{ color: 'var(--humo)' }}>{l.autor}</small></td>
                    <td><span className={`chip ${l.estado === 'leyendo' ? 'ambar' : l.estado === 'leido' ? 'ok' : ''}`}>{ESTADO_LIBRO[l.estado]}</span></td>
                    <td style={{ textAlign: 'right' }}><Link className="btn sec" href={`/panel/lecturas?libro=${l.id}`}>Abrir</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!libros.length ? <p className="ayuda">Aún no hay libros. Empieza con Meditaciones.</p> : null}
          </div>
          <details className="tarjeta" open={!libros.length}>
            <summary>+ Nuevo libro</summary>
            <form action={guardarLibro}>
              <div className="rejilla dos">
                <label className="campo"><span>Título</span><input type="text" name="titulo" required placeholder="Meditaciones" /></label>
                <label className="campo"><span>Autor</span><input type="text" name="autor" placeholder="Marco Aurelio" /></label>
                <label className="campo"><span>Estado</span>
                  <select name="estado" defaultValue="leyendo"><option value="pendiente">Pendiente</option><option value="leyendo">Leyendo</option><option value="leido">Leído</option></select>
                </label>
              </div>
              <input type="hidden" name="orden" value={libros.length + 1} />
              <label className="campo" style={{ display: 'flex', gap: 10 }}><input type="checkbox" name="visible" defaultChecked /><span style={{ margin: 0 }}>Visible en la página</span></label>
              <button className="btn">Agregar libro</button>
            </form>
          </details>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 14 }}><Link href="/panel/lecturas">← Todos los libros</Link></p>
          <details className="tarjeta">
            <summary>Datos de «{libro.titulo}»</summary>
            <form action={guardarLibro}>
              <input type="hidden" name="id" value={libro.id} />
              <div className="rejilla dos">
                <label className="campo"><span>Título</span><input type="text" name="titulo" defaultValue={libro.titulo} /></label>
                <label className="campo"><span>Autor</span><input type="text" name="autor" defaultValue={libro.autor} /></label>
                <label className="campo"><span>Estado</span>
                  <select name="estado" defaultValue={libro.estado}><option value="pendiente">Pendiente</option><option value="leyendo">Leyendo</option><option value="leido">Leído</option></select>
                </label>
                <label className="campo"><span>Orden</span><input type="number" name="orden" defaultValue={libro.orden} /></label>
              </div>
              <label className="campo"><span>Descripción o comentario general</span><textarea name="descripcion" defaultValue={libro.descripcion} /></label>
              <Subir nombre="portada_url" valor={libro.portada_url} etiqueta="Portada del libro (opcional; foto tuya del ejemplar)" carpeta="libros" />
              <label className="campo" style={{ display: 'flex', gap: 10 }}><input type="checkbox" name="visible" defaultChecked={libro.visible} /><span style={{ margin: 0 }}>Visible en la página</span></label>
              <button className="btn">Guardar libro</button>
            </form>
            <form action={borrarLibro} style={{ marginTop: 14 }}>
              <input type="hidden" name="id" value={libro.id} />
              <button className="btn peligro">Borrar libro y sus notas</button>
            </form>
          </details>

          <h2>Notas ({notas.length})</h2>
          {notas.map((n) => (
            <details className="tarjeta" key={n.id}>
              <summary>{n.frase ? `«${n.frase.slice(0, 70)}${n.frase.length > 70 ? '…' : ''}»` : 'Nota sin frase'}{!n.visible ? ' · oculta' : ''}</summary>
              <form action={guardarNota}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="libro_id" value={libro.id} />
                <CamposNota n={n} />
                <button className="btn">Guardar nota</button>
              </form>
              <form action={borrarNota} style={{ marginTop: 10 }}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="libro_id" value={libro.id} />
                <button className="btn peligro">Borrar nota</button>
              </form>
            </details>
          ))}
          <details className="tarjeta" open={!notas.length}>
            <summary>+ Nueva nota</summary>
            <form action={guardarNota}>
              <input type="hidden" name="libro_id" value={libro.id} />
              <CamposNota />
              <button className="btn">Agregar nota</button>
            </form>
          </details>
        </>
      )}
    </>
  );
}

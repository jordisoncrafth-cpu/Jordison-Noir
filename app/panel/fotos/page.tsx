import Link from 'next/link';
import { exigirAdmin } from '@/lib/auth';
import type { Coleccion, Foto } from '@/lib/datos';
import { borrarColeccion, borrarFoto, guardarColeccion, guardarFoto } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';
import Subir from '@/components/panel/Subir';
import SubirFotos from '@/components/panel/SubirFotos';

export default async function Fotos({ searchParams }: { searchParams: Promise<{ ver?: string; ok?: string; error?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { ver, ok, error } = await searchParams;
  const { data: cols } = await supabase.from('colecciones').select('*').order('orden').order('creado', { ascending: false });
  const colecciones = (cols as Coleccion[]) || [];
  const actual = colecciones.find((c) => c.id === ver) || null;
  const verSueltas = ver === 'sueltas';

  let fotos: Foto[] = [];
  if (actual || verSueltas) {
    let q = supabase.from('fotos').select('*').order('orden').order('creado');
    q = actual ? q.eq('coleccion_id', actual.id) : q.is('coleccion_id', null);
    const { data } = await q;
    fotos = (data as Foto[]) || [];
  }

  const avisos = { '1': 'Colección guardada.', borrada: 'Se borró.', foto: 'Foto guardada.' };

  return (
    <>
      <h1>Fotografía</h1>
      <p className="ayuda">Crea colecciones, sube fotos y escribe sus descripciones. Las fotos de una colección aparecen en /fotografia/nombre-de-la-coleccion.</p>
      <Aviso ok={ok} error={error} textos={avisos} />

      {!actual && !verSueltas ? (
        <>
          <div className="tarjeta">
            <h2>Tus colecciones</h2>
            <table className="tabla">
              <tbody>
                {colecciones.map((c) => (
                  <tr key={c.id}>
                    <td style={{ width: 90 }}>{c.portada_url ? <img src={c.portada_url} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 6 }} /> : null}</td>
                    <td><b>{c.titulo}</b><br /><small style={{ color: 'var(--humo)' }}>/fotografia/{c.slug}</small></td>
                    <td>{c.publicada ? <span className="chip ok">Publicada</span> : <span className="chip">Oculta</span>}</td>
                    <td style={{ textAlign: 'right' }}><Link className="btn sec" href={`/panel/fotos?ver=${c.id}`}>Abrir</Link></td>
                  </tr>
                ))}
                <tr>
                  <td></td>
                  <td colSpan={2}><b>Fotos sin colección</b></td>
                  <td style={{ textAlign: 'right' }}><Link className="btn sec" href="/panel/fotos?ver=sueltas">Abrir</Link></td>
                </tr>
              </tbody>
            </table>
          </div>

          <details className="tarjeta" open={!colecciones.length}>
            <summary>+ Nueva colección</summary>
            <form action={guardarColeccion}>
              <label className="campo"><span>Nombre</span><input type="text" name="titulo" required placeholder="Máscaras" /></label>
              <label className="campo"><span>Descripción</span><textarea name="descripcion" /></label>
              <input type="hidden" name="orden" value={colecciones.length + 1} />
              <label className="campo" style={{ display: 'flex', gap: 10 }}><input type="checkbox" name="publicada" defaultChecked /><span style={{ margin: 0 }}>Publicada</span></label>
              <button className="btn">Crear colección</button>
            </form>
          </details>
        </>
      ) : (
        <>
          <p style={{ marginBottom: 14 }}><Link href="/panel/fotos">← Todas las colecciones</Link></p>

          {actual ? (
            <details className="tarjeta">
              <summary>Datos de la colección «{actual.titulo}»</summary>
              <form action={guardarColeccion}>
                <input type="hidden" name="id" value={actual.id} />
                <div className="rejilla dos">
                  <label className="campo"><span>Nombre</span><input type="text" name="titulo" defaultValue={actual.titulo} /></label>
                  <label className="campo"><span>Dirección (/fotografia/…)</span><input type="text" name="slug" defaultValue={actual.slug} /></label>
                  <label className="campo"><span>Orden</span><input type="number" name="orden" defaultValue={actual.orden} /></label>
                  <label className="campo" style={{ display: 'flex', gap: 10, alignItems: 'end' }}><input type="checkbox" name="publicada" defaultChecked={actual.publicada} /><span style={{ margin: 0 }}>Publicada</span></label>
                </div>
                <label className="campo"><span>Descripción</span><textarea name="descripcion" defaultValue={actual.descripcion} /></label>
                <Subir nombre="portada_url" valor={actual.portada_url} etiqueta="Foto de portada de la colección" carpeta="colecciones" />
                <div className="acciones"><button className="btn">Guardar colección</button></div>
              </form>
              <form action={borrarColeccion} style={{ marginTop: 16 }}>
                <input type="hidden" name="id" value={actual.id} />
                <button className="btn peligro">Borrar colección (las fotos quedan sin colección)</button>
              </form>
            </details>
          ) : (
            <h2>Fotos sin colección</h2>
          )}

          <div className="tarjeta"><SubirFotos coleccionId={actual?.id || null} /></div>

          <div className="fotos-admin">
            {fotos.map((f) => (
              <div className="tarjeta" key={f.id}>
                <img src={f.url} alt="" loading="lazy" />
                <form action={guardarFoto}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="volver" value={ver} />
                  <label className="campo"><span>Título</span><input type="text" name="titulo" defaultValue={f.titulo} /></label>
                  <label className="campo"><span>Descripción</span><textarea name="descripcion" defaultValue={f.descripcion} style={{ minHeight: 70 }} /></label>
                  <div className="rejilla dos">
                    <label className="campo"><span>Lugar</span><input type="text" name="lugar" defaultValue={f.lugar} /></label>
                    <label className="campo"><span>Fecha</span><input type="date" name="fecha" defaultValue={f.fecha || ''} /></label>
                    <label className="campo"><span>Cámara / lente</span><input type="text" name="camara" defaultValue={f.camara} placeholder="Sony ZV-E10 · 35 mm" /></label>
                    <label className="campo"><span>Ajustes</span><input type="text" name="ajustes_tecnicos" defaultValue={f.ajustes_tecnicos} placeholder="f/1.8 · 1/60 s · ISO 800" /></label>
                    <label className="campo"><span>Orden</span><input type="number" name="orden" defaultValue={f.orden} /></label>
                    <label className="campo"><span>Colección</span>
                      <select name="coleccion_id" defaultValue={f.coleccion_id || ''}>
                        <option value="">Sin colección</option>
                        {colecciones.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="campo" style={{ display: 'flex', gap: 10 }}><input type="checkbox" name="publicada" defaultChecked={f.publicada} /><span style={{ margin: 0 }}>Visible en la página</span></label>
                  <div className="acciones"><button className="btn">Guardar</button></div>
                </form>
                <form action={borrarFoto} style={{ marginTop: 10 }}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="volver" value={ver} />
                  <button className="btn peligro">Borrar foto</button>
                </form>
              </div>
            ))}
          </div>
          {!fotos.length ? <p className="ayuda">Aún no hay fotos aquí. Súbelas con el botón de arriba.</p> : null}
        </>
      )}
    </>
  );
}

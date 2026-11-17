import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigirAdmin } from '@/lib/auth';
import { DISCIPLINAS, type Entrada } from '@/lib/datos';
import { borrarEntrada, guardarEntrada } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';
import Subir from '@/components/panel/Subir';
import Editor from '@/components/panel/Editor';

function aLocalMx(iso: string | null) {
  if (!iso) return '';
  return new Date(new Date(iso).getTime() - 6 * 3600e3).toISOString().slice(0, 16);
}

export default async function EditarEntrada({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seccion?: string; ok?: string; error?: string }>;
}) {
  const { supabase } = await exigirAdmin();
  const { id } = await params;
  const { seccion, ok, error } = await searchParams;

  let e: Partial<Entrada> = { seccion: (['reflexiones', 'proceso', 'diario'].includes(seccion || '') ? seccion : 'reflexiones') as Entrada['seccion'], visibilidad: seccion === 'diario' ? 'privada' : 'publica', estado: 'borrador' };
  if (id !== 'nueva') {
    const { data } = await supabase.from('entradas').select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    e = data as Entrada;
  }
  const publicada = e.estado === 'publicada' || e.estado === 'programada';

  return (
    <>
      <p style={{ marginBottom: 10 }}><Link href="/panel/entradas">← Todas las entradas</Link></p>
      <h1>{id === 'nueva' ? 'Nueva entrada' : e.titulo}</h1>
      <Aviso
        ok={ok}
        error={error}
        textos={{ borrador: 'Guardado como borrador. Solo tú lo ves.', publicada: 'Publicada.', programada: 'Programada: se publicará sola en la fecha indicada.' }}
      />
      {e.slug && publicada && e.visibilidad !== 'privada' ? (
        <p className="ayuda">Dirección: <a href={`/${e.seccion}/${e.slug}`} target="_blank" rel="noopener">/{e.seccion}/{e.slug} ↗</a></p>
      ) : null}

      <form action={guardarEntrada}>
        {e.id ? <input type="hidden" name="id" value={e.id} /> : null}
        <input type="hidden" name="publicado_en_actual" value={e.publicado_en || ''} />
        <input type="hidden" name="zona" value="-06:00" />
        <div className="tarjeta">
          <div className="rejilla dos">
            <label className="campo"><span>Sección</span>
              <select name="seccion" defaultValue={e.seccion}>
                <option value="reflexiones">Pensamientos y reflexiones</option>
                <option value="proceso">Proceso creativo</option>
                <option value="diario">Diario personal</option>
              </select>
            </label>
            <label className="campo"><span>Visibilidad</span>
              <select name="visibilidad" defaultValue={e.visibilidad}>
                <option value="publica">Pública (aparece en la página)</option>
                <option value="no_listada">Solo con enlace (no aparece en listas)</option>
                <option value="privada">Privada (solo tú)</option>
              </select>
            </label>
          </div>
          <label className="campo"><span>Título</span><input type="text" name="titulo" defaultValue={e.titulo} required /></label>
          <label className="campo"><span>Resumen (una o dos líneas para las listas)</span><input type="text" name="resumen" defaultValue={e.resumen} /></label>
          <Editor nombre="cuerpo" valor={e.cuerpo || ''} />
        </div>

        <details className="tarjeta">
          <summary>Portada, video y etiquetas</summary>
          <Subir nombre="portada_url" valor={e.portada_url} etiqueta="Imagen de portada (opcional)" carpeta="entradas" />
          <label className="campo"><span>Video principal: enlace de YouTube o Vimeo (opcional)</span><input type="url" name="video_url" defaultValue={e.video_url || ''} placeholder="https://youtu.be/…" /></label>
          <div className="rejilla dos">
            <label className="campo"><span>Etiquetas (separadas por comas)</span><input type="text" name="etiquetas" defaultValue={(e.etiquetas || []).join(', ')} /></label>
            <label className="campo"><span>Disciplina (para Proceso creativo)</span>
              <select name="disciplina" defaultValue={e.disciplina || ''}>
                <option value="">—</option>
                {DISCIPLINAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="campo"><span>Dirección personalizada (opcional)</span><input type="text" name="slug" defaultValue={e.slug} /></label>
          </div>
        </details>

        <div className="tarjeta">
          <h2>Publicar</h2>
          <div className="acciones">
            <button className="btn sec" name="accion" value="borrador">Guardar borrador</button>
            <button className="btn" name="accion" value="publicar">{publicada ? 'Guardar y mantener publicada' : 'Publicar ahora'}</button>
          </div>
          <div className="acciones" style={{ marginTop: 14 }}>
            <label className="campo" style={{ margin: 0 }}><span>Programar para (hora de México)</span>
              <input type="datetime-local" name="publicado_en" defaultValue={e.estado === 'programada' ? aLocalMx(e.publicado_en || null) : ''} />
            </label>
            <button className="btn sec" name="accion" value="programar" style={{ alignSelf: 'end' }}>Programar</button>
          </div>
          {publicada ? <p className="ayuda" style={{ marginTop: 12 }}>Para despublicarla, pulsa «Guardar borrador».</p> : null}
        </div>
      </form>

      {e.id ? (
        <form action={borrarEntrada} style={{ marginBottom: 40 }}>
          <input type="hidden" name="id" value={e.id} />
          <button className="btn peligro">Borrar esta entrada para siempre</button>
        </form>
      ) : null}
    </>
  );
}

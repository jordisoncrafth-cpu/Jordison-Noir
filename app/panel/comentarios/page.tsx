import { exigirAdmin } from '@/lib/auth';
import type { Comentario } from '@/lib/datos';
import { alternarComentario, borrarComentario } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';

export default async function Comentarios({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { ok } = await searchParams;
  const { data } = await supabase.from('comentarios').select('*').order('creado', { ascending: false }).limit(300);
  const lista = (data as Comentario[]) || [];

  // Nombres de dónde se comentó.
  const ids = (t: string) => lista.filter((c) => c.destino_tipo === t).map((c) => c.destino_id);
  const [en, co, li] = await Promise.all([
    supabase.from('entradas').select('id, titulo, seccion, slug').in('id', ids('entrada').length ? ids('entrada') : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('colecciones').select('id, titulo, slug').in('id', ids('coleccion').length ? ids('coleccion') : ['00000000-0000-0000-0000-000000000000']),
    supabase.from('libros').select('id, titulo, slug').in('id', ids('libro').length ? ids('libro') : ['00000000-0000-0000-0000-000000000000']),
  ]);
  const destino = new Map<string, { titulo: string; url: string }>();
  (en.data || []).forEach((x) => destino.set(x.id, { titulo: x.titulo, url: `/${x.seccion}/${x.slug}` }));
  (co.data || []).forEach((x) => destino.set(x.id, { titulo: x.titulo, url: `/fotografia/${x.slug}` }));
  (li.data || []).forEach((x) => destino.set(x.id, { titulo: x.titulo, url: `/lecturas/${x.slug}` }));

  return (
    <>
      <h1>Comentarios</h1>
      <p className="ayuda">Los comentarios se publican al momento. «Ocultar» lo quita de la página pero lo conserva; «Borrar» lo elimina para siempre.</p>
      <Aviso ok={ok} textos={{ '1': 'Listo.', borrado: 'Comentario borrado.' }} />
      {lista.length ? (
        lista.map((c) => {
          const d = destino.get(c.destino_id);
          return (
            <div className="tarjeta" key={c.id} style={{ opacity: c.oculto ? 0.6 : 1 }}>
              <div className="acciones" style={{ justifyContent: 'space-between', marginTop: 0 }}>
                <b>{c.nombre}</b>
                <span className="ayuda" style={{ margin: 0 }}>{new Date(c.creado).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</span>
              </div>
              <p style={{ whiteSpace: 'pre-line', margin: '8px 0' }}>{c.texto}</p>
              <p className="ayuda" style={{ marginBottom: 8 }}>
                En: {d ? <a href={d.url} target="_blank" rel="noopener">{d.titulo} ↗</a> : '(contenido borrado)'}
                {c.oculto ? <> · <span className="chip">Oculto</span></> : null}
              </p>
              <div className="acciones">
                <form action={alternarComentario}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="ocultar" value={c.oculto ? '0' : '1'} />
                  <button className="btn sec">{c.oculto ? 'Volver a mostrar' : 'Ocultar'}</button>
                </form>
                <form action={borrarComentario}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="btn peligro">Borrar</button>
                </form>
              </div>
            </div>
          );
        })
      ) : (
        <p className="ayuda">Todavía no hay comentarios.</p>
      )}
    </>
  );
}

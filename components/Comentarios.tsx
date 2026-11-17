import { comentariosDe, type Comentario } from '@/lib/datos';
import { fechaCorta } from '@/lib/util';
import FormComentario from './FormComentario';

export default async function Comentarios({
  tipo,
  id,
  ruta,
}: {
  tipo: Comentario['destino_tipo'];
  id: string;
  ruta: string;
}) {
  const lista = await comentariosDe(tipo, id);
  return (
    <section className="comentarios" aria-label="Comentarios">
      <h2>Comentarios{lista.length ? ` · ${lista.length}` : ''}</h2>
      {lista.map((c) => (
        <div className="comentario" key={c.id}>
          <span className="mono">{c.nombre} · {fechaCorta(c.creado)}</span>
          <p>{c.texto}</p>
        </div>
      ))}
      <FormComentario tipo={tipo} id={id} ruta={ruta} />
    </section>
  );
}

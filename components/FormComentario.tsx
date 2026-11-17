'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { enviarComentario, type EstadoComentario } from '@/lib/acciones/comentarios';

export default function FormComentario({ tipo, id, ruta }: { tipo: string; id: string; ruta: string }) {
  const [estado, accion, enviando] = useActionState<EstadoComentario, FormData>(enviarComentario, { ok: false, mensaje: '' });
  const [inicio, setInicio] = useState(0);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => setInicio(Date.now()), []);
  useEffect(() => {
    if (estado.ok) {
      form.current?.reset();
      setInicio(Date.now());
    }
  }, [estado]);

  return (
    <form ref={form} action={accion} className="form-comentario">
      <input type="hidden" name="destino_tipo" value={tipo} />
      <input type="hidden" name="destino_id" value={id} />
      <input type="hidden" name="ruta" value={ruta} />
      <input type="hidden" name="inicio" value={inicio} />
      <div className="trampa" aria-hidden="true">
        <label>No llenar<input name="sitio_web" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="mono" htmlFor={`n-${id}`}>Nombre</label>
      <input id={`n-${id}`} name="nombre" maxLength={60} required placeholder="Cómo quieres firmar" />
      <label className="mono" htmlFor={`t-${id}`}>Comentario</label>
      <textarea id={`t-${id}`} name="texto" maxLength={1500} required placeholder="Escribe aquí" />
      <div className="fila">
        <span className="mono" role="status" style={{ color: estado.ok ? 'var(--ambar)' : undefined }}>
          {estado.mensaje || 'Los comentarios se publican al momento y se moderan.'}
        </span>
        <button className="boton" disabled={enviando}>{enviando ? 'Enviando…' : 'Publicar'}</button>
      </div>
    </form>
  );
}

'use client';
import { useRef, useState } from 'react';
import { subirArchivo } from './Subir';

const AYUDA = `Escribe normal. Deja una línea en blanco entre párrafos.
## Subtítulo
> Una cita
— Autor de la cita
**negrita**   *cursiva*   [texto del enlace](https://…)
Pega un enlace de YouTube o Vimeo solo en su línea y se verá el video.`;

export default function Editor({ nombre, valor }: { nombre: string; valor: string }) {
  const [texto, setTexto] = useState(valor);
  const [estado, setEstado] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const insertar = (bloque: string) => {
    const t = ref.current;
    const pos = t ? t.selectionStart : texto.length;
    const nuevo = `${texto.slice(0, pos)}\n\n${bloque}\n\n${texto.slice(pos)}`.replace(/^\n+/, '');
    setTexto(nuevo);
  };

  return (
    <div className="campo">
      <span>Texto</span>
      <div className="acciones" style={{ marginBottom: 8 }}>
        <button type="button" className="btn sec" onClick={() => insertar('## Subtítulo')}>Subtítulo</button>
        <button type="button" className="btn sec" onClick={() => insertar('> Cita\n— Autor')}>Cita</button>
        <label className="btn sec" style={{ cursor: 'pointer' }}>
          Insertar foto o video
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setEstado('Subiendo…');
              try {
                const r = await subirArchivo(f, 'entradas');
                insertar(f.type.startsWith('video/') ? r.url : `![${r.nombre}](${r.url})`);
                setEstado('Listo. Puedes cambiar la descripción entre los corchetes [ ].');
              } catch (err) {
                setEstado(err instanceof Error ? err.message : 'No se pudo subir.');
              }
              e.target.value = '';
            }}
          />
        </label>
      </div>
      <textarea ref={ref} className="grande" name={nombre} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={AYUDA} />
      {estado ? <div className="ayuda">{estado}</div> : null}
      <details style={{ marginTop: 6 }}><summary className="ayuda" style={{ cursor: 'pointer' }}>¿Cómo dar formato?</summary><pre className="ayuda" style={{ whiteSpace: 'pre-wrap' }}>{AYUDA}</pre></details>
    </div>
  );
}

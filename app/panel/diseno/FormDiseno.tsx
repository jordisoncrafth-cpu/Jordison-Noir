'use client';
import { useMemo, useState } from 'react';
import type { Ajustes } from '@/lib/ajustes';
import { guardarDiseno } from '@/lib/acciones/panel';
import Subir from '@/components/panel/Subir';

type D = Ajustes['diseno'];

const COLORES: [keyof D, string][] = [
  ['fondo', 'Fondo'],
  ['superficie', 'Fondo secundario'],
  ['lineas', 'Líneas'],
  ['texto', 'Texto'],
  ['textoSecundario', 'Texto secundario'],
  ['acento', 'Acento'],
];

export default function FormDiseno({ diseno, logoUrl, nombre, fuentes }: { diseno: D; logoUrl: string; nombre: string; fuentes: string[] }) {
  const [d, setD] = useState<D>(diseno);
  const cambiar = <K extends keyof D>(k: K, v: D[K]) => setD((x) => ({ ...x, [k]: v }));

  const enlaceFuentes = useMemo(() => {
    const usadas = Array.from(new Set([d.fuenteTitulos, d.fuenteTexto, d.fuenteDatos]));
    return `https://fonts.googleapis.com/css2?${usadas.map((n) => `family=${n.replace(/ /g, '+')}`).join('&')}&display=swap`;
  }, [d.fuenteTitulos, d.fuenteTexto, d.fuenteDatos]);

  return (
    <form action={guardarDiseno}>
      <link rel="stylesheet" href={enlaceFuentes} />
      <div className="rejilla dos">
        <div>
          <div className="tarjeta">
            <h2>Colores</h2>
            <div className="rejilla dos">
              {COLORES.map(([k, txt]) => (
                <label key={k} className="campo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" name={k} value={d[k] as string} onChange={(e) => cambiar(k, e.target.value as never)} />
                  <span style={{ margin: 0 }}>{txt}<br /><code>{d[k] as string}</code></span>
                </label>
              ))}
            </div>
          </div>

          <div className="tarjeta">
            <h2>Tipografías</h2>
            {([['fuenteTitulos', 'Títulos y nombre'], ['fuenteTexto', 'Texto de lectura'], ['fuenteDatos', 'Datos y etiquetas']] as const).map(([k, txt]) => (
              <label key={k} className="campo">
                <span>{txt}</span>
                <select name={k} value={d[k]} onChange={(e) => cambiar(k, e.target.value)} style={{ fontFamily: `'${d[k]}'` }}>
                  {fuentes.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
            ))}
            <label className="campo">
              <span>Tamaño del texto: {d.tamanoTexto}px</span>
              <input type="range" name="tamanoTexto" min={15} max={24} step={1} value={d.tamanoTexto} onChange={(e) => cambiar('tamanoTexto', Number(e.target.value))} />
            </label>
            <label className="campo">
              <span>Tamaño de los títulos: {Math.round(d.escalaTitulos * 100)}%</span>
              <input type="range" name="escalaTitulos" min={0.7} max={1.4} step={0.05} value={d.escalaTitulos} onChange={(e) => cambiar('escalaTitulos', Number(e.target.value))} />
            </label>
            <label className="campo" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" name="grano" checked={d.grano} onChange={(e) => cambiar('grano', e.target.checked)} />
              <span style={{ margin: 0 }}>Grano de película sobre la página</span>
            </label>
          </div>

          <div className="tarjeta">
            <h2>Logo</h2>
            <Subir nombre="logoUrl" valor={logoUrl} etiqueta="Logo (cuadrado, de preferencia)" carpeta="marca" />
          </div>
        </div>

        <div>
          <div className="vista-previa" style={{ position: 'sticky', top: 16 }}>
            <div style={{ background: d.fondo, color: d.texto, padding: 24, fontFamily: `'${d.fuenteTexto}', serif`, fontSize: d.tamanoTexto }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <span style={{ fontFamily: `'${d.fuenteTitulos}', serif`, letterSpacing: '.3em', fontSize: 12 }}>{nombre}</span>
                <span style={{ fontFamily: `'${d.fuenteDatos}', monospace`, fontSize: 11, letterSpacing: '.12em', color: d.textoSecundario }}>ÍNDICE</span>
              </div>
              <span style={{ fontFamily: `'${d.fuenteDatos}', monospace`, fontSize: 11, letterSpacing: '.1em', color: d.textoSecundario, textTransform: 'uppercase' }}>Archivo personal · Vol. 01</span>
              <div style={{ fontFamily: `'${d.fuenteTitulos}', serif`, fontSize: 52 * d.escalaTitulos, lineHeight: 1, margin: '10px 0 14px', letterSpacing: '.05em' }}>Jordison</div>
              <p style={{ fontStyle: 'italic', opacity: 0.9 }}>Fotografía, cine y las ideas que se quedan después de la función.</p>
              <div style={{ borderTop: `1px solid ${d.lineas}`, marginTop: 28, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: `'${d.fuenteTitulos}', serif`, fontSize: 12, letterSpacing: '.3em' }}>CONTENIDO</span>
                <span style={{ fontFamily: `'${d.fuenteDatos}', monospace`, fontSize: 11, color: d.textoSecundario }}>7 SECCIONES</span>
              </div>
              <div style={{ background: d.superficie, border: `1px solid ${d.lineas}`, padding: 16, marginTop: 18 }}>
                <div style={{ fontSize: 24 * d.escalaTitulos }}>Diario de lecturas</div>
                <div style={{ color: d.textoSecundario, fontSize: 15 }}>Libros, frases e interpretaciones.</div>
              </div>
              <blockquote style={{ borderLeft: `1px solid ${d.acento}`, paddingLeft: 16, margin: '22px 0', fontStyle: 'italic' }}>Una cita destacada se verá así.</blockquote>
              <span style={{ fontFamily: `'${d.fuenteDatos}', monospace`, fontSize: 12, letterSpacing: '.12em', borderBottom: `1px solid ${d.acento}`, paddingBottom: 4 }}>VER COLECCIÓN →</span>
            </div>
          </div>
        </div>
      </div>
      <div className="acciones" style={{ margin: '8px 0 24px' }}>
        <button className="btn">Guardar diseño</button>
        <button type="button" className="btn sec" onClick={() => setD(diseno)}>Deshacer cambios sin guardar</button>
      </div>
    </form>
  );
}

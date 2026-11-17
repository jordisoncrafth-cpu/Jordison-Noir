'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Foto } from '@/lib/datos';

function datos(f: Foto) {
  return [f.camara, f.ajustes_tecnicos].filter(Boolean).join(' · ');
}

export default function Galeria({ fotos }: { fotos: Foto[] }) {
  const [actual, setActual] = useState<number | null>(null);
  const x0 = useRef<number | null>(null);

  const mover = useCallback((d: number) => setActual((a) => (a === null ? a : (a + d + fotos.length) % fotos.length)), [fotos.length]);

  useEffect(() => {
    if (actual === null) return;
    document.body.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActual(null);
      if (e.key === 'ArrowLeft') mover(-1);
      if (e.key === 'ArrowRight') mover(1);
    };
    window.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', tecla);
    };
  }, [actual, mover]);

  const f = actual !== null ? fotos[actual] : null;

  return (
    <>
      <div className="galeria">
        {fotos.map((foto, i) => (
          <figure key={foto.id} className="aparece">
            <img
              src={foto.url}
              alt={foto.titulo || foto.descripcion || 'Fotografía'}
              loading={i < 2 ? 'eager' : 'lazy'}
              width={foto.ancho || undefined}
              height={foto.alto || undefined}
              onClick={() => setActual(i)}
            />
            <figcaption>
              <span className="mono">N.º {String(i + 1).padStart(3, '0')}{foto.titulo ? ` · ${foto.titulo}` : ''}</span>
              <span className="mono">{[foto.lugar, datos(foto)].filter(Boolean).join(' · ')}</span>
            </figcaption>
            {foto.descripcion ? <p className="foto-desc">{foto.descripcion}</p> : null}
          </figure>
        ))}
      </div>

      {f ? (
        <div
          className="visor"
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotos"
          onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (x0.current === null) return;
            const dx = e.changedTouches[0].clientX - x0.current;
            if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
            x0.current = null;
          }}
        >
          <div className="barra">
            <span className="mono">N.º {String((actual ?? 0) + 1).padStart(3, '0')}</span>
            <button className="btn-indice" onClick={() => setActual(null)}>Cerrar ✕</button>
          </div>
          <div className="lienzo">
            <img src={f.url} alt={f.titulo || f.descripcion || 'Fotografía'} />
          </div>
          <div className="pie">
            <button className="flecha mono" onClick={() => mover(-1)}>← Anterior</button>
            <span className="mono">{[f.titulo, f.lugar, datos(f)].filter(Boolean).join(' · ')}</span>
            <button className="flecha mono" onClick={() => mover(1)}>Siguiente →</button>
          </div>
        </div>
      ) : null}
    </>
  );
}

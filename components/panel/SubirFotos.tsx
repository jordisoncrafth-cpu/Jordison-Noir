'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { crearFotos } from '@/lib/acciones/panel';
import { subirArchivo, type Subido } from './Subir';

export default function SubirFotos({ coleccionId }: { coleccionId: string | null }) {
  const router = useRouter();
  const [estado, setEstado] = useState('');
  const [ocupado, setOcupado] = useState(false);

  return (
    <div className="subida">
      <p style={{ marginBottom: 8 }}>
        <b>Subir fotos</b> — puedes elegir varias a la vez. Se suben tal cual, solo reducidas para la web (máx. 2560 px) y sin la ubicación GPS.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={ocupado}
        onChange={async (e) => {
          const archivos: File[] = Array.from(e.target.files ?? []);
          if (!archivos.length) return;
          setOcupado(true);
          const listas: Subido[] = [];
          const fallos: string[] = [];
          for (let i = 0; i < archivos.length; i++) {
            setEstado(`Subiendo ${i + 1} de ${archivos.length}…`);
            try {
              listas.push(await subirArchivo(archivos[i], 'fotos'));
            } catch (err) {
              fallos.push(`${archivos[i].name}: ${err instanceof Error ? err.message : 'error'}`);
            }
          }
          if (listas.length) {
            const r = await crearFotos(
              coleccionId,
              listas.map((s) => ({ url: s.url, ruta: s.ruta, ancho: s.ancho, alto: s.alto, titulo: '' }))
            );
            if (!r.ok) fallos.push(r.mensaje || 'No se pudieron guardar las fotos.');
          }
          setEstado(
            `${listas.length} foto(s) subida(s).` + (fallos.length ? ` Problemas: ${fallos.join(' · ')}` : ' Ya puedes escribirles título y descripción abajo.')
          );
          setOcupado(false);
          e.target.value = '';
          router.refresh();
        }}
      />
      {estado ? <div className="estado">{estado}</div> : null}
    </div>
  );
}

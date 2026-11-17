import { exigirAdmin } from '@/lib/auth';
import { completarAjustes, FUENTES } from '@/lib/ajustes';
import { restaurarDisenoOriginal, restaurarVersion } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';
import FormDiseno from './FormDiseno';

export default async function Diseno({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { ok, error } = await searchParams;
  const [{ data }, { data: historial }] = await Promise.all([
    supabase.from('ajustes').select('datos').eq('id', 1).maybeSingle(),
    supabase.from('ajustes_historial').select('id, creado').order('creado', { ascending: false }).limit(15),
  ]);
  const aj = completarAjustes(data?.datos);

  return (
    <>
      <h1>Diseño</h1>
      <p className="ayuda">Cambia colores, tipografías, tamaños, logo y grano. La vista previa se actualiza al momento; nada cambia en tu página hasta que pulses «Guardar diseño».</p>
      <Aviso ok={ok} error={error ? 'No se encontró esa versión' : undefined} textos={{ '1': 'Diseño guardado. Ya se ve en tu página.', restaurado: 'Se restauró la versión anterior.', original: 'Se restauró el diseño original.' }} />
      <FormDiseno diseno={aj.diseno} logoUrl={aj.marca.logoUrl} nombre={aj.marca.nombre} fuentes={FUENTES.map((f) => f.nombre)} />

      <details className="tarjeta">
        <summary>Volver a un diseño anterior</summary>
        <p className="ayuda">Cada vez que guardas, se conserva la versión anterior de todos los ajustes (diseño, textos, secciones y redes).</p>
        {(historial || []).map((h) => (
          <form key={h.id} action={restaurarVersion} className="acciones" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--linea)', padding: '8px 0' }}>
            <input type="hidden" name="id" value={h.id} />
            <span>{new Date(h.creado).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</span>
            <button className="btn sec">Restaurar</button>
          </form>
        ))}
        <form action={restaurarDisenoOriginal} style={{ marginTop: 14 }}>
          <button className="btn sec">Volver al diseño original de Jordison Noir</button>
        </form>
      </details>
    </>
  );
}

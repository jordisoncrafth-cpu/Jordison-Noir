import { exigirAdmin } from '@/lib/auth';
import { completarAjustes } from '@/lib/ajustes';
import { guardarTextos } from '@/lib/acciones/panel';
import Aviso from '@/components/panel/Aviso';
import Subir from '@/components/panel/Subir';

export default async function Textos({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { ok } = await searchParams;
  const { data } = await supabase.from('ajustes').select('datos').eq('id', 1).maybeSingle();
  const aj = completarAjustes(data?.datos);
  const redes = [...aj.redes, ...Array(Math.max(0, 6 - aj.redes.length)).fill({ nombre: '', url: '', usuario: '' })].slice(0, 6);

  return (
    <form action={guardarTextos}>
      <h1>Portada, secciones y redes</h1>
      <p className="ayuda">Todo lo que se lee en tu página. Al terminar, pulsa «Guardar todo» al final.</p>
      <Aviso ok={ok} textos={{ '1': 'Cambios guardados. Ya se ven en tu página.' }} />

      <details className="tarjeta" open>
        <summary>Portada</summary>
        <Subir nombre="portada_imagen" valor={aj.portada.imagenUrl} etiqueta="Foto principal" carpeta="portada" />
        <div className="rejilla dos">
          <label className="campo"><span>Encuadre de la foto (horizontal% vertical%)</span><input type="text" name="portada_posicion" defaultValue={aj.portada.posicion} placeholder="50% 20%" /></label>
          <label className="campo"><span>Datos de la foto (arriba a la derecha)</span><textarea name="portada_datos" defaultValue={aj.portada.datosFoto} placeholder="N.º 001 · 35 mm · f/2" style={{ minHeight: 60 }} /></label>
          <label className="campo"><span>Etiqueta pequeña</span><input type="text" name="portada_etiqueta" defaultValue={aj.portada.etiqueta} /></label>
          <label className="campo"><span>Título grande</span><input type="text" name="portada_titulo" defaultValue={aj.portada.titulo} /></label>
          <label className="campo"><span>Subtítulo</span><input type="text" name="portada_subtitulo" defaultValue={aj.portada.subtitulo} /></label>
        </div>
        <label className="campo"><span>Frase de la portada</span><textarea name="portada_texto" defaultValue={aj.portada.texto} style={{ minHeight: 70 }} /></label>
      </details>

      <details className="tarjeta">
        <summary>Nombre y lema</summary>
        <div className="rejilla dos">
          <label className="campo"><span>Nombre del sitio</span><input type="text" name="marca_nombre" defaultValue={aj.marca.nombre} /></label>
          <label className="campo"><span>Lema (debajo del logo)</span><input type="text" name="marca_lema" defaultValue={aj.marca.lema} /></label>
        </div>
      </details>

      <details className="tarjeta">
        <summary>Secciones: nombres, orden y cuáles se muestran</summary>
        <table className="tabla">
          <thead><tr><th>Orden</th><th>Nombre</th><th>Descripción</th><th>Visible</th></tr></thead>
          <tbody>
            {aj.secciones.map((s, i) => (
              <tr key={s.clave}>
                <td style={{ width: 70 }}><input type="number" name={`sec_orden_${s.clave}`} defaultValue={i + 1} min={1} max={20} /></td>
                <td><input type="text" name={`sec_nombre_${s.clave}`} defaultValue={s.nombre} /><small style={{ color: 'var(--humo)' }}>/{s.clave}</small></td>
                <td><input type="text" name={`sec_desc_${s.clave}`} defaultValue={s.descripcion} /></td>
                <td style={{ width: 70, textAlign: 'center' }}><input type="checkbox" name={`sec_visible_${s.clave}`} defaultChecked={s.visible} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details className="tarjeta">
        <summary>Sobre mí</summary>
        <Subir nombre="sobre_imagen" valor={aj.sobreMi.imagenUrl} etiqueta="Foto" carpeta="sobre-mi" />
        <label className="campo"><span>Texto (deja una línea en blanco entre párrafos)</span><textarea name="sobre_texto" defaultValue={aj.sobreMi.texto} style={{ minHeight: 200 }} /></label>
      </details>

      <details className="tarjeta">
        <summary>Redes sociales</summary>
        <p className="ayuda">Deja el nombre vacío para quitar una red.</p>
        {redes.map((r, i) => (
          <div className="rejilla tres" key={i}>
            <label className="campo"><span>Red</span><input type="text" name={`red_nombre_${i}`} defaultValue={r.nombre} placeholder="Instagram" /></label>
            <label className="campo"><span>Enlace</span><input type="url" name={`red_url_${i}`} defaultValue={r.url} placeholder="https://" /></label>
            <label className="campo"><span>Usuario</span><input type="text" name={`red_usuario_${i}`} defaultValue={r.usuario} placeholder="@usuario" /></label>
          </div>
        ))}
      </details>

      <details className="tarjeta">
        <summary>Contador y aviso de privacidad</summary>
        <label className="campo" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="checkbox" name="mostrar_contador" defaultChecked={aj.mostrarContador} />
          <span style={{ margin: 0 }}>Mostrar el número de visitas al pie de la página</span>
        </label>
        <label className="campo"><span>Aviso de privacidad</span><textarea name="privacidad_texto" defaultValue={aj.privacidad.texto} style={{ minHeight: 220 }} /></label>
      </details>

      <div className="acciones" style={{ margin: '8px 0 40px' }}><button className="btn">Guardar todo</button></div>
    </form>
  );
}

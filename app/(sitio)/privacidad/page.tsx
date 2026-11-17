import type { Metadata } from 'next';
import { leerAjustes } from '@/lib/ajustes';
import { parrafos } from '@/lib/markdown';

export const metadata: Metadata = { title: 'Aviso de privacidad' };

export default async function Privacidad() {
  const aj = await leerAjustes();
  return (
    <div className="wrap">
      <div className="lectura cabecera"><span className="mono">Privacidad</span><h1>Aviso de privacidad</h1></div>
      <div className="lectura">
        {parrafos(aj.privacidad.texto).map((p, i) => <p key={i} style={{ marginBottom: '1em' }}>{p}</p>)}
      </div>
    </div>
  );
}

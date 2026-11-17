'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Avisa al servidor de cada página vista. No usa cookies ni guarda la IP. */
export default function RegistroVisita() {
  const ruta = usePathname();
  useEffect(() => {
    if (!ruta || ruta.startsWith('/panel') || ruta.startsWith('/entrar')) return;
    const datos = JSON.stringify({ ruta, referente: document.referrer || '' });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/visita', new Blob([datos], { type: 'application/json' }));
      } else {
        fetch('/api/visita', { method: 'POST', body: datos, headers: { 'content-type': 'application/json' }, keepalive: true });
      }
    } catch {
      /* sin conexión: no pasa nada */
    }
  }, [ruta]);
  return null;
}

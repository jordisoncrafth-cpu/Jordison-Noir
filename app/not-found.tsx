import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <div className="wrap" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <span className="mono">Error 404</span>
      <h1 style={{ fontWeight: 300, fontSize: 'clamp(40px,8vw,96px)', margin: '16px 0' }}>Esta página no existe.</h1>
      <Link className="enlace" href="/">Volver al inicio →</Link>
    </div>
  );
}

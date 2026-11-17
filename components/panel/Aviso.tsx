export default function Aviso({ ok, error, textos }: { ok?: string; error?: string; textos?: Record<string, string> }) {
  if (error) return <p className="aviso-error">Hubo un problema: {decodeURIComponent(error)}</p>;
  if (ok) return <p className="aviso-ok">{textos?.[ok] || 'Cambios guardados.'}</p>;
  return null;
}

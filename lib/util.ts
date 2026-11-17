export function crearSlug(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'sin-titulo'
  );
}

export function sufijoAleatorio(n = 8): string {
  const letras = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => letras[b % letras.length]).join('');
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaCorta(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function texto(fd: FormData, campo: string, max = 20000): string {
  const v = fd.get(campo);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function urlSegura(u?: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Acepta direcciones https o archivos propios del sitio (que empiezan con /). */
export function urlImagen(u?: string | null): string | null {
  if (u && /^\/[a-zA-Z0-9._\-/]+$/.test(u) && !u.startsWith('//')) return u;
  return urlSegura(u);
}

/** Convierte un enlace de YouTube o Vimeo en su dirección para incrustar. */
export function enlaceVideo(u?: string | null): { tipo: 'iframe' | 'video'; src: string } | null {
  const seguro = urlSegura(u);
  if (!seguro) return null;
  const url = new URL(seguro);
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtube.com' && url.searchParams.get('v'))
    return { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.searchParams.get('v')!)}` };
  if (host === 'youtube.com' && url.pathname.startsWith('/shorts/'))
    return { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.pathname.split('/')[2] || '')}` };
  if (host === 'youtu.be')
    return { tipo: 'iframe', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.pathname.slice(1))}` };
  if (host === 'vimeo.com' && /^\/\d+/.test(url.pathname))
    return { tipo: 'iframe', src: `https://player.vimeo.com/video/${url.pathname.split('/')[1]}?dnt=1` };
  if (/\.(mp4|webm|mov)$/i.test(url.pathname)) return { tipo: 'video', src: seguro };
  return null;
}

import { enlaceVideo, urlSegura } from './util';

/**
 * Convierte el texto que escribes en el panel a HTML seguro.
 * Formatos aceptados:
 *   ## Subtítulo            ### Subtítulo menor
 *   > Cita                  — Autor (en la línea siguiente de la cita, empezando con "—")
 *   **negrita**  *cursiva*  [texto](https://enlace)
 *   ![descripción](https://imagen.jpg)
 *   Un enlace de YouTube, Vimeo o un .mp4 solo en su línea = video incrustado
 * Todo lo demás se escapa, así que nadie puede inyectar código.
 */
function escapar(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function enLinea(s: string): string {
  let t = escapar(s);
  t = t.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_m, txt: string, url: string) => {
    const seguro = urlSegura(url.replace(/&amp;/g, '&'));
    return seguro ? `<a href="${escapar(seguro)}" target="_blank" rel="noopener noreferrer">${txt}</a>` : txt;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return t;
}

function bloqueVideo(linea: string): string | null {
  const v = enlaceVideo(linea.trim());
  if (!v) return null;
  if (v.tipo === 'video')
    return `<figure class="md-video"><video src="${escapar(v.src)}" controls playsinline preload="metadata"></video></figure>`;
  return `<figure class="md-video"><iframe src="${escapar(
    v.src
  )}" title="Video" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></figure>`;
}

export function aHtml(fuente: string): string {
  const bloques = (fuente || '').replace(/\r\n/g, '\n').split(/\n{2,}/);
  const salida: string[] = [];
  for (const crudo of bloques) {
    const b = crudo.trim();
    if (!b) continue;

    const img = b.match(/^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/);
    if (img) {
      const src = urlSegura(img[2]);
      if (src)
        salida.push(
          `<figure class="md-img"><img src="${escapar(src)}" alt="${escapar(img[1])}" loading="lazy">${
            img[1] ? `<figcaption>${escapar(img[1])}</figcaption>` : ''
          }</figure>`
        );
      continue;
    }
    if (!b.includes('\n')) {
      const v = bloqueVideo(b);
      if (v) {
        salida.push(v);
        continue;
      }
    }
    if (b.startsWith('### ')) {
      salida.push(`<h3>${enLinea(b.slice(4))}</h3>`);
      continue;
    }
    if (b.startsWith('## ')) {
      salida.push(`<h2>${enLinea(b.slice(3))}</h2>`);
      continue;
    }
    if (b.startsWith('>')) {
      const lineas = b.split('\n').map((l) => l.replace(/^>\s?/, ''));
      const autor = lineas.length > 1 && /^[—-]\s?/.test(lineas[lineas.length - 1]) ? lineas.pop()! : '';
      salida.push(
        `<blockquote>${enLinea(lineas.join(' '))}${
          autor ? `<cite>${enLinea(autor.replace(/^[—-]\s?/, ''))}</cite>` : ''
        }</blockquote>`
      );
      continue;
    }
    salida.push(`<p>${b.split('\n').map(enLinea).join('<br>')}</p>`);
  }
  return salida.join('\n');
}

export function parrafos(t: string): string[] {
  return (t || '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

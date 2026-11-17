import { supabaseServidor } from './supabase/server';

export type ClaveSeccion =
  | 'fotografia'
  | 'reflexiones'
  | 'lecturas'
  | 'proceso'
  | 'diario'
  | 'sobre-mi'
  | 'redes';

export type Seccion = {
  clave: ClaveSeccion;
  nombre: string;
  descripcion: string;
  visible: boolean;
};

export type Red = { nombre: string; url: string; usuario: string };

export type Ajustes = {
  diseno: {
    fondo: string;
    superficie: string;
    lineas: string;
    texto: string;
    textoSecundario: string;
    acento: string;
    fuenteTitulos: string;
    fuenteTexto: string;
    fuenteDatos: string;
    tamanoTexto: number; // px
    escalaTitulos: number; // 0.7 – 1.4
    grano: boolean;
  };
  marca: {
    nombre: string;
    logoUrl: string;
    lema: string;
  };
  portada: {
    imagenUrl: string;
    etiqueta: string;
    titulo: string;
    subtitulo: string;
    texto: string;
    datosFoto: string;
    posicion: string; // object-position, p. ej. "50% 20%"
  };
  sobreMi: {
    imagenUrl: string;
    texto: string;
  };
  privacidad: { texto: string };
  secciones: Seccion[];
  redes: Red[];
  mostrarContador: boolean;
};

/** Tipografías disponibles (Google Fonts). */
export const FUENTES: { nombre: string; tipo: string; pesos: string }[] = [
  { nombre: 'Cinzel', tipo: 'serif', pesos: '400;500;600;700' },
  { nombre: 'Newsreader', tipo: 'serif', pesos: '300;400;500;600' },
  { nombre: 'Cormorant Garamond', tipo: 'serif', pesos: '300;400;500;600' },
  { nombre: 'Playfair Display', tipo: 'serif', pesos: '400;500;600;700' },
  { nombre: 'Fraunces', tipo: 'serif', pesos: '300;400;500;600' },
  { nombre: 'EB Garamond', tipo: 'serif', pesos: '400;500;600' },
  { nombre: 'Libre Baskerville', tipo: 'serif', pesos: '400;700' },
  { nombre: 'Lora', tipo: 'serif', pesos: '400;500;600' },
  { nombre: 'Bodoni Moda', tipo: 'serif', pesos: '400;500;600' },
  { nombre: 'Inter', tipo: 'sans-serif', pesos: '300;400;500;600' },
  { nombre: 'Geist', tipo: 'sans-serif', pesos: '300;400;500;600' },
  { nombre: 'IBM Plex Sans', tipo: 'sans-serif', pesos: '300;400;500;600' },
  { nombre: 'Space Grotesk', tipo: 'sans-serif', pesos: '300;400;500;600' },
  { nombre: 'Oswald', tipo: 'sans-serif', pesos: '300;400;500;600' },
  { nombre: 'Bebas Neue', tipo: 'sans-serif', pesos: '400' },
  { nombre: 'Permanent Marker', tipo: 'cursive', pesos: '400' },
  { nombre: 'Rock Salt', tipo: 'cursive', pesos: '400' },
  { nombre: 'IBM Plex Mono', tipo: 'monospace', pesos: '400;500' },
  { nombre: 'JetBrains Mono', tipo: 'monospace', pesos: '400;500' },
  { nombre: 'Space Mono', tipo: 'monospace', pesos: '400;700' },
];

export const AJUSTES_BASE: Ajustes = {
  diseno: {
    fondo: '#0B0B0C',
    superficie: '#17171A',
    lineas: '#2A2A2E',
    texto: '#ECE8E1',
    textoSecundario: '#8A8A90',
    acento: '#C8A15A',
    fuenteTitulos: 'Cinzel',
    fuenteTexto: 'Newsreader',
    fuenteDatos: 'IBM Plex Mono',
    tamanoTexto: 19,
    escalaTitulos: 1,
    grano: true,
  },
  marca: {
    nombre: 'JORDISON NOIR',
    logoUrl: '/logo.jpg',
    lema: 'Fotografía · Cine',
  },
  portada: {
    imagenUrl: '/portada.jpg',
    etiqueta: 'Archivo personal · Vol. 01',
    titulo: 'Jordison',
    subtitulo: 'Noir',
    texto: 'Fotografía, cine y las ideas que se quedan después de la función.',
    datosFoto: 'N.º 001\n35 mm · f/2 · ISO 2000',
    posicion: '60% 12%',
  },
  sobreMi: {
    imagenUrl: '/sobre-mi.jpg',
    texto:
      'Soy Jordison. Hago fotografía y video, y en TikTok publico análisis sobre filosofía y antihéroes.\n\nEste sitio es mi archivo personal: fotos, lecturas, ideas y el registro de lo que voy aprendiendo con la cámara y el dron.',
  },
  privacidad: {
    texto:
      'Este sitio cuenta las visitas de forma anónima para saber qué secciones se leen más. Se registra la página visitada, la fecha, el país aproximado y el tipo de dispositivo. No se guardan direcciones IP, no se usan cookies de rastreo y no se comparte información con terceros.\n\nSi dejas un comentario, se guarda el nombre que escribas y tu mensaje. Puedes pedir que se borre en cualquier momento a través de mis redes.',
  },
  secciones: [
    { clave: 'fotografia', nombre: 'Fotografía', descripcion: 'Colecciones y fotografías con su historia.', visible: true },
    { clave: 'reflexiones', nombre: 'Pensamientos y reflexiones', descripcion: 'Ensayos, ideas y análisis.', visible: true },
    { clave: 'lecturas', nombre: 'Diario de lecturas', descripcion: 'Libros, frases e interpretaciones.', visible: true },
    { clave: 'proceso', nombre: 'Proceso creativo', descripcion: 'Bitácora de fotografía, cine, edición y dron.', visible: true },
    { clave: 'diario', nombre: 'Diario personal', descripcion: 'Entradas que decido hacer públicas.', visible: true },
    { clave: 'sobre-mi', nombre: 'Sobre mí', descripcion: 'Quién está detrás de la cámara.', visible: true },
    { clave: 'redes', nombre: 'Redes', descripcion: 'Dónde publico lo demás.', visible: true },
  ],
  redes: [
    { nombre: 'Instagram', url: 'https://www.instagram.com/jordison.noir/', usuario: '@jordison.noir' },
    { nombre: 'TikTok', url: 'https://www.tiktok.com/@soychristianjordison', usuario: '@soychristianjordison' },
    { nombre: 'Facebook', url: '', usuario: '' },
  ],
  mostrarContador: true,
};

/** Une lo guardado con los valores base, para que nunca falte un campo. */
export function completarAjustes(datos: unknown): Ajustes {
  const d = (datos && typeof datos === 'object' ? datos : {}) as Partial<Ajustes>;
  const base = AJUSTES_BASE;
  const secciones = Array.isArray(d.secciones) && d.secciones.length
    ? base.secciones
        .map((s) => ({ ...s, ...(d.secciones!.find((x) => x?.clave === s.clave) || {}) }))
        .sort(
          (a, b) =>
            d.secciones!.findIndex((x) => x?.clave === a.clave) - d.secciones!.findIndex((x) => x?.clave === b.clave)
        )
    : base.secciones;
  return {
    diseno: { ...base.diseno, ...(d.diseno || {}) },
    marca: { ...base.marca, ...(d.marca || {}) },
    portada: { ...base.portada, ...(d.portada || {}) },
    sobreMi: { ...base.sobreMi, ...(d.sobreMi || {}) },
    privacidad: { ...base.privacidad, ...(d.privacidad || {}) },
    secciones,
    redes: Array.isArray(d.redes) ? d.redes : base.redes,
    mostrarContador: typeof d.mostrarContador === 'boolean' ? d.mostrarContador : base.mostrarContador,
  };
}

export async function leerAjustes(): Promise<Ajustes> {
  try {
    const supabase = await supabaseServidor();
    const { data } = await supabase.from('ajustes').select('datos').eq('id', 1).maybeSingle();
    return completarAjustes(data?.datos);
  } catch {
    return AJUSTES_BASE;
  }
}

export function seccion(aj: Ajustes, clave: ClaveSeccion): Seccion {
  return aj.secciones.find((s) => s.clave === clave) || AJUSTES_BASE.secciones.find((s) => s.clave === clave)!;
}

function familia(nombre: string, base: string): string {
  const f = FUENTES.find((x) => x.nombre === nombre) || FUENTES.find((x) => x.nombre === base)!;
  return `'${f.nombre}', ${f.tipo}`;
}

export function urlFuentes(d: Ajustes['diseno']): string {
  const usadas = Array.from(new Set([d.fuenteTitulos, d.fuenteTexto, d.fuenteDatos]));
  const familias = usadas
    .map((n) => FUENTES.find((f) => f.nombre === n))
    .filter(Boolean)
    .map((f) => `family=${encodeURIComponent(f!.nombre).replace(/%20/g, '+')}:wght@${f!.pesos}`);
  return `https://fonts.googleapis.com/css2?${familias.join('&')}&display=swap`;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const color = (c: string, base: string) => (HEX.test(c) ? c : base);

export function variablesCss(d: Ajustes['diseno']): string {
  const b = AJUSTES_BASE.diseno;
  const tam = Math.min(24, Math.max(15, Number(d.tamanoTexto) || b.tamanoTexto));
  const esc = Math.min(1.4, Math.max(0.7, Number(d.escalaTitulos) || 1));
  return `:root{--noir:${color(d.fondo, b.fondo)};--grafito:${color(d.superficie, b.superficie)};--linea:${color(
    d.lineas,
    b.lineas
  )};--hueso:${color(d.texto, b.texto)};--humo:${color(d.textoSecundario, b.textoSecundario)};--ambar:${color(
    d.acento,
    b.acento
  )};--display:${familia(d.fuenteTitulos, b.fuenteTitulos)};--serif:${familia(d.fuenteTexto, b.fuenteTexto)};--mono:${familia(
    d.fuenteDatos,
    b.fuenteDatos
  )};--tam:${tam}px;--esc:${esc};}`;
}

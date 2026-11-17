import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServidor } from '@/lib/supabase/server';

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|headless|lighthouse/i;

function dispositivo(ua: string) {
  if (/ipad|tablet/i.test(ua)) return 'Tableta';
  if (/mobi|android|iphone/i.test(ua)) return 'Celular';
  return 'Computadora';
}
function navegador(ua: string) {
  if (/instagram/i.test(ua)) return 'Instagram';
  if (/tiktok|musical_ly|bytedance/i.test(ua)) return 'TikTok';
  if (/fban|fbav/i.test(ua)) return 'Facebook';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Otro';
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (!ua || BOTS.test(ua)) return new NextResponse(null, { status: 204 });

  let cuerpo: { ruta?: string; referente?: string } = {};
  try {
    cuerpo = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const ruta = typeof cuerpo.ruta === 'string' && cuerpo.ruta.startsWith('/') ? cuerpo.ruta.slice(0, 300) : null;
  if (!ruta) return new NextResponse(null, { status: 204 });

  let referente = '';
  try {
    if (cuerpo.referente) {
      const host = new URL(cuerpo.referente).hostname.replace(/^www\./, '');
      if (host && host !== req.nextUrl.hostname) referente = host;
    }
  } catch {}

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const dia = new Date().toISOString().slice(0, 10);
  // Huella anónima que cambia cada día: sirve para contar visitantes únicos sin guardar la IP.
  const visitante = createHash('sha256')
    .update(`${process.env.VISITAS_SAL || 'jordison'}|${ip}|${ua}|${dia}`)
    .digest('hex')
    .slice(0, 32);

  const supabase = await supabaseServidor();
  // Si eres tú (sesión iniciada), no se cuenta la visita.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return new NextResponse(null, { status: 204 });

  await supabase.rpc('registrar_visita', {
    p_ruta: ruta,
    p_pais: req.headers.get('x-vercel-ip-country') || '',
    p_dispositivo: dispositivo(ua),
    p_navegador: navegador(ua),
    p_referente: referente,
    p_visitante: visitante,
  });
  return new NextResponse(null, { status: 204 });
}

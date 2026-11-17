import Link from 'next/link';
import { exigirAdmin } from '@/lib/auth';

type Visita = { ruta: string; pais: string | null; dispositivo: string | null; navegador: string | null; referente: string | null; visitante: string; creado: string };

const NOMBRE_PAIS: Record<string, string> = {
  MX: 'México', US: 'Estados Unidos', ES: 'España', AR: 'Argentina', CO: 'Colombia', CL: 'Chile', PE: 'Perú',
  GT: 'Guatemala', VE: 'Venezuela', EC: 'Ecuador', CA: 'Canadá', BR: 'Brasil', DE: 'Alemania', FR: 'Francia', GB: 'Reino Unido',
};

function contar<T extends string>(lista: (T | null | undefined)[]) {
  const m = new Map<string, number>();
  lista.forEach((v) => m.set(v || 'Desconocido', (m.get(v || 'Desconocido') || 0) + 1));
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function Ranking({ titulo, datos, nombre }: { titulo: string; datos: [string, number][]; nombre?: (k: string) => string }) {
  const max = datos[0]?.[1] || 1;
  return (
    <div className="tarjeta">
      <h2>{titulo}</h2>
      {datos.length ? (
        datos.slice(0, 8).map(([k, v]) => (
          <div className="fila-barra" key={k}>
            <div>
              {nombre ? nombre(k) : k}
              <div className="bar"><i style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
            <b style={{ textAlign: 'right' }}>{v}</b>
          </div>
        ))
      ) : (
        <p className="ayuda">Todavía no hay datos.</p>
      )}
    </div>
  );
}

const diaMx = (iso: string) => new Date(new Date(iso).getTime() - 6 * 3600e3).toISOString().slice(0, 10);

export default async function Resumen({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { periodo = '30' } = await searchParams;
  const dias = ['7', '30', '365'].includes(periodo) ? Number(periodo) : 30;
  const desde = new Date(Date.now() - dias * 86400e3).toISOString();

  const [{ data: visitasData }, { count: totalHistorico }, { count: comentariosNuevos }] = await Promise.all([
    supabase.from('visitas').select('ruta, pais, dispositivo, navegador, referente, visitante, creado').gte('creado', desde).order('creado').limit(50000),
    supabase.from('visitas').select('id', { count: 'exact', head: true }),
    supabase.from('comentarios').select('id', { count: 'exact', head: true }).gte('creado', new Date(Date.now() - 7 * 86400e3).toISOString()),
  ]);
  const visitas = (visitasData as Visita[]) || [];

  const unicos = new Set(visitas.map((v) => v.visitante)).size;
  const hoy = diaMx(new Date().toISOString());
  const visitasHoy = visitas.filter((v) => diaMx(v.creado) === hoy).length;

  // Visitas por día (o por mes si el periodo es un año).
  const porMes = dias === 365;
  const claves: string[] = [];
  for (let i = porMes ? 11 : dias - 1; i >= 0; i--) {
    if (porMes) {
      const d = new Date();
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() - i);
      claves.push(d.toISOString().slice(0, 7));
    } else {
      claves.push(diaMx(new Date(Date.now() - i * 86400e3).toISOString()));
    }
  }
  const serie = new Map(claves.map((k) => [k, 0]));
  visitas.forEach((v) => {
    const k = porMes ? diaMx(v.creado).slice(0, 7) : diaMx(v.creado);
    if (serie.has(k)) serie.set(k, (serie.get(k) || 0) + 1);
  });
  const valores = Array.from(serie.entries());
  const maximo = Math.max(1, ...valores.map(([, n]) => n));

  // Por semana (últimas 4 semanas dentro del periodo).
  const semanas = [0, 1, 2, 3].map((s) => {
    const fin = Date.now() - s * 7 * 86400e3;
    const ini = fin - 7 * 86400e3;
    return visitas.filter((v) => {
      const t = new Date(v.creado).getTime();
      return t > ini && t <= fin;
    }).length;
  });

  return (
    <>
      <h1>Resumen y visitas</h1>
      <p className="ayuda">Cada visita se registra de forma anónima: página, fecha, país aproximado y dispositivo. Tus propias visitas (con sesión iniciada) no se cuentan.</p>

      <div className="acciones" style={{ marginBottom: 16 }}>
        {[['7', '7 días'], ['30', '30 días'], ['365', '12 meses']].map(([v, t]) => (
          <Link key={v} href={`/panel?periodo=${v}`} className={`btn ${String(dias) === v ? '' : 'sec'}`}>{t}</Link>
        ))}
      </div>

      <div className="cifras">
        <div className="cifra"><b>{(totalHistorico || 0).toLocaleString('es-MX')}</b><span>Visitas en total (desde el inicio)</span></div>
        <div className="cifra"><b>{visitas.length.toLocaleString('es-MX')}</b><span>Visitas en el periodo</span></div>
        <div className="cifra"><b>{unicos.toLocaleString('es-MX')}</b><span>Visitantes únicos aprox. (por día)</span></div>
        <div className="cifra"><b>{visitasHoy}</b><span>Visitas hoy</span></div>
      </div>

      <div className="tarjeta">
        <h2>{porMes ? 'Visitas por mes' : 'Visitas por día'}</h2>
        <div className="barras" aria-label="Gráfica de visitas">
          {valores.map(([k, n]) => (
            <div key={k} title={`${k}: ${n} visitas`} style={{ height: `${(n / maximo) * 100}%` }} />
          ))}
        </div>
        <div className="acciones" style={{ justifyContent: 'space-between', color: 'var(--humo)', fontSize: 13 }}>
          <span>{valores[0]?.[0]}</span><span>máx. {maximo}</span><span>{valores[valores.length - 1]?.[0]}</span>
        </div>
      </div>

      {dias >= 30 ? <div className="cifras">
        {semanas.map((n, i) => (
          <div className="cifra" key={i}><b>{n}</b><span>{i === 0 ? 'Esta semana' : `Hace ${i} semana${i > 1 ? 's' : ''}`}</span></div>
        ))}
      </div> : null}

      <div className="rejilla dos">
        <Ranking titulo="Páginas más visitadas" datos={contar(visitas.map((v) => v.ruta))} />
        <Ranking titulo="Países" datos={contar(visitas.map((v) => v.pais))} nombre={(k) => NOMBRE_PAIS[k] || k} />
        <Ranking titulo="Dispositivos" datos={contar(visitas.map((v) => v.dispositivo))} />
        <Ranking titulo="De dónde llegan" datos={contar(visitas.map((v) => v.referente || 'Directo'))} />
        <Ranking titulo="Navegador o app" datos={contar(visitas.map((v) => v.navegador))} />
        <div className="tarjeta">
          <h2>Comentarios</h2>
          <p style={{ fontSize: 30, fontWeight: 600 }}>{comentariosNuevos || 0}</p>
          <p className="ayuda">nuevos en los últimos 7 días</p>
          <Link className="btn sec" href="/panel/comentarios">Revisar comentarios</Link>
        </div>
      </div>
    </>
  );
}

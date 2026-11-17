import { redirect } from 'next/navigation';
import { supabaseServidor } from '@/lib/supabase/server';
import { esAdmin } from '@/lib/auth';
import '../panel/panel.css';

export const metadata = { title: 'Entrar', robots: { index: false } };

async function entrar(fd: FormData) {
  'use server';
  const correo = String(fd.get('correo') || '').trim();
  const clave = String(fd.get('clave') || '');
  const supabase = await supabaseServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: clave });
  if (error) redirect('/entrar?error=datos');
  redirect('/panel');
}

export default async function Entrar({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await esAdmin()) redirect('/panel');
  const { error } = await searchParams;
  return (
    <div className="panel login">
      <form action={entrar} className="tarjeta">
        <h1 style={{ marginBottom: 16 }}>Entrar al panel</h1>
        {error === 'datos' ? <p className="aviso-error">Correo o contraseña incorrectos.</p> : null}
        {error === 'sin-permiso' ? <p className="aviso-error">Esta cuenta no tiene permiso de administrador.</p> : null}
        <label className="campo"><span>Correo</span><input type="email" name="correo" required autoComplete="username" /></label>
        <label className="campo"><span>Contraseña</span><input type="password" name="clave" required autoComplete="current-password" /></label>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>Entrar</button>
      </form>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { supabaseServidor } from './supabase/server';

/** Garantiza que quien llama es el administrador. Si no, lo manda a /entrar. */
export async function exigirAdmin() {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!data) redirect('/entrar?error=sin-permiso');
  return { supabase, user };
}

export async function esAdmin(): Promise<boolean> {
  const supabase = await supabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  return !!data;
}

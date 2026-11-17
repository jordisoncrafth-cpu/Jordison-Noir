import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function supabaseServidor() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return almacen.getAll();
        },
        setAll(lista) {
          try {
            lista.forEach(({ name, value, options }) => almacen.set(name, value, options));
          } catch {
            // Llamado desde un Server Component: el middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}

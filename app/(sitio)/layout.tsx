import { leerAjustes } from '@/lib/ajustes';
import Encabezado from '@/components/Encabezado';
import Pie from '@/components/Pie';

export default async function Sitio({ children }: { children: React.ReactNode }) {
  const aj = await leerAjustes();
  return (
    <>
      <Encabezado nombre={aj.marca.nombre} logoUrl={aj.marca.logoUrl} secciones={aj.secciones} redes={aj.redes} />
      <main>{children}</main>
      <Pie aj={aj} />
    </>
  );
}

import { exigirAdmin } from '@/lib/auth';
import NavPanel from './NavPanel';
import './panel.css';

export const metadata = { title: 'Panel', robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await exigirAdmin();
  return (
    <div className="panel">
      <NavPanel />
      <div className="panel-main">{children}</div>
    </div>
  );
}

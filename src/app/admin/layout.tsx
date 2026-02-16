import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin | Pilareta Tribe',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasAdminAccess = await isAdmin();

  if (!hasAdminAccess) {
    redirect('/');
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 4rem)',
        background: '#141414',
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '1.5rem 1rem',
          background: '#1a1a1a',
        }}
      >
        {children}
      </main>
    </div>
  );
}

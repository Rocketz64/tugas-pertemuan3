import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function MngTransaksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return <>{children}</>;
}
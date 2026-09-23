import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getTransactions, getFinancialSummary } from '@/lib/transactions';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard - HematMahasiswa',
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const [transactions, summary] = await Promise.all([
    getTransactions({ userId: user.id }),
    getFinancialSummary(user.id),
  ]);

  return (
    <DashboardClient
      user={user}
      initialTransactions={transactions}
      initialSummary={summary}
    />
  );
}

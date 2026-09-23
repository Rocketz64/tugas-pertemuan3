import type { Metadata } from 'next';
import { getThemePreference } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expense Tracker Mahasiswa',
  description: 'Aplikasi pengelola keuangan pribadi mahasiswa',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getThemePreference();

  return (
    <html lang="id" className={theme === 'dark' ? 'dark' : ''} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}

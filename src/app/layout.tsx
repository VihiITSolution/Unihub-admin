import type { Metadata } from 'next';
import Script from 'next/script';
import '../styles/globals.css';
import ClientLayout from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'Unihub.lk Admin Panel',
  description: 'Admin panel for managing Unihub.lk platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="admin-theme" strategy="beforeInteractive">{`
          try {
            const savedTheme = localStorage.getItem('unihub-admin-theme');
            const useDarkTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', useDarkTheme);
          } catch (_) {}
        `}</Script>
      </head>
      <body className="font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

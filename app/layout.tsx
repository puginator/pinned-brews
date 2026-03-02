import type { Metadata } from 'next';
import { Quicksand, Nunito } from 'next/font/google';
import './globals.css';
import { getViewer } from '@/lib/server/auth';
import { APP_NAME } from '@/lib/domain/constants';
import { Navbar } from '@/components/Navbar';
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Pin your best brews, discover what coffee people are actually making, and map the roasters worth chasing.',
  icons: {
    icon: '/brew-methods/v60-circle-badge.svg',
    shortcut: '/brew-methods/v60-circle-badge.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-amber-50 font-quicksand text-stone-800">
        <AuthSessionProvider initialViewer={viewer}>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#fefce8_0%,#fffbeb_52%,#f5f5f4_100%)]" />
          <div className="fixed inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
          <Navbar />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}

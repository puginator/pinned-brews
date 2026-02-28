import type {Metadata} from 'next';
import { Quicksand, Nunito } from 'next/font/google';
import './globals.css'; // Global styles
import { AppProvider } from '@/lib/store';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Kawaii Brews',
  description: 'A super cute coffee tasting log and local roaster passport.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${nunito.variable}`}>
      <body suppressHydrationWarning className="font-quicksand bg-amber-50 text-stone-800 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

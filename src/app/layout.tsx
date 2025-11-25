import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { validateEnvironment } from '@/lib/env-validator';
import '@/styles/globals.css';

// Validate environment on startup
validateEnvironment();

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Beagle Notice Manager',
  description: 'Admin and public interface for beagle notice notices and webviews',
  icons: {
    icon: '/images/logoforbrowser.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <body className="font-bricolage bg-white text-beagle-dark">
        {children}
      </body>
    </html>
  );
}


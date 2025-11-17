import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '@/styles/globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Beagle Program Manager',
  description: 'Admin and public interface for Beagle program notices and webviews',
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
    <html lang="en" className={montserrat.variable}>
      <body className="font-montserrat bg-white text-beagle-dark">
        {children}
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import Script from 'next/script';
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
  const gaId = 'G-PYVYRCWWTQ';
  
  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
      </head>
      <body className="font-bricolage bg-white text-beagle-dark">
        {children}
      </body>
    </html>
  );
}


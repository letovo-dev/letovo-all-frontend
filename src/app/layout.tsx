import type { Metadata, Viewport } from 'next';
import './globals.scss';
import { FooterProvider } from '@/shared/ui/context/FooterContext';

export const metadata: Metadata = {
  title: 'Letovo',
  description: 'Letovo app',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="caleo-font">
        <FooterProvider>
          <div className="layout-container">
            <main className="content">{children}</main>
          </div>
        </FooterProvider>
      </body>
    </html>
  );
}

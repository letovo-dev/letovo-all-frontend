import type { Metadata } from 'next';
import './globals.scss';
import '@ant-design/v5-patch-for-react-19';
import { FooterProvider } from '@/shared/ui/context/FooterContext';

export const metadata: Metadata = {
  title: 'Letovo',
  description: 'Letovo app',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no"
        />
      </head>
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

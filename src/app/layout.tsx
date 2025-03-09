import type { Metadata } from 'next';
import './globals.scss';
import '@ant-design/v5-patch-for-react-19';

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
          content="width=device-width, initial-scale=1.0, maximum-scale=1.5, viewport-fit=cover, user-scalable=yes"
        />
      </head>
      <body className="caleo-font">
        <div className="layout-container">
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}

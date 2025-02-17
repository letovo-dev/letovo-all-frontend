'use client';

// import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import '@ant-design/v5-patch-for-react-19';
import Footer from '@/shared/ui/footer/Footer';
import localFont from 'next/font/local';
import { useEffect } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const caleo = localFont({
  src: '../fonts/Calleo.woff',
  display: 'swap',
});

// export const metadata: Metadata = {
//   title: 'Letovo',
//   description: 'Letovo app',
//   icons: {
//     icon: '/favicon.ico',
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVh(); // Установить значение при загрузке страницы.
    window.addEventListener('resize', updateVh); // Обновлять при изменении размера окна.

    return () => {
      window.removeEventListener('resize', updateVh);
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={` ${caleo.className}`}>
        <div className="layout-container">
          <main className="content">{children}</main>
          {/* <footer className={'footer'}>{<Footer />}</footer> */}
        </div>
      </body>
    </html>
  );
}

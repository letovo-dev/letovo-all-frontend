import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import '@ant-design/v5-patch-for-react-19';
import Footer from '@/shared/ui/footer/Footer';
import localFont from 'next/font/local';

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
      <body className={` ${caleo.className}`}>
        <main>{children}</main> <Footer />
      </body>
    </html>
  );
}

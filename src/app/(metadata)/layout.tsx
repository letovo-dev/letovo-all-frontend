import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Letovo',
  description: 'Letovo app',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function MetadataLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

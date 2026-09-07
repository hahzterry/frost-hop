import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Frost Hop — Bir kat daha!',
  description: 'Hızlan, zıpla ve buzlu kuleye tırman. Icy Tower esintili, dokunmatik ve klavye kontrollü ücretsiz arcade oyunu.',
  icons: { icon: '/favicon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit:'cover', themeColor:'#080f1c' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="tr"><body>{children}</body></html>;
}

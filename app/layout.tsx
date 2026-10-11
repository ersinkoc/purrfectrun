import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Purrfect Run — A little adventure, a lot of paws',
  description:
    'A cozy 3D cat runner. Leap through a pastel neighborhood, collect milk, and chase your personal best.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

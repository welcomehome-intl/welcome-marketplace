import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'LandVault - Real Estate Investment Platform',
  description: 'Invest in land and build your future with LandVault',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

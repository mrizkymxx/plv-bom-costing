import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PLV BOM Costing & Rate Card Cockpit',
  description: 'Furniture HPP Calculation and Rate Card Cockpit (Jepara Standard)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#0c0c0e] text-neutral-200 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

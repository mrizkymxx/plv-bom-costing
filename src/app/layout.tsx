import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PLV BOM Costing & Rate Card Cockpit',
  description: 'Furniture HPP Calculation and Rate Card Cockpit (Jepara Standard)',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-neutral-200 antialiased min-h-screen selection:bg-neutral-800 selection:text-white max-w-[100vw] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

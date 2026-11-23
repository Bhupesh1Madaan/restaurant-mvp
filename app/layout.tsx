import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Counter Order MVP',
  description: 'QR Restaurant Ordering System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
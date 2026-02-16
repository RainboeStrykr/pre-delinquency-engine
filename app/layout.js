import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pre-Delinquency Intervention Engine — Risk Dashboard',
  description:
    'Banking risk analytics dashboard for monitoring customers and predicting financial stress before delinquency.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

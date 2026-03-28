import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CGHS BillingAssist',
  description:
    'AI-Powered Medical Billing Code Optimizer for CGHS, ESI, ECHS schemes. Describe any surgery, procedure, or diagnostic test in plain language and get accurate CGHS billing codes with revenue optimization.',
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

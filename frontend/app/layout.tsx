import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ExperienceShell } from '@/components/ui/experience-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PAIR — AI-Powered GeM Bid Compliance',
  description:
    'Verify GeM tender requirements, bidder evidence, compliance risk and procurement recommendations with AI.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ExperienceShell>{children}</ExperienceShell>
        </Providers>
      </body>
    </html>
  );
}
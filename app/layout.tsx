import type { Metadata } from 'next';
import '../styles/globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import SessionProvider from './SessionProvider';
import AIAssistant from '@/components/AIAssistant';

export const metadata: Metadata = {
  title: 'CuraLink - Clinical Research Platform',
  description: 'Connecting patients with clinical trials and researchers',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      {/* suppressHydrationWarning prevents mismatch warnings caused by browser
          extensions (e.g. Grammarly) injecting attributes into <body> on the
          client that the server-rendered HTML doesn't have. */}
      <body suppressHydrationWarning>
        <SessionProvider session={session}>
          {children}
          <AIAssistant />
        </SessionProvider>
      </body>
    </html>
  );
}

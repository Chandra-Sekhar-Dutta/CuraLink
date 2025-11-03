import '../styles/globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import SessionProvider from './SessionProvider';
import AIAssistant from '@/components/AIAssistant';

// Force dynamic rendering for the entire app due to auth session
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Failed to get session, continuing without auth:', error);
    // Continue without session - app will work in guest mode
  }
  
  return (
    <html lang="en">
      <head>
        <title>CuraLink - Clinical Research Platform</title>
        <meta name="description" content="Connecting patients with clinical trials and researchers" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
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

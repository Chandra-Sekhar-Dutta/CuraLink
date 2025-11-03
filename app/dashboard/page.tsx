import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export default async function DashboardIndex() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userType = (session.user as any).userType;

  if (userType === 'patient') {
    redirect('/dashboard/patient');
  }
  if (userType === 'researcher') {
    redirect('/dashboard/researcher');
  }

  // If userType isn't set yet (e.g., first-time Google sign-in)
  redirect('/auth/select-role');
}

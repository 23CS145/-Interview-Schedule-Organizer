'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
    } else if (!allowedRoles.includes(session.user.role)) {
      router.push('/dashboard');
    }
  }, [session, status, allowedRoles, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="unauthorized-container">
        <p>You don&apos;t have permission to access this page.</p>
      </div>
    );
  }

  return children;
}
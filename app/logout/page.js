'use client';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      // Clear client-side cache
      window.localStorage.removeItem('nextauth.message');
      // Perform sign out
      await signOut({ callbackUrl: '/login', redirect: false });
      // Redirect to login
      router.push('/login');
    };
    
    performLogout();
  }, [router]);

  return (
    <div className="logout-container">
      <p>Logging out...</p>
    </div>
  );
}
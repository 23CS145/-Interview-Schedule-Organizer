'use client';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      window.localStorage.removeItem('nextauth.message');
      await signOut({ callbackUrl: '/login', redirect: false });
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
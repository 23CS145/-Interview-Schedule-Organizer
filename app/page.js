// app/page.js
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/home.css';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  return (
    <div className="loading-container">
      <p>Loading...</p>
    </div>
  );
}
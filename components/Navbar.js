// components/Navbar.js
'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/navbar.css';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear client-side cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nextauth.message');
      sessionStorage.clear();
    }
    
    // Sign out and redirect
    await signOut({ 
      redirect: false,
      callbackUrl: '/login?logout=true' 
    });
    
    // Force hard refresh to clear all session data
    window.location.href = '/login?logout=true';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link href="/">Interview Scheduler</Link>
        </div>
        <div className="navbar-links">
          {session && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/schedule">Schedule</Link>
              <Link href="/interviews">Interviews</Link>
              <Link href="/profile">Profile</Link>
              {session?.user?.role === 'admin' && <Link href="/panel">Admin Panel</Link>}
            </>
          )}
        </div>
        <div className="navbar-auth">
          {session ? (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          ) : (
            <Link href="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
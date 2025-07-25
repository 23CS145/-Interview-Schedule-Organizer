'use client';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import RoleSelect from '@/components/RoleSelect';
import '@/styles/login.css';

export default function LoginPage() {
   const { data: session, status } = useSession();
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const logout = searchParams.get('logout');

  useEffect(() => {
     if (logout === 'true' && status === 'unauthenticated') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nextauth.message');
        sessionStorage.clear();
      }
    }

    if (status === 'authenticated' && session?.user?.email) {
      checkUserRole();
    }
  }, [status, session,logout]);

  const handleGitHubLogin = () => {
    // Force GitHub to show account selector every time
    signIn('github', { 
      prompt: 'select_account',
      callbackUrl: '/login'
    });
  };

  const checkUserRole = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users?email=${session.user.email}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const users = await response.json();
      const user = users.find(u => u.email === session.user.email);
      
      if (user?.role) {
        router.push('/dashboard');
      } else {
        setShowRoleSelect(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          role
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save role');
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      {error && <div className="error-message">{error}</div>}
      
      {!session ? (
        <>
          <h1>Interview Scheduler</h1>
          <button 
            onClick={handleGitHubLogin}  // Use the new handler
            className="github-login-button"
            disabled={loading}
          >
            Sign in with GitHub
          </button>

          {/* <button 
            onClick={() => signIn('github')}
            className="github-login-button"
            disabled={loading}
          >
            Sign in with GitHub
          </button> */}
        </>
      ) : showRoleSelect ? (
        <RoleSelect onSelect={handleRoleSelect} loading={loading} />
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}
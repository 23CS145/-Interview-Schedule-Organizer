'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import InterviewForm from '@/components/InterviewForm';
import { useRouter } from 'next/navigation';
import '@/styles/schedule.css';

export default function SchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    if (session && !['admin', 'interviewer'].includes(session.user.role)) {
      setError('Only admins and interviewers can schedule interviews');
    }
  }, [session]);

   useEffect(() => {
    if (status === 'unauthenticated') {
      setMessage('Please login to schedule an interview');
      const timer = setTimeout(() => router.push('/login'), 2000);
      return () => clearTimeout(timer);
    }
    
    if (status === 'authenticated') {
      if (!['admin', 'interviewer'].includes(session.user.role)) {
        setMessage('Only admins and interviewers can schedule interviews');
      }
    }
  }, [status, session, router]);

  if (status !== 'authenticated' || !['admin', 'interviewer'].includes(session?.user?.role)) {
    return (
      <div className="schedule-container">
        <h1>Schedule Interview</h1>
        <div className="auth-message">{message}</div>
      </div>
    );
  }

  const handleSubmit = async (interviewData) => {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...interviewData,
          interviewerId: session.user.id,
          createdBy: session.user.id
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create interview');
      router.push('/interviews');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!session) return <div>Loading...</div>;

  return (
    <div className="schedule-container">
      <h1>Schedule New Interview</h1>
      
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <InterviewForm 
          onSubmit={handleSubmit} 
          interviewerId={session.user.id} 
        />
      )}
    </div>
  );
}
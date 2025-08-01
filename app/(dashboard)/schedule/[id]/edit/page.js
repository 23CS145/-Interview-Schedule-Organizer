'use client';
import { useEffect, useState } from 'react';
import InterviewForm from '@/components/InterviewForm';
import { useParams, useRouter } from 'next/navigation';
import '@/styles/schedule.css';

export default function EditInterviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`/api/interviews/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch interview');
        }
        const data = await res.json();
        setInterview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const handleSubmit = async (updatedData) => {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        alert('Interview updated successfully!');
        router.push('/interviews');
      } else {
        throw new Error('Failed to update interview');
      }
    } catch (error) {
      console.error('Error updating interview:', error);
      alert('Only Admin and Interviewer can update the interview');
      router.push('/interviews');
    }
  };

  if (loading) {
    return <div className="loading">Loading interview details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="schedule-container">
      <h1 className="schedule-title">Edit Interview</h1>
      {interview && (
        <InterviewForm 
          interview={interview} 
          isEdit={true} 
          onSubmit={handleSubmit} 
        />
      )}
    </div>
  );
}
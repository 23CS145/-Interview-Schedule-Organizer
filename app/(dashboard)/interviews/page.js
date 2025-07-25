// app/(dashboard)/interviews/page.js
'use client';
import { useState, useEffect } from 'react';
import InterviewList from '@/components/InterviewList';
import '@/styles/interviews.css';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/interviews');
        if (!response.ok) {
          throw new Error('Failed to fetch interviews');
        }
        const data = await response.json();
        setInterviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    return <div className="loading">Loading interviews...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="interviews-container">
      <div className="interviews-header">
        <h1>Interview Schedule</h1>
        <a href="/schedule" className="new-interview-button">
          Schedule New Interview
        </a>
      </div>
      <InterviewList interviews={interviews} />
    </div>
  );
}
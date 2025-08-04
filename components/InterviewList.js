'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/styles/interview-list.css';

export default function InterviewList({ interviews }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

const handleDelete = async (interviewId) => {
  if (!window.confirm('Are you sure you want to delete this interview?')) {
    return;
  }

  try {
    const response = await fetch(`/api/interviews/${interviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete interview');
    }
    window.location.reload();
  } catch (err) {
    console.error('Delete error:', err);
    alert(err.message);
  }
};

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const isoString = `${dateStr.split('T')[0]}T${timeStr}:00`;
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateStr, timeStr);
        return 'Date not set';
      }

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const canEditDelete = (interview) => {
    if (!session) return false;
    return (
      session.user.role === 'admin' ||
      interview.createdBy === session.user.email ||
      interview.interviewerEmail === session.user.email
    );
  };

  return (
    <div className="interview-list-container">
      {error && <div className="error-message">{error}</div>}
      
      {interviews.length === 0 ? (
        <p className="no-interviews">No interviews scheduled yet.</p>
      ) : (
        <table className="interview-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date & Time</th>
              <th>Interviewer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview._id}>
                <td>{interview.title}</td>
                <td>{formatDateTime(interview.date, interview.time)}</td>
                <td>
                  {interview.interviewer?.name || interview.interviewerEmail}
                </td>
                <td>
                  <div className="action-buttons">
                    {(session?.user?.role === 'candidate' || 
                      interview.interviewerEmail === session?.user?.email) && (
                      <a
                        href={interview.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-button"
                      >
                        Join Meeting
                      </a>
                    )}
                    
                    {canEditDelete(interview) && (
                      <>
                        <Link
                          href={`/schedule/${interview._id}/edit`}
                          className="edit-button"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(interview._id)}
                          className="delete-button"
                          disabled={loadingId === interview._id}
                        >
                          {loadingId === interview._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
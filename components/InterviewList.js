'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import '@/styles/interview-list.css';

export default function InterviewList({ interviews: initialInterviews }) {
  const { data: session } = useSession();
  const [interviews, setInterviews] = useState(initialInterviews);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;

    setLoadingId(interviewId);
    setError(null);

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }

      setInterviews((prev) => prev.filter((i) => i._id !== interviewId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const isAuthorized = (interview) => {
    if (!session) return false;
    const isAdmin = session.user.role === 'admin';
    const isInterviewer = session.user.role === 'interviewer';
    const isCreator = interview.createdBy?.toString() === session.user.id;
    const isAssignedInterviewer = interview.interviewerId?.toString() === session.user.id;

    return isAdmin || (isInterviewer && (isCreator || isAssignedInterviewer));
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
              <th>Meeting Link</th>
              {interviews.some((interview) => isAuthorized(interview)) && (
                <th>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => {
              const canEditDelete = isAuthorized(interview);

              return (
                <tr key={interview._id}>
                  <td>{interview.title}</td>
                  <td>{formatDate(`${interview.date}T${interview.time}`)}</td>
                  <td>
                    <a href={interview.link} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </td>
                  <td>
                    {canEditDelete && (
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}


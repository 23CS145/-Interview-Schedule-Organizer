'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import '@/styles/interview-list.css';

export default function InterviewList({ interviews }) {
  const { data: session } = useSession();

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
                    {(session.user.role === 'candidate' || 
                      interview.interviewerEmail === session.user.email) && (
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
                        >
                          Delete
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
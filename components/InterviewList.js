// components/InterviewList.js
'use client';
import Link from 'next/link';
import '@/styles/interview-list.css';

export default function InterviewList({ interviews }) {
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
              <th>Meeting Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview._id}>
                <td>{interview.title}</td>
                <td>{formatDate(`${interview.date}T${interview.time}`)}</td>
                <td>
                  <a href={interview.link} target="_blank" rel="noopener noreferrer">
                    Join Meeting
                  </a>
                </td>
                <td>
                  <Link 
                    href={`/schedule/${interview._id}/edit`} 
                    className="edit-button"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
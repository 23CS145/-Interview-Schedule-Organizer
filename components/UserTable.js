'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/user-table.css';

export default function UserTable({ users, onRoleChange }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoadingId] = useState(null);//
  const [error, setError] = useState(null);

  const handleRoleUpdate = async (userId, newRole) => {
    setLoadingId(userId);
    setError(null);
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      const updatedUser = await response.json();
      onRoleChange(userId, newRole);
      
      if (session.user.id === userId) {
        router.push('/logout');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (!session || session.user.role !== 'admin') {
    return (
      <div className="unauthorized-message">
        You don't have permission to view this page
      </div>
    );
  }

  return (
    <div className="user-table-container">
      {error && <div className="error-message">{error}</div>}
      
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select 
                  value={user.role} 
                  onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                  disabled={loading}
                >
                  <option value="admin">Admin</option>
                  <option value="interviewer">Interviewer</option>
                  <option value="candidate">Candidate</option>
                </select>
              </td>
              <td>
                <button 
                  onClick={() => handleRoleUpdate(user._id, 'admin')}
                  className="role-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Make Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
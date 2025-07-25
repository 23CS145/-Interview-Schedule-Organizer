'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import '@/styles/profile-card.css';

export default function ProfileCard({ user }) {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name,
          email: formData.email
        }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedUser = await response.json();
      
      if (session.user.email === updatedUser.email) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.name
          }
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card">
      {user.image && (
        <img 
          src={user.image} 
          alt="Profile" 
          className="profile-image"
        />
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <p className="profile-role">Role: {user.role}</p>
          <button 
            onClick={() => setIsEditing(true)} 
            className="edit-button"
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
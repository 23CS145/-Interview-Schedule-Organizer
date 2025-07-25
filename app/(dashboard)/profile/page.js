// app/(dashboard)/profile/page.js
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ProfileCard from '@/components/ProfileCard';
import '@/styles/profile.css';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setUser(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      <ProfileCard user={user} />
    </div>
  );
}
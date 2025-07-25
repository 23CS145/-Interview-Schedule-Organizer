// app/(admin)/panel/page.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import UserTable from '@/components/UserTable';
import '@/styles/admin.css';

export default function AdminPanel() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, router]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      throw error; // Let UserTable handle the error
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel</h1>
      <p className="admin-subtitle">Manage all users and their roles</p>
      <UserTable users={users} onRoleChange={handleRoleChange} />
    </div>
  );
}
// app/(dashboard)/dashboard/page.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import '@/styles/dashboard.css';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  const getRoleDescription = () => {
    switch(role) {
      case 'admin':
        return 'You have full access to manage users and interviews.';
      case 'interviewer':
        return 'You can view and manage your assigned interviews.';
      case 'candidate':
        return 'You can view your upcoming interviews.';
      default:
        return '';
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {session?.user?.name}</h1>
      
      <div className="dashboard-card">
        <h2 className="dashboard-subtitle">Your Dashboard</h2>
        <p className="user-role">Role: <span className="role-badge">{role}</span></p>
        <p className="role-description">{getRoleDescription()}</p>
        
        <div className="dashboard-actions">
          {role === 'admin' && (
            <a href="/panel" className="action-button">
              Go to Admin Panel
            </a>
          )}
          <a href="/schedule" className="action-button secondary">
            Schedule Interview
          </a>
          <a href="/interviews" className="action-button secondary">
            View Interviews
          </a>
        </div>
      </div>
    </div>
  );
}
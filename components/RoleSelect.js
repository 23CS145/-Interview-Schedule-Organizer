// components/RoleSelect.js
'use client';
import { useState } from 'react';
import '@/styles/role-select.css';

export default function RoleSelect({ onSelect, loading }) {
  const [role, setRole] = useState('candidate');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect(role);
  };

  return (
    <div className="role-select-container">
      <h2>Complete Your Registration</h2>
      <p>Please select your role to continue</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="candidate">Candidate</option>
            <option value="interviewer">Interviewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
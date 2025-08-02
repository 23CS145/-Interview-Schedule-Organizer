'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@/styles/interview-form.css';

export default function InterviewForm({ interview, isEdit, onSubmit }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    link: '',
    candidateEmail: '',
    interviewerEmail: session?.user?.email || ''
  });
  const [suggestions, setSuggestions] = useState({
    candidate: [],
    interviewer: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (interview) {
      setFormData({
        title: interview.title,
        date: interview.date.split('T')[0],
        time: interview.time,
        link: interview.link,
        candidateEmail: interview.candidateEmail,
        interviewerEmail: interview.interviewerEmail
      });
    }
  }, [interview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'candidateEmail' || name === 'interviewerEmail') {
      fetchSuggestions(name.replace('Email', ''), value);
    }
  };

  const fetchSuggestions = async (type, query) => {
    if (query.length < 2) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const res = await fetch(`/api/users?search=${query}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      });

      if (!res.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await res.json();
      
      const users = Array.isArray(data) ? data : [];
      
      setSuggestions(prev => ({
        ...prev,
        [type]: users.filter(user => 
          type === 'candidate' ? user.role === 'candidate' : user.role === 'interviewer'
        )
      }));
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions(prev => ({ ...prev, [type]: [] }));
    }
  };

  const selectSuggestion = (type, email) => {
    setFormData(prev => ({ ...prev, [`${type}Email`]: email }));
    setSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        interviewerEmail: session.user.role === 'interviewer' 
          ? session.user.email 
          : formData.interviewerEmail
      });
      router.push('/interviews');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="interview-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Interview Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Date *</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div className="form-group">
        <label>Time *</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Meeting Link *</label>
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://meet.google.com/abc-xyz"
          required
        />
      </div>

      <div className="form-group">
        <label>Candidate Email *</label>
        <input
          type="email"
          name="candidateEmail"
          value={formData.candidateEmail}
          onChange={handleChange}
          required
        />
        {suggestions.candidate.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.candidate.map(user => (
              <li 
                key={user.email}
                onClick={() => selectSuggestion('candidate', user.email)}
              >
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label>Interviewer Email *</label>
        <input
          type="email"
          name="interviewerEmail"
          value={formData.interviewerEmail}
          onChange={handleChange}
          required
          disabled={session?.user?.role === 'interviewer'}
        />
        {session?.user?.role !== 'interviewer' && suggestions.interviewer.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.interviewer.map(user => (
              <li 
                key={user.email}
                onClick={() => selectSuggestion('interviewer', user.email)}
              >
                {user.name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        type="submit" 
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Saving...' : (isEdit ? 'Update Interview' : 'Schedule Interview')}
      </button>
    </form>
  );
}
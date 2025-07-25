// components/InterviewForm.js
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '@/styles/interview-form.css';

export default function InterviewForm({ interview, isEdit, onSubmit, interviewerId }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    link: '',
    candidateId: '',
    interviewerId: interviewerId || ''
  });

  useEffect(() => {
    if (interview) {
      setFormData({
        title: interview.title,
        date: interview.date,
        time: interview.time,
        link: interview.link,
        candidateId: interview.candidateId,
        interviewerId: interview.interviewerId
      });
    }
  }, [interview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="interview-form">
      <div className="form-group">
        <label>Interview Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Time</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Meeting Link</label>
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleChange}
          required
          placeholder="https://meet.google.com/abc-xyz"
        />
      </div>

      <div className="form-group">
        <label>Candidate ID</label>
        <input
          type="text"
          name="candidateId"
          value={formData.candidateId}
          onChange={handleChange}
          required
        />
      </div>

      {!interviewerId && (
        <div className="form-group">
          <label>Interviewer ID</label>
          <input
            type="text"
            name="interviewerId"
            value={formData.interviewerId}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <button type="submit">
        {isEdit ? 'Update Interview' : 'Schedule Interview'}
      </button>
    </form>
  );
}
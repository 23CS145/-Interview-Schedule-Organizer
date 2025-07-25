// app/api/interviews/[id]/route.js
import  connectDB  from '@/lib/mongodb';
import Interview from '@/models/Interview';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const interview = await Interview.findById(params.id)
      .populate('interviewerId', 'name email')
      .populate('candidateId', 'name email');
    
    if (!interview) {
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify(interview), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch interview' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    await connectDB();
    const body = await req.json();
    
    // Check if user is allowed to update this interview
    const existingInterview = await Interview.findById(params.id);
    if (!existingInterview) {
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Only admin or creator can update
    if (session.user.role !== 'admin' && existingInterview.createdBy.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const updatedInterview = await Interview.findByIdAndUpdate(params.id, body, { new: true });
    
    return new Response(JSON.stringify(updatedInterview), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update interview' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    await connectDB();
    
    // Check if user is allowed to delete this interview
    const existingInterview = await Interview.findById(params.id);
    if (!existingInterview) {
      return new Response(JSON.stringify({ error: 'Interview not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Only admin or creator can delete
    if (session.user.role !== 'admin' && existingInterview.createdBy.toString() !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    await Interview.findByIdAndDelete(params.id);
    
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete interview' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
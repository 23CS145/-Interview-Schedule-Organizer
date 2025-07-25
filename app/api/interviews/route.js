import  connectDB  from '@/lib/mongodb';
import Interview from '@/models/Interview';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  try {
    await connectDB();
    const interviews = await Interview.find()
      .populate('interviewerId', 'name email')
      .populate('candidateId', 'name email');
    
    return new Response(JSON.stringify(interviews), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch interviews' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST(req) {
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
    const interviewData = {
      ...body,
      createdBy: session.user.id,
    };
    
    const interview = await Interview.create(interviewData);
    
    return new Response(JSON.stringify(interview), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create interview' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
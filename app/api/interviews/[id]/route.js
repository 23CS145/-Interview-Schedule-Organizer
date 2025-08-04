import connectDB from '@/lib/mongodb';
import Interview from '@/models/Interview';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { isValidObjectId } from 'mongoose';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(params.id)) {
      return Response.json({ error: 'Invalid interview ID' }, { status: 400 });
    }

    await connectDB();
    
    const interview = await Interview.findById(params.id);
    
    if (!interview) {
      return Response.json({ error: 'Interview not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isParticipant = 
      interview.interviewerEmail === session.user.email || 
      interview.candidateEmail === session.user.email;
      
    if (!isAdmin && !isParticipant) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return Response.json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(params.id)) {
      return Response.json({ error: 'Invalid interview ID' }, { status: 400 });
    }

    await connectDB();
    
    const body = await req.json();
    const existingInterview = await Interview.findById(params.id);
    
    if (!existingInterview) {
      return Response.json({ error: 'Interview not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'admin';
    const isCreator = existingInterview.createdBy === session.user.email;
    const isInterviewer = existingInterview.interviewerEmail === session.user.email;

    if (!isAdmin && !isCreator && !isInterviewer) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    return Response.json(updatedInterview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
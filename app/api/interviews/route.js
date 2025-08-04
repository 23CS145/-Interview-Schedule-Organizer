import connectDB from '@/lib/mongodb';
import Interview from '@/models/Interview';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    let query = {};
    if (userEmail) {
      query = {
        $or: [
          { interviewerEmail: userEmail },
          { candidateEmail: userEmail }
        ]
      };
    }

    const interviews = await Interview.find(query)
      .sort({ date: 1, time: 1 })
      .lean();

    // Get user details for display purposes
    const populatedInterviews = await Promise.all(
      interviews.map(async (interview) => {
        const [interviewer, candidate] = await Promise.all([
          User.findOne({ email: interview.interviewerEmail }),
          User.findOne({ email: interview.candidateEmail })
        ]);

        return {
          ...interview,
          interviewer: {
            name: interviewer?.name,
            email: interviewer?.email,
            image: interviewer?.image
          },
          candidate: {
            name: candidate?.name,
            email: candidate?.email,
            image: candidate?.image
          }
        };
      })
    );

    return Response.json(populatedInterviews);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { title, date, time, link, interviewerEmail, candidateEmail } = await req.json();

    const [interviewer, candidate] = await Promise.all([
      User.findOne({ email: interviewerEmail }),
      User.findOne({ email: candidateEmail })
    ]);

    if (!interviewer || !candidate) {
      return Response.json({ error: 'Participant not found' }, { status: 404 });
    }

    const interview = await Interview.create({
      title,
      date: new Date(date),
      time,
      link,
      interviewerEmail,
      candidateEmail,
      createdBy: session.user.email
    });

    return Response.json(interview, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create interview' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;
    const existingInterview = await Interview.findById(id);
    if (!existingInterview) {
      return Response.json({ error: 'Interview not found' }, { status: 404 });
    }
    const isAdmin = session.user.role === 'admin';
    const isCreator = existingInterview.createdBy === session.user.email;
    const isInterviewer = existingInterview.interviewerEmail === session.user.email;

    if (!isAdmin && !isCreator && !isInterviewer) {
      return Response.json(
        { error: 'You are not authorized to delete this interview' },
        { status: 403 }
      );
    }
    await Interview.findByIdAndDelete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting interview:', error);
    return Response.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    );
  }
}
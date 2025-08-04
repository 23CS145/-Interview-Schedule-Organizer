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
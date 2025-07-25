// app/api/users/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  try {
    await connectDB();
    
    if (email) {
      // Allow any authenticated user to lookup their own data
      if (session?.user?.email !== email && session?.user?.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const user = await User.findOne({ email }).select('-__v');
      return Response.json(user ? [user] : []);
    }

    // Admin-only full user list
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find().select('-__v');
    return Response.json(users);
  } catch (error) {
    console.error('Error in users GET:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { email, name, image, role } = await req.json();
    
    if (!email || !role) {
      return Response.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email },
      { name, image, role },
      { upsert: true, new: true }
    );

    return Response.json(user);
  } catch (error) {
    console.error('Error in users POST:', error);
    return Response.json({ error: 'Failed to save user' }, { status: 500 });
  }
}

// export async function PATCH(req) {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user.role !== 'admin') {
//     return Response.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     await connectDB();
//     const { userId, role } = await req.json();
    
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { role },
//       { new: true }
//     );

//     if (!user) {
//       return Response.json({ error: 'User not found' }, { status: 404 });
//     }

//     return Response.json(user);
//   } catch (error) {
//     console.error('Error in users PATCH:', error);
//     return Response.json({ error: 'Failed to update user' }, { status: 500 });
//   }
// }

// app/api/users/route.js
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { userId, role, name, email } = await req.json();
    
    // Admins can update any user's role
    if (session.user.role === 'admin') {
      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-__v');

      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      return Response.json(user);
    }
    // Regular users can only update their own name
    else if (session.user.id === userId) {
      const updateData = { name };
      
      if (email && email !== session.user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return Response.json(
            { error: 'Email already in use' },
            { status: 400 }
          );
        }
        updateData.email = email;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-__v');

      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }

      return Response.json(user);
    } else {
      return Response.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
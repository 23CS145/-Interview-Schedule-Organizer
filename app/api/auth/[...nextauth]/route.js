import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          prompt: 'select_account' 
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
  async signIn({ user }) {
    await connectDB();
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      existingUser = await User.create({
        name: user.name,
        email: user.email,
        image: user.image,
        role: null,
      });
    }
    return true;
  },
  async session({ session }) {
    await connectDB();
    const dbUser = await User.findOne({ email: session.user.email });

    if (dbUser) {
      session.user.id = dbUser._id.toString();
      session.user.name = dbUser.name; // <-- added
      session.user.role = dbUser.role;
      session.user.email = dbUser.email; // <-- added (in case it's changed)
      session.user.image = dbUser.image; // <-- added (in case admin updates image)
    }

    return session;
  },
  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    else if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  }
}

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
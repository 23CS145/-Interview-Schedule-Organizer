// import NextAuth from 'next-auth';
// import GitHubProvider from 'next-auth/providers/github';
// import  connectDB  from '@/lib/mongodb';
// import User from '@/models/User';

// export const authOptions = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async signIn({ user }) {
//       await connectDB();
//       let existingUser = await User.findOne({ email: user.email });

//       if (!existingUser) {
//         await User.create({
//           name: user.name,
//           email: user.email,
//           image: user.image,
//           role: null, // role will be assigned after login
//         });
//       }
//       return true;
//     },
//     async redirect({ url, baseUrl }) {
//     // Allows relative callback URLs
//     if (url.startsWith("/")) return `${baseUrl}${url}`
//     // Allows callback URLs on the same origin
//     else if (new URL(url).origin === baseUrl) return url
//     return baseUrl
//   },
//     async session({ session }) {
//       await connectDB();
//       const dbUser = await User.findOne({ email: session.user.email });
//       session.user.id = dbUser._id;
//       session.user.role = dbUser.role;
//       return session;
//     },
//      async session({ session, user, token }) {
//     if (session?.user) {
//       const dbUser = await User.findOne({ email: session.user.email });
//       if (dbUser) {
//         session.user.id = dbUser._id.toString();
//         session.user.role = dbUser.role;
//       }
//     }
//     return session;
//   }
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

// app/api/auth/[...nextauth]/route.js
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
          prompt: 'select_account' // Force account selection every time
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
        session.user.role = dbUser.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
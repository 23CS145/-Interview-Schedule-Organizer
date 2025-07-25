// app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import SessionProviderWrapper from '../components/SessionProviderWrapper';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Interview Scheduler',
  description: 'Organize interviews with role-based access',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();
   if (typeof window !== 'undefined') {
    window.onload = () => {
      if (window.location.pathname === '/login') {
        sessionStorage.clear();
      }
    };
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper session={session}>
          <Navbar />
          <main className="main-content">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
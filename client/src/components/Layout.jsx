import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </main>
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} MailAuth System. Built with MERN, JWT, bcrypt & Nodemailer.</p>
      </footer>
    </div>
  );
}

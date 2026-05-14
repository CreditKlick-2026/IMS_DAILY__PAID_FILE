"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the server-side logout API to clear the secure cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed", error);
    }
    
    // Redirect back to login page
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground dark">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to IMS DPF Dashboard</h1>
        <p className="text-muted-foreground">You have successfully logged in.</p>
        
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 py-2 mt-4 shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

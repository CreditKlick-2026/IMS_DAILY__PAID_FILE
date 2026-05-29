"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [authData, setAuthData] = useState({ employee_id: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [userType, setUserType] = useState("hr");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: authData.employee_id,
          password: authData.password,
          role: userType
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Welcome, ${data.user.name || data.user.employee_id}!`);
        router.push('/dashboard');
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      alert('Error connecting to the server.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background overflow-x-hidden">
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 lg:bg-background">

        {/* Left Form Side */}
        <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 py-12 px-4 sm:px-6 lg:px-8">

          {/* Mobile Card Wrapper / Desktop Clean Wrapper */}
          <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-[350px] bg-background lg:bg-transparent rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border border-border lg:border-transparent p-6 sm:p-10 lg:p-0 grid gap-8 transition-all">

            <div className="grid gap-2 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Login</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Enter your credentials below to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="grid gap-6">

              {/* Custom Shadcn-like Tabs for Role */}
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-foreground">Account Type</label>
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setUserType('hr')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${userType === 'hr' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'
                      } w-1/2`}
                  >
                    HR
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('admin')}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${userType === 'admin' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'
                      } w-1/2`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Emp ID Input */}
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-foreground">Emp ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your Emp ID"
                  value={authData.employee_id}
                  onChange={e => setAuthData({ ...authData, employee_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Password Input */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between w-full">
                  <label className="text-sm font-medium leading-none text-foreground">Password</label>
                  <a href="#" className="inline-block text-sm underline text-muted-foreground hover:text-primary">
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={authData.password}
                    onChange={e => setAuthData({ ...authData, password: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
              >
                Sign In
              </button>

            </form>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="hidden bg-muted lg:block relative border-l border-border/40">
          <img
            src="/shadcn_clean_bg.png"
            alt="Dashboard"
            className="h-full w-full object-cover dark:brightness-[0.7]"
          />
          {/* Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-5xl font-bold text-white tracking-tight drop-shadow-2xl select-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-6 h-16 w-16 text-blue-500"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            IMS DPF
          </div>
        </div>

      </div>
    </div>
  );
}

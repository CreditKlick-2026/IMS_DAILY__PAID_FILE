"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [authData, setAuthData] = useState({ employee_id: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [userType, setUserType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/public/locations')
      .then(r => r.json())
      .then(d => { if (d.success) setLocations(d.data); });
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (userType === 'user' && !selectedLocation) {
      setError('Please select your location.');
      return;
    }

    setIsLoading(true);
    try {
      const body: any = {
        employee_id: authData.employee_id,
        password: authData.password,
        role: userType,
      };
      if (userType === 'user') body.location_id = Number(selectedLocation);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background overflow-x-hidden">
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 lg:bg-background">

        {/* Left Form Side */}
        <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 py-12 px-4 sm:px-6 lg:px-8">

          <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-[350px] bg-background lg:bg-transparent rounded-2xl lg:rounded-none shadow-2xl lg:shadow-none border border-border lg:border-transparent p-6 sm:p-10 lg:p-0 grid gap-8 transition-all">

            <div className="grid gap-2 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Login</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Enter your credentials below to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="grid gap-6">

              {/* Account Type Tabs */}
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none text-foreground">Account Type</label>
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
                  <button
                    type="button"
                    onClick={() => { setUserType('user'); setError(''); }}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${userType === 'user' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'} w-1/2`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserType('admin'); setError(''); setSelectedLocation(''); }}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${userType === 'admin' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground'} w-1/2`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Location Dropdown — only for User */}
              {userType === 'user' && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none text-foreground">Location</label>
                  <div className="relative">
                    <select
                      required
                      value={selectedLocation}
                      onChange={e => { setSelectedLocation(e.target.value); setError(''); }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8"
                    >
                      <option value="">-- Select Location --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    {/* Dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Emp ID */}
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

              {/* Password */}
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
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
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

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
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

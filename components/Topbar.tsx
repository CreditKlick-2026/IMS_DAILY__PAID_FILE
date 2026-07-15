"use client";
import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

interface TopbarProps {
  user: any;
  activePage: string;
  logout: () => void;
  toggleMobileMenu?: () => void;
  toggleSidebar?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ user, activePage, logout, toggleMobileMenu, toggleSidebar }) => {
  const [time, setTime] = useState('--:--:--');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`/api/notifications?requesterId=${user?.id || ''}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) { }
  };

  useEffect(() => {
    // Check local storage for theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const intervalTime = setInterval(updateTime, 1000);

    fetchNotifs();
    const intervalNotif = setInterval(fetchNotifs, 30000);

    return () => {
      clearInterval(intervalTime);
      clearInterval(intervalNotif);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const clearNotifs = async () => {
    try {
      await fetch(`/api/notifications?requesterId=${user?.id || ''}`, { method: 'DELETE' });
      setNotifications([]);
      setShowNotifs(false);
    } catch (e) { }
  };

  return (
    <div className="sticky top-0 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-md border-b border-border/60 flex-shrink-0 w-full z-50">
      <div className="flex items-center gap-4 text-sm font-bold text-foreground">
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer hidden lg:flex items-center justify-center"
            title="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        {toggleMobileMenu && (
          <button
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors cursor-pointer flex lg:hidden items-center justify-center"
            onClick={toggleMobileMenu}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        
        {/* Premium Logo Layout */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-extrabold text-[15px] tracking-tight text-foreground">IMS DPF System</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer relative"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute top-[130%] right-0 w-[450px] bg-card border border-border/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-3 border-b border-border/60 flex justify-between items-center bg-secondary/30 backdrop-blur">
                <span className="text-sm font-bold text-foreground">Notifications</span>
                <button onClick={clearNotifs} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium">Clear All</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-border/40">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="text-muted-foreground text-xs font-medium">You're all caught up!</span>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="px-5 py-3.5 flex gap-3 hover:bg-secondary/40 transition-colors cursor-pointer">
                      <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="font-semibold text-sm text-foreground">{n.title}</span>
                        <span className="text-muted-foreground text-xs leading-relaxed">{n.message}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground font-mono bg-secondary/80 px-1.5 py-0.5 rounded">A/C: {n.account}</span>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Premium Clock Widget */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/60 font-mono text-[12px] font-semibold text-foreground shadow-sm">
          <FiClock size={13} className="text-blue-500" />
          {time}
        </div>

        {/* Premium Profile Avatar */}
        <div className="relative ml-2">
          <div
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center justify-center cursor-pointer w-10 h-10 rounded-full border-2 transition-all shadow-sm ${showProfile ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-background ring-1 ring-border hover:ring-border/80 hover:shadow-md'
              }`}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
              {user?.initials || user?.name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() || '--'}
            </div>
          </div>

          {showProfile && (
            <div className="absolute top-[calc(100%+16px)] right-0 w-[200px] bg-card border border-border/80 rounded-xl shadow-2xl z-50 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Pointer Arrow */}
              <div className="absolute -top-1.5 right-[20px] w-3 h-3 bg-card border-l border-t border-border/80 rotate-45 z-10" />

              <div className="relative z-20 rounded-xl overflow-hidden bg-card flex flex-col p-1.5">
                {/* User Info Header */}
                <div className="flex flex-col px-3 py-3 mb-1 border-b border-border/40 gap-1.5">
                  <span className="text-sm font-bold text-foreground truncate">
                    {user?.name || 'System Admin'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || user?.username || 'No Email'}
                  </span>
                  <div>
                    <span className="inline-flex bg-blue-500/10 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20 font-bold uppercase tracking-wider">
                      {user?.role || 'Admin'}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm font-semibold rounded-lg cursor-pointer transition-all"
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      logout();
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;

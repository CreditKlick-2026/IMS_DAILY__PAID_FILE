"use client";
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export function NotificationDropdown({ userId }: { userId?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`/api/notifications?requesterId=${userId || ''}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const clearNotifs = async () => {
    try {
      await fetch(`/api/notifications?requesterId=${userId || ''}`, { method: 'DELETE' });
      setNotifications([]);
      setIsOpen(false);
    } catch (e) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer relative rounded-full shadow-2xs"
        title="Notifications"
      >
        <Bell size={15} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-300 shadow-2xl z-50 rounded-none animate-in fade-in duration-150">
            <div className="px-4 py-2.5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
              <button onClick={clearNotifs} className="text-[10px] text-teal-800 hover:underline font-semibold cursor-pointer">
                Clear All
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <p className="font-semibold text-slate-700">No new alerts</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All collection records synced.</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="p-3 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

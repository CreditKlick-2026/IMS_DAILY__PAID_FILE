"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { LineChart, Shield, Calendar, User, Activity } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/audit')
        .then(r => r.json())
        .then(d => {
          if (d.success) setLogs(d.logs);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <Activity className="w-8 h-8 text-primary mb-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  const formatAction = (action: string) => {
    switch(action) {
      case 'CREATE_USER': return <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold">CREATED USER</span>;
      case 'DELETE_USER': return <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded text-xs font-bold">DELETED USER</span>;
      case 'UPDATE_PASSWORD': return <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold">CHANGED PASSWORD</span>;
      case 'UPLOAD_EXCEL': return <span className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold">UPLOADED BATCH</span>;
      case 'DELETE_EXCEL': return <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded text-xs font-bold">DELETED BATCH</span>;
      default: return <span className="text-muted-foreground bg-muted px-2 py-1 rounded text-xs font-bold">{action}</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <LineChart className="text-primary" /> System Audit Logs
            </h1>
            <p className="text-muted-foreground mt-1">Track all database changes and administrative actions.</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Entity</th>
                  <th className="px-6 py-4 font-semibold">Changed By</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-48"></div></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No audit logs found in the system yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatAction(log.action)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                          {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-medium">
                          <User size={14} className="text-muted-foreground" />
                          {log.changed_by}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded max-w-xs overflow-x-auto text-muted-foreground border border-border/50">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

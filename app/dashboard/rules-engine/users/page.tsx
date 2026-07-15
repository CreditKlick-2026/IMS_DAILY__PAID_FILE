"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Shield, Check, Loader2 } from 'lucide-react';

export default function UsersAccessPage() {
  const { user } = useApp();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userProcessIds, setUserProcessIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/universal/clients')
      ]);
      const uData = await uRes.json();
      const pData = await pRes.json();
      
      if (uData.users) setUsersList(uData.users);
      if (pData.success) setProcesses(pData.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadUserMapping = async (usr: any) => {
    setSelectedUser(usr);
    setMessage('');
    try {
      const res = await fetch(`/api/users/mapping?userId=${usr.id}`);
      const data = await res.json();
      if (data.success) {
        setUserProcessIds(data.clientIds);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProcess = (clientId: number) => {
    if (userProcessIds.includes(clientId)) {
      setUserProcessIds(userProcessIds.filter(id => id !== clientId));
    } else {
      setUserProcessIds([...userProcessIds, clientId]);
    }
  };

  const handleSaveMapping = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/users/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, clientIds: userProcessIds })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Access successfully updated!');
      } else {
        setMessage('Error saving access.');
      }
    } catch (e) {
      setMessage('Network error.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-4 md:p-6 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
          <Users className="w-8 h-8 text-orange-500" />
          Users & Access Control
        </h1>
        <p className="text-slate-500 mt-2">Manage user accounts and map them to specific processes.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Users List */}
        <div className="w-full md:w-1/3">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="bg-slate-50/50 py-4 px-5 border-b border-slate-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                Select User
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {usersList.filter(u => u.role !== 'admin').map(usr => (
                  <button
                    key={usr.id}
                    onClick={() => loadUserMapping(usr)}
                    className={`w-full text-left px-4 py-3 flex flex-col gap-1 border-b border-slate-100 transition-colors ${
                      selectedUser?.id === usr.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{usr.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Emp ID: {usr.employee_id}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Mapping */}
        <div className="flex-1">
          {selectedUser ? (
            <Card className="border-slate-200/60 shadow-sm h-full flex flex-col">
              <CardHeader className="bg-slate-50/50 py-4 px-6 border-b border-slate-100 flex-shrink-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Access Mapping for {selectedUser.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Select the processes this user is allowed to access and upload data for.</p>
                </div>
                <Button onClick={handleSaveMapping} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Access
                </Button>
              </CardHeader>
              <CardContent className="p-6 overflow-y-auto flex-1">
                {message && (
                  <div className={`p-3 mb-6 rounded-lg text-sm font-semibold ${message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  {processes.map(p => {
                    const isSelected = userProcessIds.includes(p.id);
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => handleToggleProcess(p.id)}
                        className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <Shield className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-medium">Select a user to manage access.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

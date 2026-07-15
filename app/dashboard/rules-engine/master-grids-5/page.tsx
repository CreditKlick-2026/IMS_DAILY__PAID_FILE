"use client";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


import * as TabsPrimitive from "@radix-ui/react-tabs"
const Tabs = TabsPrimitive.Root;
const TabsList = TabsPrimitive.List;
const TabsTrigger = TabsPrimitive.Trigger;
const TabsContent = TabsPrimitive.Content;

import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface AssociateSlab {
    vintage: string;
    upgrade_pct: string;
    recovery_pct: string;
}

interface LeaderSlab {
    level: string;
    avg_min: string;
    avg_max: string;
    upgrade_pct: string;
    recovery_pct: string;
}

interface Grid5Data {
    associateSlabs: AssociateSlab[];
    tlSlabs: LeaderSlab[];
    amSlabs: LeaderSlab[];
}

export default function MasterGrid5Page() {
    const [data, setData] = useState<Grid5Data>({ associateSlabs: [], tlSlabs: [], amSlabs: [] });
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/master-grids-5')
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    setData({
                        associateSlabs: res.data.associateSlabs || [],
                        tlSlabs: res.data.tlSlabs || [],
                        amSlabs: res.data.amSlabs || []
                    });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/master-grids-5', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const resData = await res.json();
            if (resData.success) {
                alert('Grid 5 updated successfully!');
            } else {
                alert(resData.error || 'Failed to update');
            }
        } catch (e) {
            alert('An error occurred');
        }
        setIsSaving(false);
    };

    const addAssociateSlab = () => {
        setData(prev => ({
            ...prev,
            associateSlabs: [...prev.associateSlabs, { vintage: '', upgrade_pct: '0.00', recovery_pct: '0.00' }]
        }));
    };

    const removeAssociateSlab = (idx: number) => {
        setData(prev => ({
            ...prev,
            associateSlabs: prev.associateSlabs.filter((_, i) => i !== idx)
        }));
    };

    const updateAssociateSlab = (idx: number, field: keyof AssociateSlab, val: string) => {
        setData(prev => {
            const newSlabs = [...prev.associateSlabs];
            newSlabs[idx] = { ...newSlabs[idx], [field]: val };
            return { ...prev, associateSlabs: newSlabs };
        });
    };

    const addLeaderSlab = (type: 'tlSlabs' | 'amSlabs') => {
        setData(prev => ({
            ...prev,
            [type]: [...prev[type], { level: 'New Slab', avg_min: '', avg_max: '', upgrade_pct: '0.00', recovery_pct: '0.00' }]
        }));
    };

    const removeLeaderSlab = (type: 'tlSlabs' | 'amSlabs', idx: number) => {
        setData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== idx)
        }));
    };

    const updateLeaderSlab = (type: 'tlSlabs' | 'amSlabs', idx: number, field: keyof LeaderSlab, val: string) => {
        setData(prev => {
            const newSlabs = [...prev[type]];
            newSlabs[idx] = { ...newSlabs[idx], [field]: val };
            return { ...prev, [type]: newSlabs };
        });
    };

    if (loading) return <div className="p-4 md:p-6 text-center">Loading...</div>;

    const renderLeaderTable = (type: 'tlSlabs' | 'amSlabs') => (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => addLeaderSlab(type)} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Slab
                </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Level</TableHead>
                            <TableHead>Avg. Min (Target)</TableHead>
                            <TableHead>Avg. Max</TableHead>
                            <TableHead>Upgrade Payout (%)</TableHead>
                            <TableHead>Recovery Payout (%)</TableHead>
                            <TableHead className="w-20"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data[type].map((slab, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Input value={slab.level} onChange={e => updateLeaderSlab(type, idx, 'level', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Input value={slab.avg_min} onChange={e => updateLeaderSlab(type, idx, 'avg_min', e.target.value)} placeholder="500000" />
                                </TableCell>
                                <TableCell>
                                    <Input value={slab.avg_max} onChange={e => updateLeaderSlab(type, idx, 'avg_max', e.target.value)} placeholder="-" />
                                </TableCell>
                                <TableCell>
                                    <Input value={slab.upgrade_pct} onChange={e => updateLeaderSlab(type, idx, 'upgrade_pct', e.target.value)} type="number" step="0.01" />
                                </TableCell>
                                <TableCell>
                                    <Input value={slab.recovery_pct} onChange={e => updateLeaderSlab(type, idx, 'recovery_pct', e.target.value)} type="number" step="0.01" />
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeLeaderSlab(type, idx)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <div className="p-6 w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/rules-engine">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Master Grid 5</h1>
                        <p className="text-muted-foreground">Axis Bank (Credit Card - NPA - BAU)</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Tabs defaultValue="associate">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="associate">Associate Slabs</TabsTrigger>
                    <TabsTrigger value="tl">TL Slabs</TabsTrigger>
                    <TabsTrigger value="am">AM Slabs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="associate">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Associate Payouts (Vintage Based)</CardTitle>
                            <Button onClick={addAssociateSlab} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Row
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Vintage (Days)</TableHead>
                                            <TableHead>Upgrade Payout (%)</TableHead>
                                            <TableHead>Recovery Payout (%)</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.associateSlabs.map((slab, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <Input value={slab.vintage} onChange={e => updateAssociateSlab(idx, 'vintage', e.target.value)} placeholder="e.g. <90" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input value={slab.upgrade_pct} onChange={e => updateAssociateSlab(idx, 'upgrade_pct', e.target.value)} type="number" step="0.01" />
                                                </TableCell>
                                                <TableCell>
                                                    <Input value={slab.recovery_pct} onChange={e => updateAssociateSlab(idx, 'recovery_pct', e.target.value)} type="number" step="0.01" />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeAssociateSlab(idx)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Leader Slabs (Per Seat Avg Productivity)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderLeaderTable('tlSlabs')}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="am">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assistant Manager Slabs (Per Seat Avg Productivity)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderLeaderTable('amSlabs')}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

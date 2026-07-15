"use client";
import React, { useState, useEffect } from 'react';
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

interface DynamicGridEditorProps {
    gridId: string;
    title: string;
    subtitle: string;
    hasClientProduct?: boolean;
}

export default function DynamicGridEditor({ gridId, title, subtitle, hasClientProduct = false }: DynamicGridEditorProps) {
    const [data, setData] = useState<any>({ associateSlabs: [], tlSlabs: [], amSlabs: [], riders: [] });
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/admin/master-grids-${gridId}`)
            .then(res => res.json())
            .then(res => {
                if (res.success && res.data) {
                    setData({
                        associateSlabs: res.data.associateSlabs || [],
                        tlSlabs: res.data.tlSlabs || [],
                        amSlabs: res.data.amSlabs || [],
                        riders: res.data.riders || []
                    });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [gridId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/master-grids-${gridId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gridName: `grid_${gridId}`, data })
            });
            const resData = await res.json();
            if (resData.success) {
                alert(`${title} updated successfully!`);
            } else {
                alert(resData.error || resData.message || 'Failed to update');
            }
        } catch (e) {
            alert('An error occurred');
        }
        setIsSaving(false);
    };

    const addAssociateSlab = () => {
        const newSlab = hasClientProduct 
            ? { client: '', product: '', vintage: '', level: '', min: '', max: '', payout_pct: '0.00' }
            : { vintage: '', min: '', max: '', payout_pct: '0.00' };
        setData((prev: any) => ({ ...prev, associateSlabs: [...prev.associateSlabs, newSlab] }));
    };

    const addLeaderSlab = (type: 'tlSlabs' | 'amSlabs') => {
        setData((prev: any) => ({ ...prev, [type]: [...prev[type], { pcp_min: '', pcp_max: '', payout_pct: '0.00' }] }));
    };

    const addRider = () => {
        setData((prev: any) => ({ ...prev, riders: [...(prev.riders || []), { role: '', docking: '', payout: '' }] }));
    };

    const updateArray = (type: string, idx: number, field: string, val: string) => {
        setData((prev: any) => {
            const newArr = [...(prev[type] || [])];
            newArr[idx] = { ...newArr[idx], [field]: val };
            return { ...prev, [type]: newArr };
        });
    };

    const removeArray = (type: string, idx: number) => {
        setData((prev: any) => ({ ...prev, [type]: prev[type].filter((_: any, i: number) => i !== idx) }));
    };

    if (loading) return <div className="p-4 md:p-6 text-center">Loading...</div>;

    const renderLeaderTable = (type: 'tlSlabs' | 'amSlabs', titleText: string) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{titleText}</CardTitle>
                <Button onClick={() => addLeaderSlab(type)} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Slab
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Min PCP</TableHead>
                                <TableHead>Max PCP</TableHead>
                                <TableHead>Payout (%)</TableHead>
                                <TableHead className="w-20"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data[type].map((slab: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell><Input value={slab.pcp_min} onChange={e => updateArray(type, idx, 'pcp_min', e.target.value)} /></TableCell>
                                    <TableCell><Input value={slab.pcp_max} onChange={e => updateArray(type, idx, 'pcp_max', e.target.value)} /></TableCell>
                                    <TableCell><Input value={slab.payout_pct} onChange={e => updateArray(type, idx, 'payout_pct', e.target.value)} type="number" step="0.01" /></TableCell>
                                    <TableCell><Button variant="ghost" size="icon" onClick={() => removeArray(type, idx)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-6 w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/rules-engine">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Tabs defaultValue="associate">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="associate">Associate Slabs</TabsTrigger>
                    <TabsTrigger value="tl">TL Slabs</TabsTrigger>
                    <TabsTrigger value="am">AM Slabs</TabsTrigger>
                    <TabsTrigger value="riders">Riders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="associate">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Associate Payouts</CardTitle>
                            <Button onClick={addAssociateSlab} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Row
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            {hasClientProduct && <TableHead>Client</TableHead>}
                                            {hasClientProduct && <TableHead>Product</TableHead>}
                                            <TableHead>Vintage</TableHead>
                                            {hasClientProduct && <TableHead>Level</TableHead>}
                                            <TableHead>Min</TableHead>
                                            <TableHead>Max</TableHead>
                                            <TableHead>Payout (%)</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.associateSlabs.map((slab: any, idx: number) => (
                                            <TableRow key={idx}>
                                                {hasClientProduct && <TableCell><Input value={slab.client} onChange={e => updateArray('associateSlabs', idx, 'client', e.target.value)} /></TableCell>}
                                                {hasClientProduct && <TableCell><Input value={slab.product} onChange={e => updateArray('associateSlabs', idx, 'product', e.target.value)} /></TableCell>}
                                                <TableCell><Input value={slab.vintage} onChange={e => updateArray('associateSlabs', idx, 'vintage', e.target.value)} placeholder="<90" /></TableCell>
                                                {hasClientProduct && <TableCell><Input value={slab.level} onChange={e => updateArray('associateSlabs', idx, 'level', e.target.value)} /></TableCell>}
                                                <TableCell><Input value={slab.min} onChange={e => updateArray('associateSlabs', idx, 'min', e.target.value)} /></TableCell>
                                                <TableCell><Input value={slab.max} onChange={e => updateArray('associateSlabs', idx, 'max', e.target.value)} /></TableCell>
                                                <TableCell><Input value={slab.payout_pct} onChange={e => updateArray('associateSlabs', idx, 'payout_pct', e.target.value)} type="number" step="0.01" /></TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeArray('associateSlabs', idx)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tl">{renderLeaderTable('tlSlabs', 'Team Leader Slabs (PCP based)')}</TabsContent>
                <TabsContent value="am">{renderLeaderTable('amSlabs', 'Assistant Manager Slabs (PCP based)')}</TabsContent>

                <TabsContent value="riders">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Rider & Docker Rules</CardTitle>
                            <Button onClick={addRider} variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Rider
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Role / Rule</TableHead>
                                            <TableHead>Docking Condition</TableHead>
                                            <TableHead>Payout Multiplier / Extra</TableHead>
                                            <TableHead className="w-20"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data.riders || []).map((rider: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell><Input value={rider.role} onChange={e => updateArray('riders', idx, 'role', e.target.value)} placeholder="e.g. Caller - Rider 1" /></TableCell>
                                                <TableCell><Input value={rider.docking} onChange={e => updateArray('riders', idx, 'docking', e.target.value)} placeholder="e.g. >=85%" /></TableCell>
                                                <TableCell><Input value={rider.payout} onChange={e => updateArray('riders', idx, 'payout', e.target.value)} placeholder="e.g. 1 or 10% Extra" /></TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => removeArray('riders', idx)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

"use client";
import React from 'react';
import { KekaColumnsHeader } from '@/app/dashboard/rules-engine/keka-columns/components/KekaColumnsHeader';
import { AddKekaColumnCard } from '@/app/dashboard/rules-engine/keka-columns/components/AddKekaColumnCard';
import { KekaColumnsTable } from '@/app/dashboard/rules-engine/keka-columns/components/KekaColumnsTable';
import { useKekaColumnsData } from '@/app/dashboard/rules-engine/keka-columns/components/useKekaColumnsData';

interface AdminKekaColumnsTabProps {
  onColumnsUpdated?: () => void;
}

export function AdminKekaColumnsTab({ onColumnsUpdated }: AdminKekaColumnsTabProps) {
  const d = useKekaColumnsData(onColumnsUpdated);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full bg-gradient-to-br from-slate-100 via-slate-50/80 to-slate-100/90">
      <KekaColumnsHeader
        isConfigReady={true}
        onOpenAdd={() => d.setAddMode(true)}
      />

      {d.addMode && (
        <AddKekaColumnCard
          newKey={d.newKey}
          setNewKey={d.setNewKey}
          newDisplay={d.newDisplay}
          setNewDisplay={d.setNewDisplay}
          newLabels={d.newLabels}
          setNewLabels={d.setNewLabels}
          saving={d.saving}
          onSave={d.handleAdd}
          onCancel={() => d.setAddMode(false)}
        />
      )}

      <KekaColumnsTable
        columns={d.columns}
        loading={d.loading}
        coreKeys={d.coreKeys}
        editingKey={d.editingKey}
        editDisplay={d.editDisplay}
        setEditDisplay={d.setEditDisplay}
        editLabels={d.editLabels}
        setEditLabels={d.setEditLabels}
        onStartEdit={(col) => {
          d.setEditingKey(col.key);
          d.setEditDisplay(col.display);
          d.setEditLabels((col.labels || []).join(', '));
        }}
        onCancelEdit={() => d.setEditingKey(null)}
        onSaveEdit={() => d.editingKey && d.handleEditSave(d.editingKey)}
        onDeleteColumn={d.handleDelete}
        isConfigReady={true}
      />
    </div>
  );
}

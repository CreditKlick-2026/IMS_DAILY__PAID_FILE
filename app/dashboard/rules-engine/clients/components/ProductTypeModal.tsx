"use client";
import React, { useState } from 'react';
import { X, Layers, Plus, Trash2 } from 'lucide-react';

interface ProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onAddProduct: (name: string) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  saving: boolean;
}

export function ProductTypeModal({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onDeleteProduct,
  saving
}: ProductTypeModalProps) {
  const [newProductName, setNewProductName] = useState('');

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newProductName.trim()) return;
    await onAddProduct(newProductName.trim());
    setNewProductName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden flex flex-col rounded-none">
        {/* Header */}
        <div className="px-5 py-3.5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Product Types Manager</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter product type (e.g. Card, Loan, Auto)..."
              className="flex-1 px-3 py-1.5 border border-slate-300 bg-white outline-none focus:border-blue-500 rounded-none text-xs"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              disabled={saving || !newProductName.trim()}
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-bold rounded-none flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus size={13} /> Add
            </button>
          </div>

          <div className="border border-slate-200 divide-y max-h-52 overflow-y-auto bg-slate-50/50">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50">
                <span className="font-bold text-slate-800">{p.name}</span>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                  title="Delete product type"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-none shadow-2xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

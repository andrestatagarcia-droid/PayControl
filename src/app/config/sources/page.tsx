'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Landmark, CreditCard, Wallet, PiggyBank, Briefcase, Trash2, Edit2, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { cn, formatCurrency } from '@/lib/utils';
import { PaymentSource, SourceType } from '@/lib/types';

const SOURCE_TYPES: { label: SourceType; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { label: 'Banco', icon: Landmark },
  { label: 'Tarjeta', icon: CreditCard },
  { label: 'Efectivo', icon: Wallet },
  { label: 'Ahorro', icon: PiggyBank },
  { label: 'Otro', icon: Briefcase },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#06b6d4', '#f97316'];

export default function SourcesPage() {
  const sources = useLiveQuery(() => db.sources.toArray());

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Banco' as SourceType,
    balance: 0,
    color: COLORS[0],
  });
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      if (editingId) {
        await db.sources.update(editingId, { ...formData, name: formData.name.trim() });
        setEditingId(null);
      } else {
        await db.sources.add({ ...formData, name: formData.name.trim() });
      }
      setFormData({ name: '', type: 'Banco', balance: 0, color: COLORS[0] });
    } catch {
      setError('Error al guardar la fuente de pago.');
    }
  };

  const handleEdit = (source: PaymentSource) => {
    setEditingId(source.id ?? null);
    setFormData({
      name: source.name,
      type: source.type,
      balance: source.balance,
      color: source.color || COLORS[0],
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (sourceId: number) => {
    setError('');

    const linkedMovements = await db.movements.where('sourceId').equals(sourceId).count();
    if (linkedMovements > 0) {
      setError('No puedes eliminar esta fuente porque tiene movimientos asociados.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta fuente de pago?')) {
      await db.sources.delete(sourceId);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Fuentes de pago</h1>
        <p className="text-muted-foreground">Tus bancos, tarjetas y efectivo</p>
      </header>

      <div className="gradient-card rounded-2xl p-6 glass">
        <h2 className="text-lg font-semibold mb-6">{editingId ? 'Editar fuente' : 'Nueva fuente'}</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Nómina Bancolombia, Visa Platinum..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Saldo inicial / actual</label>
            <input
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2 col-span-full">
            <label className="text-sm font-medium text-muted-foreground">Tipo de cuenta</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SOURCE_TYPES.map((item) => {
                const Icon = item.icon;
                const isActive = formData.type === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: item.label })}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border border-border transition-all',
                      isActive ? 'bg-primary/10 border-primary text-primary' : 'hover:bg-muted'
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 col-span-full">
            <label className="text-sm font-medium text-muted-foreground">Color personalizado</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: item })}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110',
                    formData.color === item ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : ''
                  )}
                  style={{ backgroundColor: item }}
                  aria-label={`Seleccionar color ${item}`}
                >
                  {formData.color === item && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="col-span-full text-destructive text-sm font-medium">{error}</p>}

          <div className="col-span-full flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-primary text-white font-semibold py-3 rounded-xl transition-all">
              {editingId ? 'Actualizar fuente' : 'Crear fuente'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', type: 'Banco', balance: 0, color: COLORS[0] });
                  setError('');
                }}
                className="px-6 py-3 bg-muted rounded-xl text-foreground font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tus cuentas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!sources || sources.length === 0 ? (
            <div className="col-span-full text-center py-12 glass rounded-2xl border border-dashed border-border text-muted-foreground">
              No hay fuentes de pago configuradas aún
            </div>
          ) : (
            sources.map((source) => {
              const Icon = SOURCE_TYPES.find((item) => item.label === source.type)?.icon || Briefcase;
              return (
                <div key={source.id} className="relative p-6 glass rounded-2xl border border-border overflow-hidden group">
                  <div
                    className="absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: source.color }}
                  />

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="p-3 rounded-xl text-white shadow-lg shrink-0" style={{ backgroundColor: source.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleEdit(source)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        aria-label="Editar fuente de pago"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(source.id!)}
                        className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Eliminar fuente de pago"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-lg break-words">{source.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{source.type}</p>
                    <p className="text-2xl font-bold font-mono">{formatCurrency(source.balance)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


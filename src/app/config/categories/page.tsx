'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, Edit2, Check } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
  '#71717a', '#fbbf24', '#4ade80', '#2dd4bf', '#60a5fa',
];

export default function CategoriesPage() {
  const categories = useLiveQuery(() => db.categories.toArray());
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      if (editingId) {
        const duplicate = await db.categories
          .where('name')
          .equalsIgnoreCase(name.trim())
          .filter((category) => category.id !== editingId)
          .first();

        if (duplicate) {
          setError('Ya existe una categoría con ese nombre.');
          return;
        }

        await db.categories.update(editingId, { name: name.trim(), color });
        setEditingId(null);
      } else {
        const exists = await db.categories.where('name').equalsIgnoreCase(name.trim()).first();
        if (exists) {
          setError('Ya existe una categoría con ese nombre.');
          return;
        }

        await db.categories.add({ name: name.trim(), color });
      }

      setName('');
      setColor(COLORS[0]);
    } catch {
      setError('Error al guardar la categoría.');
    }
  };

  const handleEdit = (category: { id?: number; name: string; color: string }) => {
    setEditingId(category.id!);
    setName(category.name);
    setColor(category.color);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    setError('');

    const [usedByServices, usedByMovements] = await Promise.all([
      db.services.where('categoryId').equals(id).count(),
      db.movements.where('categoryId').equals(id).count(),
    ]);

    if (usedByServices || usedByMovements) {
      setError('No puedes eliminar esta categoría porque está en uso por servicios o movimientos.');
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categorías</h1>
          <p className="text-muted-foreground">Organiza tus movimientos con colores</p>
        </div>
      </header>

      <div className="gradient-card rounded-2xl p-6 glass">
        <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Alimentación, Transporte..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Color asociado</label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  className={cn(
                    'w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110',
                    color === item ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : ''
                  )}
                  style={{ backgroundColor: item }}
                  aria-label={`Seleccionar color ${item}`}
                >
                  {color === item && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-destructive text-sm font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-primary text-white font-semibold py-3 rounded-xl transition-all">
              {editingId ? 'Actualizar' : 'Crear categoría'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setColor(COLORS[0]);
                  setError('');
                }}
                className="px-4 py-3 bg-muted rounded-xl text-foreground"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Listado de categorías</h2>
        <div className="grid gap-3">
          {!categories || categories.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-dashed border-border text-muted-foreground">
              No hay categorías creadas aún
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 p-4 glass rounded-xl border border-border">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words">{category.name}</h3>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Editar categoría"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id!)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

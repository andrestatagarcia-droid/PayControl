'use client';

import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Edit2, Copy, ArrowUpRight, ArrowDownLeft, X, Search, Filter, Download } from 'lucide-react';
import { db } from '@/lib/db';
import { addMovement, deleteMovement, updateMovement } from '@/lib/api';
import { exportMovementsToExcel } from '@/lib/export';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Movement, MovementType } from '@/lib/types';
import { MOVEMENT_TYPE_VALUES, getMovementTypeLabel, isDebitMovement } from '@/lib/labels';

export default function RegistryPage() {
  const movements = useLiveQuery(() => db.movements.orderBy('date').reverse().toArray());
  const services = useLiveQuery(() => db.services.toArray());
  const sources = useLiveQuery(() => db.sources.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [error, setError] = useState('');
  const [showServiceList, setShowServiceList] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceId: undefined as number | undefined,
    reference: '',
    amount: 0,
    type: MOVEMENT_TYPE_VALUES.debit as MovementType,
    categoryId: 0,
    sourceId: 0,
    paymentType: '',
  });


  const selectedSource = useMemo(
    () => sources?.find((source) => source.id === formData.sourceId),
    [formData.sourceId, sources]
  );

  const previewBalance = useMemo(() => {
    if (!selectedSource) return null;

    const change = isDebitMovement(formData.type) ? -formData.amount : formData.amount;
    return {
      previous: selectedSource.balance,
      change,
      result: selectedSource.balance + change,
    };
  }, [selectedSource, formData.amount, formData.type]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      serviceId: undefined,
      reference: '',
      amount: 0,
      type: MOVEMENT_TYPE_VALUES.debit,
      categoryId: 0,
      sourceId: 0,
      paymentType: '',
    });
    setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.sourceId || !formData.categoryId || formData.amount <= 0) {
      setError('Por favor completa fuente, categoría y un monto válido.');
      return;
    }

    if (formData.serviceId && !services?.some((service) => service.id === formData.serviceId)) {
      setError('El servicio seleccionado ya no existe. Elige otro o quítalo del registro.');
      return;
    }

    if (!categories?.some((category) => category.id === formData.categoryId)) {
      setError('La categoría seleccionada ya no existe. Elige otra antes de guardar.');
      return;
    }

    if (!sources?.some((source) => source.id === formData.sourceId)) {
      setError('La fuente de pago seleccionada ya no existe. Elige otra antes de guardar.');
      return;
    }

    try {
      const dataToSave = {
        date: formData.date,
        serviceId: formData.serviceId,
        reference: formData.reference,
        amount: formData.amount,
        type: formData.type,
        categoryId: formData.categoryId,
        sourceId: formData.sourceId,
      };

      if (editingMovement) {
        await updateMovement(editingMovement.id!, dataToSave);
      } else {
        await addMovement(dataToSave);
      }

      setIsFormOpen(false);
      setEditingMovement(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el registro.');
    }
  };

  const handleEdit = (mov: Movement) => {
    setEditingMovement(mov);
    setFormData({
      date: mov.date,
      serviceId: mov.serviceId,
      reference: mov.reference,
      amount: mov.amount,
      type: mov.type,
      categoryId: mov.categoryId,
      sourceId: mov.sourceId,
      paymentType: services?.find((service) => service.id === mov.serviceId)?.paymentType || '',
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleDuplicate = (mov: Movement) => {
    setEditingMovement(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      serviceId: mov.serviceId,
      reference: mov.reference,
      amount: mov.amount,
      type: mov.type,
      categoryId: mov.categoryId,
      sourceId: mov.sourceId,
      paymentType: services?.find((service) => service.id === mov.serviceId)?.paymentType || '',
    });
    setError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) {
      return;
    }

    await deleteMovement(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24 md:pb-8">
      <header className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Registro diario</h1>
          <p className="text-muted-foreground">Controla tus ingresos y egresos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingMovement(null);
            setIsFormOpen(true);
          }}
          className="btn-primary text-white p-4 rounded-full md:rounded-xl shadow-lg flex items-center gap-2 group fixed bottom-20 right-6 md:static z-40 transition-transform hover:scale-105"
        >
          <Plus size={24} />
          <span className="hidden md:inline font-bold">Nuevo movimiento</span>
        </button>
      </header>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden glass max-h-[90vh] overflow-y-auto">
            <header className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card/80 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold">{editingMovement ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground"
                aria-label="Cerrar formulario"
              >
                <X size={24} />
              </button>
            </header>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo de movimiento</label>
                  <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: MOVEMENT_TYPE_VALUES.debit })}
                      className={cn(
                        'flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all',
                        formData.type === MOVEMENT_TYPE_VALUES.debit
                          ? 'bg-destructive text-white shadow-md'
                          : 'text-muted-foreground hover:bg-background/50'
                      )}
                    >
                      DÉBITO (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: MOVEMENT_TYPE_VALUES.credit })}
                      className={cn(
                        'flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all',
                        formData.type === MOVEMENT_TYPE_VALUES.credit
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-muted-foreground hover:bg-background/50'
                      )}
                    >
                      CRÉDITO (+)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative col-span-full md:col-span-1 z-40">
                  <label className="text-sm font-medium text-muted-foreground">Servicio (opcional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={services?.find((service) => service.id === formData.serviceId)?.company || ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setFormData((prev) => ({ ...prev, serviceId: undefined, paymentType: '', reference: '' }));
                        }
                        setShowServiceList(true);
                      }}
                      onFocus={() => setShowServiceList(true)}
                      onBlur={() => setTimeout(() => setShowServiceList(false), 200)}
                      placeholder="Empresa o servicio..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  </div>
                  {showServiceList && (
                    <div className="absolute left-0 right-0 z-[100] mt-1 bg-[#16161a] border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, serviceId: undefined, reference: '', categoryId: 0, paymentType: '' }));
                          setShowServiceList(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm italic"
                      >
                        Sin servicio asociado
                      </button>
                      {services?.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              serviceId: service.id,
                              reference: service.contractNumber,
                              categoryId: service.categoryId,
                              paymentType: service.paymentType,
                            }));
                            setShowServiceList(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm"
                        >
                          {service.company} - {service.serviceType}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative z-10">
                  <label className="text-sm font-medium text-muted-foreground">Referencia</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Factura, contrato..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2 relative z-30">
                  <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={0}>Elegir...</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 relative z-20">
                  <label className="text-sm font-medium text-muted-foreground">Fuente de pago</label>
                  <select
                    value={formData.sourceId}
                    onChange={(e) => setFormData({ ...formData, sourceId: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value={0}>Elegir...</option>
                    {sources?.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.name} ({formatCurrency(source.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 col-span-full">
                  <label className="text-sm font-medium text-muted-foreground">Monto</label>
                  <div className="relative">
                    <span
                      className={cn(
                        'absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold',
                        isDebitMovement(formData.type) ? 'text-destructive' : 'text-green-600'
                      )}
                    >
                      {isDebitMovement(formData.type) ? '-' : '+'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount === 0 ? '' : formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      placeholder="0.00"
                      className={cn(
                        'w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-5 text-3xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all',
                        isDebitMovement(formData.type) ? 'text-destructive' : 'text-green-600'
                      )}
                    />
                  </div>
                </div>
              </div>

              {previewBalance && (
                <div className="bg-muted/40 rounded-2xl p-4 border border-border space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Impacto en cuenta</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Saldo anterior:</span>
                    <span className="font-mono">{formatCurrency(previewBalance.previous)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold">
                    <span>Ajuste:</span>
                    <span className={isDebitMovement(formData.type) ? 'text-destructive' : 'text-green-600'}>
                      {isDebitMovement(formData.type) ? '-' : '+'}
                      {formatCurrency(formData.amount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-lg font-bold">
                    <span>Nuevo saldo:</span>
                    <span className="font-mono">{formatCurrency(previewBalance.result)}</span>
                  </div>
                </div>
              )}

              {error && <p className="text-destructive text-sm font-bold text-center">{error}</p>}

              <footer className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                >
                  Confirmar registro
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Historial</h2>
          <div className="flex gap-2">
            <button className="p-2 glass rounded-lg text-muted-foreground hover:text-foreground" aria-label="Filtrar movimientos">
              <Filter size={18} />
            </button>
            <button
              onClick={() => {
                if (movements && categories && sources && services) {
                  exportMovementsToExcel(movements, categories, sources, services);
                }
              }}
              className="p-2 glass rounded-lg text-muted-foreground hover:text-primary transition-colors"
              aria-label="Exportar movimientos"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {!movements || movements.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-dashed border-border">
              <div className="mb-4 text-4xl opacity-20">💸</div>
              <p className="text-muted-foreground">Tu historial aparecerá aquí</p>
            </div>
          ) : (
            movements.map((mov) => {
              const category = categories?.find((item) => item.id === mov.categoryId);
              const source = sources?.find((item) => item.id === mov.sourceId);
              const service = services?.find((item) => item.id === mov.serviceId);
              const isDebit = isDebitMovement(mov.type);

              return (
                <div
                  key={mov.id}
                  className="p-4 glass rounded-2xl border border-border hover:border-primary/20 transition-all overflow-hidden"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg',
                          isDebit ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
                        )}
                      >
                        {isDebit ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold break-words">{service ? service.company : mov.reference || 'Registro manual'}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {category && (
                            <span
                              className="px-2 py-0.5 rounded-md text-[9px] font-black text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.toUpperCase()}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {formatDate(mov.date)} • {source?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start justify-between gap-3 md:justify-end">
                      <div className="text-right">
                        <p className={cn('text-lg font-black font-mono', isDebit ? 'text-destructive' : 'text-green-600')}>
                          {isDebit ? '-' : '+'}
                          {formatCurrency(mov.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">Saldo: {formatCurrency(mov.resultBalance)}</p>
                        <p className="text-[10px] text-muted-foreground">{getMovementTypeLabel(mov.type)}</p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        <button
                          onClick={() => handleEdit(mov)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary"
                          aria-label="Editar movimiento"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(mov)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary"
                          aria-label="Duplicar movimiento"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(mov.id!)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive"
                          aria-label="Eliminar movimiento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
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



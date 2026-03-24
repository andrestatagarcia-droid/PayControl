'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Edit2, Zap, ExternalLink, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { PaymentType } from '@/lib/types';

const COLOMBIAN_COMPANIES = [
  'Claro', 'Movistar', 'Tigo', 'ETB', 'WOM', 'Enel', 'Vanti', 'Acueducto', 'EPM', 'Gas Natural', 'DirecTV'
];

const SERVICE_TYPES = ['Internet', 'Móvil', 'Agua', 'Energía', 'Gas', 'Otro'];

export default function ServicesPage() {
  const services = useLiveQuery(() => db.services.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    serviceType: SERVICE_TYPES[0],
    customServiceType: '',
    contractNumber: '',
    categoryId: 0,
    paymentType: 'Mensual' as PaymentType,
    link: '',
    dueDate: '' as string | number
  });

  const [showCompanyList, setShowCompanyList] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.company || !formData.categoryId) {
      setError('Empresa y Categoría son obligatorios');
      return;
    }

    const finalServiceType = formData.serviceType === 'Otro' 
      ? (formData.customServiceType || 'Otro') 
      : formData.serviceType;

    const dataToSave = {
      ...formData,
      serviceType: finalServiceType,
      categoryId: Number(formData.categoryId)
    };

    // Remove customServiceType before saving to DB
    const { customServiceType, ...cleanData } = dataToSave as any;

    try {
      if (editingId) {
        await db.services.update(editingId, cleanData);
        setEditingId(null);
      } else {
        await db.services.add(cleanData);
      }
      setFormData({
        company: '',
        serviceType: SERVICE_TYPES[0],
        customServiceType: '',
        contractNumber: '',
        categoryId: categories?.[0]?.id || 0,
        paymentType: 'Mensual',
        link: '',
        dueDate: ''
      });
    } catch (err) {
      setError('Error al guardar el servicio');
    }
  };

  const handleEdit = (service: any) => {
    const isStandardType = SERVICE_TYPES.includes(service.serviceType);
    setEditingId(service.id);
    setFormData({
      company: service.company,
      serviceType: isStandardType ? service.serviceType : 'Otro',
      customServiceType: isStandardType ? '' : service.serviceType,
      contractNumber: service.contractNumber,
      categoryId: service.categoryId,
      paymentType: service.paymentType,
      link: service.link || '',
      dueDate: service.dueDate || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold">Servicios</h1>
        <p className="text-muted-foreground">Gestiona tus pagos recurrentes</p>
      </header>

      {/* Form Card */}
      <div className="gradient-card rounded-2xl p-6 glass">
        <h2 className="text-lg font-semibold mb-6">
          {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa con Autocomplete */}
          <div className="space-y-2 relative z-50">
            <label className="text-sm font-medium text-muted-foreground">Empresa</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => {
                setFormData({ ...formData, company: e.target.value });
                setShowCompanyList(true);
              }}
              onFocus={() => setShowCompanyList(true)}
              onBlur={() => setTimeout(() => setShowCompanyList(false), 200)}
              placeholder="Ej: Claro, Enel..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {showCompanyList && (
              <div className="absolute left-0 right-0 z-[100] mt-1 bg-[#16161a] border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                {COLOMBIAN_COMPANIES.filter(c => c.toLowerCase().includes(formData.company.toLowerCase())).map(company => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, company });
                      setShowCompanyList(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de Servicio */}
          <div className="space-y-2 relative z-40">
            <label className="text-sm font-medium text-muted-foreground">Tipo de Servicio</label>
            <div className="flex gap-3">
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
              >
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {formData.serviceType === 'Otro' && (
                <input
                  type="text"
                  value={formData.customServiceType}
                  onChange={(e) => setFormData({ ...formData, customServiceType: e.target.value })}
                  placeholder="¿Cuál?"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              )}
            </div>
          </div>

          {/* Número de Contrato */}
          <div className="space-y-2 relative z-30">
            <label className="text-sm font-medium text-muted-foreground">Número de Contrato</label>
            <input
              type="text"
              value={formData.contractNumber}
              onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              placeholder="Referencia de pago"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2 relative z-20">
            <label className="text-sm font-medium text-muted-foreground">Categoría</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value={0}>Selecciona una categoría</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {formData.categoryId > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: categories?.find(c => c.id === formData.categoryId)?.color }}
                />
                <span className="text-xs text-muted-foreground">Color de categoría</span>
              </div>
            )}
          </div>

          {/* Pago (Periodicidad) */}
          <div className="space-y-2 relative z-10">
            <label className="text-sm font-medium text-muted-foreground">Frecuencia de Pago</label>
            <select
              value={formData.paymentType}
              onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="Único">Único</option>
              <option value="Diario">Diario</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensual">Mensual</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

          {/* Link */}
          <div className="space-y-2 relative z-0">
            <label className="text-sm font-medium text-muted-foreground">Link</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Fecha Límite */}
          <div className="space-y-2 relative z-0">
            <label className="text-sm font-medium text-muted-foreground">Día Límite de Pago (1-31)</label>
            <input
              type="number"
              min={1}
              max={31}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? Number(e.target.value) : '' })}
              placeholder="Ej: 15"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {error && <p className="col-span-full text-destructive text-sm font-medium">{error}</p>}

          <div className="col-span-full flex gap-3 pt-2">
            <button type="submit" className="flex-1 btn-primary text-white font-semibold py-3 rounded-xl transition-all">
              {editingId ? 'Actualizar Servicio' : 'Crear Servicio'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    company: '', serviceType: 'Internet', customServiceType: '',
                    contractNumber: '', categoryId: 0, paymentType: 'Mensual', link: '',
                    dueDate: ''
                  });
                }}
                className="px-6 py-3 bg-muted rounded-xl text-foreground font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Servicios Registrados</h2>
        <div className="grid gap-4">
          {!services || services.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-dashed border-border text-muted-foreground">
              No hay servicios configurados aún
            </div>
          ) : (
            services.map((svc) => {
              const category = categories?.find(c => c.id === svc.categoryId);
              return (
                <div key={svc.id} className="p-5 glass rounded-2xl border border-border hover:border-primary/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Zap size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{svc.company}</h3>
                        <p className="text-sm text-muted-foreground">
                          {svc.serviceType} • {svc.contractNumber}
                          {svc.dueDate && ` • Día límite: ${svc.dueDate}`}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {category && (
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.toUpperCase()}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                            {svc.paymentType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {svc.link && (
                        <a 
                          href={svc.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 bg-muted/50 hover:bg-primary/20 hover:text-primary rounded-xl transition-all"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      <button 
                        onClick={() => handleEdit(svc)}
                        className="p-2.5 bg-muted/50 hover:bg-primary/20 hover:text-primary rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => db.services.delete(svc.id!)}
                        className="p-2.5 bg-muted/50 hover:bg-destructive/20 hover:text-destructive rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
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

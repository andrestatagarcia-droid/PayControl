'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, ShieldCheck, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { exportToJSON, importFromJSON } from '@/lib/backup';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showManualImport, setShowManualImport] = useState(false);
  const [manualJson, setManualJson] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualImport = async () => {
    if (!manualJson.trim()) return;
    if (!confirm('Esta acción reemplazará TODOS tus datos actuales. ¿Estás seguro?')) return;

    try {
      const data = JSON.parse(manualJson);
      await db.transaction('rw', [db.categories, db.sources, db.services, db.movements], async () => {
        await db.categories.clear();
        await db.sources.clear();
        await db.services.clear();
        await db.movements.clear();
        if (data.categories) await db.categories.bulkAdd(data.categories);
        if (data.sources) await db.sources.bulkAdd(data.sources);
        if (data.services) await db.services.bulkAdd(data.services);
        if (data.movements) await db.movements.bulkAdd(data.movements);
      });
      setStatus({ type: 'success', msg: 'Datos restaurados con éxito. Recargando...' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Formato JSON inválido' });
    }
  };

  const handleExport = async () => {
    try {
      await exportToJSON();
      setStatus({ type: 'success', msg: 'Copia de seguridad generada con éxito' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error al exportar los datos' });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Manual validation for better mobile compatibility
    if (!file.name.endsWith('.json')) {
      setStatus({ type: 'error', msg: 'El archivo debe ser formato .json' });
      return;
    }

    if (!confirm('Esta acción reemplazará TODOS tus datos actuales. ¿Estás seguro?')) return;

    try {
      await importFromJSON(file);
      setStatus({ type: 'success', msg: 'Datos restaurados con éxito. Recargando...' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error al importar el archivo. Formato inválido.' });
    }
  };

  const handleReset = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      await db.transaction('rw', [db.categories, db.sources, db.services, db.movements], async () => {
        await db.categories.clear();
        await db.sources.clear();
        await db.services.clear();
        await db.movements.clear();
      });
      setStatus({ type: 'success', msg: 'Aplicación restablecida de fábrica' });
      setConfirmDelete(false);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Error al borrar los datos' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Ajustes</h1>
        <p className="text-muted-foreground font-medium">Gestiona tu información y copias de seguridad</p>
      </header>

      {status && (
        <div className={cn(
          "p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300",
          status.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
        )}>
          {status.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
          <p className="font-bold text-sm tracking-wide uppercase">{status.msg}</p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Backup Card */}
        <section className="p-8 rounded-3xl glass border border-border/50 shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database size={120} strokeWidth={1} />
          </div>
          
          <div className="relative">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
              <RefreshCw className="text-primary animate-spin-slow" size={28} />
              RESPALDO Y SINCRONIZACIÓN
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed font-medium">
              Sincroniza tus datos entre dispositivos exportando un archivo de respaldo. PayControl es local-first: tus datos viven en tu navegador, no en la nube.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <button 
              onClick={handleExport}
              className="flex items-center justify-between p-6 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-3xl transition-all group/btn"
            >
              <div className="text-left">
                <p className="font-black text-primary group-hover/btn:translate-x-1 transition-transform tracking-tight">EXPORTAR RESPALDO</p>
                <p className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">Descarga un .json con toda tu info</p>
              </div>
              <Download size={32} className="text-primary opacity-50 group-hover/btn:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between p-6 bg-muted/40 hover:bg-muted/60 border border-border rounded-3xl transition-all group/btn"
            >
              <div className="text-left">
                <p className="font-black text-foreground group-hover/btn:translate-x-1 transition-transform tracking-tight">IMPORTAR ARCHIVO</p>
                <p className="text-[11px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">Desde archivo .json</p>
              </div>
              <Upload size={32} className="text-muted-foreground opacity-50 group-hover/btn:opacity-100 transition-opacity" />
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleImport} 
                className="hidden" 
              />
            </button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <button 
              onClick={() => setShowManualImport(!showManualImport)}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
            >
              {showManualImport ? "Ocultar Importación Manual" : "¿No puedes seleccionar el archivo? Usa Importación Manual"}
            </button>
            
            {showManualImport && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
                <p className="text-xs text-muted-foreground">Pega aquí el contenido de tu archivo de respaldo (.json):</p>
                <textarea
                  value={manualJson}
                  onChange={(e) => setManualJson(e.target.value)}
                  placeholder='{"categories": [...], ...}'
                  className="w-full h-48 bg-background border border-border rounded-2xl p-4 font-mono text-xs focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
                <button
                  onClick={handleManualImport}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:bg-primary/90 transition-all uppercase tracking-tight"
                >
                  Restaurar desde Texto Pegado
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="p-8 rounded-3xl bg-destructive/5 border border-destructive/20 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-destructive flex items-center gap-3 tracking-tight">
              <Trash2 size={24} />
              ZONA DE PELIGRO
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Estas acciones son permanentes y no se pueden deshacer.
            </p>
          </div>

          <button 
            onClick={handleReset}
            className={cn(
              "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black transition-all shadow-lg",
              confirmDelete 
                ? "bg-destructive text-white hover:bg-destructive/90 animate-infinite-pulse" 
                : "bg-background border border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
            )}
          >
            {confirmDelete ? "¡SÍ, BORRAR TODO DEFINITIVAMENTE!" : "RESTABLECER APLICACIÓN"}
          </button>
          
          {confirmDelete && (
            <button 
              onClick={() => setConfirmDelete(false)}
              className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Cancelar acción
            </button>
          )}
        </section>
      </div>
      
      <footer className="text-center pt-8 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">
          PayControl Pro Edition • Next.js + Dexie.js
        </p>
      </footer>
    </div>
  );
}

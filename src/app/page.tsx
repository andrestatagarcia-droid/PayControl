'use client';

import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, 
  ArrowDownLeft, AlertCircle, Clock, Calendar, 
  ChevronRight, Filter, CheckCircle2, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, 
  Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { db } from '@/lib/db';
import { getMonthlyReminders, Reminder } from '@/lib/reminders';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { startOfMonth, endOfMonth, subMonths, format, isAfter, isBefore, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const movements = useLiveQuery(() => db.movements.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const sources = useLiveQuery(() => db.sources.toArray()) || [];
  const services = useLiveQuery(() => db.services.toArray()) || [];

  const [reminders, setReminders] = useState<Reminder[]>([]);

  React.useEffect(() => {
    getMonthlyReminders().then(setReminders);
  }, [movements, services]);

  // Filtering movements based on period
  const filteredMovements = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    if (period === 'week') startDate = startOfWeek(now);
    else if (period === 'month') startDate = startOfMonth(now);
    else startDate = new Date(now.getFullYear(), 0, 1);

    return movements.filter(m => isAfter(new Date(m.date), startDate) || m.date === format(startDate, 'yyyy-MM-dd'));
  }, [movements, period]);

  // Totals
  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    
    filteredMovements.forEach(m => {
      if (m.type === 'Crédito') income += m.amount;
      else expenses += m.amount;
    });

    const totalBalance = sources.reduce((acc, s) => acc + s.balance, 0);

    return { income, expenses, balance: income - expenses, totalBalance };
  }, [filteredMovements, sources]);

  // Chart Data: Flow (Income/Expenses)
  const flowData = useMemo(() => {
    const dataMap: Record<string, { name: string; ingresos: number; egresos: number }> = {};
    
    filteredMovements.forEach(m => {
      const dateKey = period === 'year' 
        ? format(new Date(m.date), 'MMM', { locale: es })
        : format(new Date(m.date), 'dd MMM', { locale: es });
      
      if (!dataMap[dateKey]) {
        dataMap[dateKey] = { name: dateKey, ingresos: 0, egresos: 0 };
      }
      
      if (m.type === 'Crédito') dataMap[dateKey].ingresos += m.amount;
      else dataMap[dateKey].egresos += m.amount;
    });

    return Object.values(dataMap);
  }, [filteredMovements, period]);

  // Chart Data: Categories
  const categoryData = useMemo(() => {
    const dataMap: Record<number, { name: string; value: number; color: string }> = {};
    
    filteredMovements.filter(m => m.type === 'Débito').forEach(m => {
      const cat = categories.find(c => c.id === m.categoryId);
      if (!cat) return;

      if (!dataMap[cat.id!]) {
        dataMap[cat.id!] = { name: cat.name, value: 0, color: cat.color };
      }
      dataMap[cat.id!].value += m.amount;
    });

    return Object.values(dataMap).sort((a, b) => b.value - a.value);
  }, [filteredMovements, categories]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Hola, Andres Felipe Garcia</h1>
          <p className="text-muted-foreground">{format(new Date(), "PPPP", { locale: es })} • PayControl Pro</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl glass w-full md:w-auto">
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 md:px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest",
                period === p ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-background/40"
              )}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </header>

      {/* BLOQUE 1: Resumen Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gradient-card p-6 rounded-3xl glass border-primary/20 relative overflow-hidden group">
          <div className="p-2 bg-primary/10 rounded-lg w-fit mb-4 text-primary group-hover:scale-110 transition-transform">
            <Wallet size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Saldo Consolidado</p>
          <h3 className="text-2xl font-black font-mono tracking-tighter mt-1">{formatCurrency(totals.totalBalance)}</h3>
        </div>

        <div className="gradient-card p-6 rounded-3xl glass border-green-500/20 relative overflow-hidden group">
          <div className="p-2 bg-green-500/10 rounded-lg w-fit mb-4 text-green-500 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Ingresos del Periodo</p>
          <h3 className="text-2xl font-black font-mono tracking-tighter mt-1 text-green-500">+{formatCurrency(totals.income)}</h3>
        </div>

        <div className="gradient-card p-6 rounded-3xl glass border-destructive/20 relative overflow-hidden group">
          <div className="p-2 bg-destructive/10 rounded-lg w-fit mb-4 text-destructive group-hover:scale-110 transition-transform">
            <TrendingDown size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Egresos del Periodo</p>
          <h3 className="text-2xl font-black font-mono tracking-tighter mt-1 text-destructive">-{formatCurrency(totals.expenses)}</h3>
        </div>

        <div className={cn(
          "gradient-card p-6 rounded-3xl glass relative overflow-hidden group transition-colors",
          totals.balance >= 0 ? "border-primary/20" : "border-destructive/20"
        )}>
          <div className={cn(
            "p-2 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform",
            totals.balance >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}>
            <AlertCircle size={20} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Balance Neto</p>
          <h3 className={cn(
            "text-2xl font-black font-mono tracking-tighter mt-1",
            totals.balance >= 0 ? "text-primary" : "text-destructive"
          )}>
            {totals.balance >= 0 ? '+' : ''}{formatCurrency(totals.balance)}
          </h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* BLOQUE 2: Gráfico de Flujo */}
        <div className="lg:col-span-4 glass rounded-3xl border border-border p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" size={20}/>
            Flujo de Caja
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16161a', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={3} />
                <Area type="monotone" dataKey="egresos" stroke="#ef4444" fillOpacity={1} fill="url(#colorEgresos)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOQUE 3: Gastos por Categoría */}
        <div className="lg:col-span-3 glass rounded-3xl border border-border p-6 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Filter className="text-violet-500" size={20}/>
            Gastos por Categoría
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#16161a', border: '1px solid #27272a', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-medium truncate w-full">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* BLOQUE 4: Recordatorios de Pago */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Pendientes este Mes
            </h2>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
              {reminders.filter(r => !r.isPaidThisMonth).length} Pendientes
            </span>
          </div>
          
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="p-8 glass rounded-3xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No hay servicios recurrentes configurados</p>
              </div>
            ) : (
              reminders.map((reminder) => {
                const isPaid = reminder.isPaidThisMonth;
                const category = categories?.find(c => c.id === reminder.service.categoryId);
                
                return (
                  <div 
                    key={reminder.service.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                      isPaid 
                        ? "bg-green-500/5 border-green-500/10 opacity-70" 
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
                        isPaid ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                      )}>
                        {isPaid ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{reminder.service.company}</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                          {isPaid ? 'Pagado este mes' : `Pendiente - ${reminder.dueDateLabel}`}
                        </p>
                      </div>
                    </div>

                    {!isPaid && (
                      <div className="flex items-center gap-2">
                        {category && (
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Pagar →
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* BLOQUE 5: Movimientos Recientes */}
        <div className="glass rounded-3xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="text-amber-500" size={20}/>
              Actividad Reciente
            </h3>
            <ChevronRight size={18} className="text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {movements.slice(0, 5).map((mov) => {
              const cat = categories.find(c => c.id === mov.categoryId);
              const isDebit = mov.type === 'Débito';
              return (
                <div key={mov.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isDebit ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-500"
                    )}>
                      {isDebit ? <ArrowUpRight size={18}/> : <ArrowDownLeft size={18}/>}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{services.find(s => s.id === mov.serviceId)?.company || mov.reference}</p>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-black uppercase" style={{ color: cat?.color }}>
                        {cat?.name}
                      </span>
                    </div>
                  </div>
                  <p className={cn(
                    "font-bold font-mono tracking-tighter",
                    isDebit ? "text-destructive" : "text-green-500"
                  )}>
                    {isDebit ? '-' : '+'}{formatCurrency(mov.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BLOQUE 5: Fuentes de Pago */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-2">
            <Wallet className="text-primary" size={20}/>
            Mis Cuentas
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {sources.map(source => (
              <div key={source.id} className="glass p-5 rounded-2xl border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: source.color }}>
                    {source.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{source.name}</h4>
                    <span className="text-[10px] text-muted-foreground uppercase">{source.type}</span>
                  </div>
                </div>
                <p className="font-black font-mono">{formatCurrency(source.balance)}</p>
              </div>
            ))}
          </div>

          {/* BLOQUE 6: Alertas */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-200">Alertas Inteligentes</h4>
              <p className="text-xs text-amber-200/60 mt-1">
                {sources.some(s => s.balance < 50000) 
                  ? "Atención: Una de tus cuentas tiene saldo bajo."
                  : "¡Todo al día! No tienes pagos urgentes pendientes hoy."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

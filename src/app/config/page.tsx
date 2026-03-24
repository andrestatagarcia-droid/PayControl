'use client';

import Link from 'next/link';
import { Tag, Zap, CreditCard, ChevronRight } from 'lucide-react';

const configModules = [
  {
    name: 'Categorías',
    desc: 'Organiza tus gastos con etiquetas y colores',
    href: '/config/categories',
    icon: Tag,
    color: 'bg-violet-500/10 text-violet-500'
  },
  {
    name: 'Servicios',
    desc: 'Gestiona tus pagos recurrentes y empresas',
    href: '/config/services',
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-500'
  },
  {
    name: 'Fuentes de Pago',
    desc: 'Controla tus bancos, tarjetas y efectivo',
    href: '/config/sources',
    icon: CreditCard,
    color: 'bg-emerald-500/10 text-emerald-500'
  }
];

export default function ConfigPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia de control financiero</p>
      </header>

      <div className="grid gap-4">
        {configModules.map((module) => (
          <Link 
            key={module.name} 
            href={module.href}
            className="flex items-center justify-between p-6 glass rounded-2xl border border-border hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-xl ${module.color}`}>
                <module.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{module.name}</h3>
                <p className="text-sm text-muted-foreground">{module.desc}</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import { SimplePageCard } from '@/components/simple/SimplePageCard';

const quickSteps = [
  'Elige el pago o servicio.',
  'Selecciona desde qué cuenta lo pagaste.',
  'Escribe el monto y guarda.',
];

export default function PayPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
      <div className="w-full space-y-6">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <CreditCard size={28} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Registrar un pago</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Usa el registro rápido para guardar tu primer pago en pocos pasos.
          </p>
        </section>

        <SimplePageCard
          title="Registro rápido"
          description="Por ahora usaremos el registro actual de la app, con un acceso más claro desde aquí."
        >
          <div className="space-y-4">
            <ol className="space-y-3">
              {quickSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-base">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <Link
              href="/registry"
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-lg font-bold text-white focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              Ir al registro de pagos
              <ArrowRight size={20} />
            </Link>
          </div>
        </SimplePageCard>

        <SimplePageCard
          title="Antes de empezar"
          description="Si todavía no tienes datos creados, puedes hacer esto primero."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/setup"
              className="rounded-2xl border border-border bg-background px-5 py-4 text-left transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <p className="font-bold">Configuración básica</p>
              <p className="mt-2 text-sm text-muted-foreground">Agrega tus cuentas y pagos habituales.</p>
            </Link>
            <div className="rounded-2xl border border-border bg-background px-5 py-4">
              <p className="flex items-center gap-2 font-bold">
                <ShieldCheck size={18} className="text-primary" />
                Consejo
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Si es tu primer uso, puedes registrar un pago manual y completar el resto después.
              </p>
            </div>
          </div>
        </SimplePageCard>
      </div>
    </div>
  );
}

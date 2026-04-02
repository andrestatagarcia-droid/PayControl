import Link from 'next/link';
import { Download, ShieldCheck, Sparkles } from 'lucide-react';
import { WelcomeActionButton } from '@/components/welcome/WelcomeActionButton';
import { WelcomeInfoCard } from '@/components/welcome/WelcomeInfoCard';

const steps = [
  'Elige qué pago quieres registrar.',
  'Selecciona desde qué cuenta lo pagaste.',
  'Guarda el pago y listo.',
];

export default function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
      <div className="w-full space-y-6">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Sparkles size={28} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Registra tus pagos de forma simple
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            PayControl te ayuda a guardar tus pagos y ver tus cuentas sin complicaciones.
          </p>
        </section>

        <section className="grid gap-4">
          <WelcomeActionButton
            href="/pay"
            title="Registrar mi primer pago"
            description="Empieza ahora con el flujo más rápido y guiado."
            variant="primary"
          />
          <WelcomeActionButton
            href="/setup"
            title="Configuración básica"
            description="Agrega tus cuentas y pagos habituales antes de comenzar."
            variant="secondary"
          />
        </section>

        <WelcomeInfoCard title="Cómo funciona">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </WelcomeInfoCard>

        <WelcomeInfoCard title="Importar respaldo">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p>
                Si ya usaste PayControl antes, puedes recuperar tu información desde una copia de seguridad.
              </p>
              <p className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="shrink-0 text-primary" />
                Esta opción es para personas que ya tienen datos guardados.
              </p>
            </div>
            <Link
              href="/setup"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-base font-semibold hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <Download size={18} />
              Importar respaldo
            </Link>
          </div>
        </WelcomeInfoCard>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, Receipt, Settings2, Wallet } from 'lucide-react';
import { SimplePageCard } from '@/components/simple/SimplePageCard';

export default function SetupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
      <div className="w-full space-y-6">
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Settings2 size={28} />
          </div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Configuración básica</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Agrega lo mínimo para empezar a usar PayControl sin complicaciones.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <SimplePageCard
            title="Tus cuentas"
            description="Agrega bancos, tarjetas o efectivo para registrar desde dónde pagas."
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
                <Wallet size={20} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Ejemplos: Bancolombia, Nequi, tarjeta débito, efectivo.
                </p>
              </div>
              <Link
                href="/config/sources"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-base font-semibold hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                Configurar cuentas
                <ArrowRight size={18} />
              </Link>
            </div>
          </SimplePageCard>

          <SimplePageCard
            title="Tus pagos habituales"
            description="Agrega servicios o pagos frecuentes para que registrarlos sea más rápido."
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-background p-4">
                <Receipt size={20} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Ejemplos: internet, energía, arriendo, suscripciones.
                </p>
              </div>
              <Link
                href="/config/services"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-base font-semibold hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                Configurar pagos habituales
                <ArrowRight size={18} />
              </Link>
            </div>
          </SimplePageCard>
        </div>

        <SimplePageCard
          title="Importar respaldo"
          description="Si ya tienes una copia de seguridad, puedes restaurarla desde ajustes."
        >
          <Link
            href="/config/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-base font-semibold hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Ir a ajustes e importar respaldo
            <ArrowRight size={18} />
          </Link>
        </SimplePageCard>
      </div>
    </div>
  );
}

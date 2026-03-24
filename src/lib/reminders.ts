import { db } from './db';
import { Service, Movement } from './types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export interface Reminder {
  service: Service;
  lastPayment?: Movement;
  isPaidThisMonth: boolean;
  dueDateLabel: string;
}

export async function getMonthlyReminders(): Promise<Reminder[]> {
  const services = await db.services.toArray();
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const reminders: Reminder[] = [];

  for (const service of services) {
    if (service.paymentType === 'Único') continue; // Skip strictly unique payments for recurring reminders

    // Find movements for this service in the current month
    const movements = await db.movements
      .where('serviceId')
      .equals(service.id!)
      .toArray();

    const monthlyMovements = movements.filter(m => {
      const date = parseISO(m.date);
      return isWithinInterval(date, { start, end });
    });

    const lastPayment = movements.sort((a, b) => b.date.localeCompare(a.date))[0];

    reminders.push({
      service,
      lastPayment,
      isPaidThisMonth: monthlyMovements.length > 0,
      dueDateLabel: service.paymentType === 'Mensual' ? 'Este mes' : service.paymentType
    });
  }

  return reminders;
}

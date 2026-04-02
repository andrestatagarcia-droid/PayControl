import { db } from './db';
import { Service, Movement } from './types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { PAYMENT_TYPE_VALUES, getPaymentTypeLabel } from './labels';

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
    if (service.paymentType === PAYMENT_TYPE_VALUES.oneTime) continue;

    const movements = await db.movements.where('serviceId').equals(service.id!).toArray();

    const monthlyMovements = movements.filter((movement) => {
      const date = parseISO(movement.date);
      return isWithinInterval(date, { start, end });
    });

    const lastPayment = movements.sort((a, b) => b.date.localeCompare(a.date))[0];

    let dueDateLabel =
      service.paymentType === PAYMENT_TYPE_VALUES.monthly
        ? 'Este mes'
        : getPaymentTypeLabel(service.paymentType);

    if (service.dueDate) {
      dueDateLabel = `Límite: día ${service.dueDate}`;
    }

    reminders.push({
      service,
      lastPayment,
      isPaidThisMonth: monthlyMovements.length > 0,
      dueDateLabel,
    });
  }

  return reminders;
}

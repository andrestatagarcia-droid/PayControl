import Dexie, { type Table } from 'dexie';
import { Category, PaymentSource, Service, Movement } from './types';

export class PayControlDB extends Dexie {
  categories!: Table<Category>;
  sources!: Table<PaymentSource>;
  services!: Table<Service>;
  movements!: Table<Movement>;

  constructor() {
    super('paycontrol_db');
    this.version(1).stores({
      categories: '++id, &name',
      sources: '++id, name',
      services: '++id, company, categoryId',
      movements: '++id, date, categoryId, sourceId, serviceId'
    });
  }
}

export const db = new PayControlDB();

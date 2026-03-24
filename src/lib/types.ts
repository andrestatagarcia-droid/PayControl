export type PaymentType = 'Único' | 'Diario' | 'Semanal' | 'Mensual' | 'Anual';
export type MovementType = 'Débito' | 'Crédito';
export type SourceType = 'Banco' | 'Tarjeta' | 'Efectivo' | 'Ahorro' | 'Otro';

export interface Category {
  id?: number;
  name: string;
  color: string;
}

export interface PaymentSource {
  id?: number;
  name: string;
  type: SourceType;
  balance: number;
  color?: string;
  icon?: string;
}

export interface Service {
  id?: number;
  company: string;
  serviceType: string;
  contractNumber: string;
  categoryId: number;
  paymentType: PaymentType;
  link?: string;
}

export interface Movement {
  id?: number;
  date: string; // ISO string for consistency
  serviceId?: number;
  reference: string;
  amount: number;
  type: MovementType;
  categoryId: number;
  sourceId: number;
  resultBalance: number;
}

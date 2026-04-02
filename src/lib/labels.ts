import type { MovementType, PaymentType } from './types';

export const MOVEMENT_TYPE_VALUES = {
  debit: 'DÃ©bito' as MovementType,
  credit: 'CrÃ©dito' as MovementType,
};

export const PAYMENT_TYPE_VALUES = {
  oneTime: 'Ãšnico' as PaymentType,
  daily: 'Diario' as PaymentType,
  weekly: 'Semanal' as PaymentType,
  monthly: 'Mensual' as PaymentType,
  yearly: 'Anual' as PaymentType,
};

export const PAYMENT_TYPE_OPTIONS = [
  { value: PAYMENT_TYPE_VALUES.oneTime, label: 'Único' },
  { value: PAYMENT_TYPE_VALUES.daily, label: 'Diario' },
  { value: PAYMENT_TYPE_VALUES.weekly, label: 'Semanal' },
  { value: PAYMENT_TYPE_VALUES.monthly, label: 'Mensual' },
  { value: PAYMENT_TYPE_VALUES.yearly, label: 'Anual' },
] as const;

export function isDebitMovement(type: MovementType) {
  return type === MOVEMENT_TYPE_VALUES.debit;
}

export function isCreditMovement(type: MovementType) {
  return type === MOVEMENT_TYPE_VALUES.credit;
}

export function getMovementTypeLabel(type: MovementType) {
  return isDebitMovement(type) ? 'Débito' : 'Crédito';
}

export function getPaymentTypeLabel(type: PaymentType) {
  return PAYMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

import { db } from './db';
import { Movement } from './types';

export async function addMovement(movement: Omit<Movement, 'id' | 'resultBalance'>) {
  return db.transaction('rw', db.movements, db.sources, async () => {
    const source = await db.sources.get(movement.sourceId);
    if (!source) throw new Error('Fuente de pago no encontrada');

    const amount = movement.amount;
    const newBalance = movement.type === 'Débito' 
      ? source.balance - amount 
      : source.balance + amount;

    const movementWithBalance: Movement = {
      ...movement,
      resultBalance: newBalance
    };

    const id = await db.movements.add(movementWithBalance);
    await db.sources.update(source.id!, { balance: newBalance });
    
    return id;
  });
}

export async function deleteMovement(id: number) {
  return db.transaction('rw', db.movements, db.sources, async () => {
    const movement = await db.movements.get(id);
    if (!movement) return;

    const source = await db.sources.get(movement.sourceId);
    if (source) {
      const restoredBalance = movement.type === 'Débito'
        ? source.balance + movement.amount
        : source.balance - movement.amount;
      await db.sources.update(source.id!, { balance: restoredBalance });
    }

    await db.movements.delete(id);
  });
}

import { db } from './db';
import { isDebitMovement } from './labels';
import { Movement } from './types';

type MovementInput = Omit<Movement, 'id' | 'resultBalance'>;

async function ensureMovementReferences(movement: MovementInput) {
  const [category, source, service] = await Promise.all([
    db.categories.get(movement.categoryId),
    db.sources.get(movement.sourceId),
    movement.serviceId ? db.services.get(movement.serviceId) : Promise.resolve(undefined),
  ]);

  if (!category) {
    throw new Error('La categoría seleccionada ya no existe.');
  }

  if (!source) {
    throw new Error('La fuente de pago seleccionada ya no existe.');
  }

  if (movement.serviceId && !service) {
    throw new Error('El servicio seleccionado ya no existe.');
  }

  return { source };
}

export async function addMovement(movement: MovementInput) {
  return db.transaction('rw', db.movements, db.sources, async () => {
    const { source } = await ensureMovementReferences(movement);

    const newBalance = isDebitMovement(movement.type)
      ? source.balance - movement.amount
      : source.balance + movement.amount;

    const movementWithBalance: Movement = {
      ...movement,
      resultBalance: newBalance,
    };

    const id = await db.movements.add(movementWithBalance);
    await db.sources.update(source.id!, { balance: newBalance });

    return id;
  });
}

export async function updateMovement(id: number, movement: MovementInput) {
  return db.transaction('rw', db.movements, db.sources, async () => {
    const existingMovement = await db.movements.get(id);
    if (!existingMovement) {
      throw new Error('El movimiento que intentas editar ya no existe.');
    }

    const { source: targetSource } = await ensureMovementReferences(movement);
    const originalSource = await db.sources.get(existingMovement.sourceId);

    if (!originalSource) {
      throw new Error('La fuente original del movimiento ya no existe.');
    }

    const restoredOriginalBalance = isDebitMovement(existingMovement.type)
      ? originalSource.balance + existingMovement.amount
      : originalSource.balance - existingMovement.amount;

    if (existingMovement.sourceId === movement.sourceId) {
      const newBalance = isDebitMovement(movement.type)
        ? restoredOriginalBalance - movement.amount
        : restoredOriginalBalance + movement.amount;

      await db.sources.update(targetSource.id!, { balance: newBalance });
      await db.movements.update(id, {
        ...movement,
        resultBalance: newBalance,
      });
      return;
    }

    const newBalance = isDebitMovement(movement.type)
      ? targetSource.balance - movement.amount
      : targetSource.balance + movement.amount;

    await db.sources.update(originalSource.id!, { balance: restoredOriginalBalance });
    await db.sources.update(targetSource.id!, { balance: newBalance });
    await db.movements.update(id, {
      ...movement,
      resultBalance: newBalance,
    });
  });
}

export async function deleteMovement(id: number) {
  return db.transaction('rw', db.movements, db.sources, async () => {
    const movement = await db.movements.get(id);
    if (!movement) return;

    const source = await db.sources.get(movement.sourceId);
    if (source) {
      const restoredBalance = isDebitMovement(movement.type)
        ? source.balance + movement.amount
        : source.balance - movement.amount;
      await db.sources.update(source.id!, { balance: restoredBalance });
    }

    await db.movements.delete(id);
  });
}

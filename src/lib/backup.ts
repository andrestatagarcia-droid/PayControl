import { db } from './db';

export async function exportToJSON() {
  const data = {
    categories: await db.categories.toArray(),
    sources: await db.sources.toArray(),
    services: await db.services.toArray(),
    movements: await db.movements.toArray(),
    version: 1,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paycontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromJSON(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Use a transaction for safety
        await db.transaction('rw', [db.categories, db.sources, db.services, db.movements], async () => {
          // Clear current data (optional but cleaner for a restore)
          await db.categories.clear();
          await db.sources.clear();
          await db.services.clear();
          await db.movements.clear();

          // Restore data
          if (data.categories) await db.categories.bulkAdd(data.categories);
          if (data.sources) await db.sources.bulkAdd(data.sources);
          if (data.services) await db.services.bulkAdd(data.services);
          if (data.movements) await db.movements.bulkAdd(data.movements);
        });
        
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
}

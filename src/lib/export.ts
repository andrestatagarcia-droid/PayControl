import * as XLSX from 'xlsx';
import { Movement, Category, PaymentSource, Service } from './types';

export function exportMovementsToExcel(
  movements: Movement[], 
  categories: Category[], 
  sources: PaymentSource[], 
  services: Service[]
) {
  const data = movements.map(m => {
    const cat = categories.find(c => c.id === m.categoryId);
    const src = sources.find(s => s.id === m.sourceId);
    const svc = services.find(s => s.id === m.serviceId);
    
    return {
      'Fecha': m.date,
      'Empresa/Servicio': svc?.company || m.reference,
      'Tipo de Servicio': svc?.serviceType || 'Manual',
      'Referencia': m.reference,
      'Categoría': cat?.name || 'N/A',
      'Tipo Pago': m.type,
      'Monto': m.amount,
      'Fuente de Pago': src?.name || 'N/A',
      'Saldo Resultante': m.resultBalance
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

  // Generate and download
  XLSX.writeFile(workbook, `PayControl_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

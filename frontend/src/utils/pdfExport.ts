import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Employee } from '../types/inventory';
import { formatDate } from './helpers';

export function exportInventoryToPDF(employees: Employee[]) {
  // Create a new PDF document in landscape mode
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a3', // Use A3 for wider tables
  });

  doc.setFontSize(18);
  doc.text('Hardware Inventory Report', 40, 40);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, 60);

  // Define the columns based on the requested inventory fields
  const head = [[
    'Department', 'Email', 'Username', 'Omada Name',
    'Hostname', 'MAC Address', 'DHCP?', 'Current IP', 'Port Number',
    'CPU Manufacturer', 'CPU Model', 'Cores',
    'RAM SN', 'RAM Model', 'Speed', 'Total Memory',
    'Storage SN', 'Storage Type', 'Capacity',
    'GPU Serial', 'GPU Manufacturer', 'GPU Model', 'GPU RAM',
    'Case', 'Motherboard SN', 'BIOS SN', 'OS Version',
    'Keyboard', 'Keyboard SN', 'Mouse', 'Mouse SN', 'Monitor', 'Monitor SN',
    'Date (as of)'
  ]];

  const body = employees.map((emp) => {
    // Helper to join multiple arrays
    const ramSN = emp.ram.map(r => r.serialNumber).join('\n');
    const ramModel = emp.ram.map(r => r.model).join('\n');
    const ramSpeed = emp.ram.map(r => r.speed).join('\n');
    const ramTotal = emp.ram.map(r => r.totalMemory).join('\n');

    const storageSN = emp.storage.map(s => s.serialNumber).join('\n');
    const storageType = emp.storage.map(s => s.type).join('\n');
    const storageCap = emp.storage.map(s => s.capacity).join('\n');

    const gpuSerial = emp.gpu.map(g => g.serial).join('\n');
    const gpuManuf = emp.gpu.map(g => g.manufacturer).join('\n');
    const gpuModel = emp.gpu.map(g => g.model).join('\n');
    const gpuRam = emp.gpu.map(g => g.ram).join('\n');

    return [
      emp.department,
      emp.email ?? '',
      emp.username,
      emp.omadaUsername,
      emp.network.hostname,
      emp.network.macAddress,
      emp.network.dhcp ? 'Yes' : 'Static',
      emp.network.currentIp,
      emp.network.portNumber,
      
      emp.cpu.manufacturer,
      emp.cpu.model,
      emp.cpu.cores.toString(),
      
      ramSN,
      ramModel,
      ramSpeed,
      ramTotal,
      
      storageSN,
      storageType,
      storageCap,
      
      gpuSerial,
      gpuManuf,
      gpuModel,
      gpuRam,
      
      emp.system.chassisName,
      emp.system.motherboardSn,
      emp.system.biosSerialNumber,
      emp.system.osVersion,
      
      emp.peripherals.keyboardBrand,
      emp.peripherals.keyboardSerialNumber,
      emp.peripherals.mouseBrand,
      emp.peripherals.mouseSerialNumber,
      emp.peripherals.monitor,
      emp.peripherals.monitorSerialNumber,
      
      formatDate(emp.dateAsOf)
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 52, 96], // matches var(--bg-header) deep blue
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      // You can specify column widths here if needed, but autoTable does a decent job usually on A3
    }
  });

  // Save the PDF
  doc.save('Hardware_Inventory_Report.pdf');
}

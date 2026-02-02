import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  accessor: string;
  format?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
}

// Helper to get value from nested object
const getValue = (obj: Record<string, any>, accessor: string): any => {
  return accessor.split('.').reduce((acc, key) => acc?.[key], obj);
};

// Export to PDF
export const exportToPDF = (options: ExportOptions) => {
  const { filename, title, subtitle, columns, data } = options;
  const doc = new jsPDF();

  // Add title
  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 20);
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, 14, 28);
  }

  // Add timestamp
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, title ? 35 : 20);

  // Prepare table data
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(row =>
    columns.map(col => {
      const value = getValue(row, col.accessor);
      return col.format ? col.format(value) : String(value ?? '');
    })
  );

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: title ? 42 : 28,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250],
    },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`${filename}.pdf`);
};

// Export to Excel
export const exportToExcel = (options: ExportOptions) => {
  const { filename, title, columns, data } = options;

  // Prepare data
  const worksheetData = data.map(row => {
    const obj: Record<string, any> = {};
    columns.forEach(col => {
      const value = getValue(row, col.accessor);
      obj[col.header] = col.format ? col.format(value) : value;
    });
    return obj;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths
  const colWidths = columns.map(col => ({ wch: Math.max(col.header.length + 5, 15) }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, title || 'Data');

  // Generate and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
};

// Export to CSV
export const exportToCSV = (options: ExportOptions) => {
  const { filename, columns, data } = options;

  // Prepare CSV content
  const headers = columns.map(col => `"${col.header}"`).join(',');
  const rows = data.map(row =>
    columns
      .map(col => {
        const value = getValue(row, col.accessor);
        const formatted = col.format ? col.format(value) : String(value ?? '');
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// Format date for export
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

// Format currency for export
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for export
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return `${value.toFixed(1)}%`;
};

// Generic export function with format selection
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export const exportData = (format: ExportFormat, options: ExportOptions) => {
  switch (format) {
    case 'pdf':
      exportToPDF(options);
      break;
    case 'excel':
      exportToExcel(options);
      break;
    case 'csv':
      exportToCSV(options);
      break;
  }
};

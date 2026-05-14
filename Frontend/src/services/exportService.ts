import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

applyPlugin(jsPDF);

interface ExportOptions {
  filename: string;
  title: string;
  headers: string[];
  data: (string | number)[][];
  dateRange?: { from: string; to: string };
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

declare module 'jspdf-autotable' {
  export function applyPlugin(jsPDF: any): void;
}

const csvCell = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const downloadTextFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportService = {
  exportToExcel: ({ filename, title, headers, data, dateRange }: ExportOptions) => {
    try {
      const dateStr = dateRange ? `_${dateRange.from}_to_${dateRange.to}` : '';
      const rows = [[title], [], headers, ...data].map((row) => row.map(csvCell).join(','));
      downloadTextFile(`${filename}${dateStr}.csv`, rows.join('\n'), 'text/csv;charset=utf-8');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  },

  exportToPDF: ({ filename, title, headers, data, dateRange }: ExportOptions) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      if (typeof doc.autoTable !== 'function') {
        throw new Error('AutoTable plugin is not registered on jsPDF');
      }
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add title
      doc.setFontSize(16);
      doc.text(title, pageWidth / 2, 10, { align: 'center' });

      // Add date range if provided
      if (dateRange) {
        doc.setFontSize(10);
        doc.text(`Date Range: ${dateRange.from} to ${dateRange.to}`, pageWidth / 2, 18, { align: 'center' });
      }

      // Add table using autoTable
      doc.autoTable({
        head: [headers],
        body: data,
        startY: dateRange ? 25 : 20,
        theme: 'grid',
        headerStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: 50
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 }
        },
        margin: 10,
        didDrawPage: (data: any) => {
          // Footer with page number
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          doc.setFontSize(9);
          doc.text(`Page ${data.pageCount}`, pageWidth - 20, pageHeight - 10);
        }
      });

      const dateStr = dateRange ? `_${dateRange.from}_to_${dateRange.to}` : '';
      doc.save(`${filename}${dateStr}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }
};

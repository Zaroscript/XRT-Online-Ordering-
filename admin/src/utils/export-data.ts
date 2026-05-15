import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  fileName: string;
  columns: ExportColumn[];
  data: any[];
  title?: string;
}

export interface ExportSheet {
  sheetName: string;
  title: string;
  columns: ExportColumn[];
  data: any[];
}

export interface MultiSheetExportOptions {
  fileName: string;
  sheets: ExportSheet[];
}

export const exportToExcel = async ({ fileName, columns, data, title }: ExportOptions) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Analytics Data');

  // Add Title
  if (title) {
    sheet.mergeCells('A1', String.fromCharCode(65 + columns.length - 1) + '1');
    const titleRow = sheet.getCell('A1');
    titleRow.value = title;
    titleRow.font = { name: 'Inter', family: 4, size: 16, bold: true };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getRow(1).height = 30;
    sheet.addRow([]); // empty row
  }

  // Add Headers
  const headerRow = sheet.addRow(columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF009F7F' }, // Accent color
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  sheet.columns = columns.map(c => ({ width: c.width || 20 }));

  // Add Data
  data.forEach((row) => {
    const rowValues = columns.map((c) => row[c.key]);
    const addedRow = sheet.addRow(rowValues);
    addedRow.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };
      
      // format as currency if number
      if (typeof cell.value === 'number') {
        cell.numFmt = '"$"#,##0.00';
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToExcelMultiSheet = async ({ fileName, sheets }: MultiSheetExportOptions) => {
  const workbook = new ExcelJS.Workbook();

  for (const { sheetName, title, columns, data } of sheets) {
    const sheet = workbook.addWorksheet(sheetName);

    // Title row
    sheet.mergeCells('A1', String.fromCharCode(65 + columns.length - 1) + '1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Inter', family: 4, size: 13, bold: true, color: { argb: 'FF111827' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    sheet.getRow(1).height = 28;
    sheet.addRow([]); // spacer

    // Header row
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF009F7F' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    sheet.columns = columns.map((c) => ({ width: c.width || 20 }));

    // Data rows
    data.forEach((row) => {
      const added = sheet.addRow(columns.map((c) => row[c.key]));
      added.eachCell((cell, col) => {
        cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
        if (typeof cell.value === 'number') cell.numFmt = '"$"#,##0.00';
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = ({ fileName, columns, data, title }: ExportOptions) => {
  const doc = new jsPDF();
  
  if (title) {
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(title, 14, 22);
  }

  const tableColumn = columns.map((col) => col.header);
  const tableRows = data.map((row) => columns.map((col) => {
    const val = row[col.key];
    return typeof val === 'number' ? `$${val.toFixed(2)}` : val;
  }));

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: title ? 30 : 14,
    theme: 'grid',
    headStyles: { fillColor: [0, 159, 127] }, // Accent color RGB(0, 159, 127) #009F7F
    styles: { fontSize: 10, cellPadding: 3, font: 'helvetica' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });

  doc.save(`${fileName}_${dayjs().format('YYYY-MM-DD')}.pdf`);
};

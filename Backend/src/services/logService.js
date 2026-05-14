const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const logRepository = require('../repositories/logRepository');
const { getPagination, paginationMeta } = require('../utils/pagination');

const listLogs = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const [items, total] = await logRepository.list({
    skip,
    take,
    status: query.status,
    employeeId: query.employeeId,
    assetId: query.assetId,
    from: query.from,
    to: query.to
  });
  return { items, meta: paginationMeta(page, limit, total) };
};

const logsByEmployee = (id) => logRepository.byEmployee(id);
const logsByAsset = (id) => logRepository.byAsset(id);

const exportLogsExcel = async (logs) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Movement Logs');
  sheet.columns = [
    { header: 'Asset ID', key: 'assetId', width: 18 },
    { header: 'Employee', key: 'employee', width: 24 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Exit Time', key: 'exitTime', width: 24 },
    { header: 'Entry Time', key: 'entryTime', width: 24 },
    { header: 'Total Hours', key: 'totalHours', width: 14 }
  ];
  logs.forEach((log) => sheet.addRow({
    assetId: log.asset?.assetId,
    employee: log.employee?.name,
    status: log.status,
    exitTime: log.exitTime,
    entryTime: log.entryTime,
    totalHours: log.totalHours
  }));
  return workbook.xlsx.writeBuffer();
};

const exportLogsPdf = (logs) => new Promise((resolve) => {
  const doc = new PDFDocument({ margin: 36 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.fontSize(18).text('Asset Movement Logs', { underline: true });
  doc.moveDown();
  logs.forEach((log) => {
    doc.fontSize(10).text(`${log.asset?.assetId || ''} | ${log.employee?.name || ''} | ${log.status} | ${log.exitTime || ''} | ${log.entryTime || ''}`);
  });
  doc.end();
});

module.exports = { listLogs, logsByEmployee, logsByAsset, exportLogsExcel, exportLogsPdf };

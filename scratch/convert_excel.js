import xlsx from 'xlsx';
import fs from 'fs';

const excelPath = 'd:/ProgramFiles/GitHub-Firebase-Antigravity/2026-07 Paridad Arancel Dialitico/directivas/vision/Serie Historica - parámetros VAAD y Paridad.xlsx';
const jsonOutputPath = 'd:/ProgramFiles/GitHub-Firebase-Antigravity/2026-07 Paridad Arancel Dialitico/app/src/data/seriesData.json';

const wb = xlsx.readFile(excelPath);
const data = xlsx.utils.sheet_to_json(wb.Sheets['Hoja1']);

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function excelDateToYYYYMM(excelDate) {
  if (typeof excelDate === 'number') {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  return String(excelDate);
}

function excelDateToLabel(excelDate) {
  if (typeof excelDate === 'number') {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    const year = jsDate.getUTCFullYear();
    const monthIndex = jsDate.getUTCMonth();
    return `${monthNames[monthIndex]} ${year}`;
  }
  return String(excelDate);
}

const seriesDataFormatted = [];

data.forEach(row => {
  const ym = excelDateToYYYYMM(row.Mes);
  const label = excelDateToLabel(row.Mes);
  
  if (ym >= '2020-12') {
    const valorHD = Number(row[' ValorSesionHD ']) || 0;
    const valorHDF = Number(row[' ValorSesionHDF ']) || 0;
    const valorDP = Number(row[' ValorMóduloDP ']) || 0;
    const resolucion = String(row[' Resolucion '] || '').trim();
    const ipc = Number(row[' IPC ']) || 0;
    const usd = Number(row[' USD ']) || 0;
    const cct = Number(row[' CCT ']) || 0;

    seriesDataFormatted.push({
      periodo: ym,
      label: label,
      resolucion: resolucion,
      valorSesionHD: valorHD,
      valorSesionHDF: valorHDF,
      valorModuloDP: valorDP,
      ipc: ipc,
      usd: usd,
      cct: cct
    });
  }
});

fs.writeFileSync(jsonOutputPath, JSON.stringify(seriesDataFormatted, null, 2), 'utf8');
console.log(`Successfully converted ${seriesDataFormatted.length} rows from 2020-12 onwards.`);
console.log('Sample first entry:', seriesDataFormatted[0]);
console.log('Sample last entry:', seriesDataFormatted[seriesDataFormatted.length - 1]);

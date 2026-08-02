import xlsx from 'xlsx';

const file = 'd:/ProgramFiles/GitHub-Firebase-Antigravity/2026-07 Paridad Arancel Dialitico/directivas/vision/Serie Historica - parámetros VAAD y Paridad.xlsx';

const wb = xlsx.readFile(file);
const data = xlsx.utils.sheet_to_json(wb.Sheets['Hoja1']);

// Convert Excel Serial Date to YYYY-MM
function excelDateToYYYYMM(excelDate) {
  if (typeof excelDate === 'number') {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    const year = jsDate.getUTCFullYear();
    const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  return String(excelDate);
}

// Convert Excel Serial Date to Spanish Label
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function excelDateToLabel(excelDate) {
  if (typeof excelDate === 'number') {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    const year = jsDate.getUTCFullYear();
    const monthIndex = jsDate.getUTCMonth();
    return `${monthNames[monthIndex]} ${year}`;
  }
  return String(excelDate);
}

data.forEach((row, index) => {
  const ym = excelDateToYYYYMM(row.Mes);
  const label = excelDateToLabel(row.Mes);
  if (ym >= '2020-12') {
    console.log(`Index ${index} | YM: ${ym} | Label: ${label} | HD: ${row[' ValorSesionHD ']} | HDF: ${row[' ValorSesionHDF ']} | DP: ${row[' ValorMóduloDP ']} | Res: ${row[' Resolucion ']}`);
  }
});

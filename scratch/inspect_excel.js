import xlsx from 'xlsx';
import path from 'path';

const file = 'd:/ProgramFiles/GitHub-Firebase-Antigravity/2026-07 Paridad Arancel Dialitico/directivas/vision/Serie Historica - parámetros VAAD y Paridad.xlsx';

const wb = xlsx.readFile(file);
console.log('Sheet Names:', wb.SheetNames);

wb.SheetNames.forEach(sheetName => {
  console.log('=== SHEET:', sheetName);
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
  console.log('Total Rows:', data.length);
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
    console.log('First Row:', JSON.stringify(data[0], null, 2));
    console.log('Last Row:', JSON.stringify(data[data.length - 1], null, 2));
  }
});

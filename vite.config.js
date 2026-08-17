import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper para convertir la fecha serial de Excel a JS Date
function excelSerialToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  // Ajustamos sumando 1 día para neutralizar el desfase de año bisiesto 1900 y de zona horaria
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate() + 1);
}

// Plugin local para procesar el Excel y guardarlo como JSON
function updateSeriesPlugin() {
  return {
    name: 'update-series-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/update-series-data') {
          try {
            const excelPath = path.resolve(__dirname, 'src/data/seriesData.xlsx')
            const jsonPath = path.resolve(__dirname, 'src/data/seriesData.json')

            if (!fs.existsSync(excelPath)) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Archivo Excel no encontrado en src/data/seriesData.xlsx' }))
              return
            }

            // Leer el archivo Excel
            const workbook = XLSX.readFile(excelPath)
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            // Convertir a JSON
            const rawData = XLSX.utils.sheet_to_json(sheet)

            // Nombres de meses para el label
            const nombresMeses = [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ]

            // Procesar y validar cada registro
            const formattedData = rawData.map(row => {
              // Limpiar espacios en las cabeceras de cada celda de la fila
              const cleanRow = {}
              Object.keys(row).forEach(k => {
                cleanRow[k.trim()] = row[k]
              })

              const resVal = cleanRow['Resolucion']
              // Regla obligatoria: Si no tiene resolución, se ignora por no ser oficial
              if (!resVal || String(resVal).trim() === '') {
                return null
              }

              // Traducir fecha serial de Excel
              const serial = cleanRow['Mes']
              if (!serial || isNaN(Number(serial))) {
                return null
              }

              const jsdate = excelSerialToJSDate(Number(serial))
              const year = jsdate.getFullYear()
              const month = jsdate.getMonth()

              const label = `${nombresMeses[month]} ${year}`
              const periodo = `${year}-${String(month + 1).padStart(2, '0')}`

              const pctCalidad = cleanRow['PorceCalidad'] !== undefined ? Number(cleanRow['PorceCalidad']) : 0

              return {
                periodo,
                label,
                resolucion: String(resVal).trim(),
                valorSesionHD: Number(cleanRow['ValorSesionHD']) || 0,
                valorSesionHDF: Number(cleanRow['ValorSesionHDF']) || 0,
                valorModuloDP: Number(cleanRow['ValorMóduloDP']) || 0,
                ipc: Number(cleanRow['IPC']) || 0,
                usd: Number(cleanRow['USD']) || 0,
                cct: Number(cleanRow['CCT']) || 0,
                porcentajeCalidad: pctCalidad
              }
            }).filter(Boolean) // Filtrar nulos

            // Guardar ordenados cronológicamente
            formattedData.sort((a, b) => a.periodo.localeCompare(b.periodo))

            // Escribir en disco
            fs.writeFileSync(jsonPath, JSON.stringify(formattedData, null, 2), 'utf-8')

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, count: formattedData.length }))
          } catch (err) {
            console.error('Error al actualizar la serie de datos:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Error procesando el Excel: ' + err.message }))
          }
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    updateSeriesPlugin()
  ],
  build: {
    sourcemap: false,
  },
})

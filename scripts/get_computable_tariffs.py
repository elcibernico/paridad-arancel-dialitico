import json
import os

# Cargar los datos
json_path = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico\app\src\data\seriesData.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Filtrar el rango de Enero 2024 a Julio 2026
start_period = "2024-01"
end_period = "2026-07"

filtered_data = [d for d in data if start_period <= d["periodo"] <= end_period]

print(f"Total meses filtrados: {len(filtered_data)}")

# Calcular aranceles con calidad y armar tabla
print("| Período | Resolución | Arancel Base | Calidad (%) | Arancel Computable (con Calidad) |")
print("| :--- | :--- | :--- | :--- | :--- |")

sum_y = 0.0

for row in filtered_data:
    periodo = row["periodo"]
    label = row["label"]
    resolucion = row["resolucion"]
    base_val = row["valorSesionHD"]
    pct_calidad = row.get("porcentajeCalidad", 0)
    
    # Inyección de calidad (aplicarCalidad = True)
    factor = 1.0 + pct_calidad
    computable_val = base_val * factor
    sum_y += computable_val
    
    print(f"| {label} ({periodo}) | {resolucion} | ${base_val:,.2f} | {pct_calidad*100:.2f}% | ${computable_val:,.2f} |")

avg_y = sum_y / len(filtered_data)
print(f"\nPromedio Calculado de Arancel Computable con Calidad: ${avg_y:,.2f}")
print(f"Promedio Esperado por el usuario: $157.565")

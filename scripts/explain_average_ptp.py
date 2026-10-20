import json

json_path = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico\app\src\data\seriesData.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Base de Diciembre 2020 (App)
base_ref = data[0]

# Rango Enero 2024 a Julio 2026
start_period = "2024-01"
end_period = "2026-07"
filtered_data = [d for d in data if start_period <= d["periodo"] <= end_period]

print("### PASO A PASO DEL CÁLCULO DE LA APP (Base: Diciembre 2020 = $5.992,28)")
print("| Mes | CCT_m / CCT_0 | USD_m / USD_0 | IPC_m / IPC_0 | IP_m (Polinómico) | Calidad | V^P_m (App) |")
print("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |")

sum_vp = 0.0
for row in filtered_data:
    periodo = row["periodo"]
    label = row["label"]
    
    # Índices respecto a Dic 2020
    indCCT = row["cct"] / base_ref["cct"]
    indUSD = row["usd"] / base_ref["usd"]
    indIPC = row["ipc"] / base_ref["ipc"]
    
    # Coeficiente polinómico (40% CCT, 30% USD, 30% IPC)
    IP_m = (0.40 * indCCT) + (0.30 * indUSD) + (0.30 * indIPC)
    
    # Factor de Calidad (52% o 0%)
    pct_calidad = row.get("porcentajeCalidad", 0)
    factor_calidad = 1.52 if pct_calidad > 0 else 1.0
    
    # V^P_m
    VP_m = base_ref["valorSesionHD"] * IP_m * factor_calidad
    sum_vp += VP_m
    
    print(f"| {label} | {indCCT:.4f} | {indUSD:.4f} | {indIPC:.4f} | {IP_m:.4f} | {pct_calidad*100:.1f}% | ${VP_m:,.2f} |")

avg_vp = sum_vp / len(filtered_data)
print(f"\nSuma Total de la Polinómica en los 31 meses: ${sum_vp:,.2f}")
print(f"Promedio de Paridad Polinómico de Referencia (App): ${avg_vp:,.2f}")

import json

json_path = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico\app\src\data\seriesData.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Base period (Dec 2020)
base_ref = data[0]
print(f"Base Period (T0): {base_ref['label']} ({base_ref['periodo']})")
print(f"Base Tariff (Y0) for HD: ${base_ref['valorSesionHD']:.2f}")
print(f"Base CCT: {base_ref['cct']}")
print(f"Base USD: {base_ref['usd']}")
print(f"Base IPC: {base_ref['ipc']}")

# Filter Enero 2024 to Julio 2026
start_period = "2024-01"
end_period = "2026-07"
filtered_data = [d for d in data if start_period <= d["periodo"] <= end_period]

sum_vp = 0.0
for d in filtered_data:
    indCCT = d["cct"] / base_ref["cct"]
    indUSD = d["usd"] / base_ref["usd"]
    indIPC = d["ipc"] / base_ref["ipc"]
    
    # weights in Point 9
    IP_m = (0.40 * indCCT) + (0.30 * indUSD) + (0.30 * indIPC)
    
    # Quality factor
    pct_calidad = d.get("porcentajeCalidad", 0)
    factor_calidad = 1.52 if pct_calidad > 0 else 1.0  # en el context aplicarCalidad es True
    
    # VP_m
    VP_m = base_ref["valorSesionHD"] * IP_m * factor_calidad
    sum_vp += VP_m

avg_vp = sum_vp / len(filtered_data)
print(f"\nAverage Polinomic Cost (VP) computed: ${avg_vp:,.2f}")

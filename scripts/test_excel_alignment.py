import json

json_path = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico\app\src\data\seriesData.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Buscar los datos de la base de indexación (Enero 2024)
base_period = "2024-01"
base_ref = next(d for d in data if d["periodo"] == base_period)

print(f"Base Period (T0): {base_ref['label']} ({base_ref['periodo']})")
print(f"Base CCT: {base_ref['cct']}")
print(f"Base USD: {base_ref['usd']}")
print(f"Base IPC: {base_ref['ipc']}")

# Arancel de partida (con calidad del 52% inyectada)
base_val_crudo = base_ref["valorSesionHD"]
pct_calidad_base = base_ref.get("porcentajeCalidad", 0)
base_val_computable = base_val_crudo * (1.0 + pct_calidad_base)
print(f"Base Tariff (Y0) computable: ${base_val_computable:.8f}")

# Rango Enero 2024 a Julio 2026
start_period = "2024-01"
end_period = "2026-07"
filtered_data = [d for d in data if start_period <= d["periodo"] <= end_period]

sum_vp = 0.0
for d in filtered_data:
    indCCT = d["cct"] / base_ref["cct"]
    indUSD = d["usd"] / base_ref["usd"]
    indIPC = d["ipc"] / base_ref["ipc"]
    
    # weights in Point 9 (40% CCT, 30% USD, 30% IPC)
    IP_m = (0.40 * indCCT) + (0.30 * indUSD) + (0.30 * indIPC)
    
    # VP_m = Y_base * IP_m (sin reajuste dinámico adicional de calidad)
    VP_m = base_val_computable * IP_m
    sum_vp += VP_m
    
    # Imprimir algunos meses clave para depuración
    if d["periodo"] in ["2024-01", "2024-02", "2026-07"]:
        print(f"  {d['label']}: IP_m={IP_m:.8f}, VP_m=${VP_m:.8f}")

avg_vp = sum_vp / len(filtered_data)
print(f"\nAverage Polinomic Cost (VP) computed: {avg_vp:.8f}")
print(f"Expected by user: 271925.2474")

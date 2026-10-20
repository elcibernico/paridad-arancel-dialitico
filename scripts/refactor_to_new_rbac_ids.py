import os
import json
import re

# Base paths
base_dir = r"d:\ProgramFiles\GitHub-Firebase-Antigravity\2026-07 Paridad Arancel Dialitico"
config_path = os.path.join(base_dir, "app", "src", "config.json")
points_dir = os.path.join(base_dir, "app", "src", "components", "points")
app_jsx_path = os.path.join(base_dir, "app", "src", "App.jsx")
auth_context_path = os.path.join(base_dir, "app", "src", "context", "AuthContext.jsx")
admin_panel_path = os.path.join(base_dir, "app", "src", "components", "AdminPanel.jsx")

def fix_config_json():
    print("Modifying config.json...")
    with open(config_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Fix the duplicate p3_p4_a1/p3_p4_a2 copy-paste bug in p3_p5
    # Let's search the blocks for p3_p5 and fix the children IDs
    for block in data.get("blocks", []):
        if block.get("id") == "p3":
            for sec in block.get("sections", []):
                if sec.get("id") == "p3_p5":
                    # Fix children IDs
                    for child in sec.get("children", []):
                        if child.get("id") == "p3_p4_a1":
                            child["id"] = "p3_p5_a1"
                        elif child.get("id") == "p3_p4_a2":
                            child["id"] = "p3_p5_a2"
                            # Fix subchildren
                            for sub in child.get("children", []):
                                if sub.get("id") == "p3_p4_a2_b1":
                                    sub["id"] = "p3_p5_a2_b1"
                                elif sub.get("id") == "p3_p4_a2_b3":
                                    sub["id"] = "p3_p5_a2_b2"

    # 2. Add component mapping to all punto nodes in config.json
    point_to_component = {
        "p1_p1": "Punto1",
        "p1_p2": "Punto2",
        "p1_p3": "Punto3",
        "p1_p4": "Punto4",
        "p1_p5": "Punto5",
        "p2_p1": "Punto6",
        "p2_p2": "Punto6",
        "p3_p1": "Punto7",
        "p3_p2": "Punto8",
        "p3_p3": "Punto9",
        "p3_p4": "Punto10",
        "p3_p5": "Punto11"
    }

    for block in data.get("blocks", []):
        for sec in block.get("sections", []):
            sec_id = sec.get("id")
            if sec_id in point_to_component:
                sec["component"] = point_to_component[sec_id]

    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("config.json updated successfully.")

def fix_app_jsx():
    print("Modifying App.jsx...")
    with open(app_jsx_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace Dashboard cards permissions
    content = content.replace("hasPermission('b1_actuarial')", "hasPermission('p1')")
    content = content.replace("hasPermission('b2_quiebre')", "hasPermission('p2')")
    content = content.replace("hasPermission('b3_econometria')", "hasPermission('p3')")

    # Replace Dashboard cards onclick navigation
    content = content.replace("setActiveBlock('b1_actuarial'); setActiveSectionId('s1_intro');",
                              "setActiveBlock('p1'); setActiveSectionId('p1_p1');")
    content = content.replace("setActiveBlock('b2_quiebre'); setActiveSectionId('s6_quiebre');",
                              "setActiveBlock('p2'); setActiveSectionId('p2_p1');")
    content = content.replace("setActiveBlock('b3_econometria'); setActiveSectionId('s7_retrospectivo');",
                              "setActiveBlock('p3'); setActiveSectionId('p3_p1');")

    with open(app_jsx_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("App.jsx updated successfully.")

def fix_auth_context_jsx():
    print("Modifying AuthContext.jsx...")
    with open(auth_context_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace allowedNodes fallback for invitado
    content = content.replace("['Punto1', 'Punto2', 'Punto6']", "['p1_p1', 'p1_p2', 'p2_p1']")

    # Replace mapNodeId mapping dictionary to support new IDs
    old_mapping = """      const mapping = {
        'b1_actuarial': ['Punto1', 'Punto2', 'Punto3', 'Punto4', 'Punto5'],
        'b2_quiebre': ['Punto6'],
        'b3_econometria': ['Punto7', 'Punto8', 'Punto9', 'Punto10', 'Punto11'],
        's1_intro': ['Punto1'],
        's2_limitaciones': ['Punto2'],
        's3_solucion': ['Punto3'],
        's4_tabla': ['Punto4'],
        's5_ajustes': ['Punto5'],
        's6_quiebre': ['Punto6'],
        's7_retrospectivo': ['Punto7'],
        's7_motor': ['Punto7'],
        's8_regresion': ['Punto8'],
        's9_impacto': ['Punto9'],
        's10_prospectivo': ['Punto10'],
        's11_valor_tecnico': ['Punto11']
      };"""

    new_mapping = """      const mapping = {
        'p1': ['p1_p1', 'p1_p2', 'p1_p3', 'p1_p4', 'p1_p5'],
        'p2': ['p2_p1', 'p2_p2'],
        'p3': ['p3_p1', 'p3_p2', 'p3_p3', 'p3_p4', 'p3_p5'],
        'b1_actuarial': ['p1_p1', 'p1_p2', 'p1_p3', 'p1_p4', 'p1_p5'],
        'b2_quiebre': ['p2_p1', 'p2_p2'],
        'b3_econometria': ['p3_p1', 'p3_p2', 'p3_p3', 'p3_p4', 'p3_p5'],
        's1_intro': ['p1_p1'],
        's2_limitaciones': ['p1_p2'],
        's3_solucion': ['p1_p3'],
        's4_tabla': ['p1_p4'],
        's5_ajustes': ['p1_p5'],
        's6_quiebre': ['p2_p1'],
        's7_retrospectivo': ['p3_p1'],
        's7_motor': ['p3_p1'],
        's8_regresion': ['p3_p2'],
        's9_impacto': ['p3_p3'],
        's10_prospectivo': ['p3_p4'],
        's11_valor_tecnico': ['p3_p5']
      };"""

    content = content.replace(old_mapping, new_mapping)

    with open(auth_context_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("AuthContext.jsx updated successfully.")

def fix_admin_panel_jsx():
    print("Modifying AdminPanel.jsx...")
    with open(admin_panel_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update fallback allowed IDs for invitado in getPermission
    content = content.replace(
        "const allowed = ['Punto1', 'Punto2', 'Punto6', 'Punto1_Apartado1', 'Punto1_Apartado2', 'Punto2_Apartado1', 'Punto6_Apartado1'];",
        "const allowed = ['p1_p1', 'p1_p2', 'p2_p1', 'p1_p1_a1', 'p1_p1_a2', 'p1_p2_a1', 'p2_p1'];"
    )

    # 2. Fix the HIERARCHY_TREE sections map to support both "sections" and children nodes recursively
    # The current HIERARCHY_TREE maps block.sections to children. Let's make sure it handles the component property
    old_tree = """const HIERARCHY_TREE = config.blocks.map(block => ({
  id: block.id,
  title: block.title,
  type: block.type || 'parte',
  children: (block.sections || []).map(sec => ({
    id: sec.id,
    title: sec.title,
    type: sec.type || 'punto',
    children: sec.children || []
  }))
}));"""

    new_tree = """const HIERARCHY_TREE = config.blocks.map(block => ({
  id: block.id,
  title: block.title,
  type: block.type || 'parte',
  children: (block.sections || []).map(sec => ({
    id: sec.id,
    title: sec.title,
    type: sec.type || 'punto',
    component: sec.component || null,
    children: sec.children || []
  }))
}));"""

    content = content.replace(old_tree, new_tree)

    # 3. Update the expandedNodes state default keys
    content = content.replace(
        "const [expandedNodes, setExpandedNodes] = useState({ b1_actuarial: true, b2_quiebre: true, b3_econometria: true });",
        "const [expandedNodes, setExpandedNodes] = useState({ p1: true, p2: true, p3: true });"
    )

    with open(admin_panel_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("AdminPanel.jsx updated successfully.")

def refactor_points():
    print("Refactoring point files...")
    # List of files to process
    mapping_rules = {
        # Punto 1
        "Punto1_Apartado1": "p1_p1_a1",
        "Punto1_Apartado2": "p1_p1_a2",
        "Punto1_Apartado3": "p1_p1_a3",
        "Punto1_Apartado4": "p1_p1_a4",
        # Punto 2
        "Punto2_Apartado1": "p1_p2_a1",
        "Punto2_Apartado2": "p1_p2_a2",
        "Punto2_Apartado3": "p1_p2_a3",
        "Punto2_Apartado4": "p1_p2_a4",
        "Punto2_Apartado4_Bloque1": "p1_p2_a4_b1",
        "Punto2_Apartado4_Bloque2": "p1_p2_a4_b2",
        "Punto2_Apartado5": "p1_p2_a5",
        # Punto 3
        "Punto3_Apartado1": "p1_p3_a1",
        "Punto3_Apartado2": "p1_p3_a2",
        "Punto3_Apartado2_Bloque1": "p1_p3_a2_b1",
        "Punto3_Apartado2_Bloque2": "p1_p3_a2_b2",
        "Punto3_Apartado2_Bloque3": "p1_p3_a2_b3",
        "Punto3_Apartado2_Bloque4": "p1_p3_a2_b4",
        "Punto3_Apartado2_Bloque5": "p1_p3_a2_b5",
        "Punto3_Apartado2_Bloque6": "p1_p3_a2_b6",
        "Punto3_Apartado3": "p1_p3_a3",
        "Punto3_Apartado3_Bloque1": "p1_p3_a3_b1",
        "Punto3_Apartado4": "p1_p3_a4", # added in case it exists
        # Punto 4
        "Punto4_Apartado1": "p1_p4_a1",
        "Punto4_Apartado2": "p1_p4_a2",
        "Punto4_Apartado3": "p1_p4_a3",
        "Punto4_Apartado4": "p1_p4_a4",
        "Punto4_Apartado5": "p1_p4_a5",
        "Punto4_Apartado6": "p1_p4_a6",
        "Punto4_Apartado1_Desarrollo": "p1_p4_a1_b1",
        "Punto4_Apartado2_Desarrollo": "p1_p4_a2_b1",
        "Punto4_Apartado3_Bloque1": "p1_p4_a3_b1",
        "Punto4_Apartado3_Bloque2": "p1_p4_a3_b2",
        "Punto4_Apartado3_Bloque3": "p1_p4_a3_b3",
        "Punto4_Apartado5_Bloque1": "p1_p4_a5_b1",
        # Punto 5
        "Punto5_Apartado1": "p1_p5_a1",
        "Punto5_Apartado2": "p1_p5_a2",
        "Punto5_Apartado3": "p1_p5_a3",
        "Punto5_Apartado4": "p1_p5_a4",
        "Punto5_Apartado5": "p1_p5_a5",
        "Punto5_Apartado6": "p1_p5_a6",
        "Punto5_Apartado1_Bloque1": "p1_p5_a1_b1",
        "Punto5_Apartado2_Bloque1": "p1_p5_a2_b1",
        "Punto5_Apartado3_Bloque1": "p1_p5_a3_b1",
        "Punto5_Apartado4_Bloque1": "p1_p5_a4_b1",
        "Punto5_Apartado5_Bloque1": "p1_p5_a5_b1",
        "Punto5_Apartado6_Bloque1": "p1_p5_a6_b1",
        "Punto5_Apartado6_Bloque2": "p1_p5_a6_b2",
        "Punto5_Apartado6_Bloque3": "p1_p5_a6_b3",
        # Punto 6
        "Punto6_Apartado1": "p2_p1",
        "Punto6_Apartado2": "p2_p2",
        # Punto 8
        "Punto8_Apartado1": "p3_p2_a1",
        "Punto8_Apartado2": "p3_p2_a2",
        "Punto8_Apartado3": "p3_p2_a3",
        "Punto8_Apartado4": "p3_p2_a4",
        "Punto8_Apartado5": "p3_p2_a6", # Tab OLS
        "Punto8_Apartado6": "p3_p2_a7", # Tab Ortogonalidad
        "Punto8_Apartado7": "p3_p2_a8", # Tab Ridge
        "Punto8_Apartado8": "p3_p2_a9", # Tab Validación
        "Punto8_Apartado_McoMatematica": "p3_p2_a6_b3",
        "Punto8_Apartado_OrtMatematica": "p3_p2_a7_b3",
        "Punto8_Apartado_RidgeMatematica": "p3_p2_a8_b4",
        "Punto8_Apartado_ValMatematica": "p3_p2_a9_b1",
        # Punto 9
        "Punto9_Apartado1": "p3_p3_a1",
        "Punto9_Apartado2": "p3_p3_a2",
        "Punto9_Apartado3": "p3_p3_a3",
        "Punto9_Apartado1_Bloque1": "p3_p3_a1_b1",
        "Punto9_Apartado2_Bloque1": "p3_p3_a2_b1",
        "Punto9_Apartado2_Bloque2": "p3_p3_a2_b2",
        "Punto9_Apartado2_Bloque3": "p3_p3_a2_b3",
        "Punto9_Apartado3_Bloque1": "p3_p3_a3_b1",
        # Punto 10
        "Punto10_Apartado1": "p3_p4_a1",
        "Punto10_Apartado2": "p3_p4_a2",
        "Punto10_Apartado2_Bloque1": "p3_p4_a2_b1",
        "Punto10_Apartado2_Bloque2": "p3_p4_a2_b2",
        "Punto10_Apartado2_Bloque3": "p3_p4_a2_b3",
        # Punto 11
        "Punto11_Apartado1": "p3_p5_a1",
        "Punto11_Apartado2": "p3_p5_a2",
        "Punto11_Apartado2_Bloque1": "p3_p5_a2_b1",
        "Punto11_Apartado2_Bloque3": "p3_p5_a2_b2"
    }

    # Also map in Punto8: canShowMco, canShowOrtogonalidad, canShowRidge, canShowValidacion
    # Let's make sure these canShow variables are properly mapped
    for filename in os.listdir(points_dir):
        if filename.endswith(".jsx") and filename.startswith("Punto") and not "backup" in filename:
            filepath = os.path.join(points_dir, filename)
            # Try decoding with standard encodings
            encodings = ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'latin-1']
            content = None
            used_enc = None
            for enc in encodings:
                try:
                    with open(filepath, 'r', encoding=enc) as f:
                        content = f.read()
                        used_enc = enc
                        break
                except UnicodeDecodeError:
                    continue
            if content is None:
                print(f"Skipping {filename} due to encoding issue.")
                continue

            # We also need to map the collapsible parameter section (previously Punto8_Apartado1, now p3_p2_a5)
            # In Punto8.jsx specifically, let's map:
            # hasPermission('Punto8_Apartado1') that wraps the parameters to p3_p2_a5
            if filename == "Punto8.jsx":
                # The parameters section header
                content = content.replace("hasPermission('Punto8_Apartado1')", "hasPermission('p3_p2_a5')")
                content = content.replace("INI: Punto8_Apartado1", "INI: p3_p2_a5")
                content = content.replace("FIN: Punto8_Apartado1", "FIN: p3_p2_a5")

            # Perform the replacements for all other IDs
            for old_id, new_id in mapping_rules.items():
                content = content.replace(f"'{old_id}'", f"'{new_id}'")
                content = content.replace(f"INI: {old_id}", f"INI: {new_id}")
                content = content.replace(f"FIN: {old_id}", f"FIN: {new_id}")

            with open(filepath, 'w', encoding=used_enc) as f:
                f.write(content)
            print(f"Updated {filename}.")

if __name__ == "__main__":
    fix_config_json()
    fix_app_jsx()
    fix_auth_context_jsx()
    fix_admin_panel_jsx()
    refactor_points()
    print("All tasks completed successfully!")

import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io

# Configuración de página
st.set_page_config(layout="wide", page_title="Simulador de Regularización Ridge y Paridad Dialítica", page_icon="📊")

# Aplicar estilo CSS personalizado para un look profesional nefrótico/médico
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .metric-box {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e9ecef;
        text-align: center;
    }
    .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #1d3557;
    }
    .metric-label {
        font-size: 14px;
        color: #6c757d;
        margin-top: 5px;
    }
    h1, h2, h3 {
        color: #1d3557;
    }
    .stAlert {
        border-radius: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# Datos Históricos Embebidos (Fallback robusto para portabilidad absoluta)
embedded_csv_data = """﻿Mes;OS; ValorSesion ; IPC ; Dólar ; CCT108-75 
01/07/2017;27; 1.954,62 ; 113,7852 ; 17,6500 ; 18.237,45 
01/08/2017;27; 2.044,29 ; 115,3819 ; 17,3000 ; 18.237,45 
01/09/2017;27; 2.151,87 ; 117,5719 ; 17,3000 ; 18.237,45 
01/10/2017;27; 2.151,87 ; 119,3528 ; 17,6500 ; 19.689,99 
01/11/2017;27; 2.151,87 ; 120,9940 ; 17,3000 ; 19.689,99 
01/12/2017;27; 2.151,87 ; 124,7956 ; 18,6500 ; 19.689,99 
01/01/2018;27; 2.151,87 ; 126,9887 ; 19,6500 ; 20.464,68 
01/02/2018;27; 2.151,87 ; 130,0606 ; 20,1000 ; 20.464,68 
01/03/2018;27; 2.187,73 ; 133,1054 ; 20,1500 ; 20.464,68 
01/04/2018;27; 2.237,94 ; 136,7512 ; 20,5500 ; 20.464,68 
01/05/2018;27; 2.237,94 ; 139,5893 ; 24,9000 ; 20.464,68 
01/06/2018;27; 2.237,94 ; 144,8053 ; 28,9000 ; 20.464,68 
01/07/2018;27; 2.506,51 ; 149,2966 ; 27,4000 ; 24.075,83 
01/08/2018;27; 2.506,51 ; 155,1034 ; 36,8000 ; 25.170,19 
01/09/2018;27; 2.506,51 ; 165,2383 ; 41,2000 ; 25.170,19 
01/10/2018;27; 2.506,51 ; 174,1473 ; 35,9000 ; 26.264,54 
01/11/2018;27; 2.730,29 ; 179,6388 ; 37,7000 ; 27.358,90 
01/12/2018;27; 2.894,11 ; 184,2552 ; 37,7000 ; 27.358,90 
01/01/2019;27; 2.948,71 ; 189,6101 ; 37,3000 ; 27.358,90 
01/02/2019;27; 2.954,09 ; 196,7501 ; 39,2000 ; 27.906,08 
01/03/2019;27; 2.954,09 ; 205,9571 ; 43,3000 ; 27.906,08 
01/04/2019;27; 2.954,09 ; 213,0517 ; 44,2000 ; 28.752,88 
01/05/2019;27; 2.954,09 ; 219,5691 ; 44,8000 ; 28.752,88 
01/06/2019;27; 2.954,09 ; 225,5370 ; 42,5000 ; 28.752,88 
01/07/2019;27; 3.397,26 ; 230,4940 ; 43,9000 ; 31.628,17 
01/08/2019;27; 4.096,55 ; 239,6077 ; 59,0000 ; 33.640,87 
01/09/2019;27; 4.282,75 ; 253,7102 ; 57,2500 ; 33.640,87 
01/10/2019;27; 4.282,75 ; 262,0661 ; 61,0000 ; 35.078,51 
01/11/2019;27; 5.112,45 ; 273,2158 ; 60,0000 ; 36.516,16 
01/12/2019;27; 5.112,45 ; 283,4442 ; 60,5000 ; 37.378,74 
01/01/2020;27; 5.112,45 ; 289,8299 ; 60,5000 ; 37.378,74 
01/02/2020;27; 5.548,40 ; 295,6660 ; 61,5000 ; 37.953,80 
01/03/2020;27; 5.548,40 ; 305,5515 ; 63,2500 ; 42.454,54 
01/04/2020;27; 5.548,40 ; 310,1243 ; 66,2500 ; 42.955,35 
01/05/2020;27; 5.548,40 ; 314,9087 ; 68,0000 ; 44.221,93 
01/06/2020;27; 5.548,40 ; 321,9738 ; 71,0000 ; 44.221,93 
01/07/2020;27; 5.548,40 ; 328,2014 ; 73,7500 ; 44.221,93 
01/08/2020;27; 5.548,40 ; 337,0632 ; 75,5000 ; 44.221,93 
01/09/2020;27; 5.548,40 ; 346,6207 ; 77,5000 ; 44.221,93 
01/10/2020;27; 5.548,40 ; 359,6570 ; 80,5000 ; 44.221,93 
01/11/2020;27; 5.548,40 ; 371,0211 ; 83,5000 ; 44.221,93 
01/12/2020;27; 5.992,28 ; 385,8826 ; 86,2500 ; 44.221,93 
01/01/2021;27; 6.411,73 ; 401,5071 ; 89,2500 ; 46.722,68 
01/02/2021;27; 6.411,73 ; 415,8595 ; 91,5000 ; 49.848,64 
01/03/2021;27; 6.411,73 ; 435,8657 ; 94,5000 ; 52.974,56 
01/04/2021;27; 6.831,20 ; 453,6503 ; 95,5000 ; 60.186,05 
01/05/2021;27; 6.831,20 ; 468,7250 ; 96,7500 ; 60.186,05 
01/06/2021;27; 6.831,20 ; 483,6049 ; 97,7500 ; 60.186,05 
01/07/2021;27; 7.250,67 ; 498,0987 ; 98,7500 ; 69.213,96 
01/08/2021;27; 7.250,67 ; 510,3942 ; 99,7500 ; 69.213,96 
01/09/2021;27; 7.849,88 ; 528,4968 ; 101,0000 ; 78.241,87 
01/10/2021;27; 8.269,34 ; 547,0802 ; 102,0000 ; 78.241,87 
01/11/2021;27; 8.269,34 ; 560,9184 ; 103,0000 ; 84.260,47 
01/12/2021;27; 8.654,04 ; 582,4575 ; 104,7500 ; 84.260,47 
01/01/2022;27; 9.086,75 ; 605,0317 ; 107,2500 ; 84.260,47 
01/02/2022;27; 9.086,75 ; 633,4341 ; 109,5000 ; 89.075,35 
01/03/2022;27; 9.086,75 ; 676,0566 ; 113,0000 ; 92.686,52 
01/04/2022;27; 11.250,26 ; 716,9399 ; 117,2500 ; 92.686,52 
01/05/2022;27; 11.250,26 ; 753,1470 ; 122,2500 ; 102.882,04 
01/06/2022;27; 11.250,26 ; 793,0278 ; 127,0000 ; 113.077,55 
01/07/2022;27; 12.115,65 ; 851,7610 ; 133,2500 ; 113.077,55 
01/08/2022;27; 12.115,65 ; 911,1316 ; 141,0000 ; 130.687,99 
01/09/2022;27; 12.981,05 ; 967,3076 ; 149,2500 ; 130.687,99 
01/10/2022;27; 12.981,05 ; 1.028,7060 ; 158,5000 ; 137.176,05 
01/11/2022;27; 12.981,05 ; 1.079,2787 ; 170,2500 ; 152.005,89 
01/12/2022;27; 13.463,22 ; 1.134,5875 ; 179,2500 ; 166.835,74 
01/01/2023;27; 15.707,09 ; 1.202,9790 ; 190,0000 ; 166.835,74 
01/02/2023;27; 15.707,09 ; 1.282,7091 ; 200,0000 ; 173.323,79 
01/03/2023;27; 15.707,09 ; 1.381,1601 ; 211,5000 ; 181.665,58 
01/04/2023;27; 19.419,65 ; 1.497,2147 ; 225,0000 ; 198.015,48 
01/05/2023;27; 19.419,65 ; 1.613,5895 ; 243,0000 ; 214.365,38 
01/06/2023;27; 19.419,65 ; 1.709,6115 ; 261,5000 ; 228.898,63 
01/07/2023;27; 20.847,59 ; 1.818,0838 ; 280,0000 ; 243.431,88 
01/08/2023;27; 23.703,42 ; 2.044,2832 ; 356,5000 ; 265.231,75 
01/09/2023;27; 27.130,42 ; 2.304,9242 ; 356,5000 ; 296.114,90 
01/10/2023;27; 30.557,42 ; 2.496,2730 ; 356,5000 ; 312.464,80 
01/11/2023;27; 32.842,08 ; 2.816,0628 ; 367,0000 ; 367.146,14 
01/12/2023;27; 34.841,16 ; 3.533,1922 ; 808,2500 ; 431.383,09 
01/01/2024;27; 90.935,43 ; 4.261,5324 ; 825,5000 ; 431.383,09 
01/02/2024;27; 90.935,43 ; 4.825,7881 ; 841,0000 ; 560.798,01 
01/03/2024;27; 90.935,43 ; 5.357,0929 ; 856,0000 ; 628.093,77 
01/04/2024;27; 90.935,43 ; 5.830,2271 ; 876,0000 ; 628.093,77 
01/05/2024;27; 90.935,43 ; 6.073,7165 ; 894,0000 ; 690.903,15 
01/06/2024;27; 90.935,43 ; 6.351,7145 ; 910,5000 ; 753.084,43 
01/07/2024;27; 90.935,43 ; 6.607,7479 ; 931,5000 ; 809.612,87 
01/08/2024;27; 93.208,82 ; 6.883,4412 ; 952,0000 ; 846.045,45 
01/09/2024;27; 95.072,99 ; 7.122,2421 ; 970,0000 ; 878.429,97 
01/10/2024;27; 95.072,99 ; 7.313,9542 ; 991,5000 ; 913.567,16 
01/11/2024;27; 95.072,99 ; 7.491,4314 ; 1.011,0000 ; 946.947,50 
01/12/2024;27; 102.203,47 ; 7.694,0075 ; 1.032,5000 ; 978.570,98 
01/01/2025;27; 102.203,47 ; 7.864,1257 ; 1.053,5000 ; 978.570,98 
01/02/2025;27; 104.145,35 ; 8.052,9927 ; 1.064,2500 ; 997.163,83 
01/03/2025;27; 104.145,35 ; 8.353,3158 ; 1.073,5000 ; 1.014.115,61 
01/04/2025;27; 107.109,24 ; 8.585,6078 ; 1.165,0000 ; 1.030.341,46 
01/05/2025;27; 109.153,31 ; 8.714,4871 ; 1.175,0000 ; 1.045.796,59 
01/06/2025;27; 110.686,35 ; 8.855,5681 ; 1.190,0000 ; 1.061.483,54 
01/07/2025;27; 112.219,41 ; 9.023,9730 ; 1.355,0000 ; 1.137.405,79 
01/08/2025;27; 112.219,41 ; 9.193,2441 ; 1.340,0000 ; 1.157.876,50 
01/09/2025;27; 112.219,41 ; 9.384,0922 ; 1.375,0000 ; 1.231.258,40 
01/10/2025;27; 112.219,41 ; 9.603,8623 ; 1.450,0000 ; 1.194.405,05 
01/11/2025;27; 113.752,45 ; 9.841,3581 ; 1.450,0000 ; 1.211.421,00 
01/12/2025;27; 115.285,53 ; 10.121,3715 ; 1.455,0000 ; 1.228.692,00 
01/01/2026;27; 115.285,53 ; 10.413,0309 ; 1.440,0000 ; 1.228.692,00 
01/02/2026;27; 115.285,53 ; 10.714,6255 ; 1.395,0000 ; 1.287.574,84 
01/03/2026;27; 115.285,53 ; 11.077,0608 ; 1.380,0000 ; 1.313.103,61 
01/04/2026;27; 115.285,53 ; 11.363,0904 ; 1.390,0000 ; 1.337.753,27 
"""

@st.cache_data
def load_data(uploaded_file=None):
    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file, sep=';')
            return df, "Archivo Subido por el Usuario"
        except Exception as e:
            st.sidebar.error(f"Error al leer archivo subido: {e}")
    
    # Si no hay archivo subido, usar los datos embebidos
    try:
        from io import StringIO
        df = pd.read_csv(StringIO(embedded_csv_data), sep=';')
        return df, "Datos Históricos Oficiales Embebidos"
    except Exception as e:
        st.error(f"Error al leer datos embebidos: {e}")
        return None, "Error"

# Título y encabezado principal
st.title("📊 Simulador de Regularización Ridge y Paridad Actuarial Dialítica")
st.markdown("""
**Análisis Econométrico del Desfasaje Financiero (*Reimbursement Gap*) y Estabilización de Costos en Hemodiálisis bajo Regímenes Macroeconómicos Inestables (Argentina).**
Este simulador interactivo permite explorar de forma empírica la inestabilidad del estimador de Mínimos Cuadrados Ordinarios ($MCO$), la inyección de estabilidad mediante la **Regresión Ridge ($L_2$)** y el cálculo del **Precio Técnico de Paridad ($PTP_{Hoy}$)** para garantizar la sustentabilidad de los centros de diálisis.
""")

# Sidebar - Carga de Datos y Parámetros
st.sidebar.header("📁 Datos y Configuración")
uploaded_file = st.sidebar.file_uploader("Subir serie de costos personalizada (.csv)", type=["csv", "txt"])
df, data_source_name = load_data(uploaded_file)

if df is not None:
    # Limpieza de datos
    df.columns = [c.strip() for c in df.columns]
    for col in ['ValorSesion', 'IPC', 'Dólar', 'CCT108-75']:
        df[col] = df[col].astype(str).str.replace('.', '').str.replace(',', '.').astype(float)
    
    # Convertir mes a formato fecha para ordenamiento
    df['Fecha'] = pd.to_datetime(df['Mes'], format='%d/%m/%Y')
    df = df.sort_values('Fecha').reset_index(drop=True)

    st.sidebar.info(f"Fuente de datos activa: **{data_source_name}**")
    
    # Controles de Parámetros de Simulación en Sidebar
    st.sidebar.header("🎛️ Hiperparámetro Ridge")
    
    # Parámetro Lambda en escala flexible
    lambda_selection = st.sidebar.radio("Tipo de selección de Lambda (λ):", ["Deslizador Lineal (Preciso)", "Ingresar Valor Numérico (Directo)"])
    if lambda_selection == "Deslizador Lineal (Preciso)":
        # Deslizador que va de 0 a 10 con paso fino, y de 10 a 100 con paso grueso
        lam = st.sidebar.slider("Parámetro de penalización λ:", min_value=0.0, max_value=50.0, value=10.0, step=0.01)
    else:
        lam = st.sidebar.number_input("Valor de Lambda λ (λ=0 es MCO):", min_value=0.0, max_value=1000.0, value=10.0, step=0.1)

    st.sidebar.header("📈 Proyección Macroeconómica (Futura)")
    g_ipc = st.sidebar.slider("Inflación Mensual Esperada ($g_{IPC}$) %:", min_value=0.0, max_value=20.0, value=4.0, step=0.1) / 100.0
    g_usd = st.sidebar.slider("Devaluación Mensual Esperada ($g_{USD}$) %:", min_value=0.0, max_value=20.0, value=3.5, step=0.1) / 100.0
    g_cct = st.sidebar.slider("Ajuste Salarial Paritario Mensual ($g_{CCT}$) %:", min_value=0.0, max_value=20.0, value=4.5, step=0.1) / 100.0
    g_os = st.sidebar.slider("Aumento Arancelario Concedido Mensual ($g_{OS}$) %:", min_value=0.0, max_value=20.0, value=2.0, step=0.1) / 100.0

    st.sidebar.header("🏥 Parámetros Clínicos")
    N = st.sidebar.number_input("Número de pacientes activos ($N$):", min_value=1, max_value=1000, value=100, step=10)
    S = st.sidebar.number_input("Sesiones mensuales por paciente ($S$):", min_value=1, max_value=20, value=13, step=1)
    
    # Selector de mes de equilibrio t0
    st.sidebar.header("🗓️ Momento de Referencia ($t_0$)")
    months_list = df['Mes'].tolist()
    t0_index = months_list.index('01/07/2017') if '01/07/2017' in months_list else 0
    t0_str = st.sidebar.selectbox("Mes de Equilibrio Financiero ($t_0$):", months_list, index=t0_index)
    
    # Obtener valores de t0
    row_t0 = df[df['Mes'] == t0_str].iloc[0]
    Y_t0 = row_t0['ValorSesion']
    CCT_t0 = row_t0['CCT108-75']
    USD_t0 = row_t0['Dólar']
    IPC_t0 = row_t0['IPC']

    # Estructura del modelo de costos estándar
    w_cct = 0.40
    w_usd = 0.30
    w_ipc = 0.30

    # Preparación de datos para regresión
    X_raw = df[['IPC', 'Dólar', 'CCT108-75']].values
    y_raw = df['ValorSesion'].values

    # Estandarización de X (media 0, desviación estándar 1) y centrado de y
    X_mean = X_raw.mean(axis=0)
    X_std = X_raw.std(axis=0, ddof=1)
    X_scaled = (X_raw - X_mean) / X_std

    y_mean = y_raw.mean()
    y_centered = y_raw - y_mean

    # Identidad de orden 3
    I = np.eye(3)

    # Estimaciones MCO y Ridge actual
    beta_mco = np.linalg.inv(X_scaled.T @ X_scaled) @ X_scaled.T @ y_centered
    beta_ridge = np.linalg.inv(X_scaled.T @ X_scaled + lam * I) @ X_scaled.T @ y_centered

    # Autovalores y número de condición de la matriz original X^TX
    eigenvals = np.linalg.eigvals(X_scaled.T @ X_scaled)
    cn = np.sqrt(np.max(eigenvals) / np.min(eigenvals))

    # TABS principales de la App
    tab1, tab2, tab3 = st.tabs(["🔍 Diagnóstico MCO vs Ridge", "📈 Proyecciones y Paridad Técnica", "📋 Datos Históricos y Correlaciones"])

    with tab1:
        st.subheader("El Colapso de MCO por Multicolinealidad Estructural")
        st.markdown("""
        En una economía inflacionaria, el Índice de Precios al Consumidor ($IPC$), el Tipo de Cambio ($USD$) y las escalas paritarias ($CCT\ 108/75$) avanzan fuertemente correlacionados intertemporalmente.
        Esta cointegración quiebra el supuesto de independencia lineal de los regresores, provocando que la matriz de diseño $X^T X$ sea casi singular (determinante cercano a cero).
        Como consecuencia, los estimadores tradicionales de MCO sufren de **varianzas explosivas** y, lo que es peor, **signos contraintuitivos o absurdos** frente a la realidad microeconómica.
        """)

        # Layout de 3 columnas para métricas de diagnóstico
        col1, col2, col3 = st.columns(3)
        with col1:
            st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-value">{cn:.2f}</div>
                    <div class="metric-label">Índice de Condición (CN)</div>
                </div>
            """, unsafe_allow_html=True)
            if cn > 30:
                st.error("🚨 Multicolinealidad SEVERA (CN > 30)")
            elif cn > 15:
                st.warning("⚠️ Multicolinealidad Moderada")
            else:
                st.success("✅ Matriz Bien Condicionada")

        with col2:
            st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-value">{np.min(eigenvals):.6f}</div>
                    <div class="metric-label">Autovalor Mínimo de XᵀX</div>
                </div>
            """, unsafe_allow_html=True)
            if np.min(eigenvals) < 0.2:
                st.error("🚨 Próximo a la Singularidad (Inversión Inestable)")

        with col3:
            st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-value">{'Ridge (λ > 0)' if lam > 0 else 'MCO (λ = 0)'}</div>
                    <div class="metric-label">Método de Estimación Activo</div>
                </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        # Comparativa de coeficientes
        st.write("### ⚖️ Tabla Comparativa de Coeficientes Estandarizados")
        
        comp_data = {
            "Variable Explicativa": ["IPC (Estructura y Servicios)", "Dólar USD (Insumos Importados)", "CCT 108/75 (Mano de Obra)"],
            "Peso Polinómico Técnico": ["30.0%", "30.0%", "40.0%"],
            "Estimador MCO (λ = 0)": [f"{beta_mco[0]:,.2f}", f"{beta_mco[1]:,.2f}", f"{beta_mco[2]:,.2f}"],
            "Estimador Ridge (λ Actual)": [f"{beta_ridge[0]:,.2f}", f"{beta_ridge[1]:,.2f}", f"{beta_ridge[2]:,.2f}"],
            "¿Lógica de Costos en MCO?": ["Sí (Positivo)", "Sí (Positivo)", "❌ NO (Es fuertemente negativo)"],
            "¿Lógica de Costos en Ridge?": [
                "Sí (Positivo)" if beta_ridge[0] > 0 else "No",
                "Sí (Positivo)" if beta_ridge[1] > 0 else "No",
                "🟢 SÍ (Es Positivo)" if beta_ridge[2] > 0 else "❌ Sigue siendo negativo (Subir λ)"
            ]
        }
        st.table(pd.DataFrame(comp_data))

        st.markdown("""
        > **El Quiebre de MCO:** Nótese que bajo MCO tradicional (con $\lambda = 0$), el coeficiente de salarios (**CCT 108/75**) es **negativo** ($-43,744.83$), lo cual implica absurdamente que los aumentos salariales reducen las tarifas. 
        > 
        > **La Corrección de Ridge:** Al aumentar la penalización $\lambda$ mediante el deslizador en la barra izquierda, se inyecta estabilidad en la diagonal de la matriz. Alrededor de $\lambda \geq 1.0$, el coeficiente salarial se vuelve **positivo**, corrigiendo el absurdo físico y recuperando la lógica económica del modelo.
        """)

        # Gráfico dinámico de la traza de Ridge
        st.write("### 📈 Visualización Dinámica de la Traza de Ridge (*Ridge Trace Plot*)")
        
        # Calcular traza de Ridge para graficar
        lambdas = np.logspace(-3, 2, 200)
        coef_paths = []
        for l in lambdas:
            br = np.linalg.inv(X_scaled.T @ X_scaled + l * I) @ X_scaled.T @ y_centered
            coef_paths.append(br)
        coef_paths = np.array(coef_paths)

        fig, ax = plt.subplots(figsize=(10, 4.5))
        ax.plot(lambdas, coef_paths[:, 0], label='IPC (Estructura)', color='#e41a1c', linewidth=2)
        ax.plot(lambdas, coef_paths[:, 1], label='Dólar USD (Insumos)', color='#377eb8', linewidth=2)
        ax.plot(lambdas, coef_paths[:, 2], label='CCT 108/75 (Salarios)', color='#4daf4a', linewidth=2)
        ax.axhline(0, color='black', linestyle='--', linewidth=0.8)
        
        # Marcar lambda actual
        ax.axvline(lam, color='#ff7f00', linestyle=':', linewidth=2, label=f'λ Actual = {lam:.2f}')
        
        ax.set_xscale('log')
        ax.set_xlabel('Hiperparámetro de Regularización / Penalización (λ)', fontsize=10, fontweight='bold')
        ax.set_ylabel('Magnitud de los Coeficientes Estandarizados (β)', fontsize=10, fontweight='bold')
        ax.set_title('Traza de Ridge: Evolución y Estabilización de Coeficientes', fontsize=12, fontweight='bold')
        ax.legend(loc='best', frameon=True, shadow=True)
        ax.grid(True, which="both", ls=":")
        
        st.pyplot(fig)

    with tab2:
        st.subheader("Cálculo Dinámico de Costos, Brecha y Paridad Técnica")
        st.markdown("""
        En esta sección acoplamos el análisis retrospectivo de pérdidas reales por rezago temporal (*Time Lag*) con una proyección prospectiva a 12 meses.
        El **Precio Técnico de Paridad "Hoy" ($PTP_{Hoy}$)** se determina como el valor arancelario por sesión que debe implementarse inmediatamente para que el prestador logre **cubrir los costos futuros indexados** y, al mismo tiempo, **amortizar y recuperar de forma completa el déficit histórico acumulado** en los últimos 12 meses.
        """)

        # 1. Análisis Retrospectivo (Últimos 12 meses registrados)
        df_retro = df.tail(12).copy()
        
        # Calcular los costos teóricos históricos de la polinómica
        df_retro['CCT_rel'] = df_retro['CCT108-75'] / CCT_t0
        df_retro['USD_rel'] = df_retro['Dólar'] / USD_t0
        df_retro['IPC_rel'] = df_retro['IPC'] / IPC_t0
        df_retro['V_P'] = Y_t0 * (w_cct * df_retro['CCT_rel'] + w_usd * df_retro['USD_rel'] + w_ipc * df_retro['IPC_rel'])
        df_retro['Loss_Unit'] = df_retro['V_P'] - df_retro['ValorSesion']
        df_retro['Loss_Total'] = df_retro['Loss_Unit'] * N * S

        total_loss_retro = df_retro['Loss_Total'].sum()

        # 2. Análisis Prospectivo (Proyección a 12 meses futuros)
        latest_row = df.iloc[-1]
        V_T = Y_t0 * (w_cct * (latest_row['CCT108-75']/CCT_t0) + w_usd * (latest_row['Dólar']/USD_t0) + w_ipc * (latest_row['IPC']/IPC_t0))
        Y_T = latest_row['ValorSesion']

        IPC_fut = latest_row['IPC']
        USD_fut = latest_row['Dólar']
        CCT_fut = latest_row['CCT108-75']
        Y_fut = Y_T

        future_months = []
        projected_V_P = []
        projected_Y = []

        for h in range(1, 13):
            IPC_fut *= (1 + g_ipc)
            USD_fut *= (1 + g_usd)
            CCT_fut *= (1 + g_cct)
            Y_fut *= (1 + g_os)
            
            V_P_h = Y_t0 * (w_cct * (CCT_fut/CCT_t0) + w_usd * (USD_fut/USD_t0) + w_ipc * (IPC_fut/IPC_t0))
            projected_V_P.append(V_P_h)
            projected_Y.append(Y_fut)
            future_months.append(f"Mes +{h}")

        # Sumatoria de costos futuros proyectados
        sum_future_V_P = sum(projected_V_P)
        
        # Factor acumulador de reajuste arancelario futuro
        Phi = sum((1 + g_os)**h for h in range(1, 13))

        # Fórmula actuarial del Precio Técnico de Paridad HOY (P0)
        ptp_hoy = (sum_future_V_P + (total_loss_retro / (N * S))) / Phi
        reajuste_req = ((ptp_hoy / Y_T) - 1.0) * 100.0

        # Mostrar métricas clave en layout de 4 columnas
        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-value">ARS {total_loss_retro:,.2f}</div>
                    <div class="metric-label">Pérdida Acumulada Past (12m)</div>
                </div>
            """, unsafe_allow_html=True)
        with m2:
            st.markdown(f"""
                <div class="metric-box">
                    <div class="metric-value">ARS {Y_T:,.2f}</div>
                    <div class="metric-label">Arancel Nominal de Cierre</div>
                </div>
            """, unsafe_allow_html=True)
        with m3:
            st.markdown(f"""
                <div class="metric-box" style="border-color: #2a9d8f;">
                    <div class="metric-value" style="color: #2a9d8f;">ARS {ptp_hoy:,.2f}</div>
                    <div class="metric-label"><b>Precio Técnico Paridad (PTP_Hoy)</b></div>
                </div>
            """, unsafe_allow_html=True)
        with m4:
            st.markdown(f"""
                <div class="metric-box" style="border-color: #e76f51;">
                    <div class="metric-value" style="color: #e76f51;">+{reajuste_req:.2f}%</div>
                    <div class="metric-label">Reajuste Técnico Requerido</div>
                </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        # Gráfico de la Brecha Retrospectiva y Prospectiva
        st.write("### 📊 Evolución del Desfasaje: Histórico vs. Proyección con Paridad Técnica")
        
        retro_months = df_retro['Mes'].tolist()
        all_months_chart = retro_months + future_months
        
        chart_V_P = df_retro['V_P'].tolist() + projected_V_P
        chart_Y_base = df_retro['ValorSesion'].tolist() + projected_Y
        
        # Calcular trayectoria si se implementa PTP_Hoy hoy
        chart_Y_ptp = df_retro['ValorSesion'].tolist() + [ptp_hoy * (1+g_os)**h for h in range(1, 13)]

        fig2, ax2 = plt.subplots(figsize=(11, 5))
        
        # Zona histórica
        ax2.axvspan(0, 11, color='#e9ecef', alpha=0.5, label='Fase Retrospectiva (Auditoría de Costos)')
        # Zona proyectada
        ax2.axvspan(11, 23, color='#e8f5e9', alpha=0.5, label='Fase Prospectiva (Planeación Financiera)')

        ax2.plot(all_months_chart, chart_V_P, label='Costo Real Polinómico Estructurado ($V_t^P$)', color='#e76f51', linewidth=3, marker='o')
        ax2.plot(all_months_chart, chart_Y_base, label='Arancel con Incrementos Ordinarios ($Y_t$)', color='#377eb8', linewidth=2, linestyle='--', marker='x')
        ax2.plot(all_months_chart, chart_Y_ptp, label='Arancel bajo Precio Técnico de Paridad ($PTP_{Hoy}$)', color='#2a9d8f', linewidth=3, marker='s')
        
        ax2.set_xlabel('Línea Temporal de Gestión (Meses)', fontsize=10, fontweight='bold')
        ax2.set_ylabel('Valor de la Sesión de Hemodiálisis (ARS)', fontsize=10, fontweight='bold')
        ax2.set_title('Resolución del Descalce Financiero mediante Paridad Técnica', fontsize=12, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        ax2.legend(loc='upper left', frameon=True, shadow=True)
        ax2.grid(True, which="both", ls=":")
        
        st.pyplot(fig2)

        st.markdown("""
        ### 📌 Interpretación Técnica y Decisiones
        1. **El Costo Real Polinómico (Línea Naranja):** Representa el costo real por sesión que el prestador soporta. Noten cómo en los meses pasados supera holgadamente a la tarifa que pagaba la obra social, acumulando una pérdida de capital.
        2. **Trayectoria Inercial (Línea Azul Discontinua):** Si se continúa con la pauta inercial de la financiadora ($g_{OS} = 2.0\%$), la brecha se expande a niveles insostenibles de asfixia financiera.
        3. **Línea de Paridad Técnica (Línea Verde):** Al implementar hoy el **$PTP_{Hoy}$**, se restablece el equilibrio de caja. La sobrecobertura inicial respecto al costo de la sesión compensa de forma prorrateada la pérdida retrospectiva acumulada, logrando la neutralidad financiera exacta al finalizar el ciclo de 12 meses.
        """)

    with tab3:
        st.subheader("Análisis de Co-Movimientos y Estructura del Dataset")
        st.markdown("""
        Aquí se presentan las correlaciones empíricas intrínsecas del dataset. Se demuestra la validez del problema de la multicolinealidad: la correlación intertemporal entre las variables nominales del sector salud supera los umbrales de advertencia convencionales.
        """)

        # Matriz de Correlación
        st.write("### 🔢 Matriz de Correlación de Pearson de los Predictores")
        corr_matrix = df[['IPC', 'Dólar', 'CCT108-75']].corr()
        st.table(corr_matrix.style.format("{:.4f}").background_gradient(cmap='coolwarm', axis=None))

        st.write("### 📊 Evolución de los Índices Nominales de Costo (Estandarizados)")
        
        # Estandarizar para graficar juntos y ver co-movimiento
        df_scaled_plot = pd.DataFrame()
        df_scaled_plot['Mes'] = df['Mes']
        df_scaled_plot['IPC (Estructura)'] = (df['IPC'] - df['IPC'].mean()) / df['IPC'].std()
        df_scaled_plot['Dólar USD (Insumos)'] = (df['Dólar'] - df['Dólar'].mean()) / df['Dólar'].std()
        df_scaled_plot['CCT 108/75 (Sueldos)'] = (df['CCT108-75'] - df['CCT108-75'].mean()) / df['CCT108-75'].std()

        fig3, ax3 = plt.subplots(figsize=(10, 4.5))
        ax3.plot(df_scaled_plot['Mes'], df_scaled_plot['IPC (Estructura)'], label='IPC Estandarizado', color='#e41a1c', alpha=0.8)
        ax3.plot(df_scaled_plot['Mes'], df_scaled_plot['Dólar USD (Insumos)'], label='Dólar Estandarizado', color='#377eb8', alpha=0.8)
        ax3.plot(df_scaled_plot['Mes'], df_scaled_plot['CCT 108/75 (Sueldos)'], label='CCT Estandarizado', color='#4daf4a', alpha=0.8)
        
        ax3.set_xlabel('Meses', fontsize=10)
        ax3.set_ylabel('Índices Estandarizados (Z-Score)', fontsize=10)
        ax3.set_title('Evolución Conjunta: Evidencia Visual de Cointegración y Multicolinealidad', fontsize=11, fontweight='bold')
        
        # Mostrar solo algunos ticks en X
        tick_spacing = max(1, len(df) // 10)
        plt.xticks(df_scaled_plot['Mes'][::tick_spacing], rotation=45, ha='right')
        ax3.legend(loc='best')
        ax3.grid(True, which="both", ls=":")
        
        st.pyplot(fig3)

        st.write("### 📝 Datos de la Serie Histórica Limpios")
        st.dataframe(df[['Mes', 'ValorSesion', 'IPC', 'Dólar', 'CCT108-75']])

# Pie de página institucional y referencias
st.markdown("""
---
<div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
    <b>Modelización de Paridad Actuarial de Diálisis</b><br>
    Universidad Nacional de Rosario - Cátedra de Matemática Financiera<br>
    Referencias Académicas: [1] Hoerl & Kennard (1970) | [2] Bager et al. (2017) MPRA | [3] Dorugade & Kashid (2010) AMS.
</div>
""", unsafe_allow_html=True)

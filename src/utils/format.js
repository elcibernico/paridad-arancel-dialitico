/**
 * Formateo de números con locale argentino (es-AR):
 *   - Separador de miles: punto  (.)
 *   - Separador decimal:  coma   (,)
 *
 * fmtAR(1234567.89, 2)    → "1.234.567,89"   (para JSX normal)
 * fmtLatex(1234567.89, 2) → "1{.}234{.}567{,}89"  (para strings de MathJax)
 * fmtPct(12.345, 2)       → "12,35 %"
 */

export function fmtAR(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '\u2014';
  return Number(value).toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un número para embeber dentro de una fórmula LaTeX/MathJax.
 * - Los puntos de miles quedan como {.} para que LaTeX no los interprete como punto decimal.
 * - La coma decimal queda como {,} para suprimir el espacio que MathJax agrega después de coma en modo math.
 * Ejemplo: fmtLatex(11363.09, 2) → "11{.}363{,}09"
 */
export function fmtLatex(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '{-}';
  const arStr = fmtAR(value, decimals); // "11.363,09"
  return arStr
    .replace(/\./g, '{.}')   // miles: "11{.}363,09"
    .replace(/,/g, '{,}');   // decimal: "11{.}363{,}09"
}

/** Porcentaje con locale argentino: fmtPct(12.5, 2) → "12,50 %" */
export function fmtPct(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '\u2014';
  return (
    Number(value).toLocaleString('es-AR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + '\u00a0%'
  );
}

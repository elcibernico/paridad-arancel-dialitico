import React from 'react';

// MathJax CDN Loader Dinámico y seguro con soporte para className de color
export default function MathJaxFormula({ formula, display = false, className }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (window.MathJax && containerRef.current) {
      containerRef.current.innerHTML = display ? `\\[${formula}\\]` : `\\(${formula}\\)`;
      window.MathJax.typesetPromise && window.MathJax.typesetPromise([containerRef.current]).catch(err => console.error(err));
    }
  }, [formula, display]);

  const defaultClasses = display 
    ? "block text-center my-3 text-teal-700 dark:text-teal-300 font-serif text-lg font-semibold" 
    : "inline-block text-teal-700 dark:text-teal-300 font-serif px-1 font-semibold";

  return <span ref={containerRef} className={className || defaultClasses} />;
}

// Provide both default and named export for compatibility
export { MathJaxFormula };

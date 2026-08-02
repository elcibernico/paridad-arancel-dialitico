const fs = require('fs');
const path = require('path');

const dir = 'd:/ProgramFiles/GitHub-Firebase-Antigravity/2026-07 Paridad Arancel Dialitico/app/src/components/points';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');

  // Replace simple isDarkMode ternaries: ${isDarkMode ? 'dark-classes' : 'light-classes'}
  const regexSimple = /\$\{\s*isDarkMode\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\s*\}/g;
  content = content.replace(regexSimple, (match, darkStr, lightStr) => {
    const lightClasses = lightStr.split(/\s+/).filter(Boolean);
    const darkClasses = darkStr.split(/\s+/).filter(Boolean).map(c => c.startsWith('dark:') ? c : 'dark:' + c);
    return [...lightClasses, ...darkClasses].join(' ');
  });

  // Handle nested ternaries like:
  // ${showSection1 ? isDarkMode ? 'A' : 'B' : isDarkMode ? 'C' : 'D'}
  const regexNested = /\$\{\s*([a-zA-Z0-9_]+)\s*\n?\s*\?\s*isDarkMode\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\s*\n?\s*:\s*isDarkMode\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\s*\}/g;
  content = content.replace(regexNested, (match, condition, trueDark, trueLight, falseDark, falseLight) => {
    const tLight = trueLight.split(/\s+/).filter(Boolean);
    const tDark = trueDark.split(/\s+/).filter(Boolean).map(c => c.startsWith('dark:') ? c : 'dark:' + c);
    const fLight = falseLight.split(/\s+/).filter(Boolean);
    const fDark = falseDark.split(/\s+/).filter(Boolean).map(c => c.startsWith('dark:') ? c : 'dark:' + c);
    
    return '${' + condition + ' ? \'' + [...tLight, ...tDark].join(' ') + '\' : \'' + [...fLight, ...fDark].join(' ') + '\'}';
  });

  // Handle single className ternaries:
  // className={isDarkMode ? 'A' : 'B'}
  const regexClassName = /className=\{\s*isDarkMode\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\s*\}/g;
  content = content.replace(regexClassName, (match, darkStr, lightStr) => {
    const lightClasses = lightStr.split(/\s+/).filter(Boolean);
    const darkClasses = darkStr.split(/\s+/).filter(Boolean).map(c => c.startsWith('dark:') ? c : 'dark:' + c);
    return 'className="' + [...lightClasses, ...darkClasses].join(' ') + '"';
  });

  fs.writeFileSync(path.join(dir, file), content, 'utf8');
  console.log('Processed', file);
});

// Fix App.jsx and Header.jsx and SlideContainer.jsx and Footer.jsx to use simple template literals or dark: classes where possible, or at least keep them intact since they are the ones handling it.
// We mainly needed to fix the points/

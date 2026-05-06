// Einfache Stammformreduktion für Deutsch
function stammformen(wort) {
  const w = wort.toLowerCase();
  const varianten = [w];
  // Endungen abschneiden
  const endungen = ['en', 'er', 'em', 'es', 'e', 'lich', 'ig', 'isch'];
  for (const end of endungen) {
    if (w.endsWith(end) && w.length - end.length > 3) {
      varianten.push(w.slice(0, w.length - end.length));
    }
  }
  // Umlaute
  varianten.push(w.replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a'));
  return varianten;
}

export function pruefAdjektive(text, eigenschaften) {
  if (!text || eigenschaften.length === 0) return [];
  const warnings = [];
  for (const eig of eigenschaften) {
    const worte = eig.name.toLowerCase().split(/[\s,/]+/);
    for (const wort of worte) {
      if (wort.length < 4) continue;
      const varianten = stammformen(wort);
      for (const variante of varianten) {
        const regex = new RegExp(`\\b${variante}\\w*`, 'gi');
        const matches = [...text.matchAll(regex)];
        for (const match of matches) {
          warnings.push({
            index: match.index,
            length: match[0].length,
            wort: match[0],
            eigenschaft: eig.name,
          });
        }
      }
    }
  }
  return warnings;
}

export function pruefVergangenheit(text) {
  if (!text) return [];
  const vergangenheit = ['war', 'hatte', 'ging', 'kam', 'wurde', 'machte', 'sagte', 'tat', 'wollte', 'konnte', 'durfte', 'musste', 'sollte'];
  const warnings = [];
  for (const verb of vergangenheit) {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = [...text.matchAll(regex)];
    for (const match of matches) {
      warnings.push({ index: match.index, length: match[0].length, wort: match[0], typ: 'vergangenheit' });
    }
  }
  return warnings;
}

export function pruefNicht(text) {
  if (!text) return [];
  const warnings = [];
  const regex = /\bnicht\b/gi;
  const matches = [...text.matchAll(regex)];
  for (const match of matches) {
    warnings.push({ index: match.index, length: match[0].length, wort: match[0], typ: 'nicht' });
  }
  return warnings;
}

export function zaehleWorte(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export function zaehlesSaetze(text) {
  if (!text || !text.trim()) return 0;
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

export function wortZaehlerStatus(anzahl) {
  if (anzahl < 40) return 'grau';
  if (anzahl <= 120) return 'gruen';
  return 'orange';
}

// Prüft ob zwei Eigenschaften semantisch sehr ähnlich sind
const aehnlicheGruppen = [
  ['Dienend', 'Hilfsbereit', 'Fürsorglich'],
  ['Zuverlässig', 'Vertrauenswürdig', 'Loyal'],
  ['Ehrlich', 'Aufrichtig', 'Authentisch'],
  ['Mutig', 'Furchtlos', 'Entschlossen'],
  ['Fleißig', 'Diszipliniert', 'Ausdauernd', 'Zielstrebig'],
  ['Einfühlsam', 'Mitfühlend', 'Rücksichtsvoll'],
  ['Demütig', 'Sanftmütig'],
  ['Freundlich', 'Gütig', 'Zuvorkommend'],
];

export function sindZuAehnlich(eig1, eig2) {
  for (const gruppe of aehnlicheGruppen) {
    if (gruppe.includes(eig1) && gruppe.includes(eig2)) return true;
  }
  return false;
}

// Leitet Geschlecht/Sektion aus dem Gruppen-Code ab.
// Standard-Schema (CAMP2GO, QUIETSCHFIDEL): Buchstaben-Präfix, z. B. "J4", "M12".
// YOUTH CAMP-Schema: Ziffern-Präfix, z. B. "1A".."2G" (Mädchen), "3A".."4D" (Jungen).
export function geschlechtAusGruppe(gruppe) {
  if (!gruppe) return 'keine';
  const zeichen = gruppe[0];
  if (zeichen === '1' || zeichen === '2') return 'weiblich';
  if (zeichen === '3' || zeichen === '4') return 'männlich';
  const prefix = zeichen.toUpperCase();
  if (prefix === 'J') return 'männlich';
  if (prefix === 'M') return 'weiblich';
  return 'keine';
}

export function sektionAusGruppe(gruppe) {
  return geschlechtAusGruppe(gruppe) === 'weiblich' ? 'mädels' : 'jungs';
}

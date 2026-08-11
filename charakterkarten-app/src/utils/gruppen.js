// Leitet Geschlecht/Sektion aus dem Gruppen-Code ab.
// Standard-Schema (CAMP2GO, QUIETSCHFIDEL): Buchstaben-Präfix, z. B. "J4", "M12".
// YOUTH CAMP-Schema: Ziffern-Präfix, z. B. "1A".."2G" (YC1: Mädchen), "3A".."4D" (YC1: Jungen).
// Die Ziffer-zu-Geschlecht-Zuordnung unterscheidet sich je Standort (YC1 vs. YC2),
// daher braucht die Ableitung zusätzlich den Camp-Code.
const YOUTH_CAMP_ZIFFERN_GESCHLECHT = {
  YC1: { 1: 'weiblich', 2: 'weiblich', 3: 'männlich', 4: 'männlich' },
  YC2: { 1: 'männlich', 2: 'weiblich' }, // Dorf 1 = Jungs, Dorf 2 = Mädels
};

export function geschlechtAusGruppe(gruppe, campCode) {
  if (!gruppe) return 'keine';
  const zeichen = gruppe[0];
  const ziffernSchema = YOUTH_CAMP_ZIFFERN_GESCHLECHT[campCode];
  if (ziffernSchema?.[zeichen]) return ziffernSchema[zeichen];
  if (zeichen === '1' || zeichen === '2') return 'weiblich'; // Fallback: YC1-Schema
  if (zeichen === '3' || zeichen === '4') return 'männlich';
  const prefix = zeichen.toUpperCase();
  if (prefix === 'J') return 'männlich';
  if (prefix === 'M') return 'weiblich';
  return 'keine';
}

export function sektionAusGruppe(gruppe, campCode) {
  return geschlechtAusGruppe(gruppe, campCode) === 'weiblich' ? 'mädels' : 'jungs';
}

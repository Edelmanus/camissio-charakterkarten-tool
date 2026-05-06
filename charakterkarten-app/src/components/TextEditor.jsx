import { useState, useMemo } from 'react';
import { pruefAdjektive, pruefVergangenheit, pruefNicht, zaehleWorte, wortZaehlerStatus } from '../utils/validierung';

const FORMULIERUNGEN = {
  einstieg: [
    '[Name] zeichnet sich besonders aus durch …',
    'An [Name] beeindruckt mich …',
    'Was [Name] besonders macht, ist …',
    '[Name] hat eine Gabe, die sofort auffällt: …',
    'Wer [Name] kennt, weiß: …',
    'Eine Sache, die ich an [Name] wirklich schätze, ist …',
    '[Name] ist jemand, der/die …',
    'Das Besondere an [Name] ist …',
  ],
  uebergang: [
    'Außerdem …',
    'Darüber hinaus …',
    'Was mir auch aufgefallen ist: …',
    'Und noch etwas: …',
    'Gleichzeitig …',
    'Nicht zuletzt …',
  ],
  schluss: [
    'Ich bin gespannt, wie Gott dich weiter gebrauchen wird.',
    'Bleib so, wie du bist — du bist ein Geschenk!',
    'Ich freue mich, dich begleiten zu dürfen.',
    'Gott hat Großes mit dir vor — ich bin sicher davon.',
    'Du bist ein Segen für alle, die dich kennen.',
    'Danke, dass du so bist, wie du bist.',
    'Ich bin stolz auf dich!',
  ],
  christlich: [
    '… ermöglicht ihm/ihr seine/ihre Beziehung zu Gott zu stärken',
    '… tief im Glauben verwurzelt',
    '… teilt die gute Nachricht mit anderen',
    '… gestaltet seinen/ihren Alltag in dem Wissen, dass Gott ganz nah ist',
    '… mit der Freude, die Gott ihm/ihr schenkt',
    '… indem er/sie dem Beispiel von Jesus folgt',
    '… kennt seine/ihre Identität in Jesus',
    '… hilft – auch wenn niemand zusieht',
    '… stellt Jesus in den Mittelpunkt seines/ihres Lebens',
    '… hat Hunger nach mehr von Jesus',
    '… ist ein Kind Gottes',
    '… erzählt anderen, wie sehr Gott sie liebt',
  ],
};

export default function TextEditor({ text, onChange, eigenschaften, kindName }) {
  const [formulierungenOffen, setFormulierungenOffen] = useState(false);
  const [aktiveKat, setAktiveKat] = useState('einstieg');

  const wortAnzahl = useMemo(() => zaehleWorte(text), [text]);
  const zaehlerStatus = useMemo(() => wortZaehlerStatus(wortAnzahl), [wortAnzahl]);

  const adjektivWarnungen = useMemo(() => pruefAdjektive(text, eigenschaften), [text, eigenschaften]);
  const vergangenheitWarnungen = useMemo(() => pruefVergangenheit(text), [text]);
  const nichtWarnungen = useMemo(() => pruefNicht(text), [text]);

  const alleWarnungen = useMemo(() => {
    const alle = [
      ...adjektivWarnungen.map(w => ({ ...w, farbe: 'bg-yellow-100 border-b-2 border-yellow-400', tooltip: `Tipp: Beschreibe die Eigenschaft, statt sie zu nennen (Regel 4)` })),
      ...vergangenheitWarnungen.map(w => ({ ...w, farbe: 'bg-blue-100 border-b-2 border-blue-400', tooltip: 'Tipp: Präsens verwenden — Regel 7' })),
      ...nichtWarnungen.map(w => ({ ...w, farbe: 'bg-orange-100 border-b-2 border-orange-400', tooltip: 'Tipp: Vermeide „nicht"-Aussagen — Regel 9' })),
    ];
    return alle.sort((a, b) => a.index - b.index);
  }, [adjektivWarnungen, vergangenheitWarnungen, nichtWarnungen]);

  const zaehlerFarbe = {
    grau: 'text-gray-400',
    gruen: 'text-camissio-summer-gruen',
    orange: 'text-camissio-orange',
  }[zaehlerStatus];

  const formulierungEinfuegen = (formel) => {
    const name = kindName || '[Name]';
    const text_formel = formel.replace(/\[Name\]/g, name);
    onChange(text ? text + ' ' + text_formel : text_formel);
  };

  const KATEGORIEN_LABEL = {
    einstieg: '🎯 Einstieg',
    uebergang: '🔄 Übergänge',
    schluss: '🌟 Schlusssätze',
    christlich: '✝️ Christliche Formulierungen',
  };

  return (
    <div className="space-y-2">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          placeholder={`Schreibe hier deinen persönlichen Text für ${kindName || 'das Kind'} (4–5 Sätze)…`}
          className="w-full min-h-[160px] border border-gray-200 rounded-xl px-4 py-3 text-sm text-camissio-dunkelblau focus:outline-none focus:ring-2 focus:ring-camissio-lila resize-y leading-relaxed font-body"
          aria-label="Charakterkarten-Text"
        />
      </div>

      {/* Warnungen & Wortzähler */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {adjektivWarnungen.length > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 rounded-lg px-2 py-1">
              💡 Tipp: Adjektiv im Text gefunden — beschreibe die Eigenschaft statt sie zu nennen (Regel 4)
            </span>
          )}
          {vergangenheitWarnungen.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2 py-1">
              💡 Tipp: Vergangenheitsform gefunden — Präsens verwenden (Regel 7)
            </span>
          )}
          {nichtWarnungen.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 rounded-lg px-2 py-1">
              💡 Tipp: „nicht" gefunden — vermeide Nicht-Aussagen (Regel 9)
            </span>
          )}
        </div>
        <div className={`text-xs font-semibold shrink-0 ${zaehlerFarbe}`}>
          {wortAnzahl} Wörter
          {wortAnzahl < 40 && <span className="font-normal text-gray-400"> (Ziel: 60–100)</span>}
          {wortAnzahl >= 40 && wortAnzahl <= 120 && <span className="font-normal"> ✓</span>}
          {wortAnzahl > 120 && <span className="font-normal"> (zu lang)</span>}
        </div>
      </div>

      {/* Fortschrittsbalken */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            zaehlerStatus === 'gruen' ? 'bg-camissio-summer-gruen' :
            zaehlerStatus === 'orange' ? 'bg-camissio-orange' : 'bg-gray-300'
          }`}
          style={{ width: `${Math.min((wortAnzahl / 100) * 100, 100)}%` }}
        />
      </div>

      {/* Hilfreiche Formulierungen */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setFormulierungenOffen(!formulierungenOffen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          aria-expanded={formulierungenOffen}
        >
          <span className="text-sm font-semibold text-camissio-dunkelblau flex items-center gap-2">
            💡 Hilfreiche Formulierungen
          </span>
          <span className="text-gray-400 text-sm">{formulierungenOffen ? '▲' : '▼'}</span>
        </button>

        {formulierungenOffen && (
          <div className="p-4 bg-white">
            {/* Kategorie-Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {Object.entries(KATEGORIEN_LABEL).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setAktiveKat(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    aktiveKat === key
                      ? 'bg-camissio-lila text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {FORMULIERUNGEN[aktiveKat].map((formel, i) => (
                <button
                  key={i}
                  onClick={() => formulierungEinfuegen(formel)}
                  className="text-left text-xs text-camissio-dunkelblau bg-camissio-greige hover:bg-camissio-lila/10 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-camissio-lila/30"
                >
                  {formel.replace(/\[Name\]/g, kindName || '[Name]')}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Klicke auf eine Formulierung, um sie an den Text anzuhängen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

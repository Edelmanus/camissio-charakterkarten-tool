import { useState, useEffect, useMemo, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import RadarChart from './RadarChart';
import EigenschaftDetail from './EigenschaftDetail';
import TextEditor from './TextEditor';
import KarteDruck from './KarteDruck';
import KorrigiertAnsicht from './KorrigiertAnsicht';
import { sindZuAehnlich } from '../utils/validierung';

// Die 7 Wesenszug-Kategorien mit Scoring-Slidern (laut Manual)
const KATEGORIE_NAMEN = {
  beziehungsstark: 'Der Beziehungsstarke',
  anpacker: 'Der Anpacker',
  unaufhaltsam: 'Der Unaufhaltsame',
  verwurzelt: 'Der Verwurzelte',
  gewissenhaft: 'Der Gewissenhafte',
  vorbild: 'Das Vorbild',
  anbeter: 'Der Anbeter',
};

const KATEGORIE_FARBEN = {
  beziehungsstark: '#55c1c4',
  anpacker: '#fa5c33',
  unaufhaltsam: '#f35b56',
  verwurzelt: '#00ab67',
  gewissenhaft: '#007d99',
  vorbild: '#a1a5dd',
  anbeter: '#f5e563',
  // Zusatz-Kategorien (kein Slider, aber für Eigenschafts-Browser)
  lernend: '#1c4554',
  gestalter: '#de69a8',
  ueberwinder: '#fa5c33',
};

function ScoreSlider({ katId, name, value, onChange }) {
  const farbe = KATEGORIE_FARBEN[katId] || '#a1a5dd';
  return (
    <div className="flex items-center gap-2">
      <div
        className="shrink-0 leading-tight text-camissio-dunkelblau font-semibold"
        style={{ fontSize: '11px', width: '140px' }}
      >
        {name}
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="flex-1 min-w-0"
          style={{ accentColor: farbe }}
          aria-label={`${name}: ${value} von 5`}
        />
        <span
          className="text-sm font-bold w-5 text-center shrink-0"
          style={{ color: farbe }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export default function KindEditor({ kind, camp, onUpdate, onFertigToggle }) {
  if (kind.korrigiert) {
    return <KorrigiertAnsicht kind={kind} />;
  }
  const [eigenschaften, setEigenschaften] = useState(null);
  const [detailEigenschaft, setDetailEigenschaft] = useState(null);
  const [aehnlichHinweis, setAehnlichHinweis] = useState(false);
  const [alleBrowseOffen, setAlleBrowseOffen] = useState(false);
  const [browseKatId, setBrowseKatId] = useState(null);
  const printRef = useRef(null);

  // Eigenschaften laden (camp-spezifisch)
  useEffect(() => {
    const file = camp?.eigenschaftenFile || '/data/eigenschaften-youth-camp.json';
    fetch(file)
      .then(r => r.json())
      .then(d => setEigenschaften(d.kategorien))
      .catch(console.error);
  }, [camp?.eigenschaftenFile]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Charakterkarte_${kind.name}`,
  });

  // Scores der 7 Kategorien
  const handleScore = (katId, val) => {
    onUpdate({ scores: { ...kind.scores, [katId]: val } });
  };

  // Top-3 Kategorien nach Score → Vorschläge berechnen
  const vorschlaege = useMemo(() => {
    if (!eigenschaften) return [];
    const sorted = Object.entries(kind.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const ergebnis = [];
    for (const katId of sorted) {
      const kat = eigenschaften.find(k => k.id === katId);
      if (!kat) continue;
      for (const eig of kat.eigenschaften.slice(0, 3)) {
        if (!ergebnis.find(e => e.name === eig.name)) {
          ergebnis.push({ ...eig, katId, katFarbe: KATEGORIE_FARBEN[katId] });
        }
      }
    }
    return ergebnis.slice(0, 6);
  }, [eigenschaften, kind.scores]);

  const eigenschaftHinzufuegen = (eig) => {
    if (kind.gewaehltEigenschaften.length >= 2) return;
    const gewaehlt = kind.gewaehltEigenschaften;
    if (gewaehlt.find(e => e.name === eig.name)) return;

    // Prüfe Ähnlichkeit (Regel 2)
    if (gewaehlt.length === 1 && sindZuAehnlich(gewaehlt[0].name, eig.name)) {
      setAehnlichHinweis(true);
      setTimeout(() => setAehnlichHinweis(false), 5000);
    }

    onUpdate({ gewaehltEigenschaften: [...gewaehlt, eig] });
    setDetailEigenschaft(null);
  };

  const eigenschaftEntfernen = (name) => {
    onUpdate({ gewaehltEigenschaften: kind.gewaehltEigenschaften.filter(e => e.name !== name) });
  };

  const fertigToggle = () => {
    if (onFertigToggle) onFertigToggle(!kind.fertig);
    else onUpdate({ fertig: !kind.fertig });
  };

  const vorname = kind.name.split(' ')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Kind-Header */}
      <div className="bg-camissio-dunkelblau text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wide mb-0.5">Charakterkarte für</div>
          <h1 className="font-headline text-3xl tracking-wide">{kind.name}</h1>
          {kind.geschlecht !== 'keine' && (
            <span className="text-xs text-camissio-lila">{kind.geschlecht}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fertigToggle}
            className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors ${
              kind.fertig
                ? 'bg-camissio-summer-gruen text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {kind.fertig ? '✓ Fertig' : 'Als fertig markieren'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Linke Spalte: Sliders + Radar */}
        <div className="space-y-4">
          {/* Wesenszug-Sliders */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-4">
              WESENSZÜGE EINSCHÄTZEN
            </h2>
            <div className="space-y-3">
              {Object.entries(KATEGORIE_NAMEN).map(([katId, name]) => (
                <ScoreSlider
                  key={katId}
                  katId={katId}
                  name={name}
                  value={kind.scores[katId] || 3}
                  onChange={(val) => handleScore(katId, val)}
                />
              ))}
            </div>
          </div>

          {/* Radar-Diagramm */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-2">
              PROFIL
            </h2>
            <RadarChart scores={kind.scores} />
          </div>
        </div>

        {/* Rechte Spalte: Vorschläge + Gewählt + Text */}
        <div className="space-y-4">
          {/* Eigenschafts-Vorschläge */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-3">
              EIGENSCHAFTS-VORSCHLÄGE
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Basierend auf den höchsten Wesenszug-Werten. Klicke für Details.
            </p>

            {vorschlaege.length === 0 ? (
              <p className="text-sm text-gray-400">Lade Eigenschaften…</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {vorschlaege.map((eig) => {
                  const istGewaehlt = kind.gewaehltEigenschaften.find(e => e.name === eig.name);
                  return (
                    <button
                      key={eig.name}
                      onClick={() => setDetailEigenschaft(eig)}
                      className={`text-left rounded-xl px-3 py-2.5 text-sm font-semibold border-2 transition-all ${
                        istGewaehlt
                          ? 'border-camissio-lila bg-camissio-lila/10 text-camissio-dunkelblau'
                          : 'border-gray-100 bg-gray-50 hover:border-camissio-lila/50 text-camissio-dunkelblau hover:bg-camissio-lila/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: eig.katFarbe }}
                        />
                        {eig.name}
                        {istGewaehlt && <span className="ml-auto text-camissio-lila">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Ähnlichkeits-Hinweis (Regel 2) */}
            {aehnlichHinweis && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                💡 Diese beiden Eigenschaften sind sehr ähnlich — möchtest du eine kontrastreichere Kombination wählen?
              </div>
            )}

            {/* Alle Eigenschaften durchsuchen */}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <button
                onClick={() => setAlleBrowseOffen(v => !v)}
                className="text-xs text-camissio-petrol hover:underline flex items-center gap-1"
              >
                <span>{alleBrowseOffen ? '▲' : '▼'}</span>
                Alle Eigenschaften durchsuchen
              </button>

              {alleBrowseOffen && eigenschaften && (
                <div className="mt-3 space-y-2">
                  {/* Kategorie-Tabs */}
                  <div className="flex gap-1 flex-wrap">
                    {eigenschaften.map(kat => (
                      <button
                        key={kat.id}
                        onClick={() => setBrowseKatId(browseKatId === kat.id ? null : kat.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                        style={browseKatId === kat.id
                          ? { background: kat.farbe, color: 'white', borderColor: kat.farbe }
                          : { background: 'white', color: '#1c4554', borderColor: '#e5e7eb' }
                        }
                      >
                        {kat.name.replace('Der ', '').replace('Das ', '').replace('Die ', '')}
                      </button>
                    ))}
                  </div>

                  {/* Eigenschaften der gewählten Kategorie */}
                  {browseKatId && (() => {
                    const kat = eigenschaften.find(k => k.id === browseKatId);
                    if (!kat) return null;
                    return (
                      <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {kat.eigenschaften.map(eig => {
                          const istGewaehlt = kind.gewaehltEigenschaften.find(e => e.name === eig.name);
                          const eigMitFarbe = { ...eig, katId: kat.id, katFarbe: KATEGORIE_FARBEN[kat.id] };
                          return (
                            <button
                              key={eig.name}
                              onClick={() => setDetailEigenschaft(eigMitFarbe)}
                              className={`text-left text-xs rounded-lg px-2.5 py-2 border transition-all ${
                                istGewaehlt
                                  ? 'border-camissio-lila bg-camissio-lila/10'
                                  : 'border-gray-100 bg-gray-50 hover:border-camissio-lila/40'
                              }`}
                            >
                              <span className="font-semibold text-camissio-dunkelblau">{eig.name}</span>
                              {istGewaehlt && <span className="ml-1 text-camissio-lila">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Gewählte Eigenschaften */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-3">
              GEWÄHLTE EIGENSCHAFTEN
              <span className="text-sm font-body font-normal text-gray-400 ml-2">
                ({kind.gewaehltEigenschaften.length}/2)
              </span>
            </h2>

            {kind.gewaehltEigenschaften.length === 0 ? (
              <p className="text-xs text-gray-400">
                Noch keine Eigenschaft ausgewählt. Klicke oben auf einen Vorschlag.
              </p>
            ) : (
              <div className="space-y-2">
                {kind.gewaehltEigenschaften.map((eig) => (
                  <div
                    key={eig.name}
                    className="flex items-center justify-between bg-camissio-lila/10 border border-camissio-lila/30 rounded-xl px-3 py-2.5"
                  >
                    <div>
                      <div className="text-sm font-semibold text-camissio-dunkelblau">{eig.name}</div>
                      {eig.bibelvers && (
                        <div className="text-xs text-camissio-petrol mt-0.5">📖 {eig.bibelvers}</div>
                      )}
                    </div>
                    <button
                      onClick={() => eigenschaftEntfernen(eig.name)}
                      className="text-gray-300 hover:text-red-400 ml-3 text-lg leading-none"
                      aria-label={`${eig.name} entfernen`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {kind.gewaehltEigenschaften.length < 2 && (
              <p className="text-xs text-gray-400 mt-2">
                {2 - kind.gewaehltEigenschaften.length} weitere Eigenschaft{kind.gewaehltEigenschaften.length === 1 ? '' : 'en'} auswählen
              </p>
            )}
          </div>

          {/* Bibelvers */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-2">
              BIBELVERS
            </h2>
            <p className="text-xs text-gray-400 mb-2">Wird auf der Charakterkarte angezeigt (Regel 14)</p>
            <input
              type="text"
              placeholder="z. B. Jeremia 29,11 oder eigenen Vers eingeben…"
              value={kind.bibelvers}
              onChange={e => onUpdate({ bibelvers: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-camissio-lila text-camissio-dunkelblau"
            />
            {/* Vorschlag aus gewählten Eigenschaften */}
            {kind.gewaehltEigenschaften.length > 0 && !kind.bibelvers && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400">Vorschlag aus den Eigenschaften:</p>
                {kind.gewaehltEigenschaften.map(eig => (
                  <button
                    key={eig.name}
                    onClick={() => onUpdate({ bibelvers: eig.bibelvers })}
                    className="text-xs text-camissio-petrol hover:underline block"
                  >
                    {eig.name}: {eig.bibelvers}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text-Editor */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-2">
              PERSÖNLICHER TEXT
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Schreibe 4–5 persönliche Sätze über {vorname} in der dritten Person — ohne die Adjektive direkt zu nennen.
            </p>
            <TextEditor
              text={kind.text}
              onChange={(text) => onUpdate({ text })}
              eigenschaften={kind.gewaehltEigenschaften}
              kindName={vorname}
            />
          </div>

          {/* PDF Export */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-2">
              EXPORTIEREN
            </h2>
            <button
              onClick={handlePrint}
              className="w-full bg-camissio-dunkelblau text-white rounded-xl py-3 font-semibold text-sm hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>Charakterkarte drucken / als PDF speichern</span>
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Nutze „Als PDF speichern" im Druckdialog deines Browsers.
            </p>
          </div>
        </div>
      </div>

      {/* Unsichtbare Druckansicht */}
      <div style={{ display: 'none' }}>
        <KarteDruck kind={kind} ref={printRef} />
      </div>

      {/* Eigenschaft-Detail-Modal */}
      {detailEigenschaft && (
        <EigenschaftDetail
          eigenschaft={detailEigenschaft}
          kindName={vorname}
          bereitsGewaehlt={!!kind.gewaehltEigenschaften.find(e => e.name === detailEigenschaft.name)}
          onAufnehmen={() => eigenschaftHinzufuegen(detailEigenschaft)}
          onSchliessen={() => setDetailEigenschaft(null)}
        />
      )}
    </div>
  );
}

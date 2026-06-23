import { useState, useEffect, useMemo } from 'react';
import RadarChart from './RadarChart';
import EigenschaftDetail from './EigenschaftDetail';
import TextEditor from './TextEditor';
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
  allerechteste: '#e8a838',
  lernend: '#1c4554',
  gestalter: '#de69a8',
  ueberwinder: '#fa5c33',
};

function ScoreSlider({ katId, name, value, onChange }) {
  const farbe = KATEGORIE_FARBEN[katId] || '#a1a5dd';
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div
        className="shrink-0 leading-tight text-camissio-dunkelblau font-semibold w-28 md:w-36"
        style={{ fontSize: '11px' }}
      >
        {name}
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <input
          type="range"
          min="0"
          max="5"
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="flex-1 min-w-0 h-2 md:h-auto"
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

function AltersgruppePill({ altersgruppe, config }) {
  if (!config || !altersgruppe) return null;
  const label = config[altersgruppe];
  if (!label) return null;
  const styles = {
    jung: 'bg-green-100 text-green-700',
    alt: 'bg-blue-100 text-blue-700',
    alle: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${styles[altersgruppe] || styles.alle}`}>
      {label}
    </span>
  );
}

export default function KindEditor({ kind, camp, onUpdate, onFertigToggle }) {
  const pillConfig = camp?.altersgruppePillConfig || null;
  if (kind.korrigiert) {
    return <KorrigiertAnsicht kind={kind} />;
  }
  const [eigenschaften, setEigenschaften] = useState(null);
  const [detailEigenschaft, setDetailEigenschaft] = useState(null);
  const [aehnlichHinweis, setAehnlichHinweis] = useState(false);
  const [alleBrowseOffen, setAlleBrowseOffen] = useState(false);
  const [browseKatId, setBrowseKatId] = useState(null);
  const [eigeneEigenschaft, setEigeneEigenschaft] = useState('');
  // Eigenschaften laden (camp-spezifisch)
  useEffect(() => {
    const file = camp?.eigenschaftenFile || '/data/eigenschaften-youth-camp.json';
    fetch(file)
      .then(r => r.json())
      .then(d => setEigenschaften(d.kategorien))
      .catch(console.error);
  }, [camp?.eigenschaftenFile]);

  // Scores der 7 Kategorien
  const handleScore = (katId, val) => {
    onUpdate({ scores: { ...kind.scores, [katId]: val } });
  };

  // Top-3 Kategorien nach Score → Vorschläge berechnen
  const vorschlaege = useMemo(() => {
    if (!eigenschaften) return [];
    if (Object.values(kind.scores).every(s => !s || s === 0)) return [];
    const sorted = Object.entries(kind.scores)
      .filter(([, v]) => v > 0)
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
      <div className="bg-camissio-dunkelblau text-white rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-white/50 uppercase tracking-wide mb-0.5">Charakterkarte für</div>
          <h1 className="font-headline text-2xl md:text-3xl tracking-wide truncate">{kind.name}</h1>
          {kind.geschlecht !== 'keine' && (
            <span className="text-xs text-camissio-lila">{kind.geschlecht}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fertigToggle}
            className={`text-sm px-3 md:px-4 py-2 rounded-xl font-semibold transition-colors ${
              kind.fertig
                ? 'bg-camissio-summer-gruen text-white'
                : 'bg-white/10 text-white/70 active:bg-white/20'
            }`}
          >
            {kind.fertig ? '✓ Fertig' : 'Zur Korrektur'}
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
              {(eigenschaften || Object.entries(KATEGORIE_NAMEN).map(([id, name]) => ({ id, name }))).map((kat) => {
                const katId = kat.id ?? kat[0];
                const name = kat.name ?? kat[1];
                return (
                  <ScoreSlider
                    key={katId}
                    katId={katId}
                    name={name}
                    value={kind.scores[katId] ?? 0}
                    onChange={(val) => handleScore(katId, val)}
                  />
                );
              })}
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
              <p className="text-sm text-gray-400">
                {eigenschaften
                  ? 'Setze die Slider links, um passende Vorschläge zu erhalten.'
                  : 'Lade Eigenschaften…'}
              </p>
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: eig.katFarbe }}
                        />
                        <span className="flex-1">{eig.name}</span>
                        <AltersgruppePill altersgruppe={eig.altersgruppe} config={pillConfig} />
                        {istGewaehlt && <span className="text-camissio-lila">✓</span>}
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
                              <AltersgruppePill altersgruppe={eig.altersgruppe} config={pillConfig} />
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

          {/* Eigene Eigenschaft hinzufügen */}
          {kind.gewaehltEigenschaften.length < 2 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide mb-3">
                EIGENE EIGENSCHAFT
              </h2>
              <p className="text-xs text-gray-400 mb-2">Nicht in der Liste? Trag hier eine eigene ein.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={eigeneEigenschaft}
                  onChange={e => setEigeneEigenschaft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && eigeneEigenschaft.trim()) {
                      eigenschaftHinzufuegen({ name: eigeneEigenschaft.trim(), katFarbe: '#9ca3af' });
                      setEigeneEigenschaft('');
                    }
                  }}
                  placeholder="z.B. Humorvoll"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-camissio-dunkelblau focus:outline-none focus:ring-2 focus:ring-camissio-lila"
                />
                <button
                  onClick={() => {
                    if (!eigeneEigenschaft.trim()) return;
                    eigenschaftHinzufuegen({ name: eigeneEigenschaft.trim(), katFarbe: '#9ca3af' });
                    setEigeneEigenschaft('');
                  }}
                  className="px-4 py-2 bg-camissio-lila text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  +
                </button>
              </div>
            </div>
          )}

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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-camissio-dunkelblau">{eig.name}</span>
                        <AltersgruppePill altersgruppe={eig.altersgruppe} config={pillConfig} />
                      </div>
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

          {/* Bibelvers — nur beim YOUTH CAMP */}
          {camp?.id === 'youth-camp' && <div className="bg-white rounded-2xl p-4 shadow-sm">
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
          </div>}

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

          {/* Fertig-Button */}
          <button
            onClick={fertigToggle}
            className={`w-full py-4 rounded-2xl font-headline text-xl tracking-wide transition-colors ${
              kind.fertig
                ? 'bg-camissio-summer-gruen text-white'
                : 'bg-camissio-dunkelblau text-white hover:opacity-90'
            }`}
          >
            {kind.fertig ? '✓ Zur Korrektur eingereicht' : 'Zur Korrektur →'}
          </button>
        </div>
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

import { useState, useEffect } from 'react';
import { getKorrekturKinder, updateKorrektur } from '../utils/api';
import MarkupEditor from './MarkupEditor';

export default function KorrekturPortal({ passwort, onAbmelden }) {
  const [kinder, setKinder] = useState([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState(null);
  const [aktivesId, setAktivesId] = useState(null);
  const [filter, setFilter] = useState('alle'); // 'alle' | 'offen' | 'korrigiert'

  useEffect(() => {
    laden_();
  }, []);

  async function laden_() {
    setLaden(true);
    try {
      const data = await getKorrekturKinder(passwort);
      setKinder(data);
    } catch {
      setFehler('Karten konnten nicht geladen werden.');
    } finally {
      setLaden(false);
    }
  }

  const gefilterteKinder = kinder.filter(k => {
    if (filter === 'offen') return !k.korrigiert;
    if (filter === 'korrigiert') return k.korrigiert;
    return true;
  });

  const aktivesKind = kinder.find(k => k.id === aktivesId) || null;

  async function handleKorrigiert(kind, korrigiert) {
    try {
      const aktualisiert = await updateKorrektur(kind.id, { korrigiert }, passwort);
      setKinder(prev => prev.map(k => k.id === aktualisiert.id ? aktualisiert : k));
    } catch {
      alert('Fehler beim Speichern.');
    }
  }

  async function handleTextSpeichern(kind, text, textMarkup, notiz) {
    try {
      const aktualisiert = await updateKorrektur(
        kind.id,
        { text, text_markup: textMarkup, korrektur_notiz: notiz, korrigiert: true },
        passwort
      );
      setKinder(prev => prev.map(k => k.id === aktualisiert.id ? aktualisiert : k));
      setAktivesId(null);
    } catch {
      alert('Fehler beim Speichern.');
    }
  }

  return (
    <div className="min-h-screen bg-camissio-greige font-body">
      {/* Header */}
      <header className="bg-camissio-dunkelblau text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl tracking-wide">KORREKTUR-PORTAL</h1>
          <p className="text-white/50 text-xs mt-0.5">
            {kinder.filter(k => !k.korrigiert).length} offen · {kinder.filter(k => k.korrigiert).length} korrigiert
          </p>
        </div>
        <button onClick={onAbmelden}
          className="text-white/60 hover:text-white text-sm transition-colors">
          Abmelden ×
        </button>
      </header>

      <div className="flex" style={{ height: 'calc(100vh - 72px)' }}>
        {/* Linke Liste */}
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden shrink-0">
          {/* Filter */}
          <div className="p-3 border-b border-gray-100 flex gap-1">
            {[['alle', 'Alle'], ['offen', 'Offen'], ['korrigiert', 'Korrigiert']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
                  filter === val
                    ? 'bg-camissio-dunkelblau text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {laden && <p className="text-xs text-gray-400 text-center py-6">Lädt...</p>}
            {fehler && <p className="text-xs text-red-500 text-center py-6">{fehler}</p>}
            {!laden && gefilterteKinder.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">Keine Karten in dieser Kategorie.</p>
            )}

            {/* Gruppierung nach Camp */}
            {gruppieren(gefilterteKinder).map(({ label, kinder: gruppe }) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 px-3 pt-3 pb-1 uppercase tracking-wider">{label}</p>
                {gruppe.map(kind => (
                  <button
                    key={kind.id}
                    onClick={() => setAktivesId(kind.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                      aktivesId === kind.id
                        ? 'bg-camissio-dunkelblau/10 border border-camissio-dunkelblau/20'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <span className={`shrink-0 w-2 h-2 rounded-full ${kind.korrigiert ? 'bg-green-400' : 'bg-orange-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-camissio-dunkelblau font-medium truncate">{kind.name}</p>
                      <p className="text-xs text-gray-400">{kind.gruppe}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Rechts: Detail */}
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          {aktivesKind ? (
            <KindDetail
              kind={aktivesKind}
              onKorrigiert={(k) => handleKorrigiert(k, !k.korrigiert)}
              onSpeichern={(kind, text, markup, notiz) => handleTextSpeichern(kind, text, markup, notiz)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400 text-sm">Karte aus der Liste wählen</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function KindDetail({ kind, onKorrigiert, onSpeichern }) {
  const [markup, setMarkup] = useState(kind.text_markup || '');
  const [notiz, setNotiz] = useState(kind.korrektur_notiz || '');
  const [speichern, setSpeichern] = useState(false);
  // key erzwingt Re-Mount des Editors bei Kartenwechsel
  const editorKey = kind.id;

  useEffect(() => {
    setMarkup(kind.text_markup || '');
    setNotiz(kind.korrektur_notiz || '');
  }, [kind.id]);

  async function handleSpeichern() {
    setSpeichern(true);
    await onSpeichern(kind, kind.text, markup, notiz);
    setSpeichern(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Meta */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-headline text-3xl text-camissio-dunkelblau tracking-wide">{kind.name}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {kind.camp_typ} · {kind.camp_standort}{kind.camp_code ? ` (${kind.camp_code})` : ''} · Gruppe {kind.gruppe}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          kind.korrigiert ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {kind.korrigiert ? 'Korrigiert' : 'Offen'}
        </span>
      </div>

      {/* Eigenschaften */}
      {kind.gewaehltEigenschaften?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gewählte Eigenschaften</p>
          <div className="flex flex-wrap gap-2">
            {kind.gewaehltEigenschaften.map((e, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: e.katFarbe || '#1c4554' }}>
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bibelvers */}
      {kind.bibelvers && (
        <div className="mb-4 p-3 bg-white rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bibelvers</p>
          <p className="text-sm text-camissio-dunkelblau">{kind.bibelvers}</p>
        </div>
      )}

      {/* Markup-Editor */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Charaktertext
          <span className="ml-2 normal-case font-normal text-gray-400">— Text markieren oder durchstreichen</span>
        </p>
        <MarkupEditor
          key={editorKey}
          initialHtml={kind.text_markup || ''}
          plainText={kind.text}
          onChange={setMarkup}
        />
      </div>

      {/* Korrektur-Notiz */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interne Notiz (optional)</p>
        <textarea
          value={notiz}
          onChange={e => setNotiz(e.target.value)}
          rows={2}
          placeholder="Notiz für den Gruppenleiter..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-camissio-dunkelblau focus:outline-none focus:ring-2 focus:ring-camissio-dunkelblau/20 resize-none"
        />
      </div>

      {/* Aktionen */}
      <div className="flex gap-3">
        <button
          onClick={handleSpeichern}
          disabled={speichern}
          className="flex-1 py-3 bg-camissio-dunkelblau text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {speichern ? 'Speichert...' : 'Speichern & als korrigiert markieren'}
        </button>
        {kind.korrigiert && (
          <button
            onClick={() => onKorrigiert(kind)}
            className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm hover:border-orange-300 hover:text-orange-600 transition-colors"
          >
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

function gruppieren(kinder) {
  const map = {};
  for (const k of kinder) {
    const label = `${k.camp_typ} · ${k.camp_standort}${k.camp_code ? ` (${k.camp_code})` : ''}`;
    if (!map[label]) map[label] = [];
    map[label].push(k);
  }
  return Object.entries(map).map(([label, kinder]) => ({ label, kinder }));
}

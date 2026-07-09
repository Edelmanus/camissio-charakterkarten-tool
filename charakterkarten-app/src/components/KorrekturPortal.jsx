import { useState, useEffect } from 'react';
import { getKorrekturStats, getKorrekturKinder, updateKorrektur } from '../utils/api';
import MarkupEditor from './MarkupEditor';
import { CAMPPLAN, getISOWeek, formatDatum, eintragLabel } from '../config/camps';

export default function KorrekturPortal({ passwort, onAbmelden }) {
  const [stats, setStats] = useState([]); // [{ camp_typ, camp_standort, camp_code, gesamt, korrigiert }]
  const [kinderCache, setKinderCache] = useState({}); // "typ|standort" → [kinder]
  const [statsLaden, setStatsLaden] = useState(true);
  const [stadtLaden, setStadtLaden] = useState(false);
  const [fehler, setFehler] = useState(null);
  const [aufgeklappt, setAufgeklappt] = useState(new Set());
  const [ausgewaehlt, setAusgewaehlt] = useState(null); // { typ, standort, code }
  const [aktiveGruppe, setAktiveGruppe] = useState(null);
  const [aktivesKindId, setAktivesKindId] = useState(null);
  const [filter, setFilter] = useState('alle');

  const aktuelleKW = getISOWeek(new Date());

  useEffect(() => { ladeStats(); }, []);

  useEffect(() => {
    if (statsLaden) return;
    const aktiv = CAMPPLAN.find(w => w.kw === aktuelleKW)
      || CAMPPLAN.find(w => w.kw > aktuelleKW);
    if (aktiv) setAufgeklappt(new Set([aktiv.kw]));
  }, [statsLaden]);

  async function ladeStats() {
    setStatsLaden(true);
    try {
      const data = await getKorrekturStats(passwort);
      setStats(data);
    } catch {
      setFehler('Statistiken konnten nicht geladen werden.');
    } finally {
      setStatsLaden(false);
    }
  }

  function cacheKey(typ, standort) {
    return `${typ}|${standort}`;
  }

  function kinderFuerAuswahl(typ, standort) {
    return kinderCache[cacheKey(typ, standort)] || [];
  }

  async function handleStadtWaehlen(e) {
    setAusgewaehlt(e);
    setAktiveGruppe(null);
    setAktivesKindId(null);
    setFilter('alle');

    const key = cacheKey(e.typ, e.standort);
    if (kinderCache[key]) return; // bereits gecacht

    setStadtLaden(true);
    try {
      const data = await getKorrekturKinder(passwort, e.typ, e.standort);
      setKinderCache(prev => ({ ...prev, [key]: data }));
    } catch {
      setFehler('Karten konnten nicht geladen werden.');
    } finally {
      setStadtLaden(false);
    }
  }

  function toggleKW(kw) {
    setAufgeklappt(prev => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });
  }

  function progress(typ, standort) {
    const s = stats.find(s => s.camp_typ === typ && s.camp_standort === standort);
    return s ? { gesamt: s.gesamt, korrigiert: s.korrigiert } : { gesamt: 0, korrigiert: 0 };
  }

  function updateKindInCache(typ, standort, aktualisiert) {
    const key = cacheKey(typ, standort);
    setKinderCache(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(k => k.id === aktualisiert.id ? aktualisiert : k),
    }));
  }

  function updateStats(typ, standort, vorher, nachher) {
    setStats(prev => prev.map(s => {
      if (s.camp_typ !== typ || s.camp_standort !== standort) return s;
      const delta = (nachher.korrigiert ? 1 : 0) - (vorher.korrigiert ? 1 : 0);
      return { ...s, korrigiert: s.korrigiert + delta };
    }));
  }

  const aktuelleKinder = ausgewaehlt ? kinderFuerAuswahl(ausgewaehlt.typ, ausgewaehlt.standort) : [];
  const aktivesKind = aktuelleKinder.find(k => k.id === aktivesKindId) || null;

  const kinderFuerGruppe = aktiveGruppe
    ? aktuelleKinder.filter(k => k.gruppe === aktiveGruppe)
    : [];

  const gefilterteKinder = kinderFuerGruppe.filter(k => {
    if (filter === 'offen') return !k.korrigiert;
    if (filter === 'korrigiert') return k.korrigiert;
    return true;
  });

  const gesamtOffen = stats.reduce((sum, s) => sum + (s.gesamt - s.korrigiert), 0);
  const gesamtKorrigiert = stats.reduce((sum, s) => sum + s.korrigiert, 0);

  async function handleKorrigiert(kind) {
    try {
      const aktualisiert = await updateKorrektur(kind.id, { korrigiert: !kind.korrigiert }, passwort);
      updateKindInCache(ausgewaehlt.typ, ausgewaehlt.standort, aktualisiert);
      updateStats(ausgewaehlt.typ, ausgewaehlt.standort, kind, aktualisiert);
    } catch {
      alert('Fehler beim Speichern.');
    }
  }

  async function handleSpeichern(kind, text, textMarkup, notiz) {
    try {
      const aktualisiert = await updateKorrektur(
        kind.id,
        { text, text_markup: textMarkup, korrektur_notiz: notiz, korrigiert: true },
        passwort
      );
      updateKindInCache(ausgewaehlt.typ, ausgewaehlt.standort, aktualisiert);
      updateStats(ausgewaehlt.typ, ausgewaehlt.standort, kind, aktualisiert);
      setAktivesKindId(null);
    } catch {
      alert('Fehler beim Speichern.');
    }
  }

  return (
    <div className="min-h-screen bg-camissio-greige font-body flex flex-col">
      <header className="bg-camissio-dunkelblau text-white px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-2xl tracking-wide">KORREKTUR-PORTAL</h1>
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-white/80 text-xs font-medium">Sommer 2026</span>
          </div>
          <p className="text-white/50 text-xs mt-0.5">
            {statsLaden ? 'Lädt…' : `${gesamtOffen} offen · ${gesamtKorrigiert} korrigiert`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors">
            Fehler-Log ↗
          </a>
          <button onClick={onAbmelden} className="text-white/60 hover:text-white text-sm transition-colors">
            Abmelden ×
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Wochenplan — auf Mobile nur wenn keine Stadt gewählt */}
        <aside className={`bg-white border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 ${ausgewaehlt ? 'hidden md:flex md:w-72' : 'w-full md:w-72'}`}>
          {fehler && <p className="text-xs text-red-500 text-center py-6 px-4">{fehler}</p>}
          {statsLaden && <p className="text-xs text-gray-400 text-center py-6">Lädt…</p>}

          {CAMPPLAN.map(woche => {
            const today = new Date();
            const vonDate = new Date(woche.datumVon);
            const bisDate = new Date(woche.datumBis + 'T23:59:59');
            const istAktuell = today >= vonDate && today <= bisDate;
            const istVergangen = bisDate < today;
            const istOffen = aufgeklappt.has(woche.kw);

            return (
              <div key={woche.kw} className={`border-b border-gray-100 ${istVergangen ? 'opacity-55' : ''}`}>
                <button
                  onClick={() => toggleKW(woche.kw)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    istAktuell ? 'bg-yellow-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {istAktuell && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />}
                    <div>
                      <p className={`text-xs font-bold tracking-wide ${istAktuell ? 'text-yellow-700' : 'text-gray-600'}`}>
                        KW {woche.kw}
                        {istAktuell && <span className="ml-1.5 font-normal text-yellow-600/80">· Diese Woche</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDatum(woche.datumVon)} – {formatDatum(woche.datumBis)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform duration-150 inline-block ${istOffen ? 'rotate-90' : ''}`}>›</span>
                </button>

                {istOffen && (
                  <div className="pb-1">
                    {woche.eintraege.map(e => {
                      const p = progress(e.typ, e.standort);
                      const istGewählt = ausgewaehlt?.typ === e.typ && ausgewaehlt?.standort === e.standort;
                      const fertig = p.gesamt > 0 && p.korrigiert === p.gesamt;

                      return (
                        <button
                          key={`${e.typ}-${e.standort}`}
                          onClick={() => handleStadtWaehlen(e)}
                          className={`w-full flex items-center justify-between px-4 pl-7 py-2 text-left transition-colors ${
                            istGewählt
                              ? 'bg-camissio-dunkelblau/10 border-r-2 border-camissio-dunkelblau'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                              fertig ? 'bg-green-400' : p.gesamt === 0 ? 'bg-gray-300' : 'bg-orange-400'
                            }`} />
                            <span className={`text-sm truncate ${istGewählt ? 'text-camissio-dunkelblau font-semibold' : 'text-gray-700'}`}>
                              {eintragLabel(e)}
                            </span>
                          </div>
                          {p.gesamt > 0 && (
                            <span className={`text-xs shrink-0 ml-2 ${fertig ? 'text-green-600' : 'text-gray-400'}`}>
                              {p.korrigiert}/{p.gesamt}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Hauptbereich — auf Mobile nur wenn Stadt gewählt */}
        <main className={`flex-1 overflow-hidden flex flex-col ${!ausgewaehlt ? 'hidden md:flex' : ''}`}>
          {!ausgewaehlt && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Stadt aus dem Wochenplan wählen</p>
                <p className="text-gray-300 text-xs mt-1">← Woche aufklappen und Standort auswählen</p>
              </div>
            </div>
          )}

          {ausgewaehlt && !aktiveGruppe && (
            stadtLaden
              ? <div className="flex-1 flex items-center justify-center"><p className="text-gray-400 text-sm">Karten werden geladen…</p></div>
              : <GruppenUebersicht
                  eintrag={ausgewaehlt}
                  kinder={aktuelleKinder}
                  onGruppeWaehlen={g => { setAktiveGruppe(g); setFilter('alle'); }}
                  onZurueckZuStadt={() => setAusgewaehlt(null)}
                />
          )}

          {ausgewaehlt && aktiveGruppe && !aktivesKind && (
            <GruppenDetail
              eintrag={ausgewaehlt}
              gruppe={aktiveGruppe}
              kinder={gefilterteKinder}
              alleKinder={kinderFuerGruppe}
              filter={filter}
              onFilterChange={setFilter}
              onZurueck={() => setAktiveGruppe(null)}
              onKindWaehlen={setAktivesKindId}
            />
          )}

          {aktivesKind && (
            <KindDetail
              kind={aktivesKind}
              onZurueck={() => setAktivesKindId(null)}
              onKorrigiert={handleKorrigiert}
              onSpeichern={handleSpeichern}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function GruppenUebersicht({ eintrag, kinder, onGruppeWaehlen, onZurueckZuStadt }) {
  const gruppen = gruppenSortiert(kinder);
  const offen = kinder.filter(k => !k.korrigiert).length;
  const korrigiert = kinder.filter(k => k.korrigiert).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <button onClick={onZurueckZuStadt} className="md:hidden text-xs text-camissio-petrol hover:underline mb-2 flex items-center gap-1">
          ‹ Stadtauswahl
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-headline text-2xl text-camissio-dunkelblau tracking-wide">
              {eintragLabel(eintrag)}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{eintrag.typ}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-orange-500">{offen}</p>
              <p className="text-xs text-gray-400">offen</p>
            </div>
            <div>
              <p className="text-xl font-bold text-green-500">{korrigiert}</p>
              <p className="text-xs text-gray-400">fertig</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-500">{kinder.length}</p>
              <p className="text-xs text-gray-400">gesamt</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {gruppen.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Noch keine Karten für diesen Standort.</p>
            <p className="text-gray-300 text-xs mt-1">Karten erscheinen sobald Gruppenleiter sie als fertig markieren.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Gruppe wählen</p>
            <div className="space-y-6">
              {['mädels', 'jungs'].map(sektion => {
                const sektionGruppen = gruppen.filter(g => g.gruppe && g.sektion === sektion);
                if (sektionGruppen.length === 0) return null;
                return (
                  <div key={sektion}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {sektion === 'mädels' ? 'Mädchen' : 'Jungs'}
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {sektionGruppen.map(({ gruppe, kinder: kids }) => {
                        const offenInGruppe = kids.filter(k => !k.korrigiert).length;
                        const alleKorrigiert = offenInGruppe === 0;
                        return (
                          <button
                            key={gruppe}
                            onClick={() => onGruppeWaehlen(gruppe)}
                            className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${
                              alleKorrigiert
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:border-camissio-dunkelblau/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-headline text-2xl text-camissio-dunkelblau tracking-wide">{gruppe}</p>
                              <p className="text-xs text-gray-400">{kids.length}</p>
                            </div>
                            <div className="mt-3">
                              {alleKorrigiert ? (
                                <span className="text-xs font-semibold text-green-600">✓ Vollständig</span>
                              ) : (
                                <span className="text-xs font-semibold text-orange-500">{offenInGruppe} offen</span>
                              )}
                            </div>
                            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${alleKorrigiert ? 'bg-green-400' : 'bg-orange-400'}`}
                                style={{ width: `${kids.length > 0 ? ((kids.length - offenInGruppe) / kids.length) * 100 : 0}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GruppenDetail({ eintrag, gruppe, kinder, alleKinder, filter, onFilterChange, onZurueck, onKindWaehlen }) {
  const offen = alleKinder.filter(k => !k.korrigiert).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <button onClick={onZurueck} className="text-xs text-camissio-petrol hover:underline mb-2 flex items-center gap-1">
          ‹ Alle Gruppen
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl text-camissio-dunkelblau tracking-wide">
              {eintragLabel(eintrag)} · Gruppe {gruppe}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {alleKinder.length} Kinder · {offen > 0 ? `${offen} offen` : 'vollständig korrigiert'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            offen === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {offen === 0 ? '✓ Fertig' : `${offen} offen`}
          </span>
        </div>

        <div className="flex gap-1 mt-3">
          {[['alle', 'Alle'], ['offen', 'Offen'], ['korrigiert', 'Korrigiert']].map(([val, label]) => (
            <button key={val} onClick={() => onFilterChange(val)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                filter === val ? 'bg-camissio-dunkelblau text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-2">
        {kinder.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">Keine Karten in dieser Kategorie.</p>
        )}
        {kinder.map(kind => (
          <button
            key={kind.id}
            onClick={() => onKindWaehlen(kind.id)}
            className="w-full bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 hover:border-camissio-dunkelblau/30 hover:shadow-sm transition-all text-left"
          >
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${kind.korrigiert ? 'bg-green-400' : 'bg-orange-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-camissio-dunkelblau truncate">{kind.name}</p>
              {kind.gewaehltEigenschaften?.length > 0 && (
                <p className="text-xs text-gray-400 truncate">
                  {kind.gewaehltEigenschaften.map(e => e.name).join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {kind.korrektur_notiz && <span className="text-xs text-gray-400">💬</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                kind.korrigiert ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {kind.korrigiert ? 'Korrigiert' : 'Offen'}
              </span>
              <span className="text-gray-300 text-sm">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function KindDetail({ kind, onZurueck, onKorrigiert, onSpeichern }) {
  const [markup, setMarkup] = useState(kind.text_markup || '');
  const [notiz, setNotiz] = useState(kind.korrektur_notiz || '');
  const [speichert, setSpeichert] = useState(false);

  useEffect(() => {
    setMarkup(kind.text_markup || '');
    setNotiz(kind.korrektur_notiz || '');
  }, [kind.id]);

  async function handleSpeichern() {
    setSpeichert(true);
    await onSpeichern(kind, kind.text, markup, notiz);
    setSpeichert(false);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <button onClick={onZurueck} className="text-xs text-camissio-petrol hover:underline mb-2 flex items-center gap-1">
          ‹ Zurück zur Gruppe
        </button>
        <div className="flex items-start justify-between">
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
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-5">
        {kind.gewaehltEigenschaften?.length > 0 && (
          <div>
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

        {kind.bibelvers && (
          <div className="p-3 bg-white rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bibelvers</p>
            <p className="text-sm text-camissio-dunkelblau">{kind.bibelvers}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Charaktertext
            <span className="ml-2 normal-case font-normal">— Text markieren oder durchstreichen</span>
          </p>
          <MarkupEditor
            key={kind.id}
            initialHtml={kind.text_markup || ''}
            plainText={kind.text}
            onChange={setMarkup}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vollständig korrigierter Text für Gruppenleiter</p>
          <textarea
            value={notiz}
            onChange={e => setNotiz(e.target.value)}
            rows={3}
            placeholder="Notiz für den Gruppenleiter..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-camissio-dunkelblau focus:outline-none focus:ring-2 focus:ring-camissio-dunkelblau/20 resize-none"
          />
        </div>

        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSpeichern}
            disabled={speichert}
            className="flex-1 py-3 bg-camissio-dunkelblau text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {speichert ? 'Speichert…' : 'Speichern & als korrigiert markieren'}
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
    </div>
  );
}

function gruppenSortiert(kinder) {
  const map = {};
  for (const k of kinder) {
    if (!map[k.gruppe]) map[k.gruppe] = [];
    map[k.gruppe].push(k);
  }
  return Object.entries(map)
    .sort(([a], [b]) => {
      const sA = a.startsWith('M') ? 0 : 1;
      const sB = b.startsWith('M') ? 0 : 1;
      if (sA !== sB) return sA - sB;
      return a.localeCompare(b, 'de', { numeric: true });
    })
    .map(([gruppe, kinder]) => ({
      gruppe,
      sektion: gruppe.startsWith('M') ? 'mädels' : 'jungs',
      kinder,
    }));
}

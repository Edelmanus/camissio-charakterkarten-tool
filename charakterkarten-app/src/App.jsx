import { useState, useEffect, useCallback, useRef } from 'react';
import { getSession, clearSession, getKinder, createKind, updateKind, deleteKind, setFertig } from './utils/api';
import { getCampById } from './config/camps';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KindEditor from './components/KindEditor';
import AnleitungModal from './components/AnleitungModal';
import LeereAnsicht from './components/LeereAnsicht';
import CampAuswahl from './components/CampAuswahl';
import KorrekturPortal from './components/KorrekturPortal';
import Onboarding from './components/Onboarding';

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [korrekturPasswort, setKorrekturPasswort] = useState(null);

  function handleSessionGestartet(sess) {
    setSession(sess);
  }

  function handleKorrekturPortal(passwort) {
    setKorrekturPasswort(passwort);
  }

  function handleAbmelden() {
    clearSession();
    setSession(null);
  }

  function handleKorrekturAbmelden() {
    setKorrekturPasswort(null);
  }

  if (korrekturPasswort) {
    return <KorrekturPortal passwort={korrekturPasswort} onAbmelden={handleKorrekturAbmelden} />;
  }

  if (!session) {
    return (
      <CampAuswahl
        onSessionGestartet={handleSessionGestartet}
        onKorrekturPortal={handleKorrekturPortal}
      />
    );
  }

  return (
    <GruppenApp session={session} onAbmelden={handleAbmelden} />
  );
}

function GruppenApp({ session, onAbmelden }) {
  const [kinder, setKinder] = useState([]);
  const [aktivesKindId, setAktivesKindId] = useState(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState(null);
  const [anleitungOffen, setAnleitungOffen] = useState(false);
  const [sidebarOffen, setSidebarOffen] = useState(true);
  const [aktiverTab, setAktivesTab] = useState('gruppe'); // mobile tabs: 'gruppe' | 'karte'
  const [neuesKindFormOffen, setNeuesKindFormOffen] = useState(false);
  const [onboardingGesehen, setOnboardingGesehen] = useState(
    () => !!localStorage.getItem(`onboarding_${session.campId}_${session.gruppe}`)
  );

  const camp = getCampById(campIdFromTyp(session.campTyp));

  useEffect(() => {
    if (!camp) return;
    const root = document.documentElement;
    root.style.setProperty('--camp-akzent', camp.farbe);
    root.style.setProperty('--camp-akzent-hell', camp.farbeHell);
    root.style.setProperty('--camp-akzent-text', camp.farbeText);
  }, [camp]);

  useEffect(() => {
    getKinder(session.campId, session.gruppe)
      .then(data => { setKinder(data); setLaden(false); })
      .catch(() => { setFehler('Kinder konnten nicht geladen werden.'); setLaden(false); });

    const poll = setInterval(() => {
      getKinder(session.campId, session.gruppe)
        .then(data => setKinder(prev => prev.map(alt => {
          const neu = data.find(k => k.id === alt.id);
          if (!neu) return alt;
          if (alt.korrigiert !== neu.korrigiert || alt.text_markup !== neu.text_markup || alt.korrektur_notiz !== neu.korrektur_notiz) {
            return { ...alt, korrigiert: neu.korrigiert, text_markup: neu.text_markup, korrektur_notiz: neu.korrektur_notiz };
          }
          return alt; // gleiche Referenz → kein Re-render
        })))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(poll);
  }, [session.campId, session.gruppe]);

  const aktiveKind = kinder.find(k => k.id === aktivesKindId) || null;

  const neuesKindAnlegen = useCallback(async (name, geschlecht) => {
    try {
      const kind = await createKind(session.campId, session.gruppe, name, geschlecht);
      setKinder(prev => [...prev, kind]);
      setAktivesKindId(kind.id);
      setNeuesKindFormOffen(false);
      if (window.innerWidth < 768) setAktivesTab('karte');
      else setSidebarOffen(false);
    } catch {
      alert('Fehler beim Anlegen.');
    }
  }, [session]);

  const kindAktivieren = useCallback((id) => {
    setAktivesKindId(id);
    if (window.innerWidth < 768) setAktivesTab('karte');
    else setSidebarOffen(false);
  }, []);

  // Läuft pro Kind-ID eine Kette von Speicher-Requests, damit sie nacheinander
  // (statt parallel) beim Server ankommen — ein älterer Zwischenstand kann so
  // nie einen neueren überschreiben, selbst bei instabiler Camp-WLAN-Verbindung.
  const saveQueueRef = useRef({});

  const kindLoeschen = useCallback(async (id) => {
    try {
      await deleteKind(id);
      delete saveQueueRef.current[id];
      setKinder(prev => {
        const neueKinder = prev.filter(k => k.id !== id);
        if (aktivesKindId === id) {
          setAktivesKindId(neueKinder.length > 0 ? neueKinder[0].id : null);
        }
        return neueKinder;
      });
    } catch {
      alert('Fehler beim Löschen.');
    }
  }, [aktivesKindId]);

  const kindAktualisieren = useCallback((id, updates) => {
    // Sofortiges lokales Update: die Oberfläche zeigt den neuen Stand direkt,
    // unabhängig davon, wie lange der Request zum Server braucht.
    setKinder(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));

    // Frontend nutzt gewaehltEigenschaften (camelCase), Backend erwartet gewaehlte_eigenschaften
    const normalized = { ...updates };
    if (normalized.gewaehltEigenschaften !== undefined) {
      normalized.gewaehlte_eigenschaften = normalized.gewaehltEigenschaften;
      delete normalized.gewaehltEigenschaften;
    }

    const vorherige = saveQueueRef.current[id] || Promise.resolve();
    saveQueueRef.current[id] = vorherige
      .catch(() => {})
      .then(() => updateKind(id, normalized))
      .catch(() => {
        alert('Fehler beim Speichern — bitte Internetverbindung prüfen und Seite neu laden.');
      });
  }, []);

  const kindFertigToggle = useCallback(async (id, fertig) => {
    try {
      const aktualisiert = await setFertig(id, fertig);
      setKinder(prev => prev.map(k => k.id === id ? aktualisiert : k));
    } catch {
      alert('Fehler beim Speichern des Status.');
    }
  }, []);

  const onboardingAbschliessen = useCallback(() => {
    localStorage.setItem(`onboarding_${session.campId}_${session.gruppe}`, '1');
    setOnboardingGesehen(true);
  }, [session]);

  if (!camp) {
    return <div className="p-8 text-red-500">Camp-Konfiguration nicht gefunden.</div>;
  }

  if (laden) {
    return (
      <div className="min-h-screen bg-camissio-greige flex items-center justify-center">
        <p className="text-camissio-dunkelblau/50 font-body">Lade Gruppe {session.gruppe}...</p>
      </div>
    );
  }

  if (fehler) {
    return (
      <div className="min-h-screen bg-camissio-greige flex items-center justify-center">
        <p className="text-red-500 font-body">{fehler}</p>
      </div>
    );
  }

  if (!onboardingGesehen) {
    return <Onboarding camp={camp} onWeiter={onboardingAbschliessen} />;
  }

  const sidebarProps = {
    kinder,
    aktivesKindId,
    camp,
    gruppe: session.gruppe,
    onKindAktivieren: kindAktivieren,
    onNeuesKind: neuesKindAnlegen,
    onKindLoeschen: kindLoeschen,
    formOffen: neuesKindFormOffen,
    onFormOffenChange: setNeuesKindFormOffen,
  };

  const kindEditorContent = aktiveKind ? (
    <KindEditor
      kind={aktiveKind}
      camp={camp}
      onUpdate={(updates) => kindAktualisieren(aktiveKind.id, updates)}
      onFertigToggle={(fertig) => kindFertigToggle(aktiveKind.id, fertig)}
    />
  ) : (
    <LeereAnsicht onNeuesKind={neuesKindAnlegen} gruppe={session.gruppe} />
  );

  return (
    <div className="min-h-screen bg-camissio-greige font-body">
      <Header
        camp={camp}
        session={session}
        onAnleitung={() => setAnleitungOffen(true)}
        onSidebarToggle={() => setSidebarOffen(v => !v)}
        sidebarOffen={sidebarOffen}
        anzahlKinder={kinder.length}
        onCampWechseln={onAbmelden}
      />

      {/* ── Desktop-Layout (md+) ── */}
      <div className="hidden md:flex gap-3 p-3" style={{ height: 'calc(100vh - 84px)' }}>
        <div className={`shrink-0 transition-all duration-200 ${sidebarOffen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <div className="bg-white rounded-2xl shadow-sm h-full overflow-hidden">
            <Sidebar {...sidebarProps} />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto min-w-0 bg-white rounded-2xl shadow-sm p-6">
          {kindEditorContent}
        </main>
      </div>

      {/* ── Mobile-Layout (<md): Tab-Content + Bottom Nav ── */}
      <div className="md:hidden flex flex-col px-3 gap-2 pb-3" style={{ height: 'calc(100vh - 84px)' }}>
        {/* Tab-Inhalt als Pill */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-sm">
          {aktiverTab === 'gruppe' && <Sidebar {...sidebarProps} />}
          {aktiverTab === 'karte' && (
            <div className="p-4">
              {kindEditorContent}
            </div>
          )}
        </div>

        {/* Bottom Navigation als Pill */}
        <nav className="bg-white rounded-2xl shadow-md shrink-0 flex items-center justify-around px-6 pt-2 pb-3">
          {/* Gruppe Tab */}
          <button
            onClick={() => setAktivesTab('gruppe')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
              aktiverTab === 'gruppe' ? 'text-camp-akzent' : 'text-gray-400'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-xs font-semibold">Gruppe</span>
          </button>

          {/* Anlegen FAB */}
          <button
            onClick={() => { setAktivesTab('gruppe'); setNeuesKindFormOffen(true); }}
            className="w-14 h-14 rounded-full text-white flex items-center justify-center text-3xl shadow-lg -mt-5 transition-transform active:scale-95"
            style={{ backgroundColor: camp.farbe }}
            aria-label="Neues Kind anlegen"
          >
            +
          </button>

          {/* Karte Tab */}
          <button
            onClick={() => setAktivesTab('karte')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
              aktiverTab === 'karte' ? 'text-camp-akzent' : 'text-gray-400'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="text-xs font-semibold">Karte</span>
          </button>
        </nav>
      </div>

      {anleitungOffen && (
        <AnleitungModal onSchliessen={() => setAnleitungOffen(false)} />
      )}
    </div>
  );
}

function campIdFromTyp(typ) {
  const map = { 'YOUTH CAMP': 'youth-camp', 'CAMP2GO': 'camp2go', 'QUIETSCHFIDEL': 'quietschfidel' };
  return map[typ] || typ;
}

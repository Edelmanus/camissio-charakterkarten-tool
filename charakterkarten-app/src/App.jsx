import { useState, useEffect, useCallback } from 'react';
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
  }, [session.campId, session.gruppe]);

  const aktiveKind = kinder.find(k => k.id === aktivesKindId) || null;

  const neuesKindAnlegen = useCallback(async (name, geschlecht) => {
    try {
      const kind = await createKind(session.campId, session.gruppe, name, geschlecht);
      setKinder(prev => [...prev, kind]);
      setAktivesKindId(kind.id);
      if (window.innerWidth < 768) setSidebarOffen(false);
    } catch {
      alert('Fehler beim Anlegen.');
    }
  }, [session]);

  const kindAktivieren = useCallback((id) => {
    setAktivesKindId(id);
    if (window.innerWidth < 768) setSidebarOffen(false);
  }, []);

  const kindLoeschen = useCallback(async (id) => {
    try {
      await deleteKind(id);
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

  const kindAktualisieren = useCallback(async (id, updates) => {
    // Frontend nutzt gewaehltEigenschaften (camelCase), Backend erwartet gewaehlte_eigenschaften
    const normalized = { ...updates };
    if (normalized.gewaehltEigenschaften !== undefined) {
      normalized.gewaehlte_eigenschaften = normalized.gewaehltEigenschaften;
      delete normalized.gewaehltEigenschaften;
    }
    try {
      const aktualisiert = await updateKind(id, normalized);
      setKinder(prev => prev.map(k => k.id === id ? aktualisiert : k));
    } catch {
      console.warn('Fehler beim Aktualisieren', updates);
    }
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

      <div className="flex gap-3 p-3" style={{ height: 'calc(100vh - 72px)' }}>
        <div className={`
          shrink-0 transition-all duration-200
          md:relative md:translate-x-0
          ${sidebarOffen ? 'w-64' : 'w-0 overflow-hidden'}
        `}>
          <div className="bg-white rounded-2xl shadow-sm h-full overflow-hidden">
            <Sidebar
              kinder={kinder}
              aktivesKindId={aktivesKindId}
              camp={camp}
              onKindAktivieren={kindAktivieren}
              onNeuesKind={neuesKindAnlegen}
              onKindLoeschen={kindLoeschen}
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto min-w-0 bg-white rounded-2xl shadow-sm p-3 md:p-6">
          {aktiveKind ? (
            <KindEditor
              kind={aktiveKind}
              camp={camp}
              onUpdate={(updates) => kindAktualisieren(aktiveKind.id, updates)}
              onFertigToggle={(fertig) => kindFertigToggle(aktiveKind.id, fertig)}
            />
          ) : (
            <LeereAnsicht onNeuesKind={neuesKindAnlegen} />
          )}
        </main>
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

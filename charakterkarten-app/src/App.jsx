import { useState, useEffect, useCallback } from 'react';
import { getInitialState, saveToStorage, createKind, loadAktivesCamp, saveAktivesCamp, clearAktivesCamp } from './utils/storage';
import { getCampById } from './config/camps';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KindEditor from './components/KindEditor';
import Onboarding from './components/Onboarding';
import AnleitungModal from './components/AnleitungModal';
import LeereAnsicht from './components/LeereAnsicht';
import CampAuswahl from './components/CampAuswahl';

function useCampState(campId) {
  const camp = getCampById(campId);
  const [state, setState] = useState(() => getInitialState(camp.storageKey));

  useEffect(() => {
    saveToStorage(state, camp.storageKey);
  }, [state, camp.storageKey]);

  const reset = useCallback(() => {
    setState(getInitialState(camp.storageKey));
  }, [camp.storageKey]);

  return [state, setState, reset];
}

export default function App() {
  const [aktivescamp, setAktivescamp] = useState(() => loadAktivesCamp());
  const [anleitungOffen, setAnleitungOffen] = useState(false);
  const [sidebarOffen, setSidebarOffen] = useState(true);

  const camp = getCampById(aktivescamp);

  // CSS-Variablen für aktives Camp setzen
  useEffect(() => {
    if (!camp) return;
    const root = document.documentElement;
    root.style.setProperty('--camp-akzent', camp.farbe);
    root.style.setProperty('--camp-akzent-hell', camp.farbeHell);
    root.style.setProperty('--camp-akzent-text', camp.farbeText);
  }, [camp]);

  const campWechseln = useCallback((campId) => {
    saveAktivesCamp(campId);
    setAktivescamp(campId);
    setSidebarOffen(true);
  }, []);

  const campVerlassen = useCallback(() => {
    clearAktivesCamp();
    setAktivescamp(null);
  }, []);

  // Kein Camp gewählt → Auswahl-Bildschirm
  if (!camp) {
    return <CampAuswahl onCampGewaehlt={campWechseln} />;
  }

  return (
    <CampApp
      camp={camp}
      anleitungOffen={anleitungOffen}
      setAnleitungOffen={setAnleitungOffen}
      sidebarOffen={sidebarOffen}
      setSidebarOffen={setSidebarOffen}
      onCampVerlassen={campVerlassen}
    />
  );
}

function CampApp({ camp, anleitungOffen, setAnleitungOffen, sidebarOffen, setSidebarOffen, onCampVerlassen }) {
  const [state, setState] = useCampState(camp.id);

  const aktiveKind = state.kinder.find(k => k.id === state.aktivesKindId) || null;

  const neuesKindAnlegen = useCallback((name, geschlecht) => {
    const kind = createKind(name, geschlecht);
    setState(prev => ({
      ...prev,
      kinder: [...prev.kinder, kind],
      aktivesKindId: kind.id,
    }));
    if (window.innerWidth < 768) setSidebarOffen(false);
  }, [setState, setSidebarOffen]);

  const kindAktivieren = useCallback((id) => {
    setState(prev => ({ ...prev, aktivesKindId: id }));
    if (window.innerWidth < 768) setSidebarOffen(false);
  }, [setState, setSidebarOffen]);

  const kindLoeschen = useCallback((id) => {
    setState(prev => {
      const neueKinder = prev.kinder.filter(k => k.id !== id);
      const neuesAktives = neueKinder.length > 0
        ? (prev.aktivesKindId === id ? neueKinder[0].id : prev.aktivesKindId)
        : null;
      return { ...prev, kinder: neueKinder, aktivesKindId: neuesAktives };
    });
  }, [setState]);

  const kindAktualisieren = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      kinder: prev.kinder.map(k => k.id === id ? { ...k, ...updates } : k),
    }));
  }, [setState]);

  const onboardingAbschliessen = useCallback(() => {
    setState(prev => ({ ...prev, onboardingGesehen: true }));
  }, [setState]);

  if (!state.onboardingGesehen) {
    return <Onboarding camp={camp} onWeiter={onboardingAbschliessen} />;
  }

  return (
    <div className="min-h-screen bg-camissio-greige font-body">
      <Header
        camp={camp}
        onAnleitung={() => setAnleitungOffen(true)}
        onSidebarToggle={() => setSidebarOffen(v => !v)}
        sidebarOffen={sidebarOffen}
        anzahlKinder={state.kinder.length}
        onCampWechseln={onCampVerlassen}
      />

      <div className="flex gap-3 p-3" style={{ height: 'calc(100vh - 72px)' }}>
        <div className={`
          shrink-0 transition-all duration-200
          md:relative md:translate-x-0
          ${sidebarOffen ? 'w-64' : 'w-0 overflow-hidden'}
        `}>
          <div className="bg-white rounded-2xl shadow-sm h-full overflow-hidden">
            <Sidebar
              kinder={state.kinder}
              aktivesKindId={state.aktivesKindId}
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

import { useState, useEffect, useCallback } from 'react';
import { getInitialState, saveToStorage, createKind } from './utils/storage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KindEditor from './components/KindEditor';
import Onboarding from './components/Onboarding';
import AnleitungModal from './components/AnleitungModal';
import LeereAnsicht from './components/LeereAnsicht';

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [anleitungOffen, setAnleitungOffen] = useState(false);
  const [sidebarOffen, setSidebarOffen] = useState(true);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const aktiveKind = state.kinder.find(k => k.id === state.aktivesKindId) || null;

  const neuesKindAnlegen = useCallback((name, geschlecht) => {
    const kind = createKind(name, geschlecht);
    setState(prev => ({
      ...prev,
      kinder: [...prev.kinder, kind],
      aktivesKindId: kind.id,
    }));
    // Auf mobilen Geräten Sidebar nach Anlegen schließen
    if (window.innerWidth < 768) setSidebarOffen(false);
  }, []);

  const kindAktivieren = useCallback((id) => {
    setState(prev => ({ ...prev, aktivesKindId: id }));
    // Auf mobilen Geräten Sidebar nach Auswahl schließen
    if (window.innerWidth < 768) setSidebarOffen(false);
  }, []);

  const kindLoeschen = useCallback((id) => {
    setState(prev => {
      const neueKinder = prev.kinder.filter(k => k.id !== id);
      const neuesAktives = neueKinder.length > 0
        ? (prev.aktivesKindId === id ? neueKinder[0].id : prev.aktivesKindId)
        : null;
      return { ...prev, kinder: neueKinder, aktivesKindId: neuesAktives };
    });
  }, []);

  const kindAktualisieren = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      kinder: prev.kinder.map(k => k.id === id ? { ...k, ...updates } : k),
    }));
  }, []);

  const onboardingAbschliessen = useCallback(() => {
    setState(prev => ({ ...prev, onboardingGesehen: true }));
  }, []);

  if (!state.onboardingGesehen) {
    return <Onboarding onWeiter={onboardingAbschliessen} />;
  }

  return (
    <div className="min-h-screen bg-camissio-greige font-body">
      <Header
        onAnleitung={() => setAnleitungOffen(true)}
        onSidebarToggle={() => setSidebarOffen(v => !v)}
        sidebarOffen={sidebarOffen}
        anzahlKinder={state.kinder.length}
      />

      <div className="flex" style={{ height: 'calc(100vh - 72px)' }}>
        {/* Sidebar — auf mobilen Geräten overlay */}
        <div className={`
          shrink-0 transition-all duration-200
          md:relative md:translate-x-0
          ${sidebarOffen ? 'w-64' : 'w-0 overflow-hidden'}
        `}>
          <Sidebar
            kinder={state.kinder}
            aktivesKindId={state.aktivesKindId}
            onKindAktivieren={kindAktivieren}
            onNeuesKind={neuesKindAnlegen}
            onKindLoeschen={kindLoeschen}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-3 md:p-6 min-w-0">
          {aktiveKind ? (
            <KindEditor
              kind={aktiveKind}
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

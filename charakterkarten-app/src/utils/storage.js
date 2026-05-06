const STORAGE_KEY = 'camissio_charakterkarten';

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('LocalStorage nicht verfügbar');
  }
}

export function createKind(name, geschlecht = 'keine') {
  return {
    id: crypto.randomUUID(),
    name,
    geschlecht,
    scores: {
      beziehungsstark: 3,
      anpacker: 3,
      unaufhaltsam: 3,
      verwurzelt: 3,
      gewissenhaft: 3,
      vorbild: 3,
      anbeter: 3,
    },
    gewaehltEigenschaften: [],
    bibelvers: '',
    text: '',
    fertig: false,
  };
}

export function getInitialState() {
  const loaded = loadFromStorage();
  if (loaded && loaded.kinder && loaded.kinder.length > 0) {
    return loaded;
  }
  return {
    onboardingGesehen: false,
    kinder: [],
    aktivesKindId: null,
  };
}

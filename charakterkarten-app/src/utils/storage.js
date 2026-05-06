import { CAMP_STORAGE_KEY } from '../config/camps';

export function loadFromStorage(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveToStorage(data, storageKey) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    console.warn('LocalStorage nicht verfügbar');
  }
}

export function loadAktivesCamp() {
  try {
    return localStorage.getItem(CAMP_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function saveAktivesCamp(campId) {
  try {
    localStorage.setItem(CAMP_STORAGE_KEY, campId);
  } catch {
    console.warn('LocalStorage nicht verfügbar');
  }
}

export function clearAktivesCamp() {
  try {
    localStorage.removeItem(CAMP_STORAGE_KEY);
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

export function getInitialState(storageKey) {
  const loaded = loadFromStorage(storageKey);
  if (loaded && loaded.kinder && loaded.kinder.length > 0) {
    return loaded;
  }
  return {
    onboardingGesehen: false,
    kinder: [],
    aktivesKindId: null,
  };
}

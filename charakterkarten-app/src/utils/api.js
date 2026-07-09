const BASE = '/api';

async function request(method, path, body) {
  const session = getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.korrekturPasswort) {
    headers['x-korrektur-password'] = session.korrekturPasswort;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Camps ---
export const getCamps = (typ) =>
  request('GET', typ ? `/camps?typ=${encodeURIComponent(typ)}` : '/camps');

// --- Session (Camp + Gruppe) ---
const SESSION_KEY = 'camissio_session';

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// --- Kinder ---
export const getKinder = (campId, gruppe) =>
  request('GET', `/kinder?camp_id=${campId}&gruppe=${encodeURIComponent(gruppe)}`);

export const createKind = (campId, gruppe, name, geschlecht) =>
  request('POST', '/kinder', { camp_id: campId, gruppe, name, geschlecht });

export const updateKind = (id, updates) =>
  request('PUT', `/kinder/${id}`, updates);

export const deleteKind = (id) =>
  request('DELETE', `/kinder/${id}`);

export const setFertig = (id, fertig) =>
  request('PUT', `/kinder/${id}/fertig`, { fertig });

// --- Korrektur-Portal ---
export async function korrekturLogin(passwort) {
  const res = await fetch(`${BASE}/korrektur/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passwort }),
  });
  if (!res.ok) throw new Error('Falsches Passwort');
  return true;
}

export function getKorrekturStats(passwort) {
  return fetch(`${BASE}/korrektur/stats`, {
    headers: { 'x-korrektur-password': passwort },
  }).then(r => r.ok ? r.json() : Promise.reject(new Error('Nicht autorisiert')));
}

export function getKorrekturKinder(passwort, typ, standort) {
  const params = new URLSearchParams();
  if (typ) params.set('typ', typ);
  if (standort) params.set('standort', standort);
  return fetch(`${BASE}/korrektur/kinder?${params}`, {
    headers: { 'x-korrektur-password': passwort },
  }).then(r => r.ok ? r.json() : Promise.reject(new Error('Nicht autorisiert')));
}

export function updateKorrektur(id, data, passwort) {
  return fetch(`${BASE}/korrektur/kinder/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-korrektur-password': passwort },
    body: JSON.stringify(data),
  }).then(r => r.ok ? r.json() : Promise.reject(new Error('Fehler beim Speichern')));
}

// --- Fehler-Log ---
// Best-effort-Meldung endgültig fehlgeschlagener Saves — wirft nie,
// damit ein kaputtes Logging nicht selbst zum Problem wird.
export function logFehler(payload) {
  return fetch(`${BASE}/fehler-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

// --- Admin (eigenes Passwort, getrennt vom Korrektur-Team) ---
export async function adminLogin(passwort) {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passwort }),
  });
  if (!res.ok) throw new Error('Falsches Passwort');
  return true;
}

export function getFehlerLog(passwort) {
  return fetch(`${BASE}/admin/fehler-log`, {
    headers: { 'x-admin-password': passwort },
  }).then(r => r.ok ? r.json() : Promise.reject(new Error('Nicht autorisiert')));
}

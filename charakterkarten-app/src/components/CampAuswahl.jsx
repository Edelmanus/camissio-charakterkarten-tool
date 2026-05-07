import { useState, useEffect } from 'react';
import { getCamps, korrekturLogin, saveSession } from '../utils/api';
import { CAMPS } from '../config/camps';

const GRUPPEN_TYPEN = [
  { prefix: 'J', label: 'Jungen' },
  { prefix: 'M', label: 'Mädchen' },
];
const GRUPPEN_NUMMERN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CampAuswahl({ onSessionGestartet, onKorrekturPortal }) {
  const [schritt, setSchritt] = useState(1); // 1=Typ, 2=Standort, 3=Gruppe
  const [campTyp, setCampTyp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [gewaehlteCampId, setGewaehlteCampId] = useState(null);
  const [gruppenPrefix, setGruppenPrefix] = useState(null);
  const [gruppenNummer, setGruppenNummer] = useState(null);
  const [ladeFehler, setLadeFehler] = useState(null);

  // Korrektur-Login
  const [korrekturOffen, setKorrekturOffen] = useState(false);
  const [passwort, setPasswort] = useState('');
  const [loginFehler, setLoginFehler] = useState(false);
  const [loginLaed, setLoginLaed] = useState(false);

  const campConfig = CAMPS.find(c => c.id === campTypKey(campTyp));

  useEffect(() => {
    if (!campTyp) return;
    getCamps(campTyp)
      .then(setCamps)
      .catch(() => setLadeFehler('Camps konnten nicht geladen werden.'));
  }, [campTyp]);

  function handleTypWahl(typ) {
    setCampTyp(typ);
    setGewaehlteCampId(null);
    setGruppenPrefix(null);
    setGruppenNummer(null);
    setSchritt(2);
  }

  function handleStandortWahl(id) {
    setGewaehlteCampId(id);
    setSchritt(3);
  }

  function handleStart() {
    if (!gewaehlteCampId || !gruppenPrefix || !gruppenNummer) return;
    const gruppe = `${gruppenPrefix}${gruppenNummer}`;
    const camp = camps.find(c => c.id === gewaehlteCampId);
    saveSession({ campId: gewaehlteCampId, gruppe, campTyp, campStandort: camp.standort, campCode: camp.code });
    onSessionGestartet({ campId: gewaehlteCampId, gruppe, campTyp, campStandort: camp.standort, campCode: camp.code });
  }

  async function handleKorrekturLogin(e) {
    e.preventDefault();
    setLoginFehler(false);
    setLoginLaed(true);
    try {
      await korrekturLogin(passwort);
      onKorrekturPortal(passwort);
    } catch {
      setLoginFehler(true);
    } finally {
      setLoginLaed(false);
    }
  }

  return (
    <div className="min-h-screen bg-camissio-greige flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* Logo + Titel */}
        <div className="text-center mb-8">
          <img src="/assets/camissio-logo.png" alt="CAMISSIO" className="h-14 w-auto mx-auto mb-5"
            onError={e => { e.target.style.display = 'none'; }} />
          <h1 className="font-headline text-4xl md:text-5xl text-camissio-dunkelblau tracking-wide leading-tight">
            CHARAKTERKARTEN
          </h1>
          <p className="text-camissio-dunkelblau/50 mt-2 font-body text-sm">
            ...denn jeder soll von Jesus hören!
          </p>
        </div>

        {/* Fortschrittsanzeige */}
        <div className="flex items-center justify-center gap-2 mb-7">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                schritt >= s
                  ? 'bg-camissio-dunkelblau text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>{s}</div>
              {s < 3 && <div className={`w-10 h-0.5 ${schritt > s ? 'bg-camissio-dunkelblau' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Schritt 1: Camp-Typ */}
        {schritt === 1 && (
          <div>
            <p className="text-camissio-dunkelblau/70 text-center font-body text-base mb-5">
              Auf welchem Camp schreibst du Charakterkarten?
            </p>
            <div className="flex flex-col gap-3">
              {CAMPS.map(camp => (
                <button
                  key={camp.id}
                  onClick={() => handleTypWahl(campTypName(camp.id))}
                  className="group w-full rounded-2xl p-4 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-lg focus:outline-none"
                  style={{ backgroundColor: camp.farbeHell }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-headline text-xl tracking-wide" style={{ color: camp.farbeText }}>
                        {camp.name}
                      </div>
                      <div className="text-xs font-body mt-0.5" style={{ color: camp.farbeText, opacity: 0.7 }}>
                        {camp.zielgruppe}
                      </div>
                    </div>
                    <span className="text-xl font-headline opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ color: camp.farbe }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schritt 2: Standort */}
        {schritt === 2 && (
          <div>
            <button onClick={() => setSchritt(1)}
              className="text-sm text-camissio-dunkelblau/50 hover:text-camissio-dunkelblau mb-4 flex items-center gap-1">
              ← Zurück
            </button>
            <p className="text-camissio-dunkelblau/70 text-center font-body text-base mb-5">
              Welcher Standort?
            </p>
            {ladeFehler && <p className="text-red-500 text-sm text-center mb-4">{ladeFehler}</p>}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto shadow-sm">
              {camps.map((camp, i) => (
                <button
                  key={camp.id}
                  onClick={() => handleStandortWahl(camp.id)}
                  className={`w-full text-left px-5 py-3 text-sm font-body text-camissio-dunkelblau hover:bg-camissio-greige transition-colors flex items-center justify-between ${
                    i > 0 ? 'border-t border-gray-50' : ''
                  }`}
                >
                  {camp.code ? (
                    <span className="font-semibold">{camp.code}</span>
                  ) : (
                    <span>{camp.standort}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Schritt 3: Gruppe */}
        {schritt === 3 && (
          <div>
            <button onClick={() => setSchritt(2)}
              className="text-sm text-camissio-dunkelblau/50 hover:text-camissio-dunkelblau mb-4 flex items-center gap-1">
              ← Zurück
            </button>
            <p className="text-camissio-dunkelblau/70 text-center font-body text-base mb-5">
              Was ist deine Gruppe?
            </p>
            <div className="flex gap-3 mb-4">
              {GRUPPEN_TYPEN.map(({ prefix, label }) => (
                <button
                  key={prefix}
                  onClick={() => setGruppenPrefix(prefix)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    gruppenPrefix === prefix
                      ? 'border-camissio-dunkelblau bg-camissio-dunkelblau text-white'
                      : 'border-gray-200 text-gray-500 hover:border-camissio-dunkelblau/50'
                  }`}
                >
                  {label} ({prefix})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {GRUPPEN_NUMMERN.map(n => (
                <button
                  key={n}
                  onClick={() => setGruppenNummer(n)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    gruppenNummer === n
                      ? 'border-camissio-dunkelblau bg-camissio-dunkelblau text-white'
                      : 'border-gray-200 text-gray-500 hover:border-camissio-dunkelblau/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={handleStart}
              disabled={!gruppenPrefix || !gruppenNummer}
              className="w-full py-3 rounded-xl font-headline text-lg tracking-wide text-white transition-all disabled:opacity-40"
              style={{ backgroundColor: campConfig?.farbe || '#1c4554' }}
            >
              {gruppenPrefix && gruppenNummer
                ? `Gruppe ${gruppenPrefix}${gruppenNummer} starten →`
                : 'Gruppe wählen'}
            </button>
          </div>
        )}

        {/* Korrektur-Portal Button — nur auf Startseite (Schritt 1) */}
        {schritt === 1 && (
          <div className="mt-6">
            <button
              onClick={() => setKorrekturOffen(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-camissio-dunkelblau/20 hover:border-camissio-dunkelblau/50 text-camissio-dunkelblau/50 hover:text-camissio-dunkelblau rounded-xl py-3 text-sm font-semibold transition-all font-body"
            >
              <span>✏️</span>
              Zum Korrektur-Portal
            </button>
          </div>
        )}

        <p className="text-camissio-dunkelblau/25 text-xs text-center mt-4 font-body">
          Deutsche Zeltmission · CAMISSIO Charakterkarten-Tool
        </p>
      </div>

      {/* Korrektur-Login Modal */}
      {korrekturOffen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-headline text-2xl text-camissio-dunkelblau tracking-wide mb-1">
              KORREKTUR-PORTAL
            </h2>
            <p className="text-sm text-gray-500 mb-5">Bitte Passwort eingeben.</p>
            <form onSubmit={handleKorrekturLogin}>
              <input
                type="password"
                value={passwort}
                onChange={e => { setPasswort(e.target.value); setLoginFehler(false); }}
                placeholder="Passwort"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-camissio-dunkelblau/30 ${
                  loginFehler ? 'border-red-400' : 'border-gray-200'
                }`}
                autoFocus
              />
              {loginFehler && (
                <p className="text-red-500 text-xs mb-3">Falsches Passwort.</p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setKorrekturOffen(false); setPasswort(''); setLoginFehler(false); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:border-gray-300">
                  Abbrechen
                </button>
                <button type="submit" disabled={loginLaed || !passwort}
                  className="flex-1 py-2.5 bg-camissio-dunkelblau text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                  {loginLaed ? '...' : 'Einloggen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function campTypName(campId) {
  const map = { 'youth-camp': 'YOUTH CAMP', 'camp2go': 'CAMP2GO', 'quietschfidel': 'QUIETSCHFIDEL' };
  return map[campId] || campId;
}

function campTypKey(typ) {
  const map = { 'YOUTH CAMP': 'youth-camp', 'CAMP2GO': 'camp2go', 'QUIETSCHFIDEL': 'quietschfidel' };
  return map[typ] || typ;
}

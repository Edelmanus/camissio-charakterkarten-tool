import { useState, useEffect } from 'react';
import { adminLogin, getFehlerLog } from '../utils/api';

export default function AdminPage() {
  const [passwort, setPasswort] = useState(null);

  if (!passwort) {
    return <AdminLogin onEingeloggt={setPasswort} />;
  }

  return <FehlerLogSeite passwort={passwort} onAbmelden={() => setPasswort(null)} />;
}

function AdminLogin({ onEingeloggt }) {
  const [eingabe, setEingabe] = useState('');
  const [fehler, setFehler] = useState(false);
  const [laed, setLaed] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setFehler(false);
    setLaed(true);
    try {
      await adminLogin(eingabe);
      onEingeloggt(eingabe);
    } catch {
      setFehler(true);
    } finally {
      setLaed(false);
    }
  }

  return (
    <div className="min-h-screen bg-camissio-greige flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h1 className="font-headline text-2xl text-camissio-dunkelblau tracking-wide mb-1">ADMIN</h1>
        <p className="text-sm text-gray-500 mb-5">Bitte Passwort eingeben.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            value={eingabe}
            onChange={e => { setEingabe(e.target.value); setFehler(false); }}
            placeholder="Passwort"
            className={`w-full border rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-camissio-dunkelblau/30 ${
              fehler ? 'border-red-400' : 'border-gray-200'
            }`}
            autoFocus
          />
          {fehler && <p className="text-red-500 text-xs mb-3">Falsches Passwort.</p>}
          <button
            type="submit"
            disabled={laed || !eingabe}
            className="w-full py-2.5 bg-camissio-dunkelblau text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-40"
          >
            {laed ? '...' : 'Einloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}

function FehlerLogSeite({ passwort, onAbmelden }) {
  const [eintraege, setEintraege] = useState(null);
  const [fehler, setFehler] = useState(null);

  useEffect(() => { laden(); }, [passwort]);

  function laden() {
    setEintraege(null);
    setFehler(null);
    getFehlerLog(passwort)
      .then(setEintraege)
      .catch(() => setFehler('Fehler-Log konnte nicht geladen werden.'));
  }

  return (
    <div className="min-h-screen bg-camissio-greige font-body">
      <header className="bg-camissio-dunkelblau text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl tracking-wide">ADMIN · FEHLER-LOG</h1>
          <p className="text-white/50 text-xs mt-0.5">Fehlgeschlagene Speicherversuche</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={laden} className="text-white/60 hover:text-white text-sm transition-colors">
            ↻ Aktualisieren
          </button>
          <a href="/" className="text-white/60 hover:text-white text-sm transition-colors">
            Zur App
          </a>
          <button onClick={onAbmelden} className="text-white/60 hover:text-white text-sm transition-colors">
            Abmelden ×
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {fehler && <p className="text-sm text-red-500 text-center py-12">{fehler}</p>}
        {!fehler && eintraege === null && <p className="text-sm text-gray-400 text-center py-12">Lädt…</p>}
        {eintraege?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-12">Keine fehlgeschlagenen Saves protokolliert. 🎉</p>
        )}
        {eintraege?.length > 0 && (
          <div className="space-y-2">
            {eintraege.map(e => (
              <div key={e.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-camissio-dunkelblau">
                    {e.kind_name || 'Unbekanntes Kind'}
                    {e.gruppe && <span className="text-gray-400 font-normal"> · Gruppe {e.gruppe}</span>}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(e.created_at).toLocaleString('de-DE')}
                  </span>
                </div>
                {(e.camp_typ || e.camp_standort) && (
                  <p className="text-xs text-gray-400">{e.camp_typ} · {e.camp_standort}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Feld: {e.kontext || '–'} — {e.meldung || 'Unbekannter Fehler'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

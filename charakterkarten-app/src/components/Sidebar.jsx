import { useState } from 'react';

function NeuesKindForm({ onAnlegen, onAbbrechen }) {
  const [name, setName] = useState('');
  const [geschlecht, setGeschlecht] = useState('keine');

  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onAnlegen(name.trim(), geschlecht);
      setName('');
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 bg-white rounded-xl p-3 shadow-sm border border-camp-akzent/30">
      <input
        type="text"
        placeholder="Vor- und Nachname (z. B. Lukas Müller)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-camp-akzent text-camissio-dunkelblau"
        aria-label="Name des Kindes"
        autoFocus
      />
      <div className="mt-2">
        <label className="text-xs text-gray-500 block mb-1">Geschlecht (optional)</label>
        <div className="flex gap-2">
          {[['männlich', '♂'], ['weiblich', '♀'], ['keine', '–']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setGeschlecht(val)}
              className={`flex-1 text-xs py-1 rounded-lg border transition-colors ${
                geschlecht === val
                  ? 'bg-camp-akzent text-white border-camp-akzent'
                  : 'border-gray-200 text-gray-500 hover:border-camp-akzent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 bg-camp-akzent text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-colors"
        >
          Anlegen
        </button>
        <button
          type="button"
          onClick={onAbbrechen}
          className="px-3 text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>
    </form>
  );
}

export default function Sidebar({ kinder, aktivesKindId, onKindAktivieren, onNeuesKind, onKindLoeschen }) {
  const [formOffen, setFormOffen] = useState(false);
  const [loeschenKonfirm, setLoeschenKonfirm] = useState(null);

  const handleAnlegen = (name, geschlecht) => {
    onNeuesKind(name, geschlecht);
    setFormOffen(false);
  };

  return (
    <aside className="w-64 flex flex-col overflow-hidden shrink-0 h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-headline text-lg text-camissio-dunkelblau tracking-wide">
          Meine Gruppe
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{kinder.length} Kind{kinder.length !== 1 ? 'er' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {kinder.map(kind => {
          const istAktiv = kind.id === aktivesKindId;
          let statusBadge, statusFarbe;
          if (kind.korrigiert) {
            statusBadge = '✓✓'; statusFarbe = 'text-green-500';
          } else if (kind.fertig) {
            statusBadge = '✓'; statusFarbe = 'text-camissio-petrol';
          } else if (kind.text?.length > 20) {
            statusBadge = '✍️'; statusFarbe = 'text-camissio-orange';
          } else {
            statusBadge = '○'; statusFarbe = 'text-gray-300';
          }
          const status = statusBadge;

          return (
            <div
              key={kind.id}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                istAktiv
                  ? 'bg-camp-akzent-hell border border-camp-akzent/40'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onKindAktivieren(kind.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-sm shrink-0 ${statusFarbe}`}>{status}</span>
                <span className="text-sm text-camissio-dunkelblau truncate font-medium">
                  {kind.name}
                </span>
              </div>
              {loeschenKonfirm === kind.id ? (
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { onKindLoeschen(kind.id); setLoeschenKonfirm(null); }}
                    className="text-xs bg-red-500 text-white rounded px-1.5 py-0.5"
                  >
                    Löschen
                  </button>
                  <button
                    onClick={() => setLoeschenKonfirm(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setLoeschenKonfirm(kind.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-sm shrink-0 transition-opacity"
                  aria-label={`${kind.name} löschen`}
                >
                  🗑
                </button>
              )}
            </div>
          );
        })}

        {kinder.length === 0 && !formOffen && (
          <p className="text-xs text-gray-400 text-center py-4 px-2">
            Noch keine Kinder angelegt. Klicke auf „+ Neues Kind".
          </p>
        )}

        {formOffen && (
          <NeuesKindForm onAnlegen={handleAnlegen} onAbbrechen={() => setFormOffen(false)} />
        )}
      </div>

      <div className="p-3 border-t border-gray-100">
        {!formOffen && (
          <button
            onClick={() => setFormOffen(true)}
            className="w-full flex items-center justify-center gap-2 bg-camp-akzent text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 transition-colors"
          >
            <span>+</span>
            <span>Neues Kind</span>
          </button>
        )}
      </div>
    </aside>
  );
}

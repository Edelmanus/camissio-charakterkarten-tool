import { useState } from 'react';

export default function LeereAnsicht({ onNeuesKind }) {
  const [formOffen, setFormOffen] = useState(false);
  const [name, setName] = useState('');
  const [geschlecht, setGeschlecht] = useState('keine');

  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onNeuesKind(name.trim(), geschlecht);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <img
        src="/assets/herzankerkreis-lila-greige.png"
        alt=""
        className="w-24 h-24 mb-6 opacity-60"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <h2 className="font-headline text-3xl text-camissio-dunkelblau tracking-wide mb-2">
        BEREIT ZUM STARTEN?
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Lege dein erstes Kind an oder wähle eines aus der Sidebar aus, um mit der Charakterkarte zu beginnen.
      </p>

      {!formOffen ? (
        <button
          onClick={() => setFormOffen(true)}
          className="bg-camissio-lila text-white rounded-2xl px-8 py-3 font-semibold text-base hover:bg-opacity-90 transition-colors"
        >
          + Neues Kind anlegen
        </button>
      ) : (
        <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-camissio-lila/20">
          <h3 className="font-semibold text-camissio-dunkelblau mb-4">Neues Kind anlegen</h3>
          <input
            type="text"
            placeholder="Vor- und Nachname (z. B. Lukas Müller)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-camissio-lila text-camissio-dunkelblau mb-3"
            autoFocus
          />
          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">Geschlecht (optional)</label>
            <div className="flex gap-2">
              {[['männlich', '♂ Männlich'], ['weiblich', '♀ Weiblich'], ['keine', '– Keine Angabe']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setGeschlecht(val)}
                  className={`flex-1 text-xs py-2 rounded-xl border transition-colors ${
                    geschlecht === val
                      ? 'bg-camissio-lila text-white border-camissio-lila'
                      : 'border-gray-200 text-gray-500 hover:border-camissio-lila'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-camissio-lila text-white rounded-xl py-2.5 font-semibold hover:bg-opacity-90 disabled:opacity-40 transition-colors"
            >
              Anlegen
            </button>
            <button
              type="button"
              onClick={() => setFormOffen(false)}
              className="px-4 text-gray-400 hover:text-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

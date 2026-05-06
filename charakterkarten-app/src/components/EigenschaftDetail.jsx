export default function EigenschaftDetail({ eigenschaft, kindName, onAufnehmen, onSchliessen, bereitsGewaehlt }) {
  const pronomen = (text) => text.replace(/\[Name\]/g, kindName || '[Name]');

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onSchliessen(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-camissio-dunkelblau text-white p-5 flex items-start justify-between">
          <div>
            <h3 className="font-headline text-2xl tracking-wide">{eigenschaft.name}</h3>
          </div>
          <button
            onClick={onSchliessen}
            className="text-white/60 hover:text-white text-xl leading-none ml-4 mt-0.5"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Beschreibung */}
          <div>
            <p className="text-sm text-camissio-dunkelblau leading-relaxed">
              {eigenschaft.beschreibung}
            </p>
          </div>

          {/* Bibelvers */}
          <div className="flex items-start gap-2 bg-camissio-greige rounded-xl p-3">
            <span className="text-lg shrink-0">📖</span>
            <div>
              <div className="text-xs font-semibold text-camissio-petrol mb-0.5 uppercase tracking-wide">Bibelvers</div>
              <div className="text-sm text-camissio-dunkelblau font-medium">{eigenschaft.bibelvers}</div>
            </div>
          </div>

          {/* Inspirationstext */}
          {eigenschaft.inspirationstext && (
            <div className="border border-camissio-lila/30 rounded-xl p-4 bg-camissio-lila/5">
              <div className="flex items-center gap-2 mb-2">
                <span>💭</span>
                <span className="text-xs font-semibold text-camissio-lila uppercase tracking-wide">
                  Beispielformulierung zur Inspiration
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">
                „{pronomen(eigenschaft.inspirationstext)}"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Bitte selbst schreiben — dies ist nur eine Anregung!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onSchliessen}
            className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={onAufnehmen}
            disabled={bereitsGewaehlt}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              bereitsGewaehlt
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-camissio-lila text-white hover:bg-opacity-90'
            }`}
          >
            {bereitsGewaehlt ? '✓ Bereits ausgewählt' : 'In meine Karte aufnehmen'}
          </button>
        </div>
      </div>
    </div>
  );
}

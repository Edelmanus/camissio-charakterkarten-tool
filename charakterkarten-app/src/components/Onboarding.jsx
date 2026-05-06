export default function Onboarding({ camp, onWeiter }) {
  const akzent = camp?.farbe || '#a1a5dd';
  return (
    <div className="min-h-screen bg-camissio-greige flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={camp?.logo || '/assets/youth-camp-logo-lila.png'}
            alt={camp?.vollname || 'CAMISSIO'}
            className="h-24 w-auto mx-auto mb-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="font-headline text-5xl tracking-wide" style={{ color: akzent }}>
            CHARAKTERKARTEN
          </h1>
          <p className="text-camissio-dunkelblau/50 mt-2 font-body text-sm">
            ...denn jeder soll von Jesus hören!
          </p>
        </div>

        {/* Was ist eine Charakterkarte? */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-camissio-dunkelblau font-headline text-xl tracking-wide mb-3">
            Was ist eine Charakterkarte?
          </h2>
          <p className="text-camissio-dunkelblau/70 text-sm leading-relaxed font-body">
            Eine Charakterkarte ist eine persönliche Ermutigung für jedes Kind in deiner Gruppe.
            Du wählst zwei positive Eigenschaften aus, die das Kind wirklich auszeichnen,
            und schreibst einen kurzen, herzlichen Text — eine Mitgabe für nach dem Camp,
            die zeigt: Du wirst gesehen, du bist wertvoll.
          </p>
        </div>

        {/* 3 Schritte */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { nr: '1', titel: 'Einordnen', text: 'Bewerte das Kind in 7 Wesenszug-Kategorien auf einer Skala von 1–5.' },
            { nr: '2', titel: 'Auswählen', text: 'Wähle 2 passende Eigenschaften aus den Vorschlägen aus.' },
            { nr: '3', titel: 'Schreiben', text: 'Schreibe einen persönlichen, ermutigenden Text von 4–5 Sätzen.' },
          ].map(({ nr, titel, text }) => (
            <div key={nr} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-8 h-8 rounded-full text-white font-headline text-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: akzent }}>
                {nr}
              </div>
              <div className="text-camissio-dunkelblau font-semibold text-sm mb-1">{titel}</div>
              <div className="text-camissio-dunkelblau/60 text-xs leading-relaxed">{text}</div>
            </div>
          ))}
        </div>

        <p className="text-camissio-dunkelblau/40 text-xs text-center mb-6">
          ℹ️ Die vollständige Anleitung findest du jederzeit oben rechts unter „Anleitung"
        </p>

        <button
          onClick={onWeiter}
          className="w-full text-white rounded-2xl py-4 font-headline text-2xl tracking-wide hover:opacity-90 transition-opacity"
          style={{ backgroundColor: akzent }}
        >
          LOSLEGEN →
        </button>
      </div>
    </div>
  );
}

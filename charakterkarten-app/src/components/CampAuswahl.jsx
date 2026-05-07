import { CAMPS } from '../config/camps';

export default function CampAuswahl({ onCampGewaehlt }) {
  return (
    <div className="min-h-screen bg-camissio-greige flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <img
            src="/assets/camissio-logo.png"
            alt="CAMISSIO"
            className="h-14 w-auto mx-auto mb-5"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="font-headline text-4xl md:text-5xl text-camissio-dunkelblau tracking-wide leading-tight">
            CHARAKTERKARTEN
          </h1>
          <p className="text-camissio-dunkelblau/50 mt-3 font-body text-sm">
            ...denn jeder soll von Jesus hören!
          </p>
        </div>

        {/* Frage */}
        <p className="text-camissio-dunkelblau/70 text-center font-body text-base mb-6">
          Auf welchem Camp schreibst du Charakterkarten?
        </p>

        {/* Camp-Karten */}
        <div className="flex flex-col gap-4">
          {CAMPS.map((camp) => (
            <button
              key={camp.id}
              onClick={() => onCampGewaehlt(camp.id)}
              className="group w-full rounded-2xl p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-camissio-dunkelblau/30"
              style={{ backgroundColor: camp.farbeHell }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div
                    className="font-headline text-2xl tracking-wide leading-none mb-1"
                    style={{ color: camp.farbeText }}
                  >
                    {camp.name}
                  </div>
                  <div className="text-xs font-body" style={{ color: camp.farbeText, opacity: 0.7 }}>
                    {camp.zielgruppe}
                  </div>
                  <div className="text-sm font-body mt-1.5 leading-snug text-camissio-dunkelblau/70">
                    {camp.beschreibung}
                  </div>
                </div>

                <div
                  className="shrink-0 text-2xl font-headline opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: camp.farbe }}
                >
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-camissio-dunkelblau/30 text-xs text-center mt-8 font-body">
          Deutsche Zeltmission · CAMISSIO Charakterkarten-Tool
        </p>
      </div>
    </div>
  );
}

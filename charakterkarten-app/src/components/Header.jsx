export default function Header({ camp, session, onAnleitung, onSidebarToggle, sidebarOffen, anzahlKinder, onCampWechseln }) {
  return (
    <header className="bg-camissio-greige px-3 pt-3 pb-0">
      <div
        className="bg-white rounded-2xl shadow-sm flex items-center justify-between px-3 md:px-5 gap-2"
        style={{ height: '60px' }}
      >

        {/* Links: Sidebar-Toggle + Logo + Camp-Name */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
            aria-label={sidebarOffen ? 'Sidebar schließen' : 'Sidebar öffnen'}
            title="Gruppe ein-/ausblenden"
          >
            <div className="flex flex-col gap-1 w-5">
              <span className="block h-0.5 bg-camissio-dunkelblau/60 rounded" />
              <span className={`block h-0.5 bg-camissio-dunkelblau/60 rounded transition-all duration-200 ${sidebarOffen ? 'w-3' : 'w-5'}`} />
              <span className={`block h-0.5 bg-camissio-dunkelblau/60 rounded transition-all duration-200 ${sidebarOffen ? 'w-4' : 'w-5'}`} />
            </div>
          </button>

          <img
            src={camp.logo}
            alt={camp.vollname}
            className="h-8 w-auto hidden md:block"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/assets/herzanker-dunkelblau.png"
            alt="CAMISSIO"
            className="h-7 w-auto md:hidden"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="hidden sm:block">
            <div
              className="font-headline text-xl md:text-2xl tracking-wide leading-none"
              style={{ color: camp.farbe }}
            >
              {camp.name}
            </div>
            <div className="text-xs text-camissio-dunkelblau/40 leading-tight font-body tracking-wide">
              {session ? `${session.campStandort} · Gruppe ${session.gruppe}` : 'Charakterkarten-Tool'}
            </div>
          </div>
        </div>

        {/* Mitte: Kinder-Anzeige */}
        {!sidebarOffen && anzahlKinder > 0 && (
          <button
            onClick={onSidebarToggle}
            className="text-xs text-camissio-dunkelblau/40 hover:text-camissio-dunkelblau/70 transition-colors hidden sm:block"
          >
            {anzahlKinder} Kind{anzahlKinder !== 1 ? 'er' : ''} in der Gruppe
          </button>
        )}

        {/* Rechts */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCampWechseln}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-camissio-dunkelblau/70 hover:text-camissio-dunkelblau rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors"
            title="Camp wechseln"
            aria-label="Camp wechseln"
          >
            <span>⇄</span>
            <span className="hidden md:inline">Camp wechseln</span>
          </button>
          <button
            onClick={onAnleitung}
            className="flex items-center gap-1.5 text-white rounded-xl px-3 md:px-4 py-1.5 text-sm font-semibold transition-colors hover:opacity-90"
            style={{ backgroundColor: camp.farbe }}
            aria-label="Anleitung öffnen"
          >
            <span>ℹ️</span>
            <span className="hidden md:inline">Anleitung</span>
          </button>
        </div>

      </div>
    </header>
  );
}

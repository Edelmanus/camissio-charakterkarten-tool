export default function Header({ onAnleitung, onSidebarToggle, sidebarOffen, anzahlKinder }) {
  return (
    <header className="bg-camissio-dunkelblau text-white shadow-md" style={{ height: '72px' }}>
      <div className="flex items-center justify-between px-3 md:px-6 h-full gap-2">

        {/* Links: Sidebar-Toggle + Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label={sidebarOffen ? 'Sidebar schließen' : 'Sidebar öffnen'}
            title="Gruppe ein-/ausblenden"
          >
            <div className="flex flex-col gap-1 w-5">
              <span className={`block h-0.5 bg-white/70 rounded transition-all duration-200 ${sidebarOffen ? 'w-5' : 'w-5'}`} />
              <span className={`block h-0.5 bg-white/70 rounded transition-all duration-200 ${sidebarOffen ? 'w-3' : 'w-5'}`} />
              <span className={`block h-0.5 bg-white/70 rounded transition-all duration-200 ${sidebarOffen ? 'w-4' : 'w-5'}`} />
            </div>
          </button>

          {/* Logo */}
          <img
            src="/assets/youth-camp-logo-lila.png"
            alt="CAMISSIO YOUTH CAMP"
            className="h-10 w-auto hidden md:block"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/assets/herzanker-lila.png"
            alt="CAMISSIO"
            className="h-9 w-auto md:hidden"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="hidden sm:block">
            <div className="font-headline text-xl md:text-2xl tracking-wide text-camissio-lila leading-none">
              YOUTH CAMP
            </div>
            <div className="text-xs text-white/60 leading-tight font-body tracking-wide">
              Charakterkarten-Tool
            </div>
          </div>
        </div>

        {/* Mitte: Kinder-Anzeige (nur wenn Sidebar zu) */}
        {!sidebarOffen && anzahlKinder > 0 && (
          <button
            onClick={onSidebarToggle}
            className="text-xs text-white/50 hover:text-white/80 transition-colors hidden sm:block"
          >
            {anzahlKinder} Kind{anzahlKinder !== 1 ? 'er' : ''} in der Gruppe
          </button>
        )}

        {/* Rechts */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 hidden lg:block italic">
            Das Highlight deines Sommers!
          </span>
          <button
            onClick={onAnleitung}
            className="flex items-center gap-1.5 bg-camissio-lila/20 hover:bg-camissio-lila/40 text-white rounded-xl px-3 md:px-4 py-2 text-sm font-semibold transition-colors"
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

import { useState, useEffect, useRef } from 'react';

export default function KorrigiertAnsicht({ kind }) {
  const hatMarkup = kind.text_markup && kind.text_markup.trim().length > 0;
  const [aktiverKommentar, setAktiverKommentar] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!aktiverKommentar) return;
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setAktiverKommentar(null);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setAktiverKommentar(null);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [aktiverKommentar]);

  function handleTextClick(e) {
    const span = e.target.closest('.inline-kommentar');
    if (!span) return;

    if (aktiverKommentar?.spanEl === span) {
      setAktiverKommentar(null);
      return;
    }

    const rect = span.getBoundingClientRect();
    const popoverWidth = 280;
    const popoverEstimatedHeight = 60;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));

    let top = rect.top - popoverEstimatedHeight - 10;
    if (top < 8) top = rect.bottom + 8;

    setAktiverKommentar({ text: span.dataset.comment, top, left, spanEl: span });
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Name + Status */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-headline text-3xl text-camissio-dunkelblau tracking-wide">{kind.name}</h2>
          {kind.bibelvers && (
            <p className="text-sm text-camissio-petrol mt-1 italic">„{kind.bibelvers}"</p>
          )}
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shrink-0 ml-4">
          ✓ Korrigiert
        </span>
      </div>

      {/* Gewählte Eigenschaften */}
      {kind.gewaehltEigenschaften?.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Eigenschaften</p>
          <div className="flex flex-wrap gap-2">
            {kind.gewaehltEigenschaften.map((e, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: e.katFarbe || '#1c4554' }}
              >
                {e.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Korrigierter Text */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Charaktertext
          {hatMarkup && (
            <span className="ml-2 normal-case font-normal text-camissio-petrol">
              (mit Korrektur-Markierungen — Kommentare antippen)
            </span>
          )}
        </p>
        <div
          onClick={handleTextClick}
          className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-camissio-dunkelblau leading-relaxed whitespace-pre-wrap"
        >
          {hatMarkup ? (
            <div dangerouslySetInnerHTML={{ __html: kind.text_markup }} />
          ) : (
            <span>{kind.text}</span>
          )}
        </div>
      </div>

      {/* Korrektur-Notiz */}
      {kind.korrektur_notiz && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Notiz vom Korrektur-Team</p>
          <p className="text-sm text-amber-800 leading-relaxed">{kind.korrektur_notiz}</p>
        </div>
      )}

      {/* Kommentar-Popover */}
      {aktiverKommentar && (
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: aktiverKommentar.top, left: aktiverKommentar.left, width: 280 }}
          className="z-50 bg-camissio-dunkelblau text-white rounded-xl px-4 py-3 shadow-xl"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs leading-relaxed">{aktiverKommentar.text}</p>
            <button
              onClick={() => setAktiverKommentar(null)}
              className="text-white/60 hover:text-white text-sm leading-none shrink-0 mt-0.5"
            >
              ×
            </button>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-camissio-dunkelblau" />
        </div>
      )}
    </div>
  );
}

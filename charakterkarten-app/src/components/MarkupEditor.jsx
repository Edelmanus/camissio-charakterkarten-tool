import { useRef, useEffect, useState, useCallback } from 'react';

export default function MarkupEditor({ initialHtml, plainText, onChange }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const popoverRef = useRef(null);
  const [kommentarOffen, setKommentarOffen] = useState(false);
  const [kommentarText, setKommentarText] = useState('');
  const [aktiverKommentar, setAktiverKommentar] = useState(null); // { text, top, left }

  useEffect(() => {
    if (!editorRef.current) return;
    const startHtml = initialHtml && initialHtml.trim() ? initialHtml : (plainText || '');
    editorRef.current.innerHTML = startHtml;
  }, []);

  // Popover schließen bei Klick außerhalb
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

  function apply(fn) {
    editorRef.current?.focus();
    fn();
    onChange(editorRef.current?.innerHTML || '');
  }

  function durchstreichen() {
    apply(() => document.execCommand('strikeThrough'));
  }

  function rueckgaengig() {
    apply(() => document.execCommand('undo'));
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML || '');
  }

  function kommentarStarten(e) {
    e.preventDefault();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    setKommentarText('');
    setKommentarOffen(true);
  }

  function kommentarEinfuegen() {
    if (!savedRangeRef.current || !kommentarText.trim()) return;

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRangeRef.current);

    const range = savedRangeRef.current;
    const span = document.createElement('span');
    span.className = 'inline-kommentar';
    span.dataset.comment = kommentarText.trim();
    span.appendChild(range.extractContents());
    range.insertNode(span);

    sel.removeAllRanges();
    onChange(editorRef.current?.innerHTML || '');
    setKommentarOffen(false);
    setKommentarText('');
    savedRangeRef.current = null;
  }

  function kommentarAbbrechen() {
    setKommentarOffen(false);
    setKommentarText('');
    savedRangeRef.current = null;
  }

  function handleEditorClick(e) {
    const span = e.target.closest('.inline-kommentar');
    if (!span) return;

    // Toggle: gleiches Span nochmal getippt → schließen
    if (aktiverKommentar?.spanEl === span) {
      setAktiverKommentar(null);
      return;
    }

    const rect = span.getBoundingClientRect();
    const popoverWidth = 280;
    const popoverEstimatedHeight = 60;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    // Viewport-Clipping horizontal
    left = Math.max(8, Math.min(left, window.innerWidth - popoverWidth - 8));

    let top = rect.top - popoverEstimatedHeight - 10;
    // Kein Platz oben → unterhalb anzeigen
    if (top < 8) top = rect.bottom + 8;

    setAktiverKommentar({ text: span.dataset.comment, top, left, spanEl: span });
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100">
        <button
          onMouseDown={e => { e.preventDefault(); durchstreichen(); }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          title="Durchstreichen"
        >
          <span className="line-through">Durchstr.</span>
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button
          onMouseDown={kommentarStarten}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
          title="Text auswählen und kommentieren"
        >
          💬 Kommentar
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button
          onMouseDown={e => { e.preventDefault(); rueckgaengig(); }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600"
          title="Rückgängig"
        >
          ↩ Rückgängig
        </button>
      </div>

      {/* Kommentar-Eingabe */}
      {kommentarOffen && (
        <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
          <span className="text-xs text-amber-700 shrink-0">Kommentar:</span>
          <input
            autoFocus
            type="text"
            value={kommentarText}
            onChange={e => setKommentarText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') kommentarEinfuegen(); if (e.key === 'Escape') kommentarAbbrechen(); }}
            placeholder="Kommentar eingeben…"
            className="flex-1 text-xs border border-amber-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white"
          />
          <button
            onClick={kommentarEinfuegen}
            disabled={!kommentarText.trim()}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors"
          >
            OK
          </button>
          <button
            onClick={kommentarAbbrechen}
            className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onClick={handleEditorClick}
        className="px-4 py-3 text-sm text-camissio-dunkelblau leading-relaxed min-h-[180px] focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />

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
          {/* Pfeil nach unten */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-camissio-dunkelblau" />
        </div>
      )}
    </div>
  );
}

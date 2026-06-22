import { useRef, useEffect, useState } from 'react';

const FARBEN = [
  { label: 'Gelb', value: '#fef08a', textClass: 'text-yellow-700' },
  { label: 'Grün', value: '#bbf7d0', textClass: 'text-green-700' },
  { label: 'Rot', value: '#fecaca', textClass: 'text-red-700' },
];

export default function MarkupEditor({ initialHtml, plainText, onChange }) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [kommentarOffen, setKommentarOffen] = useState(false);
  const [kommentarText, setKommentarText] = useState('');

  useEffect(() => {
    if (!editorRef.current) return;
    const startHtml = initialHtml && initialHtml.trim() ? initialHtml : (plainText || '');
    editorRef.current.innerHTML = startHtml;
  }, []);

  function apply(fn) {
    editorRef.current?.focus();
    fn();
    onChange(editorRef.current?.innerHTML || '');
  }

  function markieren(farbe) {
    apply(() => document.execCommand('hiliteColor', false, farbe));
  }

  function durchstreichen() {
    apply(() => document.execCommand('strikeThrough'));
  }

  function markierungEntfernen() {
    apply(() => document.execCommand('removeFormat'));
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML || '');
  }

  function kommentarStarten(e) {
    e.preventDefault();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    // Selektion speichern bevor das Input-Feld den Fokus übernimmt
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

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-100 flex-wrap">
        <span className="text-xs text-gray-400 mr-1">Markieren:</span>
        {FARBEN.map(f => (
          <button
            key={f.value}
            onMouseDown={e => { e.preventDefault(); markieren(f.value); }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 hover:shadow-sm transition-shadow"
            style={{ backgroundColor: f.value }}
            title={`${f.label} markieren`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
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
          onMouseDown={e => { e.preventDefault(); markierungEntfernen(); }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500"
          title="Formatierung entfernen"
        >
          ✕ Formatierung
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
            Abbrechen
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="px-4 py-3 text-sm text-camissio-dunkelblau leading-relaxed min-h-[180px] focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
      />
    </div>
  );
}

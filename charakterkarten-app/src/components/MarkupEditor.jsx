import { useRef, useEffect } from 'react';

const FARBEN = [
  { label: 'Gelb', value: '#fef08a', textClass: 'text-yellow-700' },
  { label: 'Grün', value: '#bbf7d0', textClass: 'text-green-700' },
  { label: 'Rot', value: '#fecaca', textClass: 'text-red-700' },
];

export default function MarkupEditor({ initialHtml, plainText, onChange }) {
  const editorRef = useRef(null);

  // Inhalt nur beim ersten Mounten setzen
  useEffect(() => {
    if (!editorRef.current) return;
    // Wenn noch kein Markup existiert, mit dem Plaintext initialisieren
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
    apply(() => {
      document.execCommand('removeFormat');
    });
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML || '');
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
          onMouseDown={e => { e.preventDefault(); markierungEntfernen(); }}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-500"
          title="Formatierung entfernen"
        >
          ✕ Formatierung
        </button>
      </div>

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

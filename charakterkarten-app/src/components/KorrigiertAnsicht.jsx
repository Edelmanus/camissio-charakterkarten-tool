export default function KorrigiertAnsicht({ kind }) {
  const hatMarkup = kind.text_markup && kind.text_markup.trim().length > 0;

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
              (mit Korrektur-Markierungen)
            </span>
          )}
        </p>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-sm text-camissio-dunkelblau leading-relaxed whitespace-pre-wrap">
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
    </div>
  );
}

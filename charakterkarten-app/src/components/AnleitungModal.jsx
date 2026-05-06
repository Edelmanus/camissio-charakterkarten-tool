const REGELN = [
  'Schreibe den Vor- und Nachnamen jedes Teilnehmers auf die Charakterkarte.',
  'Wähle zwei positive und passende Eigenschaften für jeden Teilnehmer aus. Überprüfe, dass sich die beiden Eigenschaften unterscheiden. Ein gutes Beispiel wären die Adjektive „Hilfsbereit" und „Mutig". Die Adjektive „Dienend" und „Hilfsbereit" unterscheiden sich hingegen nicht hinreichend.',
  'Schreibe die Charakterkarte in der dritten Person. Benutze nicht „du", „ich" oder „wir".',
  'Die Charakterkarte beinhaltet die von dir gewählten zwei Adjektive und anschließend eine Beschreibung, welche die Charaktereigenschaften näher erläutert. In deiner Beschreibung dürfen die beiden Adjektive nicht vorkommen. Stattdessen sollst du mithilfe deiner Beschreibung die beiden Adjektive definieren. Erkläre, wie du weißt, dass der Teilnehmer diese Eigenschaften besitzt. Es ist nicht ausreichend zu schreiben, dass der Teilnehmer geduldig ist. Du musst erklären, auf welche Art und Weise der Teilnehmer seine Geduld zeigt.',
  'Deine Beschreibung sollte eine Länge von ungefähr vier bis fünf aussagekräftigen Sätzen haben. Bleibe bei den von dir ausgewählten Adjektiven. Schreibe nicht, dass der Teilnehmer loyal und sanftmütig ist und dann, wie kreativ und furchtlos der Teilnehmer ist. Als Faustregel gilt: Überlege dir zwei aussagekräftige Sätze für jede Eigenschaft. Füllsätze zählen nicht dazu.',
  'Denke daran, dass du Eigenschaften wählst, die auch über das Camp hinaus für die Teilnehmer gelten. Schreibe zum Beispiel nicht über Aktivitäten des Camps.',
  'Wähle das Präsens als Zeitform, da der Teilnehmer diese Charaktereigenschaften immer noch besitzt.',
  'Versuche, dich nicht zu wortreich auszudrücken. Eine Charakterkarte ist keine wissenschaftliche Arbeit. Sage einfach, wie es ist.',
  'Vermeide „nicht"-Aussagen wie: „Er ist nicht schüchtern, wenn es darum geht, die Wahrheit zu teilen."',
  'Schreibe nicht über negative Erfahrungen. Sage nicht, dass der Teilnehmer mutig war, als er sich nach fünf Stunden Weinen endlich auf die Rutsche gewagt hat.',
  'Sei kreativ! Alle Teilnehmer sind unterschiedlich; benutze dementsprechend auch verschiedene Charaktereigenschaften.',
  'Vermeide es, immer wieder dieselben Wörter wie „super" oder „fantastisch" zu verwenden.',
  'Achte darauf, dass deine Sprache dem Geschlecht der Teilnehmer angemessen ist. Jungs wünschen sich nicht, sanftmütig zu sein, sondern vielleicht geduldig. Mädchen träumen nicht davon, hart zu sein, sondern vielleicht zielstrebig.',
  'Suche eine passende Bibelstelle für den Teilnehmer raus.',
  'Und erinnere dich: schreibe über die zwei Eigenschaften, die du wählst!',
];

const REGEL_ICONS = ['✍️', '⚖️', '👤', '📝', '📏', '🌍', '⏱️', '💬', '❌', '🚫', '🌟', '✨', '♀️♂️', '📖', '🎯'];

export default function AnleitungModal({ onSchliessen }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onSchliessen(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Anleitung für Charakterkarten"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-headline text-2xl text-camissio-dunkelblau tracking-wide">
              ANLEITUNG
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Hilfestellung für Charakterkarten</p>
          </div>
          <button
            onClick={onSchliessen}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
            aria-label="Anleitung schließen"
          >
            ✕
          </button>
        </div>

        {/* Regeln */}
        <div className="overflow-y-auto p-6 space-y-4">
          {REGELN.map((regel, i) => (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-camissio-lila/20 text-camissio-dunkelblau flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm text-camissio-dunkelblau leading-relaxed">
                  {/* Fett hervorheben bei wichtigen Teilen */}
                  {i === 1 && <><strong>Zwei positive und passende Eigenschaften</strong> — </>}
                  {i === 2 && <><strong>Dritte Person</strong> — </>}
                  {i === 3 && <><strong>Adjektive nicht nennen, beschreiben!</strong> — </>}
                  {i === 4 && <><strong>4–5 aussagekräftige Sätze</strong> — </>}
                  {i === 6 && <><strong>Präsens!</strong> — </>}
                  {regel}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-camissio-greige rounded-b-2xl shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Diese Anleitung ist jederzeit über den ℹ️-Button oben rechts erreichbar.
          </p>
        </div>
      </div>
    </div>
  );
}

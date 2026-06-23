import {
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const ALLE_KATEGORIEN_KURZ = {
  beziehungsstark: 'Beziehg.',
  anpacker: 'Anpacker',
  unaufhaltsam: 'Unaufh.',
  verwurzelt: 'Verwurz.',
  gewissenhaft: 'Gewiss.',
  vorbild: 'Vorbild',
  anbeter: 'Anbeter',
  allerechteste: 'Recht.',
  lernend: 'Lernend',
  gestalter: 'Gestalter',
  ueberwinder: 'Überwind.',
};

function CustomTick({ x, y, payload, textAnchor }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#1c4554"
      fontSize={9}
      fontFamily="Nunito Sans, sans-serif"
      fontWeight={700}
    >
      {payload.value}
    </text>
  );
}

export default function RadarChart({ scores }) {
  // Kategorien mit Score > 0, absteigend sortiert
  const mitScore = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  // Kategorien ohne Score
  const ohneScore = Object.keys(ALLE_KATEGORIEN_KURZ)
    .filter(k => !scores[k] || scores[k] === 0);

  // Immer genau 7 Achsen: erst die mit Score, dann auffüllen
  const selected = [
    ...mitScore.map(([k]) => k),
    ...ohneScore,
  ].slice(0, 7);

  const data = selected.map(key => ({
    subject: ALLE_KATEGORIEN_KURZ[key] || key,
    Wert: scores[key] || 0,
    fullMark: 5,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReRadar data={data} cx="50%" cy="50%" outerRadius="62%">
        <PolarGrid stroke="#a1a5dd" strokeOpacity={0.4} />
        <PolarAngleAxis
          dataKey="subject"
          tick={<CustomTick />}
        />
        <Radar
          name="Wesenszüge"
          dataKey="Wert"
          stroke="#a1a5dd"
          fill="#a1a5dd"
          fillOpacity={0.4}
          strokeWidth={2}
          dot={{ fill: '#a1a5dd', r: 3 }}
        />
        <Tooltip
          formatter={(value) => [`${value}/5`, 'Stärke']}
          contentStyle={{ borderRadius: '8px', fontSize: '12px', fontFamily: 'Nunito Sans' }}
        />
      </ReRadar>
    </ResponsiveContainer>
  );
}

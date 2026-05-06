import {
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Kurze Labels damit der Chart übersichtlich bleibt
const KATEGORIEN_KURZ = {
  beziehungsstark: 'Beziehg.',
  anpacker: 'Anpacker',
  unaufhaltsam: 'Unaufh.',
  verwurzelt: 'Verwurz.',
  gewissenhaft: 'Gewiss.',
  vorbild: 'Vorbild',
  anbeter: 'Anbeter',
};

// Custom Tick für bessere Darstellung
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
  const data = Object.entries(KATEGORIEN_KURZ).map(([key, label]) => ({
    subject: label,
    Wert: scores[key] || 3,
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

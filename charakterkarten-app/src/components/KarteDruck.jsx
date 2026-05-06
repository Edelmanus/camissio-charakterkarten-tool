import { forwardRef } from 'react';

// Druckansicht / PDF-Vorlage für eine Charakterkarte
const KarteDruck = forwardRef(function KarteDruck({ kind }, ref) {
  return (
    <div
      ref={ref}
      className="bg-white"
      style={{
        width: '210mm',
        minHeight: '148mm',
        padding: '20mm',
        fontFamily: 'Nunito Sans, sans-serif',
        color: '#1c4554',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hintergrund-Akzent oben */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '8mm',
        background: 'linear-gradient(135deg, #a1a5dd 0%, #1c4554 100%)',
      }} />

      {/* Logo-Bereich */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '4mm' }}>
        <img
          src="/assets/herzanker-lila.png"
          alt="CAMISSIO"
          style={{ height: '32px', width: 'auto' }}
        />
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', color: '#a1a5dd', letterSpacing: '2px', lineHeight: 1 }}>
            CAMISSIO YOUTH CAMP
          </div>
          <div style={{ fontSize: '9px', color: '#888', letterSpacing: '1px' }}>
            CHARAKTERKARTE
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '8px' }}>
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '42px',
          color: '#1c4554',
          margin: 0,
          letterSpacing: '2px',
          lineHeight: 1,
        }}>
          {kind.name}
        </h1>
      </div>

      {/* Eigenschaften */}
      {kind.gewaehltEigenschaften.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {kind.gewaehltEigenschaften.map((eig, i) => (
            <span
              key={i}
              style={{
                background: '#a1a5dd',
                color: 'white',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {eig.name}
            </span>
          ))}
        </div>
      )}

      {/* Fließtext */}
      <div style={{
        fontSize: '14px',
        lineHeight: '1.7',
        color: '#1c4554',
        marginBottom: '16px',
        maxWidth: '160mm',
      }}>
        {kind.text || '(noch kein Text geschrieben)'}
      </div>

      {/* Bibelvers */}
      {kind.bibelvers && (
        <div style={{
          background: '#f0f2ed',
          borderLeft: '4px solid #a1a5dd',
          borderRadius: '4px',
          padding: '10px 14px',
          fontSize: '13px',
          color: '#007d99',
          fontStyle: 'italic',
        }}>
          📖 {kind.bibelvers}
        </div>
      )}

      {/* Fußzeile */}
      <div style={{
        position: 'absolute',
        bottom: '10mm',
        left: '20mm',
        right: '20mm',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '9px', color: '#aaa' }}>
          Das Highlight deines Sommers! · camissio.de
        </span>
        <img
          src="/assets/herzankerkreis-lila-greige.png"
          alt=""
          style={{ height: '24px', width: 'auto', opacity: 0.6 }}
        />
      </div>
    </div>
  );
});

export default KarteDruck;

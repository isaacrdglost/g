"use client";

export default function DashboardMapBg() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 228,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      className="dash-map-bg"
    >
      <svg
        viewBox="0 0 1400 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="dashMapFade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="dashMapMask">
            <rect width="1400" height="900" fill="url(#dashMapFade)" />
          </mask>
        </defs>

        <g mask="url(#dashMapMask)">
          {/* === TOPOGRAFIA sutil - curvas de nivel === */}
          <ellipse cx="400" cy="350" rx="280" ry="180" stroke="rgba(212,80,10,0.025)" strokeWidth="0.5" fill="none" />
          <ellipse cx="400" cy="350" rx="220" ry="140" stroke="rgba(212,80,10,0.02)" strokeWidth="0.5" fill="none" />
          <ellipse cx="400" cy="350" rx="160" ry="100" stroke="rgba(212,80,10,0.015)" strokeWidth="0.5" fill="none" />

          <ellipse cx="1050" cy="600" rx="240" ry="160" stroke="rgba(212,80,10,0.02)" strokeWidth="0.5" fill="none" />
          <ellipse cx="1050" cy="600" rx="180" ry="120" stroke="rgba(212,80,10,0.015)" strokeWidth="0.5" fill="none" />

          {/* === GRID de coordenadas - muito sutil === */}
          {[200, 400, 600, 800, 1000, 1200].map((x) => (
            <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="900" stroke="rgba(212,80,10,0.012)" strokeWidth="0.5" />
          ))}
          {[150, 300, 450, 600, 750].map((y) => (
            <line key={`hg${y}`} x1="0" y1={y} x2="1400" y2={y} stroke="rgba(212,80,10,0.012)" strokeWidth="0.5" />
          ))}

          {/* === TRILHA PRINCIPAL - a jornada do MEI === */}
          <path
            d="M80 200 C180 180, 280 280, 420 240 S620 160, 780 220 S980 320, 1100 260 S1250 200, 1380 280"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="10 6"
          />

          {/* Trilha animada - progresso */}
          <path
            d="M80 200 C180 180, 280 280, 420 240 S620 160, 780 220 S980 320, 1100 260 S1250 200, 1380 280"
            stroke="rgba(212,80,10,0.12)"
            strokeWidth="1.5"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            style={{ animation: "drawRoute 10s ease-in-out infinite alternate" }}
          />

          {/* === TRILHA SECUNDARIA - alternativa === */}
          <path
            d="M100 500 C200 470, 380 550, 520 510 S720 430, 880 490 S1080 570, 1200 520 S1350 460, 1400 500"
            stroke="rgba(212,80,10,0.04)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 8"
          />

          {/* === TRILHA TERCIARIA - base === */}
          <path
            d="M60 720 C200 690, 400 760, 600 730 S850 670, 1000 720 S1200 780, 1400 740"
            stroke="rgba(212,80,10,0.03)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="5 7"
          />

          {/* === CONEXOES entre trilhas === */}
          <path d="M420 240 C440 320, 480 420, 520 510" stroke="rgba(212,80,10,0.03)" strokeWidth="0.7" fill="none" strokeDasharray="3 5" />
          <path d="M780 220 C800 310, 840 400, 880 490" stroke="rgba(212,80,10,0.03)" strokeWidth="0.7" fill="none" strokeDasharray="3 5" />
          <path d="M1100 260 C1080 360, 1060 450, 1050 520" stroke="rgba(212,80,10,0.025)" strokeWidth="0.7" fill="none" strokeDasharray="3 5" />

          {/* === WAYPOINTS PRINCIPAIS - etapas da jornada === */}

          {/* Ponto 01 - Inicio (Cadastro) */}
          <circle cx="80" cy="200" r="4" fill="rgba(212,80,10,0.08)">
            <animate attributeName="r" values="4;6;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="200" r="14" stroke="rgba(212,80,10,0.06)" strokeWidth="0.6" fill="none">
            <animate attributeName="r" values="14;22;14" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="68" y="190" fill="rgba(212,80,10,0.06)" fontSize="7" fontFamily="var(--font-dm-mono)">01</text>

          {/* Ponto 02 - Faturamento */}
          <circle cx="420" cy="240" r="3.5" fill="rgba(212,80,10,0.07)">
            <animate attributeName="r" values="3.5;5;3.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="420" cy="240" r="12" stroke="rgba(212,80,10,0.05)" strokeWidth="0.5" fill="none">
            <animate attributeName="r" values="12;18;12" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="4s" repeatCount="indefinite" />
          </circle>
          <text x="408" y="230" fill="rgba(212,80,10,0.05)" fontSize="7" fontFamily="var(--font-dm-mono)">02</text>

          {/* Ponto 03 - DAS */}
          <circle cx="780" cy="220" r="3" fill="rgba(212,80,10,0.06)">
            <animate attributeName="r" values="3;5;3" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="780" cy="220" r="11" stroke="rgba(212,80,10,0.04)" strokeWidth="0.5" fill="none">
            <animate attributeName="r" values="11;17;11" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <text x="768" y="210" fill="rgba(212,80,10,0.045)" fontSize="7" fontFamily="var(--font-dm-mono)">03</text>

          {/* Ponto 04 - Obrigacoes */}
          <circle cx="1100" cy="260" r="3" fill="rgba(212,80,10,0.06)">
            <animate attributeName="r" values="3;4.5;3" dur="4.5s" repeatCount="indefinite" />
          </circle>
          <text x="1088" y="250" fill="rgba(212,80,10,0.04)" fontSize="7" fontFamily="var(--font-dm-mono)">04</text>

          {/* Ponto 05 - Destino (Sucesso) */}
          <circle cx="1380" cy="280" r="3.5" fill="rgba(212,80,10,0.07)">
            <animate attributeName="r" values="3.5;5.5;3.5" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="1380" cy="280" r="14" stroke="rgba(212,80,10,0.06)" strokeWidth="0.6" fill="none">
            <animate attributeName="r" values="14;22;14" dur="2.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <text x="1368" y="270" fill="rgba(212,80,10,0.05)" fontSize="7" fontFamily="var(--font-dm-mono)">05</text>

          {/* === WAYPOINTS SECUNDARIOS === */}
          <circle cx="520" cy="510" r="2" fill="rgba(212,80,10,0.04)">
            <animate attributeName="r" values="2;3;2" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="880" cy="490" r="2.5" fill="rgba(212,80,10,0.04)">
            <animate attributeName="r" values="2.5;3.5;2.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="730" r="2" fill="rgba(212,80,10,0.03)">
            <animate attributeName="r" values="2;3;2" dur="4.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="1000" cy="720" r="1.5" fill="rgba(212,80,10,0.025)">
            <animate attributeName="r" values="1.5;2.5;1.5" dur="5s" repeatCount="indefinite" />
          </circle>

          {/* === PONTOS DE REFERENCIA ESTATICOS === */}
          <circle cx="200" cy="160" r="1" fill="rgba(212,80,10,0.03)" />
          <circle cx="600" cy="180" r="1" fill="rgba(212,80,10,0.025)" />
          <circle cx="950" cy="350" r="1.5" fill="rgba(212,80,10,0.03)" />
          <circle cx="300" cy="450" r="1" fill="rgba(212,80,10,0.025)" />
          <circle cx="1200" cy="420" r="1" fill="rgba(212,80,10,0.02)" />
          <circle cx="150" cy="650" r="1" fill="rgba(212,80,10,0.02)" />
          <circle cx="750" cy="650" r="1.5" fill="rgba(212,80,10,0.025)" />
          <circle cx="1300" cy="600" r="1" fill="rgba(212,80,10,0.02)" />
          <circle cx="350" cy="800" r="1" fill="rgba(212,80,10,0.015)" />
          <circle cx="1150" cy="800" r="1" fill="rgba(212,80,10,0.015)" />

          {/* === PARTICULAS VIAJANDO === */}
          <circle r="2" fill="rgba(212,80,10,0.1)"
            style={{
              offsetPath: "path('M80 200 C180 180, 280 280, 420 240 S620 160, 780 220 S980 320, 1100 260 S1250 200, 1380 280')",
              animation: "travelRoute1 12s linear infinite",
            }}
          />
          <circle r="1.5" fill="rgba(212,80,10,0.07)"
            style={{
              offsetPath: "path('M80 200 C180 180, 280 280, 420 240 S620 160, 780 220 S980 320, 1100 260 S1250 200, 1380 280')",
              animation: "travelRoute1 12s linear infinite",
              animationDelay: "-5s",
            }}
          />
          <circle r="1" fill="rgba(212,80,10,0.05)"
            style={{
              offsetPath: "path('M100 500 C200 470, 380 550, 520 510 S720 430, 880 490 S1080 570, 1200 520 S1350 460, 1400 500')",
              animation: "travelRoute2 16s linear infinite",
            }}
          />

          {/* === BUSSOLA decorativa no canto === */}
          <g transform="translate(1280, 120)" opacity="0.04">
            <circle cx="0" cy="0" r="30" stroke="rgba(212,80,10,1)" strokeWidth="1" fill="none" />
            <circle cx="0" cy="0" r="22" stroke="rgba(212,80,10,1)" strokeWidth="0.5" fill="none" />
            <line x1="0" y1="-28" x2="0" y2="-18" stroke="rgba(212,80,10,1)" strokeWidth="1.5" />
            <line x1="0" y1="18" x2="0" y2="28" stroke="rgba(212,80,10,1)" strokeWidth="0.8" />
            <line x1="-28" y1="0" x2="-18" y2="0" stroke="rgba(212,80,10,1)" strokeWidth="0.8" />
            <line x1="18" y1="0" x2="28" y2="0" stroke="rgba(212,80,10,1)" strokeWidth="0.8" />
            <polygon points="0,-16 4,0 0,4 -4,0" fill="rgba(212,80,10,1)" />
            <text x="-3" y="-32" fontSize="6" fill="rgba(212,80,10,1)" fontFamily="var(--font-dm-mono)" fontWeight="600">N</text>
          </g>

          {/* === ESCALA decorativa embaixo === */}
          <g transform="translate(100, 850)" opacity="0.03">
            <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(212,80,10,1)" strokeWidth="1" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(212,80,10,1)" strokeWidth="1" />
            <line x1="50" y1="-2" x2="50" y2="2" stroke="rgba(212,80,10,1)" strokeWidth="0.5" />
            <line x1="100" y1="-3" x2="100" y2="3" stroke="rgba(212,80,10,1)" strokeWidth="1" />
            <text x="40" y="12" fontSize="5" fill="rgba(212,80,10,1)" fontFamily="var(--font-dm-mono)">1km</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

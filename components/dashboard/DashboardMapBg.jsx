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
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", opacity: 1 }}
      >
        <defs>
          <radialGradient id="dashMapFade" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="dashMapMask">
            <rect width="1200" height="800" fill="url(#dashMapFade)" />
          </mask>
        </defs>

        <g mask="url(#dashMapMask)">
          {/* Rota 1 - curva principal */}
          <path
            d="M50 300 C200 260, 350 380, 550 340 S850 220, 1100 320"
            stroke="rgba(212,80,10,0.04)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 6"
          />

          {/* Rota 2 - curva inferior */}
          <path
            d="M100 550 C250 520, 450 620, 650 560 S900 480, 1150 540"
            stroke="rgba(212,80,10,0.035)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 8"
          />

          {/* Rota 3 - conexao vertical sutil */}
          <path
            d="M550 340 C560 400, 540 460, 550 520"
            stroke="rgba(212,80,10,0.03)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 6"
          />

          {/* Rota animada - se desenhando */}
          <path
            d="M150 420 C300 380, 500 450, 700 400 S950 340, 1100 410"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="1.2"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            style={{ animation: "drawRoute 8s ease-in-out infinite alternate" }}
          />

          {/* Waypoint A */}
          <circle cx="150" cy="420" r="2.5" fill="rgba(212,80,10,0.06)">
            <animate attributeName="r" values="2.5;4;2.5" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="420" r="10" stroke="rgba(212,80,10,0.04)" strokeWidth="0.6" fill="none">
            <animate attributeName="r" values="10;16;10" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Waypoint B */}
          <circle cx="550" cy="340" r="2" fill="rgba(212,80,10,0.06)">
            <animate attributeName="r" values="2;3.5;2" dur="5s" repeatCount="indefinite" />
          </circle>

          {/* Waypoint C */}
          <circle cx="700" cy="400" r="3" fill="rgba(212,80,10,0.06)">
            <animate attributeName="r" values="3;4.5;3" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="400" r="12" stroke="rgba(212,80,10,0.035)" strokeWidth="0.6" fill="none">
            <animate attributeName="r" values="12;18;12" dur="3.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="3.5s" repeatCount="indefinite" />
          </circle>

          {/* Waypoint D */}
          <circle cx="1100" cy="410" r="2" fill="rgba(212,80,10,0.05)">
            <animate attributeName="r" values="2;3;2" dur="4.5s" repeatCount="indefinite" />
          </circle>

          {/* Waypoint E - rota inferior */}
          <circle cx="650" cy="560" r="1.5" fill="rgba(212,80,10,0.05)">
            <animate attributeName="r" values="1.5;2.5;1.5" dur="5s" repeatCount="indefinite" />
          </circle>

          {/* Pontos de referencia estaticos */}
          <circle cx="350" cy="290" r="1" fill="rgba(212,80,10,0.04)" />
          <circle cx="850" cy="250" r="1" fill="rgba(212,80,10,0.03)" />
          <circle cx="400" cy="600" r="1" fill="rgba(212,80,10,0.03)" />
          <circle cx="950" cy="500" r="1" fill="rgba(212,80,10,0.035)" />

          {/* Particula 1 - rota principal animada */}
          <circle r="1.5" fill="rgba(212,80,10,0.08)"
            style={{
              offsetPath: "path('M150 420 C300 380, 500 450, 700 400 S950 340, 1100 410')",
              animation: "travelRoute1 10s linear infinite",
            }}
          />

          {/* Particula 2 - rota superior */}
          <circle r="1" fill="rgba(212,80,10,0.06)"
            style={{
              offsetPath: "path('M50 300 C200 260, 350 380, 550 340 S850 220, 1100 320')",
              animation: "travelRoute2 14s linear infinite",
            }}
          />

          {/* Labels de coordenadas sutis */}
          <text x="158" y="415" fill="rgba(212,80,10,0.04)" fontSize="6" fontFamily="var(--font-dm-mono)">01</text>
          <text x="708" y="395" fill="rgba(212,80,10,0.035)" fontSize="6" fontFamily="var(--font-dm-mono)">02</text>
        </g>
      </svg>

    </div>
  );
}

"use client";

export default function AuthMapBg() {
  return (
    <>
      <div className="auth-noise" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* Mapa SVG com rotas, waypoints e particulas */}
      <div className="auth-map">
        <svg viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* Rotas principais - caminhos curvos */}
          <path
            d="M-50 200 C200 180, 350 350, 500 300 S750 150, 900 280 S1100 400, 1300 250 S1500 180, 1550 300"
            stroke="rgba(212,80,10,0.08)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 6"
          />
          <path
            d="M-50 500 C150 480, 300 600, 500 550 S700 400, 850 500 S1050 650, 1250 550 S1400 450, 1550 520"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 6"
          />
          <path
            d="M-50 750 C200 700, 400 800, 600 720 S850 600, 1000 700 S1200 800, 1550 680"
            stroke="rgba(212,80,10,0.05)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 8"
          />

          {/* Rotas secundarias - conexoes entre rotas */}
          <path
            d="M500 300 C520 380, 480 450, 500 550"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 6"
          />
          <path
            d="M900 280 C920 340, 870 420, 850 500"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 6"
          />
          <path
            d="M1250 550 C1230 600, 1200 650, 1180 700"
            stroke="rgba(212,80,10,0.05)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 6"
          />

          {/* Rota principal animada - se desenhando */}
          <path
            d="M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400"
            stroke="rgba(212,80,10,0.15)"
            strokeWidth="1.5"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            style={{ animation: "drawRoute 6s ease-in-out infinite alternate" }}
          />

          {/* Waypoints - pontos de destino com pulso */}
          {/* Ponto A - Inicio */}
          <circle cx="100" cy="400" r="3" fill="#D4500A" opacity="0.9">
            <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="400" r="12" stroke="rgba(212,80,10,0.2)" strokeWidth="0.5" fill="none">
            <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Ponto B */}
          <circle cx="500" cy="300" r="2.5" fill="#D4500A" opacity="0.7">
            <animate attributeName="r" values="2.5;4;2.5" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="300" r="10" stroke="rgba(212,80,10,0.15)" strokeWidth="0.5" fill="none">
            <animate attributeName="r" values="10;16;10" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0;0.2" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Ponto C */}
          <circle cx="900" cy="280" r="2" fill="#D4500A" opacity="0.6">
            <animate attributeName="r" values="2;3.5;2" dur="3.5s" repeatCount="indefinite" />
          </circle>

          {/* Ponto D */}
          <circle cx="550" cy="380" r="3.5" fill="#D4500A" opacity="0.8">
            <animate attributeName="r" values="3.5;5.5;3.5" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="550" cy="380" r="14" stroke="rgba(212,80,10,0.25)" strokeWidth="0.5" fill="none">
            <animate attributeName="r" values="14;22;14" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Ponto E */}
          <circle cx="1350" cy="400" r="2.5" fill="#D4500A" opacity="0.7">
            <animate attributeName="r" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Ponto F - rota inferior */}
          <circle cx="500" cy="550" r="2" fill="#D4500A" opacity="0.5">
            <animate attributeName="r" values="2;3;2" dur="4.5s" repeatCount="indefinite" />
          </circle>

          {/* Ponto G */}
          <circle cx="850" cy="500" r="2" fill="#D4500A" opacity="0.5">
            <animate attributeName="r" values="2;3.5;2" dur="3.8s" repeatCount="indefinite" />
          </circle>

          {/* Ponto H */}
          <circle cx="1000" cy="700" r="2" fill="#D4500A" opacity="0.4">
            <animate attributeName="r" values="2;3;2" dur="5s" repeatCount="indefinite" />
          </circle>

          {/* Waypoints menores - pontos de referencia */}
          <circle cx="250" cy="190" r="1.5" fill="rgba(212,80,10,0.3)" />
          <circle cx="700" cy="160" r="1" fill="rgba(212,80,10,0.2)" />
          <circle cx="1100" cy="380" r="1.5" fill="rgba(212,80,10,0.25)" />
          <circle cx="350" cy="620" r="1" fill="rgba(212,80,10,0.2)" />
          <circle cx="680" cy="730" r="1.5" fill="rgba(212,80,10,0.2)" />
          <circle cx="1150" cy="620" r="1" fill="rgba(212,80,10,0.15)" />
          <circle cx="200" cy="800" r="1" fill="rgba(212,80,10,0.15)" />
          <circle cx="1300" cy="700" r="1" fill="rgba(212,80,10,0.2)" />

          {/* Particula viajando pela rota principal */}
          <circle r="2" fill="#D4500A" opacity="0.9"
            style={{
              offsetPath: "path('M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400')",
              animation: "travelRoute1 8s linear infinite",
            }}
          />
          <circle r="1.5" fill="#D4500A" opacity="0.7"
            style={{
              offsetPath: "path('M100 400 C250 350, 400 420, 550 380 S800 300, 950 380 S1150 480, 1350 400')",
              animation: "travelRoute1 8s linear infinite",
              animationDelay: "-3s",
            }}
          />

          {/* Particula viajando pela rota superior */}
          <circle r="1.5" fill="#D4500A" opacity="0.6"
            style={{
              offsetPath: "path('M-50 200 C200 180, 350 350, 500 300 S750 150, 900 280 S1100 400, 1300 250 S1500 180, 1550 300')",
              animation: "travelRoute2 12s linear infinite",
            }}
          />

          {/* Particula viajando pela rota inferior */}
          <circle r="1" fill="#D4500A" opacity="0.5"
            style={{
              offsetPath: "path('M-50 500 C150 480, 300 600, 500 550 S700 400, 850 500 S1050 650, 1250 550 S1400 450, 1550 520')",
              animation: "travelRoute2 15s linear infinite",
              animationDelay: "-5s",
            }}
          />

          {/* Labels de coordenadas sutis */}
          <text x="108" y="395" fill="rgba(212,80,10,0.2)" fontSize="7" fontFamily="var(--font-dm-mono)">01</text>
          <text x="558" y="375" fill="rgba(212,80,10,0.15)" fontSize="7" fontFamily="var(--font-dm-mono)">02</text>
          <text x="508" y="295" fill="rgba(212,80,10,0.12)" fontSize="6" fontFamily="var(--font-dm-mono)">03</text>
          <text x="908" y="275" fill="rgba(212,80,10,0.1)" fontSize="6" fontFamily="var(--font-dm-mono)">04</text>
          <text x="1358" y="395" fill="rgba(212,80,10,0.12)" fontSize="6" fontFamily="var(--font-dm-mono)">05</text>
        </svg>
      </div>
    </>
  );
}

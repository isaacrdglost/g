"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { useSidebar } from "@/lib/sidebar-context";
import { formatarCnpj } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

function mascaraCnpj(cnpj) {
  // 19.131.243/0001-97 → 19.***.***/**01-97
  if (!cnpj || cnpj.length < 18) return cnpj;
  return cnpj.slice(0, 3) + "***" + "." + "***" + cnpj.slice(11);
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconDas() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14M6 3V1M12 3V1" />
    </svg>
  );
}

function IconFaturamento() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 17L6 10l4 4 7-11" />
    </svg>
  );
}

function IconNotas() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1H4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-6-6z" />
      <path d="M10 1v6h6" />
      <path d="M6 10h6M6 14h3" />
    </svg>
  );
}

function IconObrigacoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l2.5 2.5L13 6" />
      <circle cx="9" cy="9" r="8" />
    </svg>
  );
}

function IconDocumentos() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H4a2 2 0 00-2 2v12l3-2 3 2 3-2 3 2V4a2 2 0 00-2-2z" />
      <path d="M6 6h6M6 10h4" />
    </svg>
  );
}

function IconConta() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6" r="4" />
      <path d="M2 17c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

function IconSair() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15H3a1 1 0 01-1-1V4a1 1 0 011-1h3" />
      <path d="M12 12l4-3-4-3" />
      <path d="M16 9H7" />
    </svg>
  );
}

const NAV_PRINCIPAL = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Pagamento DAS", href: "/dashboard/das", icon: IconDas },
  { label: "Faturamento", href: "/dashboard/faturamento", icon: IconFaturamento },
  { href: "/dashboard/notas", label: "Notas fiscais", icon: IconNotas },
];

const NAV_FERRAMENTAS = [
  { label: "Obrigacoes", href: "/dashboard/obrigacoes", icon: IconObrigacoes },
  { label: "Documentos", href: "/dashboard/documentos", icon: IconDocumentos },
  { label: "Minha conta", href: "/dashboard/conta", icon: IconConta },
];

function NavItem({ item, isActive, onClick, colapsada }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center rounded-xl text-sm nav-item ${colapsada ? "justify-center" : "gap-3 px-4"}`}
      style={{
        background: isActive ? "rgba(212,80,10,0.12)" : "transparent",
        color: isActive ? "#D4500A" : "rgba(255,255,255,0.4)",
        fontWeight: isActive ? 500 : 400,
        border: isActive ? "1px solid rgba(212,80,10,0.08)" : "1px solid transparent",
        padding: colapsada ? "10px" : "10px 16px",
      }}
      title={colapsada ? item.label : undefined}
    >
      <Icon />
      {!colapsada && <span>{item.label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil, dadosCnpj, carregando } = useDashboard();
  const { aberta, fechar, colapsada, toggleColapso } = useSidebar();
  const [cnpjVisivel, setCnpjVisivel] = useState(false);

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  const cnpjFormatado = perfil?.cnpj ? formatarCnpj(perfil.cnpj) : "";
  const situacao = dadosCnpj?.descricao_situacao_cadastral || perfil?.situacao || "";
  const ativo = situacao.toLowerCase() === "ativa";

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${aberta ? "active" : ""} lg:hidden`}
        onClick={fechar}
      />

      <aside
        className={`flex flex-col sidebar-mobile ${aberta ? "active" : ""} lg:!transform-none`}
        style={{
          width: colapsada ? 68 : 228,
          height: "100vh",
          backgroundColor: "#141414",
          overflow: "visible",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
          transition: "width 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
      {/* Clip interno */}
      <div className="flex flex-col" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Glows decorativos */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          left: "-20%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,80,10,0.18) 0%, rgba(212,80,10,0.04) 40%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-30%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,80,10,0.14) 0%, rgba(212,80,10,0.03) 40%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,80,10,0.12) 0%, rgba(212,80,10,0.02) 40%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Mapa de trilhas */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <svg viewBox="0 0 228 900" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
          {/* Rotas principais */}
          <path
            d="M-20 120 C60 100, 80 200, 140 180 S200 250, 250 220"
            stroke="rgba(212,80,10,0.12)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 5"
          />
          <path
            d="M-10 400 C50 380, 100 450, 160 420 S220 500, 260 460"
            stroke="rgba(212,80,10,0.08)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="6 5"
          />
          <path
            d="M-20 650 C40 630, 90 700, 150 680 S200 740, 250 710"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="5 6"
          />
          {/* Conexao vertical */}
          <path
            d="M114 100 C120 200, 108 300, 114 420 S108 550, 114 680"
            stroke="rgba(212,80,10,0.06)"
            strokeWidth="0.8"
            fill="none"
            strokeDasharray="4 6"
          />
          {/* Rota animada */}
          <path
            d="M40 80 C80 150, 120 200, 100 320 S80 450, 140 550 S180 650, 100 800"
            stroke="rgba(212,80,10,0.15)"
            strokeWidth="1.2"
            fill="none"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
            style={{ animation: "drawRoute 8s ease-in-out infinite alternate" }}
          />
          {/* Waypoints pulsantes */}
          <circle cx="140" cy="180" r="2.5" fill="#D4500A" opacity="0.7">
            <animate attributeName="r" values="2.5;4;2.5" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="180" r="10" stroke="rgba(212,80,10,0.25)" strokeWidth="0.6" fill="none">
            <animate attributeName="r" values="10;16;10" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="320" r="2" fill="#D4500A" opacity="0.5">
            <animate attributeName="r" values="2;3.5;2" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="420" r="2" fill="#D4500A" opacity="0.4">
            <animate attributeName="r" values="2;3;2" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="550" r="2.5" fill="#D4500A" opacity="0.6">
            <animate attributeName="r" values="2.5;4;2.5" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="680" r="2" fill="#D4500A" opacity="0.4">
            <animate attributeName="r" values="2;3;2" dur="4.5s" repeatCount="indefinite" />
          </circle>
          {/* Pontos estaticos */}
          <circle cx="60" cy="150" r="1" fill="rgba(212,80,10,0.25)" />
          <circle cx="180" cy="280" r="1" fill="rgba(212,80,10,0.2)" />
          <circle cx="40" cy="480" r="1" fill="rgba(212,80,10,0.15)" />
          <circle cx="170" cy="600" r="1" fill="rgba(212,80,10,0.2)" />
          <circle cx="50" cy="750" r="1.5" fill="rgba(212,80,10,0.15)" />
          {/* Particula viajando */}
          <circle r="1.5" fill="#D4500A" opacity="0.8"
            style={{
              offsetPath: "path('M40 80 C80 150, 120 200, 100 320 S80 450, 140 550 S180 650, 100 800')",
              animation: "travelRoute1 10s linear infinite",
            }}
          />
          <circle r="1" fill="#D4500A" opacity="0.5"
            style={{
              offsetPath: "path('M40 80 C80 150, 120 200, 100 320 S80 450, 140 550 S180 650, 100 800')",
              animation: "travelRoute1 10s linear infinite",
              animationDelay: "-4s",
            }}
          />
        </svg>
      </div>

      {/* Logo + collapse toggle */}
      <div
        className="flex items-center justify-center"
        style={{ padding: colapsada ? "24px 0 20px" : "24px 24px 28px", position: "relative", zIndex: 1 }}
      >
        <img src="/logo-v1-dark.svg" alt="Guiado" style={{ width: colapsada ? 28 : 36, height: colapsada ? 28 : 36, borderRadius: colapsada ? 6 : 8, transition: "all 0.25s ease" }} />
      </div>

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col gap-6 overflow-y-auto"
        style={{ padding: "0 12px", position: "relative", zIndex: 1 }}
      >
        <div>
          <span
            className={`block pb-2 ${colapsada ? "hidden" : "px-4"}`}
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Principal
          </span>
          <div className="flex flex-col gap-1">
            {NAV_PRINCIPAL.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={fechar} colapsada={colapsada} />
            ))}
          </div>
        </div>

        <div>
          <span
            className={`block pb-2 ${colapsada ? "hidden" : "px-4"}`}
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            Ferramentas
          </span>
          <div className="flex flex-col gap-1">
            {NAV_FERRAMENTAS.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={fechar} colapsada={colapsada} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer card */}
      <div style={{ padding: "0 12px 8px", position: "relative", zIndex: 1, display: colapsada ? "none" : "block" }}>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {carregando ? (
            <div className="rounded" style={{ width: 130, height: 12, backgroundColor: "rgba(255,255,255,0.08)" }} />
          ) : cnpjFormatado ? (
            <>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  {cnpjVisivel ? cnpjFormatado : mascaraCnpj(cnpjFormatado)}
                </span>
                <button
                  onClick={() => setCnpjVisivel(!cnpjVisivel)}
                  className="cursor-pointer"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 2,
                    color: "rgba(255,255,255,0.3)",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                >
                  {cnpjVisivel ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 1.5l11 11M5.7 5.7a1.8 1.8 0 002.6 2.6" />
                      <path d="M2.8 4.5C1.8 5.5 1.1 6.7 1 7c.5 1.2 2.8 4.5 6 4.5.9 0 1.7-.2 2.4-.6M11.2 9.5c1-1 1.7-2.2 1.8-2.5-.5-1.2-2.8-4.5-6-4.5-.6 0-1.2.1-1.7.3" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 7s2.8-4.5 6-4.5S13 7 13 7s-2.8 4.5-6 4.5S1 7 1 7z" />
                      <circle cx="7" cy="7" r="1.8" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    backgroundColor: ativo ? "#4ADE80" : "#E05252",
                  }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {ativo ? "Ativo na Receita" : "Inativo"}
                </span>
              </div>
            </>
          ) : (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              CNPJ nao cadastrado
            </span>
          )}
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: "0 12px 20px", position: "relative", zIndex: 1 }}>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full py-2.5 rounded-xl text-sm cursor-pointer nav-item ${colapsada ? "justify-center px-0" : "gap-3 px-4"}`}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
          }}
        >
          <IconSair />
          {!colapsada && <span>Sair</span>}
        </button>
      </div>
      </div>{/* end clip */}

      {/* Collapse toggle - FORA do clip pra nao ser cortado */}
      <button
        onClick={toggleColapso}
        className="hidden lg:flex items-center justify-center cursor-pointer"
        style={{
          position: "absolute",
          top: 26,
          right: -14,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "#D4500A",
          border: "none",
          color: "#FFFFFF",
          zIndex: 999,
          transition: "all 0.15s ease",
          boxShadow: "0 2px 10px rgba(212,80,10,0.4)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {colapsada ? <path d="M4 2l4 4-4 4" /> : <path d="M8 2l-4 4 4 4" />}
        </svg>
      </button>
    </aside>
    </>
  );
}

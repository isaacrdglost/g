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

function IconNota() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1H4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7l-6-6z" />
      <path d="M10 1v6h6" />
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
];

const NAV_FERRAMENTAS = [
  { label: "Emitir nota", href: "/dashboard/notas", icon: IconNota },
  { label: "Obrigacoes", href: "/dashboard/obrigacoes", icon: IconObrigacoes },
  { label: "Documentos", href: "/dashboard/documentos", icon: IconDocumentos },
  { label: "Minha conta", href: "/dashboard/conta", icon: IconConta },
];

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm nav-item"
      style={{
        background: isActive ? "rgba(255,92,0,0.12)" : "transparent",
        color: isActive ? "#FF5C00" : "rgba(255,255,255,0.4)",
        fontWeight: isActive ? 500 : 400,
        border: isActive ? "1px solid rgba(255,92,0,0.08)" : "1px solid transparent",
      }}
    >
      <Icon />
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { perfil, dadosCnpj, carregando } = useDashboard();
  const { aberta, fechar } = useSidebar();
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
          width: 228,
          height: "100vh",
          backgroundColor: "#1C1C1C",
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
        }}
      >
      {/* Glow decorativo */}
      <div
        style={{
          position: "absolute",
          top: "-5%",
          left: "-30%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,92,0,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-20%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,92,0,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        className="flex items-center gap-2.5"
        style={{ padding: "28px 24px 36px", position: "relative", zIndex: 1 }}
      >
        <div
          className="flex items-center justify-center font-bold"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            backgroundColor: "#FF5C00",
            color: "#1C1C1C",
            fontSize: 15,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          G
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#FFFFFF",
            fontFamily: "var(--font-dm-sans)",
            letterSpacing: "-0.03em",
          }}
        >
          Guiado
        </span>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 flex flex-col gap-8 overflow-y-auto"
        style={{ padding: "0 12px", position: "relative", zIndex: 1 }}
      >
        <div>
          <span
            className="block px-4 pb-2"
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
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={fechar} />
            ))}
          </div>
        </div>

        <div>
          <span
            className="block px-4 pb-2"
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
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} onClick={fechar} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer card */}
      <div style={{ padding: "0 12px 10px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "14px 16px",
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
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm cursor-pointer nav-item"
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
          <span>Sair</span>
        </button>
      </div>
    </aside>
    </>
  );
}

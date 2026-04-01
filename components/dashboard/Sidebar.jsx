"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";

// Formatar CNPJ para exibição
function formatarCnpj(cnpj) {
  if (!cnpj) return "";
  const n = cnpj.replace(/\D/g, "");
  return `${n.slice(0, 2)}.${n.slice(2, 5)}.${n.slice(5, 8)}/${n.slice(8, 12)}-${n.slice(12)}`;
}

// Ícones SVG inline simples
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
      <path d="M2 7h14" />
      <path d="M6 3V1M12 3V1" />
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

const NAV_PRINCIPAL = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Pagamento DAS", href: "/dashboard/das", icon: IconDas },
  { label: "Faturamento", href: "/dashboard/faturamento", icon: IconFaturamento },
];

const NAV_FERRAMENTAS = [
  { label: "Emitir nota", href: "/dashboard/notas", icon: IconNota },
  { label: "Obrigações", href: "/dashboard/obrigacoes", icon: IconObrigacoes },
  { label: "Documentos", href: "/dashboard/documentos", icon: IconDocumentos },
  { label: "Minha conta", href: "/dashboard/conta", icon: IconConta },
];

function NavItem({ item, isActive }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
      style={{
        background: isActive ? "rgba(212,230,0,0.12)" : "transparent",
        color: isActive ? "#D4E600" : "rgba(255,255,255,0.38)",
      }}
    >
      <Icon />
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { perfil, dadosCnpj, carregando } = useDashboard();

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const cnpjFormatado = perfil?.cnpj ? formatarCnpj(perfil.cnpj) : "";
  const situacao = dadosCnpj?.descricao_situacao_cadastral || perfil?.situacao || "";
  const ativo = situacao.toLowerCase() === "ativa";

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col"
      style={{ width: 216, backgroundColor: "#1C1C1C" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
        <div
          className="flex items-center justify-center font-bold text-base"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            backgroundColor: "#D4E600",
            color: "#1C1C1C",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          G
        </div>
        <span
          className="text-white text-base"
          style={{ fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}
        >
          Guiado
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 flex flex-col gap-6 px-3 overflow-y-auto">
        <div>
          <span
            className="block px-3 pb-1.5 text-xs uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Principal
          </span>
          <div className="flex flex-col gap-0.5">
            {NAV_PRINCIPAL.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </div>
        </div>

        <div>
          <span
            className="block px-3 pb-1.5 text-xs uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            Ferramentas
          </span>
          <div className="flex flex-col gap-0.5">
            {NAV_FERRAMENTAS.map((item) => (
              <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Rodapé - CNPJ e status */}
      <div className="px-3 pb-4 pt-2">
        <div
          className="rounded-lg px-3 py-2.5"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          {carregando ? (
            <div
              className="rounded"
              style={{ width: 130, height: 12, backgroundColor: "rgba(255,255,255,0.1)" }}
            />
          ) : (
            <>
              <span
                className="block text-xs"
                style={{
                  color: "rgba(255,255,255,0.38)",
                  fontFamily: "var(--font-dm-mono)",
                }}
              >
                {cnpjFormatado}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    backgroundColor: ativo ? "#4ADE80" : "#E05252",
                  }}
                />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {ativo ? "Ativo na Receita" : "Inativo"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

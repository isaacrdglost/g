"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useDashboard } from "@/lib/dashboard-context";
import { useSidebar } from "@/lib/sidebar-context";
import { extrairNome } from "@/lib/utils";
import { useNotificacoes } from "@/lib/useNotificacoes";
import ModalRecebimento from "@/components/dashboard/ModalRecebimento";

function getIniciais(nome) {
  if (!nome) return "?";
  return nome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatarData() {
  const hoje = new Date();
  return hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Topbar() {
  const { perfil, carregando } = useDashboard();
  const { toggle } = useSidebar();
  const router = useRouter();
  const dataFormatada = useMemo(() => formatarData(), []);
  const [modalAberto, setModalAberto] = useState(false);
  const [notifAberto, setNotifAberto] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoes();

  const nomeCompleto = perfil?.nome_fantasia
    ? extrairNome(perfil.nome_fantasia)
    : perfil?.email || "";
  const primeiroNome = nomeCompleto.split(" ")[0].split("@")[0];
  const iniciais = getIniciais(nomeCompleto);
  const email = perfil?.email || "";

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    if (!notifAberto && !menuAberto) return;
    function handleClick(e) {
      if (notifAberto && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifAberto(false);
      }
      if (menuAberto && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifAberto, menuAberto]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  return (
    <>
      <header
        className="flex items-center justify-between lg:px-8 lg:py-5"
        style={{
          backgroundColor: "#F7F7F5",
          borderBottom: "1px solid #EBEBEB",
          padding: "14px 16px",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden cursor-pointer"
            style={{ background: "none", border: "none", color: "#1C1C1C", padding: 4 }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 6h16M3 11h16M3 16h16" />
            </svg>
          </button>

          <div>
            {carregando ? (
              <div className="skeleton rounded" style={{ width: 180, height: 22 }} />
            ) : (
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1C1C1C",
                  fontFamily: "var(--font-dm-sans)",
                  letterSpacing: "-0.03em",
                }}
              >
                Ola, {primeiroNome}
              </h1>
            )}
            <p className="hidden sm:block" style={{ fontSize: 13, color: "#D6D6D6", marginTop: 1 }}>
              {dataFormatada}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm btn-primary cursor-pointer"
            style={{
              backgroundColor: "#CCA830",
              color: "#1C1C1C",
              fontWeight: 600,
              fontSize: 13,
              border: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 1v12M1 7h12" />
            </svg>
            <span className="hidden sm:inline">Lancar recebimento</span>
          </button>

          {/* Sino de notificacoes */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setNotifAberto(!notifAberto)}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid #D6D6D6",
                position: "relative",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F3F3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5.5a4 4 0 00-8 0c0 4.5-2 5.5-2 5.5h12s-2-1-2-5.5" />
                <path d="M9.15 13a1.5 1.5 0 01-2.3 0" />
              </svg>
              {naoLidas > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#E05252",
                  }}
                />
              )}
            </button>

            {/* Dropdown */}
            {notifAberto && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  borderRadius: 14,
                  overflow: "hidden",
                  zIndex: 100,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: "14px 16px", borderBottom: "1px solid #EBEBEB" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1C" }}>
                    Notificacoes
                  </span>
                  {naoLidas > 0 && (
                    <button
                      onClick={marcarTodasComoLidas}
                      className="cursor-pointer"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 11,
                        color: "#8A8A8A",
                        fontWeight: 500,
                        padding: 0,
                      }}
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                {/* Lista */}
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notificacoes.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "#8A8A8A" }}>
                        Nenhuma notificacao por enquanto
                      </p>
                    </div>
                  ) : (
                    notificacoes.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => marcarComoLida(notif.id)}
                        className="flex items-start gap-3 w-full cursor-pointer"
                        style={{
                          padding: "12px 16px",
                          backgroundColor: notif.lida ? "#FFFFFF" : "#F7F7F5",
                          border: "none",
                          borderBottom: "1px solid #F3F3F3",
                          textAlign: "left",
                          transition: "background-color 0.15s ease",
                        }}
                      >
                        <span
                          className="rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: notif.cor,
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                        />
                        <div className="flex-1">
                          <p style={{ fontSize: 13, color: "#1C1C1C", lineHeight: 1.5 }}>
                            {notif.texto}
                          </p>
                          <p style={{ fontSize: 11, color: "#8A8A8A", marginTop: 3 }}>
                            {notif.tempo}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar + Menu */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setMenuAberto(!menuAberto); setNotifAberto(false); }}
              className="flex items-center justify-center rounded-full cursor-pointer"
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg, #5A5A5A 0%, #2C2C2C 100%)",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 12,
                fontFamily: "var(--font-dm-sans)",
                border: menuAberto ? "2px solid #CCA830" : "2px solid transparent",
                transition: "border-color 0.15s ease",
              }}
            >
              {carregando ? "" : iniciais}
            </button>

            {menuAberto && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 240,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  borderRadius: 14,
                  overflow: "hidden",
                  zIndex: 100,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {/* User info */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #EBEBEB" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1C" }}>
                    {primeiroNome}
                  </p>
                  <p style={{ fontSize: 12, color: "#8A8A8A", marginTop: 2 }}>
                    {email}
                  </p>
                </div>

                {/* Links */}
                <div style={{ padding: "6px 0" }}>
                  {[
                    { label: "Minha conta", href: "/dashboard/conta", icon: "M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0" },
                    { label: "Faturamento", href: "/dashboard/faturamento", icon: "M1 21L8 13l5 5 8-13" },
                    { label: "Pagamento DAS", href: "/dashboard/das", icon: "M4 5h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 1v4M16 1v4M4 9h16" },
                    { label: "Documentos", href: "/dashboard/documentos", icon: "M16 2H8a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V4a2 2 0 00-2-2zM8 7h8M8 11h5" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuAberto(false)}
                      className="flex items-center gap-3"
                      style={{
                        padding: "10px 16px",
                        fontSize: 13,
                        color: "#1C1C1C",
                        textDecoration: "none",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F7F7F5"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Separador + Sair */}
                <div style={{ borderTop: "1px solid #EBEBEB", padding: "6px 0" }}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full cursor-pointer"
                    style={{
                      padding: "10px 16px",
                      fontSize: 13,
                      color: "#E05252",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FDF0F0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ModalRecebimento
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
      />
    </>
  );
}

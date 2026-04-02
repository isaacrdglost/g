"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { BRASIL_API_BASE } from "@/lib/constants";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const supabase = createClient();

  const [perfil, setPerfil] = useState(null);
  const [dadosCnpj, setDadosCnpj] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [semCnpj, setSemCnpj] = useState(false);

  useEffect(() => {
    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Nome vem do user_metadata (cadastro) ou do perfil
      const nomeUsuario =
        user.user_metadata?.nome_completo || user.email || "";

      // Buscar perfil
      const { data: perfilData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Sem CNPJ: permitir explorar com dados fake
      if (!perfilData?.cnpj) {
        setPerfil({
          id: user.id,
          email: user.email,
          nome_fantasia: nomeUsuario,
          cnpj: null,
          cnae: null,
          situacao: null,
          plano: "free",
        });
        setSemCnpj(true);
        setCarregando(false);
        return;
      }

      setPerfil({
        ...perfilData,
        email: user.email,
        nome_fantasia: perfilData.nome_fantasia || nomeUsuario,
      });

      // Buscar dados do CNPJ na BrasilAPI
      try {
        const res = await fetch(
          `${BRASIL_API_BASE}/cnpj/v1/${perfilData.cnpj}`
        );
        if (res.ok) {
          setDadosCnpj(await res.json());
        }
      } catch {
        // Falha silenciosa, dados do CNPJ são complementares
      }

      setCarregando(false);
    }
    carregar();
  }, []);

  return (
    <DashboardContext.Provider
      value={{ perfil, dadosCnpj, carregando, semCnpj }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

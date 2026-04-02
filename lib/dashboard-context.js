"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { BRASIL_API_BASE } from "@/lib/constants";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const supabase = createClient();

  const [perfil, setPerfil] = useState(null);
  const [dadosCnpj, setDadosCnpj] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [semCnpj, setSemCnpj] = useState(false);

  const atualizarPerfil = useCallback(async (dados) => {
    if (!perfil?.id) return;
    await supabase.from("profiles").update(dados).eq("id", perfil.id);
    setPerfil((prev) => (prev ? { ...prev, ...dados } : prev));
  }, [perfil?.id]);

  const carregar = useCallback(async () => {
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const nomeUsuario =
      user.user_metadata?.nome_completo || user.email || "";

    const { data: perfilData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

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
      setDadosCnpj(null);
      setCarregando(false);
      return;
    }

    setSemCnpj(false);
    setPerfil({
      ...perfilData,
      email: user.email,
      nome_fantasia: perfilData.nome_fantasia || nomeUsuario,
    });

    try {
      const res = await fetch(
        `${BRASIL_API_BASE}/cnpj/v1/${perfilData.cnpj}`
      );
      if (res.ok) {
        setDadosCnpj(await res.json());
      }
    } catch {
      // Falha silenciosa
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <DashboardContext.Provider
      value={{ perfil, dadosCnpj, carregando, semCnpj, recarregar: carregar, atualizarPerfil }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

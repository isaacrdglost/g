"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { BRASIL_API_BASE } from "@/lib/constants";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const router = useRouter();
  const supabase = createClient();

  const [perfil, setPerfil] = useState(null);
  const [dadosCnpj, setDadosCnpj] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Buscar perfil
      const { data: perfilData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Sem CNPJ cadastrado, redirecionar para completar perfil
      if (!perfilData?.cnpj) {
        router.push("/dashboard/conta");
        return;
      }

      setPerfil({ ...perfilData, email: user.email });

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
    <DashboardContext.Provider value={{ perfil, dadosCnpj, carregando }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

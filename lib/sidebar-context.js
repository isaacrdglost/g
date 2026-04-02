"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [aberta, setAberta] = useState(false);
  const [colapsada, setColapsada] = useState(false);
  const toggle = () => setAberta((v) => !v);
  const fechar = () => setAberta(false);
  const toggleColapso = () => setColapsada((v) => !v);

  return (
    <SidebarContext.Provider value={{ aberta, toggle, fechar, colapsada, toggleColapso }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

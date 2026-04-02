"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [aberta, setAberta] = useState(false);
  const toggle = () => setAberta((v) => !v);
  const fechar = () => setAberta(false);

  return (
    <SidebarContext.Provider value={{ aberta, toggle, fechar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

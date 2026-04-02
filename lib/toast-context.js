"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensagem, tipo = "success") => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {/* Toast renderizado */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 50,
            padding: "12px 18px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            animation: "toastIn 0.3s ease-out",
            backgroundColor: toast.tipo === "success" ? "#2A1F14" : "#FDF0F0",
            color: toast.tipo === "success" ? "#D4500A" : "#8B1A1A",
          }}
        >
          {toast.tipo === "success" ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8.5l2.5 2.5L12 5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3M8 10.5v.5" />
            </svg>
          )}
          {toast.mensagem}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

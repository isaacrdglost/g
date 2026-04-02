"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function InfoTooltip({ text }) {
  const [aberto, setAberto] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!aberto) return;

    // Posicionar o tooltip
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }

    function handleClick(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target)
      ) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aberto]);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={() => setAberto((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 15,
          height: 15,
          borderRadius: "50%",
          border: "1px solid #C8C2B8",
          fontSize: 9,
          fontWeight: 600,
          color: "#C8C2B8",
          cursor: "pointer",
          lineHeight: 1,
          userSelect: "none",
          marginLeft: 6,
          flexShrink: 0,
        }}
      >
        i
      </span>
      {aberto && createPortal(
        <span
          ref={tooltipRef}
          style={{
            position: "fixed",
            bottom: `calc(100vh - ${pos.top}px)`,
            left: pos.left,
            transform: "translateX(-50%)",
            backgroundColor: "rgba(42,31,20,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#FAF8F5",
            borderRadius: 10,
            padding: "10px 14px",
            width: 280,
            fontSize: 12,
            lineHeight: 1.6,
            fontWeight: 400,
            letterSpacing: "0.01em",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)",
            whiteSpace: "normal",
            animation: "fadeIn 0.15s ease-out",
            textTransform: "none",
          }}
        >
          {text}
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(42,31,20,0.92)",
            }}
          />
        </span>,
        document.body
      )}
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

export default function InfoTooltip({ text }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [aberto]);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <span
        onClick={() => setAberto((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "1px solid #C8C2B8",
          fontSize: 9,
          fontWeight: 600,
          color: "#C8C2B8",
          cursor: "pointer",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        i
      </span>
      {aberto && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#2A1F14",
            color: "#FAF8F5",
            borderRadius: 8,
            padding: "10px 14px",
            maxWidth: 260,
            fontSize: 12,
            lineHeight: 1.5,
            zIndex: 50,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            whiteSpace: "normal",
          }}
        >
          {text}
          {/* Arrow */}
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
              borderTop: "6px solid #2A1F14",
            }}
          />
        </span>
      )}
    </span>
  );
}

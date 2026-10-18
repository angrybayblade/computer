"use client";

import { useState, useEffect, useRef } from "react";
import { useWindowManager } from "./WindowManager";
import { EditPasswordModal } from "./edit/EditPasswordModal";

export function TopBar() {
  const { windows, restoreWindow, focusWindow } = useWindowManager();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const openWindows = windows.filter((w) => !w.isMinimized);
  const minimizedWindows = windows.filter((w) => w.isMinimized);
  const isMaximized = windows.some((w) => w.isMaximized);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      setShowPasswordModal(true);
      return;
    }

    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 600);
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        background: "var(--color-bauhaus-black)",
        borderBottom: isMaximized ? "3px solid var(--color-bauhaus-black)" : "3px solid var(--color-bauhaus-red)",
        userSelect: "none",
        gap: 0,
      }}
    >
      {/* logo */}
      <div
        onClick={handleLogoClick}
        style={{
          paddingRight: 16,
          paddingLeft: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: "100%",
          borderRight: "2px solid var(--color-bauhaus-dark-gray)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--color-bauhaus-red)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            background: "var(--color-bauhaus-yellow)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            background: "var(--color-bauhaus-blue)",
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {openWindows.map((w) => (
          <button
            key={w.id}
            onClick={() => focusWindow(w.id)}
            style={{
              height: "100%",
              padding: "0 14px",
              border: "none",
              borderRight: "2px solid var(--color-bauhaus-dark-gray)",
              background: "transparent",
              color: "var(--color-bauhaus-white)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {w.title}
          </button>
        ))}
        {minimizedWindows.map((w) => (
          <button
            key={w.id}
            onClick={() => restoreWindow(w.id)}
            style={{
              height: "100%",
              padding: "0 14px",
              border: "none",
              borderRight: "2px solid var(--color-bauhaus-dark-gray)",
              background: "transparent",
              color: "var(--color-bauhaus-gray)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontStyle: "italic",
              opacity: 0.6,
            }}
          >
            {w.title}
          </button>
        ))}
      </div>


      <div
        style={{
          paddingLeft: 16,
          paddingRight: 20,
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: "0.12em",
          color: "var(--color-bauhaus-yellow)",
          fontFamily: "monospace",
          whiteSpace: "nowrap",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {time}
      </div>

      {/* Bauhaus mark */}

      <EditPasswordModal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}

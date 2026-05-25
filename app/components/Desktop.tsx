"use client";

import { useWindowManager } from "./WindowManager";
import { AppWindow } from "./AppWindow";
import { APPS } from "./apps";

export function Desktop() {
  const { windows, openWindow } = useWindowManager();
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-bauhaus-white)",
        overflow: "hidden",
      }}
    >
      {/* Decorative background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(var(--color-bauhaus-black) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-bauhaus-black) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Decorative bauhaus shapes on desktop */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: "3px solid var(--color-bauhaus-red)",
          opacity: 0.12,
        }} />
        <div style={{
          position: "absolute",
          top: 80,
          right: 100,
          width: 120,
          height: 120,
          border: "3px solid var(--color-bauhaus-blue)",
          opacity: 0.08,
          transform: "rotate(15deg)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 120,
          left: 60,
          width: 0,
          height: 0,
          borderLeft: "60px solid transparent",
          borderRight: "60px solid transparent",
          borderBottom: "104px solid var(--color-bauhaus-yellow)",
          opacity: 0.1,
        }} />
      </div>

      {/* Desktop app icons */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {APPS.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() =>
              openWindow(app.id, app.title, {
                width: app.width,
                height: app.height,
                minWidth: app.minWidth,
                minHeight: app.minHeight,
              })
            }
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              width: 80,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: "3px solid var(--color-bauhaus-black)",
                padding: 6,
                background: "var(--color-bauhaus-white)",
              }}
            >
              {app.icon}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-bauhaus-black)",
              }}
            >
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* Window rendering */}
      {windows.map((ws) => {
        const appDef = APPS.find((a) => a.id === ws.id);
        return (
          <AppWindow
            key={ws.id}
            windowState={ws}
            accentColor={appDef?.accentColor}
          >
            {appDef?.content ?? (
              <div style={{ padding: 24, color: "var(--color-bauhaus-dark-gray)" }}>
                Unknown application
              </div>
            )}
          </AppWindow>
        );
      })}
    </div>
  );
}

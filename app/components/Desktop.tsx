"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWindowManager } from "./WindowManager";
import { AppWindow } from "./AppWindow";
import { APPS } from "./apps";
import { resolveAppUiTheme } from "./apps/themes";
import { isMobileViewport, TOP_BAR_HEIGHT } from "@/lib/viewport";
import { getPublicAppRouteById } from "@/lib/app-routes";

const desktopApps = APPS.filter((app) => getPublicAppRouteById(app.id));
const firstColumnIds = ["welcome", "resume", "blog", "books", "vines"];
const firstColumnIdSet = new Set(firstColumnIds);
const desktopAppById = new Map(desktopApps.map((app) => [app.id, app]));
const desktopAppColumns = [
  firstColumnIds.flatMap((id) => {
    const app = desktopAppById.get(id);
    return app ? [app] : [];
  }),
  desktopApps.filter((app) => !firstColumnIdSet.has(app.id)),
].filter((column) => column.length > 0);

const externalDesktopApps = [
  {
    id: "bobby",
    title: "Bobby",
    href: "https://bobby.viraj.computer",
    iconSrc: "/bobby.svg",
  },
];

const desktopIconStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 8,
  textDecoration: "none",
} as const;

const desktopIconLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--color-bauhaus-black)",
} as const;

export function Desktop({
  fullscreenMode = false,
  onToggleFullscreen,
  routedAppId,
  routedContent,
}: {
  fullscreenMode?: boolean;
  onToggleFullscreen?: (appId: string) => void;
  routedAppId?: string;
  routedContent?: ReactNode;
}) {
  const { windows, openWindow } = useWindowManager();
  const openedWelcome = useRef(false);

  useEffect(() => {
    if (routedAppId === "welcome") {
      openedWelcome.current = true;
      return;
    }
    if (openedWelcome.current || routedAppId) return;
    openedWelcome.current = true;
    if (isMobileViewport()) return;

    const welcome = APPS.find((app) => app.id === "welcome");
    if (!welcome) return;

    const width = welcome.width ?? 520;
    const height = welcome.height ?? 380;

    openWindow(welcome.id, welcome.title, {
      width,
      height,
      minWidth: welcome.minWidth,
      minHeight: welcome.minHeight,
      x: Math.max(80, Math.round((window.innerWidth - width) / 2)),
      y: Math.max(
        TOP_BAR_HEIGHT + 24,
        Math.round((window.innerHeight - TOP_BAR_HEIGHT - height) / 2)
      ),
    });
  }, [openWindow, routedAppId]);

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
      <div className="desktop-icon-grid">
        {desktopAppColumns.map((column) => (
          <div className="desktop-icon-column" key={column[0].id}>
            {column.map((app) => {
              const route = getPublicAppRouteById(app.id);
              if (!route) return null;
              return (
                <Link
                  key={app.id}
                  href={route.path}
                  scroll={false}
                  className="desktop-icon"
                  style={desktopIconStyle}
                >
                  <div style={{ width: 48, height: 48 }}>{app.icon}</div>
                  <span style={desktopIconLabelStyle}>
                    {app.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
        <div className="desktop-icon-column">
          {externalDesktopApps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="desktop-icon"
              style={desktopIconStyle}
              aria-label={`${app.title} (opens in a new tab)`}
            >
              <Image src={app.iconSrc} alt="" width={48} height={48} />
              <span style={desktopIconLabelStyle}>{app.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Window rendering */}
      {windows.map((ws) => {
        const appDef = APPS.find((a) => a.id === ws.id);
        const ui = resolveAppUiTheme(appDef?.ui);
        return (
          <AppWindow
            key={ws.id}
            windowState={ws}
            chrome={ui.chrome}
            contentBackground={ui.content?.background}
            fullscreenMode={fullscreenMode && routedAppId === ws.id}
            onToggleFullscreen={onToggleFullscreen}
          >
            {routedAppId === ws.id && routedContent ? routedContent : (appDef?.content ?? (
              <div style={{ padding: 24, color: "var(--color-bauhaus-dark-gray)" }}>
                Unknown application
              </div>
            ))}
          </AppWindow>
        );
      })}
    </div>
  );
}

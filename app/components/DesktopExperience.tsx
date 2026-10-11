"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Desktop } from "./Desktop";
import { TopBar } from "./TopBar";
import {
  WindowManagerProvider,
  useWindowManager,
  type InitialWindow,
} from "./WindowManager";
import { APPS } from "./apps";
import { getPublicAppRouteByPath } from "@/lib/app-routes";

function descriptorForApp(id: string): InitialWindow | undefined {
  const app = APPS.find((candidate) => candidate.id === id);
  if (!app) return undefined;

  return {
    id: app.id,
    title: app.title,
    width: app.width,
    height: app.height,
    minWidth: app.minWidth,
    minHeight: app.minHeight,
  };
}

function RouteWindowSync({ activeWindow }: { activeWindow?: InitialWindow }) {
  const { openWindow } = useWindowManager();
  const lastSyncedId = useRef<string | undefined>(activeWindow?.id);

  useEffect(() => {
    if (!activeWindow) {
      lastSyncedId.current = undefined;
      return;
    }
    if (lastSyncedId.current === activeWindow.id) return;
    lastSyncedId.current = activeWindow.id;
    openWindow(activeWindow.id, activeWindow.title, activeWindow);
  }, [activeWindow, openWindow]);

  return null;
}

export function DesktopExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = getPublicAppRouteByPath(pathname);
  const isDesktopRoute = pathname === "/" || route !== undefined;

  if (!isDesktopRoute) return children;

  const activeWindow = route ? descriptorForApp(route.id) : undefined;

  return (
    <WindowManagerProvider initialWindow={activeWindow} activeWindowId={route?.id}>
      <RouteWindowSync activeWindow={activeWindow} />
      <TopBar />
      <Desktop routedAppId={route?.id} routedContent={route ? children : undefined} />
      {route ? null : children}
    </WindowManagerProvider>
  );
}

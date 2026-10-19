"use client";

import { Suspense, useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Desktop } from "./Desktop";
import { TopBar } from "./TopBar";
import {
  WindowManagerProvider,
  useWindowManager,
  type InitialWindow,
} from "./WindowManager";
import { APPS } from "./apps";
import { getPublicAppRouteById, getPublicAppRouteByPath } from "@/lib/app-routes";

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

function DesktopExperienceRouter({
  children,
  pathname,
  route,
}: {
  children: ReactNode;
  pathname: string;
  route: NonNullable<ReturnType<typeof getPublicAppRouteByPath>>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fullscreenMode = searchParams.get("fs") === "true";

  const toggleFullscreen = useCallback(
    (appId: string) => {
      const appRoute = getPublicAppRouteById(appId);
      if (!appRoute) return;

      const currentRoute = getPublicAppRouteByPath(pathname);
      const isCurrentApp = currentRoute?.id === appId;
      const isExiting = isCurrentApp && fullscreenMode;
      const nextSearchParams = new URLSearchParams(searchParams.toString());

      if (isExiting) nextSearchParams.delete("fs");
      else nextSearchParams.set("fs", "true");

      const targetPath = isCurrentApp ? pathname : appRoute.path;
      const query = nextSearchParams.toString();
      router.push(query ? `${targetPath}?${query}` : targetPath, { scroll: false });
    },
    [fullscreenMode, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!fullscreenMode) return;

    function exitFullscreen(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("fs");
      const query = nextSearchParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    window.addEventListener("keydown", exitFullscreen);
    return () => window.removeEventListener("keydown", exitFullscreen);
  }, [fullscreenMode, pathname, router, searchParams]);

  return (
    <>
      {fullscreenMode ? null : <TopBar />}
      <Desktop
        fullscreenMode={fullscreenMode}
        onToggleFullscreen={toggleFullscreen}
        routedAppId={route.id}
        routedContent={children}
      />
    </>
  );
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
      {route ? (
        <Suspense
          fallback={
            <>
              <TopBar />
              <Desktop routedAppId={route.id} routedContent={<div />} />
            </>
          }
        >
          <DesktopExperienceRouter pathname={pathname} route={route}>
            {children}
          </DesktopExperienceRouter>
        </Suspense>
      ) : (
        <>
          <TopBar />
          <Desktop />
          {children}
        </>
      )}
    </WindowManagerProvider>
  );
}

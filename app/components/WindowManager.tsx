"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getFullscreenWindowBounds,
  isMobileViewport,
  TOP_BAR_HEIGHT,
} from "@/lib/viewport";

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

interface WindowManagerContextValue {
  windows: WindowState[];
  topZ: number;
  openWindow: (
    id: string,
    title: string,
    opts?: Partial<
      Pick<WindowState, "x" | "y" | "width" | "height" | "minWidth" | "minHeight">
    >
  ) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  toggleMaximize: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

function buildWindowBounds(
  opts: Partial<
    Pick<WindowState, "x" | "y" | "width" | "height" | "minWidth" | "minHeight">
  > | undefined,
  offset: number
) {
  return {
    x: opts?.x ?? 80 + offset,
    y: opts?.y ?? TOP_BAR_HEIGHT + 40 + offset,
    width: opts?.width ?? 640,
    height: opts?.height ?? 480,
    minWidth: opts?.minWidth ?? 320,
    minHeight: opts?.minHeight ?? 240,
  };
}

function withMobileFullscreen<T extends Pick<WindowState, "x" | "y" | "width" | "height">>(
  bounds: T
): T & Pick<WindowState, "x" | "y" | "width" | "height" | "isMaximized" | "prevBounds"> {
  if (!isMobileViewport()) {
    return { ...bounds, isMaximized: false, prevBounds: undefined };
  }

  return {
    ...bounds,
    ...getFullscreenWindowBounds(),
    isMaximized: true,
    prevBounds: bounds,
  };
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [topZ, setTopZ] = useState(10);

  useEffect(() => {
    function handleResize() {
      setWindows((prev) =>
        prev.map((w) => (w.isMaximized ? { ...w, ...getFullscreenWindowBounds() } : w))
      );
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openWindow: WindowManagerContextValue["openWindow"] = useCallback(
    (id, title, opts) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          if (existing.isMinimized) {
            const bounds = buildWindowBounds(
              {
                x: existing.prevBounds?.x ?? existing.x,
                y: existing.prevBounds?.y ?? existing.y,
                width: existing.prevBounds?.width ?? existing.width,
                height: existing.prevBounds?.height ?? existing.height,
                minWidth: existing.minWidth,
                minHeight: existing.minHeight,
              },
              0
            );

            return prev.map((w) =>
              w.id === id
                ? {
                    ...w,
                    isMinimized: false,
                    ...withMobileFullscreen(bounds),
                  }
                : w
            );
          }
          return prev;
        }
        const offset = prev.length * 28;
        const bounds = buildWindowBounds(opts, offset);
        const placement = withMobileFullscreen(bounds);

        return [
          ...prev,
          {
            id,
            title,
            ...bounds,
            ...placement,
            minWidth: bounds.minWidth,
            minHeight: bounds.minHeight,
            zIndex: topZ + 1,
            isMinimized: false,
          },
        ];
      });
      setTopZ((z) => z + 1);
    },
    [topZ]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w))
      );
    },
    [topZ]
  );

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              width: Math.max(width, w.minWidth),
              height: Math.max(height, w.minHeight),
            }
          : w
      )
    );
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            x: w.prevBounds?.x ?? 80,
            y: w.prevBounds?.y ?? TOP_BAR_HEIGHT + 40,
            width: w.prevBounds?.width ?? 640,
            height: w.prevBounds?.height ?? 480,
          };
        }
        return {
          ...w,
          isMaximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          ...getFullscreenWindowBounds(),
        };
      })
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback(
    (id: string) => {
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id !== id) return w;

          const bounds = buildWindowBounds(
            {
              x: w.prevBounds?.x ?? w.x,
              y: w.prevBounds?.y ?? w.y,
              width: w.prevBounds?.width ?? w.width,
              height: w.prevBounds?.height ?? w.height,
              minWidth: w.minWidth,
              minHeight: w.minHeight,
            },
            0
          );

          return {
            ...w,
            isMinimized: false,
            zIndex: nextZ,
            ...withMobileFullscreen(bounds),
          };
        })
      );
    },
    [topZ]
  );

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        topZ,
        openWindow,
        closeWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        toggleMaximize,
        minimizeWindow,
        restoreWindow,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

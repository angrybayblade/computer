"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";

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

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}

const TOP_BAR_HEIGHT = 40;

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [topZ, setTopZ] = useState(10);

  const openWindow: WindowManagerContextValue["openWindow"] = useCallback(
    (id, title, opts) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          if (existing.isMinimized) {
            return prev.map((w) =>
              w.id === id ? { ...w, isMinimized: false } : w
            );
          }
          return prev;
        }
        const offset = prev.length * 28;
        return [
          ...prev,
          {
            id,
            title,
            x: opts?.x ?? 80 + offset,
            y: opts?.y ?? TOP_BAR_HEIGHT + 40 + offset,
            width: opts?.width ?? 640,
            height: opts?.height ?? 480,
            minWidth: opts?.minWidth ?? 320,
            minHeight: opts?.minHeight ?? 240,
            zIndex: topZ + 1,
            isMinimized: false,
            isMaximized: false,
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
          x: 0,
          y: TOP_BAR_HEIGHT,
          width: window.innerWidth,
          height: window.innerHeight - TOP_BAR_HEIGHT,
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
        prev.map((w) =>
          w.id === id ? { ...w, isMinimized: false, zIndex: nextZ } : w
        )
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

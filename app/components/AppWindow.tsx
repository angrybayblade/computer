"use client";

import {
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useWindowManager, type WindowState } from "./WindowManager";
import { type AppChromeTheme } from "./apps/types";
import { bauhausTheme } from "./apps/themes";

interface AppWindowProps {
  windowState: WindowState;
  chrome?: AppChromeTheme;
  contentBackground?: string;
  children: ReactNode;
}

export function AppWindow({
  windowState,
  chrome = bauhausTheme.chrome,
  contentBackground,
  children,
}: AppWindowProps) {
  const {
    closeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    toggleMaximize,
    minimizeWindow,
  } = useWindowManager();

  const windowRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeState = useRef<{
    startX: number;
    startY: number;
    originW: number;
    originH: number;
    originX: number;
    originY: number;
    edge: string;
  } | null>(null);

  const handleTitlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (windowState.isMaximized) return;
      e.preventDefault();
      focusWindow(windowState.id);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: windowState.x,
        originY: windowState.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [windowState.id, windowState.x, windowState.y, windowState.isMaximized, focusWindow]
  );

  const handleTitlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      moveWindow(
        windowState.id,
        dragState.current.originX + dx,
        Math.max(0, dragState.current.originY + dy)
      );
    },
    [windowState.id, moveWindow]
  );

  const handleTitlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const handleEdgePointerDown = useCallback(
    (edge: string) => (e: ReactPointerEvent) => {
      if (windowState.isMaximized) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(windowState.id);
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originW: windowState.width,
        originH: windowState.height,
        originX: windowState.x,
        originY: windowState.y,
        edge,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [windowState, focusWindow]
  );

  const handleEdgePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const rs = resizeState.current;
      if (!rs) return;
      const dx = e.clientX - rs.startX;
      const dy = e.clientY - rs.startY;
      let newW = rs.originW;
      let newH = rs.originH;
      let newX = rs.originX;
      let newY = rs.originY;

      if (rs.edge.includes("e")) newW = rs.originW + dx;
      if (rs.edge.includes("s")) newH = rs.originH + dy;
      if (rs.edge.includes("w")) {
        newW = rs.originW - dx;
        newX = rs.originX + dx;
      }
      if (rs.edge.includes("n")) {
        newH = rs.originH - dy;
        newY = rs.originY + dy;
      }

      const clampedW = Math.max(newW, windowState.minWidth);
      const clampedH = Math.max(newH, windowState.minHeight);
      if (rs.edge.includes("w") && clampedW !== newW) {
        newX = rs.originX + rs.originW - clampedW;
      }
      if (rs.edge.includes("n") && clampedH !== newH) {
        newY = rs.originY + rs.originH - clampedH;
      }

      moveWindow(windowState.id, newX, newY);
      resizeWindow(windowState.id, clampedW, clampedH);
    },
    [windowState.id, windowState.minWidth, windowState.minHeight, moveWindow, resizeWindow]
  );

  const handleEdgePointerUp = useCallback(() => {
    resizeState.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && windowState.isMaximized) {
        toggleMaximize(windowState.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [windowState.id, windowState.isMaximized, toggleMaximize]);

  if (windowState.isMinimized) return null;

  const edgeSize = 6;
  const edges = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  const cursorMap: Record<string, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
  };
  const edgeStyles: Record<string, React.CSSProperties> = {
    n: { top: -edgeSize / 2, left: edgeSize, right: edgeSize, height: edgeSize },
    s: { bottom: -edgeSize / 2, left: edgeSize, right: edgeSize, height: edgeSize },
    e: { right: -edgeSize / 2, top: edgeSize, bottom: edgeSize, width: edgeSize },
    w: { left: -edgeSize / 2, top: edgeSize, bottom: edgeSize, width: edgeSize },
    ne: { top: -edgeSize / 2, right: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 },
    nw: { top: -edgeSize / 2, left: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 },
    se: { bottom: -edgeSize / 2, right: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 },
    sw: { bottom: -edgeSize / 2, left: -edgeSize / 2, width: edgeSize * 2, height: edgeSize * 2 },
  };

  const controls = {
    width: chrome.controls?.width ?? 36,
    borderLeft: chrome.controls?.borderLeft ?? "3px solid var(--color-bauhaus-black)",
    minimize: chrome.controls?.minimize ?? {
      background: "var(--color-bauhaus-yellow)",
      color: "var(--color-bauhaus-black)",
    },
    maximize: chrome.controls?.maximize ?? {
      background: "var(--color-bauhaus-blue)",
      color: "var(--color-bauhaus-white)",
    },
    close: chrome.controls?.close ?? {
      background: "var(--color-bauhaus-red)",
      color: "var(--color-bauhaus-white)",
    },
  };

  const shellBackground = contentBackground ?? chrome.contentBackground ?? chrome.windowBackground;

  return (
    <div
      ref={windowRef}
      className={chrome.windowClassName}
      onPointerDown={() => focusWindow(windowState.id)}
      style={{
        position: "absolute",
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
        display: "flex",
        flexDirection: "column",
        border: windowState.isMaximized ? "none" : (chrome.windowBorder ?? "3px solid var(--color-bauhaus-black)"),
        background: chrome.windowBackground ?? "var(--color-bauhaus-white)",
        boxShadow: windowState.isMaximized ? "none" : (chrome.windowShadow ?? "6px 6px 0 var(--color-bauhaus-black)"),
      }}
    >
      {/* Title bar */}
      <div
        className={chrome.titleBarClassName}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => toggleMaximize(windowState.id)}
        style={{
          display: "flex",
          alignItems: "center",
          height: chrome.titleBarHeight ?? 36,
          background: chrome.titleBarBackground ?? chrome.accentColor,
          cursor: windowState.isMaximized ? "default" : "grab",
          userSelect: "none",
          flexShrink: 0,
          borderBottom: chrome.titleBarBorderBottom ?? "3px solid var(--color-bauhaus-black)",
        }}
      >
        <span
          style={{
            flex: 1,
            paddingLeft: 12,
            fontFamily: chrome.titleBarFontFamily,
            fontWeight: chrome.titleFontWeight ?? 700,
            fontSize: chrome.titleFontSize ?? 13,
            letterSpacing: chrome.titleLetterSpacing ?? "0.08em",
            textTransform: chrome.titleTextTransform ?? "uppercase",
            color: chrome.titleBarColor ?? "var(--color-bauhaus-white)",
          }}
        >
          {windowState.title}
        </span>
        <div
          className={chrome.controlsClassName}
          style={{ display: "flex", gap: 0, height: "100%" }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(windowState.id);
            }}
            style={{
              width: controls.width,
              height: "100%",
              border: "none",
              borderLeft: controls.borderLeft,
              background: controls.minimize.background,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: chrome.titleBarFontFamily,
              fontSize: 16,
              fontWeight: 600,
              color: controls.minimize.color,
            }}
            aria-label="Minimize"
          >
            &#8722;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(windowState.id);
            }}
            style={{
              width: controls.width,
              height: "100%",
              border: "none",
              borderLeft: controls.borderLeft,
              background: controls.maximize.background,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: chrome.titleBarFontFamily,
              fontSize: 13,
              fontWeight: 600,
              color: controls.maximize.color,
            }}
            aria-label="Maximize"
          >
            {windowState.isMaximized ? "◇" : "□"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(windowState.id);
            }}
            style={{
              width: controls.width,
              height: "100%",
              border: "none",
              borderLeft: controls.borderLeft,
              background: controls.close.background,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: chrome.titleBarFontFamily,
              fontSize: 14,
              fontWeight: 600,
              color: controls.close.color,
            }}
            aria-label="Close"
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative",
          background: shellBackground,
        }}
      >
        {children}
      </div>

      {/* Resize handles */}
      {!windowState.isMaximized &&
        edges.map((edge) => (
          <div
            key={edge}
            onPointerDown={handleEdgePointerDown(edge)}
            onPointerMove={handleEdgePointerMove}
            onPointerUp={handleEdgePointerUp}
            style={{
              position: "absolute",
              cursor: cursorMap[edge],
              zIndex: 1,
              ...edgeStyles[edge],
            }}
          />
        ))}
    </div>
  );
}

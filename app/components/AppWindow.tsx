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
  fullscreenMode?: boolean;
  onToggleFullscreen?: (appId: string) => void;
  children: ReactNode;
}

type WindowControlGlyphName = "minimize" | "maximize" | "fullscreen" | "close";

function WindowControlGlyph({
  name,
  active = false,
}: {
  name: WindowControlGlyphName;
  active?: boolean;
}) {
  const paths: Record<WindowControlGlyphName, string> = {
    minimize: "M2 7h10",
    maximize: active ? "M4 2h8v8H4zM2 4v8h8" : "M2.5 2.5h9v9h-9z",
    fullscreen: active
      ? "M1 5h4V1M13 5H9V1M1 9h4v4M13 9H9v4"
      : "M5 1H1v4M9 1h4v4M1 9v4h4M13 9v4H9",
    close: "M3 3l8 8M11 3l-8 8",
  };

  return (
    <svg
      className="app-window-control-icon"
      viewBox="0 0 14 14"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        d={paths[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function AppWindow({
  windowState,
  chrome = bauhausTheme.chrome,
  contentBackground,
  fullscreenMode = false,
  onToggleFullscreen,
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
      if (fullscreenMode || windowState.isMaximized) return;
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
    [fullscreenMode, windowState.id, windowState.x, windowState.y, windowState.isMaximized, focusWindow]
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
      if (fullscreenMode || windowState.isMaximized) return;
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
    [fullscreenMode, windowState, focusWindow]
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
      if (!fullscreenMode && e.key === "Escape" && windowState.isMaximized) {
        toggleMaximize(windowState.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenMode, windowState.id, windowState.isMaximized, toggleMaximize]);

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
    fullscreen: chrome.controls?.fullscreen ?? chrome.controls?.maximize ?? {
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
        left: fullscreenMode ? 0 : windowState.x,
        top: fullscreenMode ? 0 : windowState.y,
        width: fullscreenMode ? "100%" : windowState.width,
        height: fullscreenMode ? "100%" : windowState.height,
        zIndex: windowState.zIndex,
        display: "flex",
        flexDirection: "column",
        border: fullscreenMode || windowState.isMaximized ? "none" : (chrome.windowBorder ?? "3px solid var(--color-bauhaus-black)"),
        background: chrome.windowBackground ?? "var(--color-bauhaus-white)",
        boxShadow: fullscreenMode || windowState.isMaximized ? "none" : (chrome.windowShadow ?? "6px 6px 0 var(--color-bauhaus-black)"),
      }}
    >
      {/* Title bar */}
      <div
        className={chrome.titleBarClassName}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => {
          if (!fullscreenMode) toggleMaximize(windowState.id);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          height: chrome.titleBarHeight ?? 36,
          background: chrome.titleBarBackground ?? chrome.accentColor,
          cursor: fullscreenMode || windowState.isMaximized ? "default" : "grab",
          userSelect: "none",
          flexShrink: 0,
          borderBottom: chrome.titleBarBorderBottom ?? "3px solid var(--color-bauhaus-black)",
        }}
      >
        <span
          className="app-window-title"
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
          className={`app-window-controls${chrome.controlsClassName ? ` ${chrome.controlsClassName}` : ""}`}
          onPointerDown={(event) => event.stopPropagation()}
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
              color: controls.minimize.color,
            }}
            aria-label="Minimize"
          >
            <WindowControlGlyph name="minimize" />
          </button>
          {onToggleFullscreen ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFullscreen(windowState.id);
              }}
              style={{
                width: controls.width,
                height: "100%",
                border: "none",
                borderLeft: controls.borderLeft,
                background: controls.fullscreen.background,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: controls.fullscreen.color,
              }}
              aria-label={fullscreenMode ? "Exit fullscreen" : "Enter fullscreen"}
              title={fullscreenMode ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
            >
              <WindowControlGlyph name="fullscreen" active={fullscreenMode} />
            </button>
          ) : null}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!fullscreenMode) toggleMaximize(windowState.id);
            }}
            style={{
              width: controls.width,
              height: "100%",
              border: "none",
              borderLeft: controls.borderLeft,
              background: controls.maximize.background,
              cursor: fullscreenMode ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: controls.maximize.color,
            }}
            aria-label="Maximize"
          >
            <WindowControlGlyph name="maximize" active={windowState.isMaximized} />
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
              color: controls.close.color,
            }}
            aria-label="Close"
          >
            <WindowControlGlyph name="close" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        className="app-window-content"
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "auto",
          position: "relative",
          background: shellBackground,
        }}
      >
        {children}
      </div>

      {/* Resize handles */}
      {!fullscreenMode && !windowState.isMaximized &&
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

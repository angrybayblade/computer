import { type AppUiTheme } from "../types";

export const galleryTheme: AppUiTheme = {
  chrome: {
    accentColor: "#d9a33a",
    titleBarBackground: "#082f60",
    titleBarColor: "#f4e5d2",
    titleBarBorderBottom: "1px solid #183f6b",
    titleBarHeight: 38,
    titleFontSize: 11,
    titleFontWeight: 700,
    titleLetterSpacing: "0.14em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: "var(--font-roboto-mono), monospace",
    titleBarClassName: "gallery-title-bar",
    windowClassName: "gallery-window",
    controlsClassName: "gallery-window-controls",
    windowBorder: "1px solid #183f6b",
    windowBackground: "#f4e8d8",
    windowShadow: "8px 8px 0 rgba(8, 47, 96, 0.22)",
    contentBackground: "#f4e8d8",
    controls: {
      width: 42,
      borderLeft: "1px solid #183f6b",
      minimize: { background: "#f4e5d2", color: "#082f60" },
      maximize: { background: "#c96d5b", color: "#fff4e5" },
      fullscreen: { background: "#e6d8c6", color: "#082f60" },
      close: { background: "#082748", color: "#f4e5d2" },
    },
  },
  content: {
    background: "#f4e8d8",
    color: "#082f60",
    fontFamily: "var(--font-roboto-mono), monospace",
    className: "gallery-app",
  },
};

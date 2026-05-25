import { type AppUiTheme } from "../types";

const openSans = 'var(--font-open-sans), "Open Sans", sans-serif';

export const animeTheme: AppUiTheme = {
  chrome: {
    accentColor: "#e12120",
    titleBarBackground: "#0F0F14",
    titleBarColor: "#E8E4DC",
    titleBarBorderBottom: "2px solid #e12120",
    titleBarHeight: 36,
    titleFontSize: 11,
    titleFontWeight: 700,
    titleLetterSpacing: "0.18em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: openSans,
    titleBarClassName: "anime-title-bar",
    windowClassName: "anime-window",
    controlsClassName: "anime-window-controls",
    windowBorder: "1px solid #2E2E3A",
    windowBackground: "#0B0B0F",
    windowShadow: "0 0 28px rgba(225, 33, 32, 0.22), 0 8px 32px rgba(0, 0, 0, 0.6)",
    contentBackground: "#0B0B0F",
    controls: {
      width: 36,
      borderLeft: "1px solid #2E2E3A",
      minimize: {
        background: "#15151C",
        color: "#6B6878",
      },
      maximize: {
        background: "#15151C",
        color: "#6B6878",
      },
      close: {
        background: "#e12120",
        color: "#0B0B0F",
      },
    },
  },
  content: {
    background: "#0B0B0F",
    color: "#E8E4DC",
    fontFamily: openSans,
    className: "anime-app",
    vars: {
      "app-bg": "#0B0B0F",
      "app-surface": "#15151C",
      "app-fg": "#E8E4DC",
      "app-muted": "#6B6878",
      "app-border": "#2E2E3A",
      "app-hairline": "#1E1E28",
      "app-accent": "#e12120",
      "app-amber": "#FFB800",
      "app-concrete": "#1E1E28",
      "app-neon-red-glow": "rgba(225, 33, 32, 0.45)",
      "app-radius": "2px",
      "app-radius-sm": "1px",
    },
  },
};

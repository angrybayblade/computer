import { type AppUiTheme } from "../types";

export const midcenturyTheme: AppUiTheme = {
  chrome: {
    accentColor: "#1A1A1A",
    titleBarBackground: "#FAF6F0",
    titleBarColor: "#1A1A1A",
    titleBarBorderBottom: "2px solid #1A1A1A",
    titleBarHeight: 36,
    titleFontSize: 11,
    titleFontWeight: 700,
    titleLetterSpacing: "0.16em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: 'var(--font-geist-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
    titleBarClassName: "midcentury-title-bar",
    windowClassName: "midcentury-window",
    controlsClassName: "midcentury-window-controls",
    windowBorder: "2px solid #1A1A1A",
    windowBackground: "#F5F0E0",
    windowShadow: "6px 6px 0 rgba(26, 26, 26, 0.15)",
    contentBackground: "#F5F0E0",
    controls: {
      width: 36,
      borderLeft: "2px solid #1A1A1A",
      minimize: {
        background: "#FAF6F0",
        color: "#1A1A1A",
      },
      maximize: {
        background: "#FAF6F0",
        color: "#1A1A1A",
      },
      close: {
        background: "#1A1A1A",
        color: "#FAF6F0",
      },
    },
  },
  content: {
    background: "#F5F0E0",
    color: "#1A1A1A",
    fontFamily: 'var(--font-geist-sans), "Helvetica Neue", Helvetica, Arial, sans-serif',
    className: "midcentury-app",
    vars: {
      "app-bg": "#F5F0E0",
      "app-surface": "#FAF6F0",
      "app-fg": "#1A1A1A",
      "app-muted": "#6B6358",
      "app-mustard": "#D4A843",
      "app-navy": "#1B365D",
      "app-terracotta": "#C45D2C",
      "app-teal": "#2E7D7B",
      "app-sage": "#6B8E6B",
      "app-border": "#1A1A1A",
      "app-accent": "#D4A843",
    },
  },
};

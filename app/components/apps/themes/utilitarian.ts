import { type AppUiTheme } from "../types";

export const utilitarianTheme: AppUiTheme = {
  chrome: {
    accentColor: "#111111",
    titleBarBackground: "#F7F7F5",
    titleBarColor: "#111111",
    titleBarBorderBottom: "1px solid #111111",
    titleBarHeight: 32,
    titleFontSize: 11,
    titleFontWeight: 500,
    titleLetterSpacing: "0.14em",
    titleTextTransform: "uppercase",
    windowBorder: "1px solid #111111",
    windowBackground: "#EBEBEB",
    windowShadow: "none",
    contentBackground: "#EBEBEB",
    controls: {
      width: 32,
      borderLeft: "1px solid #111111",
      minimize: {
        background: "#F7F7F5",
        color: "#111111",
      },
      maximize: {
        background: "#F7F7F5",
        color: "#111111",
      },
      close: {
        background: "#111111",
        color: "#F7F7F5",
      },
    },
  },
  content: {
    background: "#EBEBEB",
    color: "#111111",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    vars: {
      "app-bg": "#EBEBEB",
      "app-surface": "#F7F7F5",
      "app-fg": "#111111",
      "app-muted": "#666666",
      "app-accent": "#FFD200",
      "app-accent-alt": "#E86100",
      "app-border": "#111111",
      "app-hairline": "#C8C8C8",
    },
  },
};

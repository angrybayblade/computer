import { type AppUiTheme } from "../types";

export const blogTheme: AppUiTheme = {
  chrome: {
    accentColor: "#ff5c35",
    titleBarBackground: "#181818",
    titleBarColor: "#fff9ed",
    titleBarBorderBottom: "1px solid #3f3a34",
    titleBarHeight: 38,
    titleFontSize: 11,
    titleFontWeight: 700,
    titleLetterSpacing: "0.14em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: 'var(--font-roboto-mono), monospace',
    titleBarClassName: "blog-title-bar",
    windowClassName: "blog-window",
    controlsClassName: "blog-window-controls",
    windowBorder: "1px solid #3f3a34",
    windowBackground: "#fff9ed",
    windowShadow: "8px 8px 0 rgba(24, 24, 24, 0.23)",
    contentBackground: "#fff9ed",
    controls: {
      width: 42,
      borderLeft: "1px solid #3f3a34",
      minimize: { background: "#fff9ed", color: "#181818" },
      maximize: { background: "#ff5c35", color: "#181818" },
      close: { background: "#181818", color: "#fff9ed" },
    },
  },
  content: {
    background: "#fff9ed",
    color: "#181818",
    fontFamily: 'var(--font-crimson-text), Georgia, serif',
    className: "blog-app",
  },
};

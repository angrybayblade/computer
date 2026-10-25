import { type AppUiTheme } from "../types";

export const stickersTheme: AppUiTheme = {
  chrome: {
    accentColor: "#ff6b57",
    titleBarBackground: "#f7edda",
    titleBarColor: "#25221f",
    titleBarBorderBottom: "2px solid #25221f",
    titleBarHeight: 38,
    titleFontSize: 11,
    titleFontWeight: 800,
    titleLetterSpacing: "0.12em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: "var(--font-roboto-mono), monospace",
    titleBarClassName: "stickers-title-bar",
    windowClassName: "stickers-window",
    controlsClassName: "stickers-window-controls",
    windowBorder: "2px solid #25221f",
    windowBackground: "#f7edda",
    windowShadow: "7px 7px 0 #25221f",
    contentBackground: "#f7edda",
    controls: {
      width: 40,
      borderLeft: "2px solid #25221f",
      minimize: { background: "#ffcf4a", color: "#25221f" },
      maximize: { background: "#67c9bf", color: "#25221f" },
      fullscreen: { background: "#8aa7ff", color: "#25221f" },
      close: { background: "#ff6b57", color: "#25221f" },
    },
  },
  content: {
    background: "#f7edda",
    color: "#25221f",
    fontFamily: "var(--font-roboto-mono), monospace",
    className: "stickers-app",
  },
};

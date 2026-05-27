import { type AppUiTheme } from "../types";

const display = 'Georgia, "Times New Roman", Times, serif';
const body = 'Arial, Helvetica, sans-serif';

export const surrealismTheme: AppUiTheme = {
  chrome: {
    accentColor: "#E84545",
    titleBarBackground: "#1A1228",
    titleBarColor: "#F5EDE3",
    titleBarBorderBottom: "2px solid #E84545",
    titleBarHeight: 36,
    titleFontSize: 11,
    titleFontWeight: 700,
    titleLetterSpacing: "0.16em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: display,
    titleBarClassName: "vines-title-bar",
    windowClassName: "vines-window",
    controlsClassName: "vines-window-controls",
    windowBorder: "2px solid #1A1A1A",
    windowBackground: "#2A2040",
    windowShadow: "6px 6px 0 rgba(232, 69, 69, 0.45)",
    contentBackground: "#2A2040",
    controls: {
      width: 36,
      borderLeft: "2px solid #1A1A1A",
      minimize: {
        background: "#7EB6D4",
        color: "#1A1A1A",
      },
      maximize: {
        background: "#F5EDE3",
        color: "#1A1A1A",
      },
      close: {
        background: "#E84545",
        color: "#F5EDE3",
      },
    },
  },
  content: {
    background: "#000000",
    color: "#F5EDE3",
    fontFamily: body,
    className: "vines-app",
    vars: {
      "app-bg": "#000000",
      "app-surface": "#1A1228",
      "app-paper": "#F5EDE3",
      "app-fg": "#F5EDE3",
      "app-muted": "#B8AFC8",
      "app-border": "#1A1A1A",
      "app-accent": "#E84545",
      "app-accent-alt": "#7EB6D4",
      "app-sun": "#F5A623",
      "app-vine": "#4A7C59",
    },
  },
};

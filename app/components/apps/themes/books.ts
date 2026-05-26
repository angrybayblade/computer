import { type AppUiTheme } from "../types";

const display = 'var(--font-playfair-display), Georgia, "Times New Roman", serif';
const body = 'var(--font-crimson-text), Georgia, "Times New Roman", serif';

export const booksTheme: AppUiTheme = {
  chrome: {
    accentColor: "#C9A84C",
    titleBarBackground: "#0A0A0A",
    titleBarColor: "#E8DFD0",
    titleBarBorderBottom: "1px solid #C9A84C",
    titleBarHeight: 36,
    titleFontSize: 11,
    titleFontWeight: 600,
    titleLetterSpacing: "0.18em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: display,
    titleBarClassName: "books-title-bar",
    windowClassName: "books-window",
    controlsClassName: "books-window-controls",
    windowBorder: "1px solid #C9A84C",
    windowBackground: "#0A0A0A",
    windowShadow: "6px 6px 0 rgba(201, 168, 76, 0.38)",
    contentBackground: "#0A0A0A",
    controls: {
      width: 36,
      borderLeft: "1px solid #2A2520",
      minimize: {
        background: "#121110",
        color: "#C9A84C",
      },
      maximize: {
        background: "#121110",
        color: "#C9A84C",
      },
      close: {
        background: "#1B3A2F",
        color: "#E8DFD0",
      },
    },
  },
  content: {
    background: "#0A0A0A",
    color: "#E8DFD0",
    fontFamily: body,
    className: "books-app",
    vars: {
      "app-bg": "#0A0A0A",
      "app-surface": "#121110",
      "app-paper": "#E8DFD0",
      "app-fg": "#E8DFD0",
      "app-muted": "#8B8178",
      "app-border": "#2A2520",
      "app-hairline": "#1A1816",
      "app-accent": "#1B3A2F",
      "app-accent-alt": "#C9A84C",
      "app-ink": "#0D0D0D",
      "app-wood": "#5C4033",
      "app-wood-dark": "#2A1810",
      "app-shadow-gold": "rgba(201, 168, 76, 0.38)",
      "app-radius": "0px",
      "app-radius-sm": "0px",
    },
  },
};

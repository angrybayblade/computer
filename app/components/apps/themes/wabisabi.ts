import { type AppUiTheme } from "../types";

const display = 'var(--font-playfair-display), Georgia, "Times New Roman", serif';
const body = 'var(--font-open-sans), system-ui, sans-serif';

export const wabisabiTheme: AppUiTheme = {
  chrome: {
    accentColor: "#6B7B5C",
    titleBarBackground: "#F5F0E6",
    titleBarColor: "#3A3A38",
    titleBarBorderBottom: "1px solid rgba(107, 123, 92, 0.25)",
    titleBarHeight: 36,
    titleFontSize: 11,
    titleFontWeight: 500,
    titleLetterSpacing: "0.14em",
    titleTextTransform: "uppercase",
    titleBarFontFamily: display,
    titleBarClassName: "wabisabi-title-bar",
    windowClassName: "wabisabi-window",
    controlsClassName: "wabisabi-window-controls",
    windowBorder: "1px solid rgba(58, 58, 56, 0.12)",
    windowBackground: "#F5F0E6",
    windowShadow: "6px 8px 24px rgba(58, 58, 56, 0.08)",
    contentBackground: "#F5F0E6",
    controls: {
      width: 36,
      borderLeft: "1px solid rgba(107, 123, 92, 0.2)",
      minimize: {
        background: "#FAF7F0",
        color: "#7A756C",
      },
      maximize: {
        background: "#FAF7F0",
        color: "#7A756C",
      },
      close: {
        background: "#6B7B5C",
        color: "#FAF7F0",
      },
    },
  },
  content: {
    background: "#F5F0E6",
    color: "#3A3A38",
    fontFamily: body,
    vars: {
      "resume-bg": "#F5F0E6",
      "resume-paper": "#FAF7F0",
      "resume-ink": "#3A3A38",
      "resume-muted": "#7A756C",
      "resume-olive": "#6B7B5C",
      "resume-teal": "#5C7A78",
      "resume-sienna": "#A65D45",
      "resume-gold": "#B8A078",
      "resume-border": "rgba(58, 58, 56, 0.1)",
      "resume-display": display,
      "resume-body": body,
    },
  },
};

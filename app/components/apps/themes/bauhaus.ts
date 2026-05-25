import { type AppUiTheme } from "../types";

export const bauhausTheme: AppUiTheme = {
  chrome: {
    accentColor: "var(--color-bauhaus-red)",
    titleBarBackground: "var(--color-bauhaus-red)",
    titleBarColor: "var(--color-bauhaus-white)",
    titleBarBorderBottom: "3px solid var(--color-bauhaus-black)",
    titleBarHeight: 36,
    titleFontSize: 13,
    titleFontWeight: 700,
    titleLetterSpacing: "0.08em",
    titleTextTransform: "uppercase",
    windowBorder: "3px solid var(--color-bauhaus-black)",
    windowBackground: "var(--color-bauhaus-white)",
    windowShadow: "6px 6px 0 var(--color-bauhaus-black)",
    contentBackground: "var(--color-bauhaus-white)",
    controls: {
      width: 36,
      borderLeft: "3px solid var(--color-bauhaus-black)",
      minimize: {
        background: "var(--color-bauhaus-yellow)",
        color: "var(--color-bauhaus-black)",
      },
      maximize: {
        background: "var(--color-bauhaus-blue)",
        color: "var(--color-bauhaus-white)",
      },
      close: {
        background: "var(--color-bauhaus-red)",
        color: "var(--color-bauhaus-white)",
      },
    },
  },
  content: {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
};

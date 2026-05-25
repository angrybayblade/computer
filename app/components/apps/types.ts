import { type CSSProperties, type ReactNode } from "react";

export type AppWindowControlsTheme = {
  width?: number;
  borderLeft?: string;
  minimize?: { background: string; color: string };
  maximize?: { background: string; color: string };
  close?: { background: string; color: string };
};

export type AppChromeTheme = {
  accentColor: string;
  titleBarBackground?: string;
  titleBarColor?: string;
  titleBarBorderBottom?: string;
  titleBarHeight?: number;
  titleFontSize?: number;
  titleFontWeight?: number;
  titleLetterSpacing?: string;
  titleTextTransform?: CSSProperties["textTransform"];
  titleBarFontFamily?: string;
  titleBarClassName?: string;
  windowClassName?: string;
  controlsClassName?: string;
  windowBorder?: string;
  windowBackground?: string;
  windowShadow?: string;
  contentBackground?: string;
  controls?: AppWindowControlsTheme;
};

export type AppContentTheme = {
  background?: string;
  color?: string;
  fontFamily?: string;
  className?: string;
  /** CSS custom properties applied to the app content shell, without the `--` prefix. */
  vars?: Record<string, string>;
};

export type AppUiTheme = {
  chrome: AppChromeTheme;
  content?: AppContentTheme;
};

export type AppDefinition = {
  id: string;
  title: string;
  icon: ReactNode;
  ui: AppUiTheme;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  content: ReactNode;
};

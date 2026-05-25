"use client";

import { type CSSProperties, type ReactNode } from "react";
import { type AppContentTheme } from "./types";

type AppContentProps = {
  theme?: AppContentTheme;
  style?: CSSProperties;
  children: ReactNode;
};

export function buildContentStyle(theme?: AppContentTheme): CSSProperties {
  const vars = theme?.vars
    ? Object.fromEntries(
        Object.entries(theme.vars).map(([key, value]) => [`--${key}`, value] as const)
      )
    : {};

  return {
    height: "100%",
    backgroundColor: theme?.background,
    color: theme?.color,
    fontFamily: theme?.fontFamily,
    ...vars,
  };
}

export function AppContent({ theme, style, children }: AppContentProps) {
  return (
    <div className={theme?.className} style={{ ...buildContentStyle(theme), ...style }}>
      {children}
    </div>
  );
}

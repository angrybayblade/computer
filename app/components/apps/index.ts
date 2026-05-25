import { type AppDefinition } from "./types";
import { moviesApp } from "./movies";
import { musicApp } from "./music";

export const APPS: AppDefinition[] = [moviesApp, musicApp];

export type { AppDefinition, AppUiTheme, AppChromeTheme, AppContentTheme } from "./types";
export { AppContent } from "./AppContent";
export { bauhausTheme, utilitarianTheme, etherealTheme, resolveAppUiTheme } from "./themes";

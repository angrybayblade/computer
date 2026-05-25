import { type AppDefinition } from "./types";
import { moviesApp } from "./movies";
import { musicApp } from "./music";
import { comicsApp } from "./comics";

export const APPS: AppDefinition[] = [moviesApp, musicApp, comicsApp];

export type { AppDefinition, AppUiTheme, AppChromeTheme, AppContentTheme } from "./types";
export { AppContent } from "./AppContent";
export { bauhausTheme, utilitarianTheme, etherealTheme, midcenturyTheme, resolveAppUiTheme } from "./themes";

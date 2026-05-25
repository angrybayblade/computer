import { type AppDefinition } from "./types";
import { moviesApp } from "./movies";
import { musicApp } from "./music";
import { comicsApp } from "./comics";
import { animeApp } from "./anime";

export const APPS: AppDefinition[] = [moviesApp, musicApp, comicsApp, animeApp];

export type { AppDefinition, AppUiTheme, AppChromeTheme, AppContentTheme } from "./types";
export { AppContent } from "./AppContent";
export { bauhausTheme, utilitarianTheme, etherealTheme, midcenturyTheme, animeTheme, resolveAppUiTheme } from "./themes";

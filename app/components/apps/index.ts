import { type AppDefinition } from "./types";
import { welcomeApp } from "./welcome";
import { moviesApp } from "./movies";
import { musicApp } from "./music";
import { comicsApp } from "./comics";
import { animeApp } from "./anime";
import { booksApp } from "./books";

export const APPS: AppDefinition[] = [welcomeApp, moviesApp, musicApp, comicsApp, animeApp, booksApp];

export type { AppDefinition, AppUiTheme, AppChromeTheme, AppContentTheme } from "./types";
export { AppContent } from "./AppContent";
export { bauhausTheme, utilitarianTheme, etherealTheme, midcenturyTheme, animeTheme, booksTheme, resolveAppUiTheme } from "./themes";

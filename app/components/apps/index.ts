import { type AppDefinition } from "./types";
import { welcomeApp } from "./welcome";
import { moviesApp } from "./movies";
import { musicApp } from "./music";
import { comicsApp } from "./comics";
import { animeApp } from "./anime";
import { booksApp } from "./books";
import { vinesApp } from "./vines";
import { resumeApp } from "./resume";

export const APPS: AppDefinition[] = [
  welcomeApp,
  resumeApp,
  moviesApp,
  musicApp,
  comicsApp,
  animeApp,
  booksApp,
  vinesApp,
];

export type { AppDefinition, AppUiTheme, AppChromeTheme, AppContentTheme } from "./types";
export { AppContent } from "./AppContent";
export {
  bauhausTheme,
  utilitarianTheme,
  etherealTheme,
  midcenturyTheme,
  animeTheme,
  booksTheme,
  surrealismTheme,
  wabisabiTheme,
  resolveAppUiTheme,
} from "./themes";

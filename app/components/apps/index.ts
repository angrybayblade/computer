import { type AppDefinition } from "./types";
import { welcomeApp } from "./welcome";
import { moviesApp } from "./movies";
import { musicApp } from "./music";
import { comicsApp } from "./comics";
import { animeApp } from "./anime";
import { booksApp } from "./books";
import { blogApp } from "./blog";
import { vinesApp } from "./vines";
import { resumeApp } from "./resume";
import { galleryApp } from "./gallery";
import { stickersApp } from "./stickers";

export const APPS: AppDefinition[] = [
  welcomeApp,
  resumeApp,
  moviesApp,
  musicApp,
  comicsApp,
  animeApp,
  booksApp,
  blogApp,
  vinesApp,
  galleryApp,
  stickersApp,
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

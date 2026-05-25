import { type AppUiTheme } from "../types";
import { bauhausTheme } from "./bauhaus";

export { bauhausTheme } from "./bauhaus";
export { utilitarianTheme } from "./utilitarian";
export { etherealTheme } from "./ethereal";
export { midcenturyTheme } from "./midcentury";
export { animeTheme } from "./anime";

export function resolveAppUiTheme(ui?: AppUiTheme): AppUiTheme {
  if (!ui) return bauhausTheme;

  return {
    chrome: { ...bauhausTheme.chrome, ...ui.chrome },
    content: { ...bauhausTheme.content, ...ui.content },
  };
}

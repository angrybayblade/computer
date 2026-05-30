export const MOBILE_BREAKPOINT = 640;
export const TOP_BAR_HEIGHT = 40;

export function isMobileViewport(width = typeof window !== "undefined" ? window.innerWidth : MOBILE_BREAKPOINT + 1) {
  return width <= MOBILE_BREAKPOINT;
}

export function getFullscreenWindowBounds() {
  return {
    x: 0,
    y: TOP_BAR_HEIGHT,
    width: window.innerWidth,
    height: window.innerHeight - TOP_BAR_HEIGHT,
  };
}

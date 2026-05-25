"use client";

import { WindowManagerProvider } from "./components/WindowManager";
import { TopBar } from "./components/TopBar";
import { Desktop } from "./components/Desktop";

export default function Home() {
  return (
    <WindowManagerProvider>
      <TopBar />
      <Desktop />
    </WindowManagerProvider>
  );
}

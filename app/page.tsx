"use client";

import { WindowManagerProvider } from "./components/WindowManager";
import { TopBar } from "./components/TopBar";
import { Desktop } from "./components/Desktop";

export default function Home() {
  return (
    <>
      <noscript>
        <main>
          <h1>Viraj Patel — Software Engineer</h1>
          <p>
            Viraj Patel, also known online as angrybayblade, is a software engineer in Bengaluru,
            India. He builds developer platforms, SDKs, orchestration systems, and open-source
            infrastructure.
          </p>
          <p>
            His experience includes founding engineering roles at Composio and Valory, plus Google
            Summer of Code. His work spans Python, JavaScript, Go, React, Next.js, PostgreSQL,
            Docker, and Kubernetes.
          </p>
          <nav aria-label="Viraj Patel on the web">
            <a href="https://github.com/angrybayblade">GitHub</a>{" "}
            <a href="https://www.linkedin.com/in/angrybayblade/">LinkedIn</a>{" "}
            <a href="https://x.com/angrybayblade">X</a>
          </nav>
        </main>
      </noscript>
      <WindowManagerProvider>
        <TopBar />
        <Desktop />
      </WindowManagerProvider>
    </>
  );
}

"use client";

import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { bauhausTheme } from "../themes";


function WelcomeAppContent() {
  return (
    <div className="welcome-app">
      <div className="welcome-shapes" aria-hidden>
        <div className="welcome-shape welcome-shape-circle" />
        <div className="welcome-shape welcome-shape-square" />
        <div className="welcome-shape welcome-shape-triangle" />
      </div>

      <div className="welcome-content">
        <p className="welcome-eyebrow">Welcome to my computer</p>
        <p className="welcome-lead">
          My name is Viraj, I'm a software engineer by profession, I like cooking,
          lifting weights and consuming all sort of media in my free time
        </p>
        <p className="welcome-lead">
          Feel free to look around, use the apps to learn stuff about me
        </p>
        <div className="welcome-social-links">
          <a href="https://www.linkedin.com/in/angrybayblade/" target="_blank" rel="noopener noreferrer">
            <img src="/linkedin.svg" alt="LinkedIn" width={24} height={24} />
          </a>
          <a href="https://github.com/angrybayblade" target="_blank" rel="noopener noreferrer">
            <img src="/github.svg" alt="GitHub" width={24} height={24} />
          </a>
          <a href="https://www.instagram.com/angrybayblade/" target="_blank" rel="noopener noreferrer">
            <img src="/instagram.svg" alt="Instagram" width={24} height={24} />
          </a>
          <a href="https://x.com/angrybayblade" target="_blank" rel="noopener noreferrer">
            <img src="/twitter.svg" alt="Twitter" width={24} height={24} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function WelcomeApp() {
  return (
    <AppContent theme={bauhausTheme.content}>
      <WelcomeAppContent />
    </AppContent>
  );
}

function ThisPcIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect x="4" y="4.5" width="30" height="30" fill="var(--color-bauhaus-white)" stroke="var(--color-bauhaus-black)" strokeWidth="1.5" />
      <rect x="8" y="8" width="22" height="22" fill="var(--color-bauhaus-blue)" />
      <circle cx="14" cy="14.5" r="2" fill="var(--color-bauhaus-red)" stroke="var(--color-bauhaus-black)" strokeWidth="0.75" />
      <circle cx="14" cy="19.5" r="2" fill="var(--color-bauhaus-red)" stroke="var(--color-bauhaus-black)" strokeWidth="0.75" />
      <circle cx="14" cy="24.5" r="2" fill="var(--color-bauhaus-red)" stroke="var(--color-bauhaus-black)" strokeWidth="0.75" />
      <rect x="17" y="12.5" width="6" height="3" fill="var(--color-bauhaus-yellow)" stroke="var(--color-bauhaus-black)" strokeWidth="0.75" />
    </svg>
  );
}

export const welcomeApp: AppDefinition = {
  id: "welcome",
  title: "This PC",
  icon: <ThisPcIcon />,
  ui: bauhausTheme,
  width: 520,
  height: 380,
  minWidth: 360,
  minHeight: 280,
  content: <WelcomeApp />,
};

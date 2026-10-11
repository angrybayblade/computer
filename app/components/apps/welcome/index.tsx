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
          My name is Viraj, on the internet I go by the pseudonym <b>angrybayblade</b>.
        </p>
        <p className="welcome-lead">
          I'm a software engineer by profession, I like cooking, lifting weights
          and consuming all sort of media in my free time
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
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M21 32h6v7h-6z" fill="var(--color-bauhaus-black)" />
      <rect x="13" y="39" width="22" height="3" rx="1" fill="var(--color-bauhaus-black)" />
      <rect x="3" y="6" width="42" height="28" rx="3" fill="var(--color-bauhaus-black)" />
      <path d="M6 9h36v20H6z" fill="var(--color-bauhaus-white)" />
      <path d="M6 9h18v20H6z" fill="var(--color-bauhaus-blue)" />
      <circle cx="24" cy="19" r="7" fill="var(--color-bauhaus-red)" />
      <path d="M31 22h11v7H31z" fill="var(--color-bauhaus-yellow)" />
      <path d="M21 31.5h6" stroke="var(--color-bauhaus-white)" strokeWidth="1" strokeLinecap="round" />
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

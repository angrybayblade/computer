"use client";

import { AppContent } from "../AppContent";
import { type AppDefinition } from "../types";
import { wabisabiTheme } from "../themes";
import styles from "./resume.module.css";

type Role = {
  title: string;
  period: string;
  bullets: string[];
};

type Experience = {
  company: string;
  location: string;
  period: string;
  intro?: string;
  roles: Role[];
};

const EXPERIENCE: Experience[] = [
  {
    company: "Composio",
    location: "Bengaluru, India",
    period: "May 2024 — September 2025",
    intro:
      "Joined as a founding engineer, led the development of the tooling infrastructure and worked on improving the developer experience both internally and externally.",
    roles: [
      {
        title: "Founding Engineer",
        period: "May 2024 — Present",
        bullets: [
          "Led the development of the SDK and the plugin ecosystem",
          "Rewrote the tooling orchestration service which led to the overall performance boost of 11×",
          "Designed and developed multiple components of the tooling infrastructure ground up including a runtime framework for scaling tool executions, a versioning framework for tools, and a pipeline which takes in an OpenAPI specification and outputs a tool compatible with Composio's platform",
          "Implemented abstractions and in-house tooling for speeding the development process while reducing risk factors",
        ],
      },
    ],
  },
  {
    company: "Valory AG",
    location: "Remote",
    period: "Sep 2021 — May 2024",
    intro:
      "Joined as one of the founding engineers, led the development of the core stack and multiple open source frameworks to improve the developer experience.",
    roles: [
      {
        title: "Python Engineer",
        period: "Aug 2023 — May 2024",
        bullets: [
          "Reduced deployment complexity on the user platform by automating environment configurations",
          "Improved the user experience by developing a client for the user platform and reducing deployment time by 95–99%",
          "Designed and developed the POC for a no-code/low-code platform for developing autonomous services",
        ],
      },
      {
        title: "Python Engineer & Engineering Coordinator",
        period: "Sep 2022 — Aug 2023",
        bullets: [
          "Coordinated release cycles for the core frameworks",
          "Developed an orchestration framework to streamline development, testing, and deployment of autonomous services",
          "Sped up development and reduced production issues by introducing in-house static analysers",
          "Developed multiple plugins to support on-chain interaction from different chains and wallets",
        ],
      },
      {
        title: "Junior Python Developer",
        period: "Sep 2021 — Sep 2022",
        bullets: [
          "Improved user experience by fixing bugs and implementing new features on the core framework",
          "Worked on developing various autonomous services using the core stack as proof of concept",
          "Designed and developed infrastructure for package management on the IPFS network",
          "Reduced deployment time of services by up to 80% by introducing internal tooling",
        ],
      },
    ],
  },
  {
    company: "Google Summer of Code",
    location: "Remote",
    period: "May 2021 — Aug 2021",
    intro:
      "Accepted as a summer intern in GSoC 2021, working on a low-code platform for developing neural networks with TensorFlow at Emory School of Medicine.",
    roles: [
      {
        title: "Summer Intern",
        period: "May 2021 — Aug 2021",
        bullets: [
          "Reduced workflow complexity by introducing a simple and coherent development process",
          "Reduced development time by improving the no-code UI design and implementing a JSON-to-Python transpiler for converting graph-like data structures to boilerplate Python code",
          "Introduced an in-browser code editor to reduce iteration time",
        ],
      },
    ],
  },
];

const SKILLS = [
  "C, Go, Python, TypeScript",
  "Flask, Django, FastAPI",
  "Tailwind, React, Next.js",
  "MongoDB, PostgreSQL",
  "Web3, IPFS",
  "Linux, Network Programming, Async Programming",
  "Git, VS Code, Docker",
];

function ExperienceBlock({ entry }: { entry: Experience }) {
  return (
    <article className={styles.entry}>
      <header className={styles.entryHeader}>
        <h3 className={styles.company}>{entry.company}</h3>
        <p className={styles.meta}>
          <span className={styles.metaLocation}>{entry.location}</span>
          <span className={styles.metaSep} aria-hidden>
            ·
          </span>
          <time className={styles.metaPeriod}>{entry.period}</time>
        </p>
      </header>
      {entry.intro ? <p className={styles.entryIntro}>{entry.intro}</p> : null}
      <div className={styles.roles}>
        {entry.roles.map((role) => (
          <section key={`${entry.company}-${role.title}-${role.period}`} className={styles.role}>
            <div className={styles.roleHeader}>
              <h4 className={styles.roleTitle}>{role.title}</h4>
              <time className={styles.rolePeriod}>{role.period}</time>
            </div>
            <ul className={styles.bullets}>
              {role.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

function ResumeAppContent() {
  return (
    <div className={styles.app}>
      <div className={styles.scroll}>
        <div className={styles.texture} aria-hidden />
        <div className={styles.layout}>
          <section className={styles.section} aria-labelledby="resume-experience-heading">
            <h2
              id="resume-experience-heading"
              className={`${styles.sectionTitle} ${styles.sectionTitleMain}`}
            >
              Experience
            </h2>
            <div className={styles.timeline}>
              {EXPERIENCE.map((entry) => (
                <ExperienceBlock key={entry.company} entry={entry} />
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="resume-skills-heading">
            <h2 id="resume-skills-heading" className={`${styles.sectionTitle} ${styles.sectionTitleMain}`}>
              Skills
            </h2>
            <ul className={styles.skillList}>
              {SKILLS.map((skill) => (
                <li key={skill}>
                  <span className={styles.skill}>{skill}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ResumeApp() {
  return (
    <AppContent theme={wabisabiTheme.content}>
      <ResumeAppContent />
    </AppContent>
  );
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 36 36" width="100%" height="100%" aria-hidden>
      <rect
        x="3"
        y="3"
        width="30"
        height="30"
        fill="#FAF7F0"
        stroke="#6B7B5C"
        strokeWidth="1.25"
      />
      <rect x="8" y="8" width="20" height="20" rx="1" fill="#F5F0E6" stroke="#6B7B5C" strokeWidth="0.75" opacity="0.45" />
      <line x1="11" y1="12" x2="25" y2="12" stroke="#3A3A38" strokeWidth="1" opacity="0.35" />
      <line x1="11" y1="16" x2="23" y2="16" stroke="#3A3A38" strokeWidth="0.75" opacity="0.25" />
      <line x1="11" y1="19.5" x2="21" y2="19.5" stroke="#3A3A38" strokeWidth="0.75" opacity="0.2" />
      <path
        d="M14 23.5 Q18 26.5 22 23"
        fill="none"
        stroke="#B8A078"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const resumeApp: AppDefinition = {
  id: "resume",
  title: "Resume",
  icon: <ResumeIcon />,
  ui: wabisabiTheme,
  width: 820,
  height: 660,
  minWidth: 480,
  minHeight: 400,
  content: <ResumeApp />,
};

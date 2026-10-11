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

const SUMMARY =
  "Founding engineer with experience building developer platforms, SDKs, orchestration systems, and open-source infrastructure at early-stage startups. Shipped systems from idea to POC to production, including an orchestration rewrite that improved performance 11× and deployment tooling that reduced deployment time by 95–99%. Comfortable owning ambiguous problems end to end across backend infrastructure and developer experience.";

const EXPERIENCE: Experience[] = [
  {
    company: "Composio",
    location: "Bengaluru, India",
    period: "May 2024 — September 2025",
    intro:
      "Joined as a founding engineer, led the development of the tooling infrastructure, improved the developer experience internally and externally, and ran multiple growth experiments during the company’s early search for product-market fit.",
    roles: [
      {
        title: "Founding Engineer",
        period: "May 2024 — September 2025",
        bullets: [
          "Rewrote the early tooling infrastructure, delivering more robust infrastructure and an 11× throughput improvement",
          "Designed and developed core tooling infrastructure from the ground up, including a scalable tool-execution runtime, a versioning service, and an OpenAPI-to-tool generation pipeline",
          "Built reusable abstractions and internal developer tooling that accelerated implementation while reducing regressions and operational risk",
          "Built Composio SDK, SWEKIT (scored 48.6%, second place in SWE Bench at the time), and the plugin ecosystem as part of early growth experimentation",
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
        title: "Senior Python Engineer",
        period: "Aug 2023 — May 2024",
        bullets: [
          "Reduced deployment complexity on the user platform by automating environment configurations",
          "Improved the user experience by developing a client for the user platform and reducing deployment time by 95–99%",
          "Designed and developed the POC for a no-code/low-code platform for developing autonomous services",
        ],
      },
      {
        title: "Python Engineer and Engineering Lead (SDK)",
        period: "Sep 2022 — Aug 2023",
        bullets: [
          "Coordinated release cycles across the core open-source frameworks",
          "Built an orchestration framework that streamlined the development, testing, and deployment of services built using the agent frameworks",
          "Introduced custom static-analysis tooling that accelerated development and reduced production issues",
          "Built plugins enabling on-chain interactions across multiple blockchain networks and wallets",
        ],
      },
      {
        title: "Junior Python Developer",
        period: "Sep 2021 — Sep 2022",
        bullets: [
          "Built internal tooling that reduced service deployment time by up to 80%",
          "Designed and built IPFS-based package-management infrastructure and an extensible plugin ecosystem around it",
          "Developed autonomous-service prototypes using the core stack to validate its capabilities and potential use cases",
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
        title: "Intern",
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
  "Python, JavaScript, Go",
  "Flask, Django",
  "ReactJS, NextJS",
  "MongoDB, PostgreSQL",
  "Web3, IPFS",
  "Linux, Network Programming, Asynchronous Programming",
  "Git, VS Code, Docker, Kubernetes",
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
          <section className={styles.section} aria-labelledby="resume-summary-heading">
            <h2 id="resume-summary-heading" className={`${styles.sectionTitle} ${styles.sectionTitleMain}`}>
              Summary
            </h2>
            <p className={styles.summary}>{SUMMARY}</p>
          </section>
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
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path
        d="M11 4h20l8 8v29a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"
        fill="#FAF7F0"
        stroke="#3A3A38"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M31 4v8h8" fill="#DCE1D5" stroke="#3A3A38" strokeWidth="2" strokeLinejoin="round" />
      <rect x="13" y="12" width="12" height="14" rx="2" fill="#6B7B5C" />
      <circle cx="19" cy="16.5" r="2.5" fill="#FAF7F0" />
      <path d="M15 24v-1a4 4 0 0 1 8 0v1Z" fill="#FAF7F0" />
      <path d="M29 19h5M29 24h4" stroke="#6B7B5C" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 31h19M14 36h14" stroke="#3A3A38" strokeWidth="2" strokeLinecap="round" />
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

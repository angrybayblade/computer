import type { Metadata } from "next";
import { Crimson_Text, Geist, Geist_Mono, Open_Sans, Playfair_Display, Roboto_Mono } from "next/font/google";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: "Viraj's Computer",
  authors: [{ name: "Viraj Patel", url: "https://github.com/angrybayblade" }],
  creator: "Viraj Patel",
  publisher: "Viraj Patel",
  keywords: [
    "Viraj Patel",
    "angrybayblade",
    "software engineer",
    "founding engineer",
    "developer platforms",
    "SDKs",
    "orchestration systems",
    "open-source infrastructure",
    "Bengaluru",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: "Viraj's Computer",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@angrybayblade",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: getSiteUrl().toString(),
  mainEntity: {
    "@type": "Person",
    name: "Viraj Patel",
    alternateName: "angrybayblade",
    jobTitle: "Software Engineer",
    description: SITE_DESCRIPTION,
    url: getSiteUrl().toString(),
    sameAs: [
      "https://github.com/angrybayblade",
      "https://www.linkedin.com/in/angrybayblade/",
      "https://x.com/angrybayblade",
      "https://www.instagram.com/angrybayblade/",
    ],
    homeLocation: {
      "@type": "Place",
      name: "Bengaluru, India",
    },
    knowsAbout: [
      "Python",
      "JavaScript",
      "Go",
      "React",
      "Next.js",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
      "Developer tooling",
      "SDK design",
      "Orchestration systems",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} ${openSans.variable} ${playfairDisplay.variable} ${crimsonText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <div id="portal-root" />
      </body>
    </html>
  );
}

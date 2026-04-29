import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safe Norrapat — Full-Stack Developer for Hire",
  description:
    "Full-Stack Developer เชี่ยวชาญ Next.js, TypeScript, Node.js และ React พร้อมรับงาน Freelance ทุกขนาดโปรเจกต์ ติดต่อได้เลยค่ะ",
  keywords: ["Full-Stack Developer", "Next.js", "TypeScript", "React", "Freelance", "Thailand", "Web Development"],
  authors: [{ name: "Safe Norrapat", url: "https://github.com/safe-norrapat" }],
  openGraph: {
    type: "website",
    title: "Safe Norrapat — Full-Stack Developer for Hire",
    description: "Full-Stack Developer พร้อมรับงาน Freelance · Next.js · TypeScript · Node.js",
    siteName: "Safe Norrapat Portfolio",
    locale: "th_TH",
    images: [
      {
        url: "/og-hire.png",
        width: 1200,
        height: 630,
        alt: "Safe Norrapat — Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Safe Norrapat — Full-Stack Developer for Hire",
    description: "Full-Stack Developer พร้อมรับงาน Freelance · Next.js · TypeScript · Node.js",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HireLayout({ children }: { children: React.ReactNode }) {
  return children;
}

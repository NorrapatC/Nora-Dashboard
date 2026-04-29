import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PipelineProvider } from "@/contexts/PipelineContext";
import DashboardShell from "@/components/DashboardShell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nora AI Team Dashboard",
  description: "AI agent team overview",
  metadataBase: new URL("https://nora.safedev.th"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`} style={{ backgroundColor: "#f9f7f4" }}>
        <LanguageProvider>
          <PipelineProvider>
            <DashboardShell>{children}</DashboardShell>
          </PipelineProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

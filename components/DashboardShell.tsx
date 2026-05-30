"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const NO_SIDEBAR = ["/login", "/hire"];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!showSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* WHY md:pl-56 (not pl-56): on mobile the sidebar is an overlay drawer, so
          content must NOT be pushed right. From md+ the sidebar is a fixed rail and
          content clears it with left padding. */}
      <div className="flex-1 md:pl-56 min-w-0">
        {children}
      </div>
    </div>
  );
}

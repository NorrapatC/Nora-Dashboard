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
      <div className="flex-1 pl-56 min-w-0">
        {children}
      </div>
    </div>
  );
}

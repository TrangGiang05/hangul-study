import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { AITutorProvider } from "../ai/AITutorContext";
import { AITutorDrawer } from "../ai/AITutorDrawer";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AITutorProvider>
      <div className="dashboard-shell">
        <Sidebar />
        <main className="dashboard-main">{children}</main>
        <AITutorDrawer />
      </div>
    </AITutorProvider>
  );
}
import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  stickyNav?: boolean;
}

export function Layout({ children, stickyNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar sticky={stickyNav} />
      <main className={stickyNav ? "pt-24" : ""}>{children}</main>
    </div>
  );
}

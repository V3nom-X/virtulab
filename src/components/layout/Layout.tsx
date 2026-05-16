import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BackButton } from "./BackButton";

interface LayoutProps {
  children: ReactNode;
  stickyNav?: boolean;
  showNav?: boolean;
  hideBackButton?: boolean;
}

export function Layout({ children, stickyNav = false, showNav = false, hideBackButton = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {showNav ? (
        <>
          <Navbar sticky={stickyNav} />
          <main className={stickyNav ? "pt-24" : ""}>{children}</main>
        </>
      ) : (
        <>
          {!hideBackButton && <BackButton />}
          <main className={hideBackButton ? "" : "pt-20"}>{children}</main>
        </>
      )}
    </div>
  );
}

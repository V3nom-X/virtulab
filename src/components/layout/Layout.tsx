import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BackButton } from "./BackButton";
import { AppDock } from "./AppDock";

interface LayoutProps {
  children: ReactNode;
  stickyNav?: boolean;
  showNav?: boolean;
  hideBackButton?: boolean;
  hideDock?: boolean;
}

export function Layout({ children, stickyNav = false, showNav = false, hideBackButton = false, hideDock = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {showNav ? (
        <>
          <Navbar sticky={stickyNav} />
          <main className={stickyNav ? "pt-24 pb-28" : "pb-28"}>{children}</main>
        </>
      ) : (
        <>
          {!hideBackButton && <BackButton />}
          <main className={hideBackButton ? "pb-28" : "pt-20 pb-28"}>{children}</main>
        </>
      )}
      {!hideDock && <AppDock />}
    </div>
  );
}

import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BackButton } from "./BackButton";

interface LayoutProps {
  children: ReactNode;
  stickyNav?: boolean;
  showNav?: boolean;
  hideBackButton?: boolean;
  /** @deprecated retained for backwards compatibility; dock has been removed */
  hideDock?: boolean;
}

export function Layout({ children, stickyNav = false, showNav = false, hideBackButton = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {showNav ? (
        <>
          <Navbar sticky={stickyNav} />
          <main className={stickyNav ? "pt-36 pb-8" : "pt-16 pb-8"}>{children}</main>
        </>
      ) : (
        <>
          {!hideBackButton && <BackButton />}
          <main className={hideBackButton ? "pb-8" : "pt-20 pb-8"}>{children}</main>
        </>
      )}
    </div>
  );
}

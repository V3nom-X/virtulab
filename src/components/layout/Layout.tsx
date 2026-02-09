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
    <div className="min-h-screen bg-background">
      {showNav ? (
        <>
          <Navbar sticky={stickyNav} />
          <main className={stickyNav ? "pt-24" : ""}>{children}</main>
        </>
      ) : (
        <>
          {!hideBackButton && <BackButton />}
          <main>{children}</main>
        </>
      )}
    </div>
  );
}

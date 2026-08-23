import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BackButton } from "./BackButton";
import { AppDock } from "./AppDock";

interface LayoutProps {
  children: ReactNode;
  stickyNav?: boolean;
  showNav?: boolean;
  hideBackButton?: boolean;
  /** Hide the magnetic dock on pages that need every pixel of vertical space. */
  hideDock?: boolean;
}

export function Layout({
  children,
  stickyNav = false,
  showNav = false,
  hideBackButton = false,
  hideDock = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {showNav ? (
        <>
          <Navbar sticky={stickyNav} />
          {!hideDock && <AppDock />}
          <main id="main-content" className={stickyNav ? "pt-36 pb-8" : "pt-16 pb-8"}>
            {children}
          </main>
        </>
      ) : (
        <>
          {!hideBackButton && <BackButton />}
          {!hideDock && <AppDock className="pt-16" />}
          <main id="main-content" className="pb-8">
            {children}
          </main>
        </>
      )}
    </div>
  );
}

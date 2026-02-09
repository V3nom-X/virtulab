import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HelpCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardNav } from "@/components/ui/card-nav";
import { NativeHoverCard } from "@/components/ui/native-hover-card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import virtulabLogo from "@/assets/virtulab-logo.png";

const navItems = [
  {
    label: "Explore",
    bgColor: "hsl(162 77% 46%)",
    textColor: "#ffffff",
    links: [
      { label: "Home", href: "/", ariaLabel: "Go to home" },
      { label: "Library", href: "/library", ariaLabel: "Browse experiment library" },
      { label: "Videos", href: "/videos", ariaLabel: "Watch educational videos" },
      { label: "Genius Bar", href: "/genius-bar", ariaLabel: "Browse curriculum notes" },
    ],
  },
  {
    label: "Create",
    bgColor: "hsl(220 15% 20%)",
    textColor: "#ffffff",
    links: [
      { label: "Workspace", href: "/workspace", ariaLabel: "Open workspace" },
      { label: "Builder", href: "/builder", ariaLabel: "Open experiment builder" },
      { label: "Community", href: "/community", ariaLabel: "View community" },
    ],
  },
  {
    label: "Account",
    bgColor: "hsl(210 15% 93%)",
    textColor: "hsl(220 15% 15%)",
    links: [
      { label: "Profile", href: "/profile", ariaLabel: "View profile" },
      { label: "Analytics", href: "/analytics", ariaLabel: "View analytics" },
      { label: "Settings", href: "/settings", ariaLabel: "Open settings" },
    ],
  },
];

export function Navbar({ sticky = false }: { sticky?: boolean }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const Logo = (
    <Link to="/" className="flex items-center gap-2">
      <img src={virtulabLogo} alt="VirtuLab" className="w-9 h-9 rounded-xl object-cover" />
      <span className="text-xl font-bold text-foreground hidden sm:block">
        Virtu<span className="text-primary">Lab</span>
      </span>
    </Link>
  );

  const RightContent = (
    <div className="flex items-center gap-1">
      <ThemeToggle />
      
      <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" asChild>
        <Link to="/help">
          <HelpCircle className="w-5 h-5" />
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex" asChild>
        <Link to="/admin">
          <Shield className="w-5 h-5" />
        </Link>
      </Button>
      
      {user ? (
        <NativeHoverCard
          imageSrc=""
          name={user.email || "User"}
          username={user.email?.split('@')[0]}
          description="Click to view your profile and manage account"
          buttonText="View Profile"
          onButtonClick={() => navigate('/profile')}
          size="md"
          variant="glass"
          buttonContent={
            <div className="flex flex-col gap-2">
              <Button size="sm" className="w-full" onClick={() => navigate('/profile')}>
                View Profile
              </Button>
              <Button size="sm" variant="outline" className="w-full text-destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          }
        />
      ) : null}
    </div>
  );

  return (
    <CardNav
      logo={Logo}
      items={navItems}
      ctaText={user ? undefined : "Sign In"}
      onCtaClick={user ? undefined : () => navigate('/auth')}
      rightContent={RightContent}
      sticky={sticky}
    />
  );
}

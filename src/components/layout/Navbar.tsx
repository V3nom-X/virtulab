import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HelpCircle, Shield, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardNav } from "@/components/ui/card-nav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import virtulabLogo from "@/assets/virtulab-logo.png";

const allPages = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Videos", href: "/videos" },
  { label: "Genius Bar", href: "/genius-bar" },
  { label: "Workspace", href: "/workspace" },
  { label: "Builder", href: "/builder" },
  { label: "Community", href: "/community" },
  { label: "Profile", href: "/profile" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
  { label: "Admin", href: "/admin" },
  { label: "Help", href: "/help" },
];

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
  const { user } = useAuth();

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground" data-tour="nav-menu" aria-label="Open navigation menu">
            <Menu className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-gold">Navigate</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allPages.map((page) => (
            <DropdownMenuItem key={page.href} asChild>
              <Link to={page.href} className="w-full cursor-pointer">
                {page.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
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

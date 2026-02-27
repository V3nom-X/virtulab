import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="bg-background/80 backdrop-blur-sm border border-gold/30 shadow-sm hover:bg-muted hover:border-gold/50 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm border border-gold/30 shadow-sm hover:bg-muted hover:border-gold/50 transition-colors"
            aria-label="Navigate to page"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
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
    </div>
  );
}

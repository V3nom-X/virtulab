import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Library,
  Video,
  FlaskConical,
  Hammer,
  Users,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { MagneticDock, type DockItemData } from "@/components/ui/magnetic-dock";
import { useIsMobile } from "@/hooks/use-mobile";

const ROUTES: Array<{ id: string; label: string; href: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { id: "home", label: "Home", href: "/", Icon: Home },
  { id: "library", label: "Library", href: "/library", Icon: Library },
  { id: "videos", label: "Videos", href: "/videos", Icon: Video },
  { id: "workspace", label: "Workspace", href: "/workspace", Icon: FlaskConical },
  { id: "builder", label: "Builder", href: "/builder", Icon: Hammer },
  { id: "community", label: "Community", href: "/community", Icon: Users },
  { id: "analytics", label: "Analytics", href: "/analytics", Icon: BarChart3 },
  { id: "profile", label: "Profile", href: "/profile", Icon: User },
  { id: "settings", label: "Settings", href: "/settings", Icon: SettingsIcon },
  { id: "help", label: "Help", href: "/help", Icon: HelpCircle },
];

export function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const items: DockItemData[] = ROUTES.map(({ id, label, href, Icon }) => ({
    id,
    label,
    icon: <Icon className="w-full h-full" />,
    onClick: () => navigate(href),
    isActive: location.pathname === href || (href !== "/" && location.pathname.startsWith(href)),
  }));

  return (
    <MagneticDock
      items={items}
      iconSize={isMobile ? 36 : 48}
      maxScale={isMobile ? 1.25 : 1.5}
      magneticDistance={isMobile ? 80 : 150}
      showLabels={!isMobile}
      position="bottom"
      variant="glass"
      className="bottom-3"
    />
  );
}

import { Link } from "react-router-dom";
import { Beaker, Instagram, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Beaker className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Virtu<span className="text-primary">Lab</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Making science education accessible, interactive, and fun for everyone.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/b._.noir"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2.5">
              <li><Link to="/library" className="text-sm text-muted-foreground hover:text-primary transition-colors">Experiment Library</Link></li>
              <li><Link to="/workspace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Workspace</Link></li>
              <li><Link to="/builder" className="text-sm text-muted-foreground hover:text-primary transition-colors">Custom Builder</Link></li>
              <li><Link to="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community Hub</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Video Tutorials</Link></li>
              <li><Link to="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link to="/settings" className="text-sm text-muted-foreground hover:text-primary transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">About VirtuLab</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VirtuLab. Completely free, no ads.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Developed with <Heart className="w-4 h-4 text-destructive" /> by Benjamin Menya • Managed by NEX VENTURES
          </p>
        </div>
      </div>
    </footer>
  );
}

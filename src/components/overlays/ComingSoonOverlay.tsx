import { Construction, Clock } from 'lucide-react';

interface ComingSoonOverlayProps {
  title?: string;
  features?: string[];
}

export function ComingSoonOverlay({ title = "Coming Soon", features = [] }: ComingSoonOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 bg-background flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">
          We're working hard to bring this feature to life. Stay tuned!
        </p>
        {features.length > 0 && (
          <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Upcoming features:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

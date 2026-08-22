import { Link } from "react-router-dom";
import { Sparkles, CalendarClock, ArrowRight } from "lucide-react";

export function WeeklyDropStrip() {
  return (
    <section className="py-6 md:py-8">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-sm">
          <div
            aria-hidden
            data-parallax-decor
            className="pointer-events-none absolute -top-16 -right-10 w-48 h-48 rounded-full bg-gold/20 blur-3xl"
          />
          <div
            aria-hidden
            data-parallax-decor
            className="pointer-events-none absolute -bottom-20 -left-12 w-52 h-52 rounded-full bg-purple/20 blur-3xl"
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 md:p-6 min-w-0">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold/15 text-gold shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold mb-1">
                <Sparkles className="w-3 h-3" /> Fresh every week
              </span>
              <h2 className="text-base md:text-lg font-semibold break-words">
                2–3 new experiments added every week
              </h2>
              <p className="text-sm text-muted-foreground break-words">
                New simulations, quizzes and modules land continuously — always free, always ad-free.
              </p>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
            >
              Browse library <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

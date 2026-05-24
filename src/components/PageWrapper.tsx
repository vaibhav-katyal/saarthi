import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
}

export function PageWrapper({ children, title, subtitle, icon, badge }: PageWrapperProps) {
  const titleWords = title.split(' ');
  const lastWord = titleWords.pop();
  const restOfTitle = titleWords.join(' ');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-black min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
      {/* Subtle Grid Background */}
      <div className="sticky top-0 left-0 w-full h-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">
        <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {(badge || icon) && (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white/60 mb-1">
              {icon || <Sparkles className="h-3 w-3" />}
              {badge || "Feature"}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
            {restOfTitle ? <>{restOfTitle} </> : null}
            <span className="text-white">{lastWord}</span>
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div className="animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}

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
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#070B14] min-h-screen text-white font-sans relative pb-10">
      {/* Background Noise & Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[50%] rounded-full bg-accent/10 blur-[180px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">
        <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {(badge || icon) && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(0,245,255,0.15)] mb-1">
              {icon || <Sparkles className="h-3 w-3" />}
              {badge || "Feature"}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground font-heading">
            {restOfTitle ? <>{restOfTitle} </> : null}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">{lastWord}</span>
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

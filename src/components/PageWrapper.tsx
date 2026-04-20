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
    <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#02040A] min-h-screen text-white font-sans relative pb-10 selection:bg-white/20">
      {/* Cinematic Background Layer */}
      <div className="sticky top-0 left-0 w-full h-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-screen" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F5FF]/20 blur-[180px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#7B61FF]/20 blur-[180px] mix-blend-screen" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-pink-500/15 blur-[150px] mix-blend-screen" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 relative z-10 space-y-6">
        <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {(badge || icon) && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_rgba(0,245,255,0.15)] mb-1">
              {icon || <Sparkles className="h-3 w-3" />}
              {badge || "Feature"}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-heading">
            {restOfTitle ? <>{restOfTitle} </> : null}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">{lastWord}</span>
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

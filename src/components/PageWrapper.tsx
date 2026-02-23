import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="page-bg min-h-screen p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

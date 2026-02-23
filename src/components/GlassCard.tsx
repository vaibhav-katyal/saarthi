import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", hover = false, onClick }: GlassCardProps) {
  return (
    <div
      className={`glass-panel p-5 ${hover ? "cursor-pointer glass-panel-hover" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

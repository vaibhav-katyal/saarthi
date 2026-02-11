import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "strong";
}

const GlassCard = ({ className, children, variant = "default", ...props }: GlassCardProps) => {
  const variantClass = {
    default: "glass",
    subtle: "glass-subtle",
    strong: "glass-strong",
  }[variant];

  return (
    <div className={cn(variantClass, "rounded-2xl p-6", className)} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;

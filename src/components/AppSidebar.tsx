import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Map,
  Code2,
  Users,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { title: "Knowledge Vault", path: "/vault", icon: BookOpen },
  { title: "AI Roadmap", path: "/roadmap", icon: Map },
  { title: "Testpad", path: "/testpad", icon: Code2 },
  { title: "Community", path: "/community", icon: Users },
  { title: "Leave Manager", path: "/leave", icon: Calculator },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      style={{ width: collapsed ? 64 : 240 }}
      className="relative flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-200"
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Saarthi
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path} className="block">
              <div
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 mb-0.5 ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

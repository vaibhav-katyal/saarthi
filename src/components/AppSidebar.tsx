import { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookOpen,
  Map,
  Code2,
  Users,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  Brain,
  LayoutDashboard,
  LogOut,
  Swords,
  MessageCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ApiSettingsModal } from "./ApiSettingsModal";
import { toast } from "sonner";

const navItems = [
  { title: "Knowledge Vault", path: "/vault", icon: BookOpen },
  { title: "AI Roadmap", path: "/roadmap", icon: Map },
  { title: "MCQ Generator", path: "/mcq", icon: Brain },
  { title: "Testpad", path: "/testpad", icon: Code2 },
  { title: "Code Duel", path: "/duel", icon: Swords },
  { title: "AI Chat", path: "/chat", icon: MessageCircle },
  { title: "Leave Manager", path: "/leave", icon: Calculator },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState("");

  const handleOpenSettings = () => {
    const saved = localStorage.getItem("groq_api_key") || "";
    setGroqApiKey(saved);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("groq_api_key", groqApiKey);
    toast.success("Groq API key saved successfully!");
  };

  const initials = user?.name ? getInitials(user.name) : "?";

  return (
    <motion.aside
      initial={{ width: collapsed ? 64 : 240 }}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
      className="relative flex h-screen flex-col border-r border-border bg-sidebar z-50 overflow-hidden"
      aria-label="Main Navigation Sidebar"
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex h-14 items-center gap-2.5 px-4 border-b border-border cursor-pointer transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        aria-label="Go to Homepage"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap"
            >
              Saarthi
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Nav items */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-thin" aria-label="Sidebar Navigation">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/dashboard" && location.pathname === "/");

            const linkContent = (
              <div
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 mb-0.5 ${isActive
                  ? "bg-secondary text-foreground shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:translate-x-1"
                  }`}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <AnimatePresence mode="popLayout">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(4px)", x: -10 }}
                      animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                      exit={{ opacity: 0, filter: "blur(4px)", x: -10, transition: { duration: 0.1 } }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="truncate whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );

            if (!collapsed) {
              return (
                <NavLink key={item.path} to={item.path} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-current={isActive ? "page" : undefined}>
                  {linkContent}
                </NavLink>
              );
            }

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink to={item.path} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={item.title} aria-current={isActive ? "page" : undefined}>
                    {linkContent}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={10}
                  className="font-medium"
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* User info + Collapse toggle */}
      <div className="border-t border-border">
        {/* User Profile Section */}
        {user && (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                  {collapsed ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center p-1.5 hover:bg-secondary rounded-lg transition-colors">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00F5FF]/30 to-[#7B61FF]/30 border border-white/10 text-[11px] font-bold text-foreground">
                                {initials}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={10}
                          className="font-medium"
                        >
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-secondary/60 transition-colors"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00F5FF]/30 to-[#7B61FF]/30 border border-white/10 text-xs font-bold text-foreground">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={12}
                className="w-52 bg-background/95 backdrop-blur-md border border-border/80 shadow-2xl p-1.5 rounded-xl z-[100]"
              >
                <div className="px-2.5 py-2 border-b border-border/50 mb-1.5">
                  <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-secondary cursor-pointer focus:bg-secondary outline-none transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#00F5FF]" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenSettings}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-secondary cursor-pointer focus:bg-secondary outline-none transition-colors"
                >
                  <Settings className="h-4 w-4 text-[#7B61FF]" />
                  <span>Setting</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50 my-1.5" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 cursor-pointer focus:bg-destructive/10 outline-none transition-colors"
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="p-2 pt-0 w-full flex justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <motion.div
              initial={false}
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          </button>
        </div>
      </div>
      <ApiSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        apiKey={groqApiKey}
        onApiKeyChange={setGroqApiKey}
        onSave={handleSaveSettings}
      />
    </motion.aside>
  );
}

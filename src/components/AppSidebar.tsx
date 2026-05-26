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
  { title: "Saarthi AI", path: "/chat", icon: MessageCircle },
  { title: "Knowledge Vault", path: "/vault", icon: BookOpen },
  { title: "AI Roadmap", path: "/roadmap", icon: Map },
  { title: "MCQ Generator", path: "/mcq", icon: Brain },
  { title: "Testpad Pro", path: "/testpad", icon: Code2 },
  { title: "Code Duel", path: "/duel", icon: Swords },
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
      className="relative flex h-screen flex-col border-r border-white/[0.08] bg-black z-50 overflow-hidden"
      aria-label="Main Navigation Sidebar"
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex h-14 items-center gap-2.5 px-4 border-b border-white/[0.08] cursor-pointer transition-colors duration-150 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-inset"
        aria-label="Go to Homepage"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.1]">
          <GraduationCap className="h-4 w-4 text-white" />
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
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 mb-1.5 ${isActive
                  ? "bg-white/[0.08] text-white border border-white/[0.1]"
                  : "text-white/40 hover:bg-white/[0.05] hover:text-white hover:translate-x-0.5"
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
                <NavLink key={item.path} to={item.path} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" aria-current={isActive ? "page" : undefined}>
                  {linkContent}
                </NavLink>
              );
            }

            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink to={item.path} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" aria-label={item.title} aria-current={isActive ? "page" : undefined}>
                    {linkContent}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={10}
                  className="font-medium bg-black border-white/10 text-white"
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      {/* User info + Collapse toggle */}
      <div className="border-t border-white/[0.08]">
        {/* User Profile Section */}
        {user && (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl bg-white/[0.02]">
                  {collapsed ? (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-center p-2 hover:bg-white/[0.06] rounded-xl transition-colors">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-white/[0.1]" />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-[11px] font-bold text-white">
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
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-white/[0.1] shrink-0" />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-xs font-bold text-white">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-white/30 truncate">
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
                className="w-52 bg-black border border-white/[0.1] shadow-xl p-1.5 rounded-xl z-[100]"
              >
                <div className="px-2.5 py-2 border-b border-white/[0.08] mb-1.5">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white hover:bg-white/[0.08] cursor-pointer focus:bg-white/[0.08] outline-none transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-white/60" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleOpenSettings}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white hover:bg-white/[0.08] cursor-pointer focus:bg-white/[0.08] outline-none transition-colors"
                >
                  <Settings className="h-4 w-4 text-white/60" />
                  <span>Setting</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.08] my-1.5" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.08] cursor-pointer focus:bg-white/[0.08] outline-none transition-colors"
                >
                  <LogOut className="h-4 w-4 text-white/50" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="p-3 pt-0 w-full flex justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
            className="flex w-full items-center justify-center rounded-xl p-3 text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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

'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronDown,
  Layers,
  BarChart2,
  Activity,
  Factory,
  Package,
  TrendingUp,
  Users,
  Truck,
  Shield,
} from "lucide-react";
import { loadDashboards, SavedDashboard } from "@/lib/dashboardStorage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SignedIn } from "@/components/AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: "/main-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/production",
    label: "Production",
    icon: Factory,
  },
  {
    href: "/material",
    label: "Material",
    icon: Package,
  },
  {
    href: "/sales",
    label: "Sales",
    icon: TrendingUp,
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: Activity,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/vendors",
    label: "Vendors",
    icon: Truck,
  },
  {
    href: "/users-and-roles",
    label: "Users & Roles",
    icon: Shield,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardsOpen, setDashboardsOpen] = useState(false);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const refresh = () => { loadDashboards().then(setSavedDashboards); };
    refresh();
    window.addEventListener('dashboards-updated', refresh);
    return () => window.removeEventListener('dashboards-updated', refresh);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      <SignedIn>
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 h-screen bg-background border-r shadow-sm",
            isExpanded ? "w-56" : "w-20",
            isMobile && !isExpanded && "-translate-x-full",
            className
          )}
        >
          <div className="flex h-full flex-col">
            {/* Brand/Logo Section */}
            <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
              <div className="flex h-14 items-center px-4">
                {/* Heimdyn Logo and Text */}
                {isExpanded ? (
                  <>
                    <Link href="/" className="flex items-center gap-2 flex-1" onClick={closeSidebar}>
                      <Image src="/logo.PNG" alt="Heimdyn" width={24} height={24} className="dark:invert" />
                      <span className="font-semibold tracking-tight">Heimdyn</span>
                    </Link>
                    
                    {/* Toggle Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="h-8 w-8 shrink-0"
                      title="Collapse sidebar"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    {/* Toggle Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="h-8 w-8 rounded-lg"
                      title="Expand sidebar"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                const navLink = (
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground",
                      !isExpanded && "justify-center px-2"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {isExpanded && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="ml-auto h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs"
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );

                if (!isExpanded) {
                  return (
                    <Tooltip key={item.href} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          {navLink}
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs p-0"
                            >
                              {item.badge > 9 ? "9+" : item.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{navLink}</div>;
              })}

            </nav>

            {/* Footer */}
            <div className="border-t p-2">
              <div className={cn(
                "flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground",
                !isExpanded && "justify-center"
              )}>
                {isExpanded ? (
                  <span>Heimdyn v1.0</span>
                ) : (
                  <span>v1.0</span>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobile && isExpanded && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Mobile Toggle */}
        {isMobile && !isExpanded && (
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            onClick={() => setIsExpanded(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Spacer for main content */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out hidden md:block shrink-0",
            isExpanded ? "w-56" : "w-20"
          )}
        />
      </SignedIn>
    </>
  );
}

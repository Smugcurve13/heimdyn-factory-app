'use client'

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn } from "@/components/AuthProvider";
import { UserButton } from "@/components/UserButton";
import { useRole, ROLES } from "@/lib/erp/roles";
import { UserCog } from "lucide-react";

function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCog className="h-4 w-4" />
          <span className="hidden sm:inline">{role}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ROLES.map((r) => (
          <DropdownMenuItem key={r} onClick={() => setRole(r)} className={r === role ? "text-primary" : undefined}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={
        isActive
          ? "rounded-full border border-primary px-2 py-0.5 text-primary"
          : "rounded-full border px-2 py-0.5"
      }
    >
      {children}
    </Link>
  );
}

function DateDisplay() {
  const [date, setDate] = useState('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const d = new Date();
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    setDate(`${day}/${month}/${d.getFullYear()}`);
  }, []);
  
  if (!mounted) {
    return <span className="hidden sm:inline w-20"></span>; // Placeholder to prevent layout shift
  }
  
  return (
    <span className="hidden sm:inline">
      {date}
    </span>
  );
}

function ThemeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TopNav({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left side - Company placeholder */}
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">Heimdyn</span>
        </div>
        
        {/* Right side - user controls */}
        <div className="flex items-center gap-4 text-sm">
          <DateDisplay />
          <div className="flex items-center gap-2">
            <SignedIn>
              <RoleSwitcher />
            </SignedIn>
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

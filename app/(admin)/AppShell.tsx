"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getMe, logoutUser } from "./req-res";
import type { MeResponse } from "./interfaces";
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShoppingCart, 
  Flag, 
  AlertTriangle, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  User as UserIcon,
  LayoutDashboard
} from "lucide-react";

type NavItem = { 
  label: string; 
  href: string; 
  icon: React.ElementType;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Skip auth check for login page
    if (pathname.includes("/login")) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await getMe();
        if (mounted) setSession(me);
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    const saved = window.localStorage.getItem("jobme.admin.sidebar.collapsed");
    if (saved === "1") setIsSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("jobme.admin.sidebar.collapsed", isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);

  const role = session?.logged ? session.user.role : null;
  
  const userItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    ];

    if (role === "super_admin") {
      items.push(
        { label: "Add Admin", href: "/add-admins", icon: UserPlus },
        { label: "Control Admins", href: "/control-admins", icon: Shield }
      );
    }

    items.push(
      { label: "Control Users", href: "/control-users", icon: Users },
      { label: "Control Orders", href: "/control-orders", icon: ShoppingCart },
      { label: "Reports", href: "/reports", icon: Flag },
      { label: "Fraud Cases", href: "/fraud-cases", icon: AlertTriangle },
      { label: "Chat", href: "/admin-chats", icon: MessageSquare }
    );

    return items;
  }, [role]);

  const onLogout = async () => {
    await logoutUser();
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminProfile");
    setOpenMenu(false);
    router.push("/super-admin/login");
  };

  if (isLoading) return (
    <main className="min-h-screen grid place-items-center bg-[#0D0D1A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-violet-400 font-medium animate-pulse">Initializing Admin Panel...</p>
      </div>
    </main>
  );

  // If not logged in and not on login page, show children (which might be the login page)
  // Or handle redirect here if needed.
  if (!session?.logged && pathname.includes("/login")) {
    return <>{children}</>;
  }

  // If not logged in and trying to access admin pages, show nothing or children (login)
  if (!session?.logged) {
    return <>{children}</>;
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#000000] text-[#F5F5F7] flex">
      {/* Sidebar */}
      <aside
        className={`relative h-screen shrink-0 border-r border-white/5 bg-[#1D1D1F] transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-[#2D2D2F] flex items-center justify-center border border-white/10 shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">JobMe</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-bold">Administrator</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {userItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group ${
                    active 
                      ? "bg-[#2D2D2F] text-white" 
                      : "text-[#86868B] hover:text-[#F5F5F7] hover:bg-[#2D2D2F]/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#0071E3]" : ""}`} />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((v) => !v)}
                className={`flex w-full items-center rounded-xl p-2 transition-all hover:bg-white/5 ${
                  isSidebarCollapsed ? "justify-center" : "gap-3"
                }`}
              >
                <div className="relative">
                  <img
                    src={session.user.pfp || "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"}
                    alt="Profile"
                    className="h-10 w-10 rounded-xl object-cover grayscale opacity-80"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#1D1D1F]" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 text-left flex-1">
                    <p className="truncate text-sm font-medium text-white">{session.user.name || "Admin"}</p>
                    <p className="truncate text-[10px] text-[#86868B] font-bold uppercase tracking-wider">{role?.replace('_', ' ')}</p>
                  </div>
                )}
              </button>

              {/* Popup Menu */}
              {openMenu && (
                <div className="absolute bottom-16 left-0 w-full rounded-2xl border border-white/5 bg-[#1D1D1F] p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <Link
                    href="/profile-details"
                    className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-[#F5F5F7] hover:bg-[#2D2D2F] transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <button className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-[#F5F5F7] hover:bg-[#2D2D2F] transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="mt-4 flex items-center justify-center h-8 w-full rounded-lg bg-white/5 hover:bg-white/10 text-[#86868B] transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
        {/* Header */}
        <header className="h-12 shrink-0 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-8">
          <h1 className="text-sm font-semibold tracking-tight text-[#86868B] uppercase">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h1>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
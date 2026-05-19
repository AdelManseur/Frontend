"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getMe, getDashboardStats, getAnalytics } from "../req-res";
import type { MeResponse } from "../interfaces";
import { 
  Shield, 
  ArrowRight, 
  TrendingUp, 
  Users as UsersIcon, 
  ShoppingCart, 
  AlertCircle, 
  FileText, 
  Activity 
} from "lucide-react";

interface DashboardStats {
  users: { total: number; new24h: number };
  orders: { total: number; new24h: number };
  fraud: { total: number; active: number; new24h: number };
  reports: { total: number; pending: number; new24h: number };
}

export default function SuperAdminHomePage() {
  const [session, setSession] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [me, statsData] = await Promise.all([
          getMe(),
          getDashboardStats()
        ]);
        
        if (mounted) {
          setSession(me);
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (isLoading) return null;

  if (session?.logged && stats) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/5">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              System <span className="text-[#86868B]">Overview</span>
            </h1>
            <p className="text-[#86868B] font-medium">
              Real-time platform metrics and administrative controls.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-[#1D1D1F] rounded-full border border-white/5 shadow-sm">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">System Operational</span>
          </div>
        </section>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Users" 
            value={stats.users.total.toLocaleString()} 
            trend={stats.users.new24h} 
            icon={UsersIcon}
            description="Account registrations"
          />
          <StatCard 
            label="Total Orders" 
            value={stats.orders.total.toLocaleString()} 
            trend={stats.orders.new24h} 
            icon={ShoppingCart}
            description="Processed transactions"
          />
          <StatCard 
            label="Active Fraud" 
            value={stats.fraud.active.toLocaleString()} 
            trend={stats.fraud.new24h} 
            icon={AlertCircle}
            description="Unresolved cases"
            isAlert={stats.fraud.active > 0}
          />
          <StatCard 
            label="Pending Reports" 
            value={stats.reports.pending.toLocaleString()} 
            trend={stats.reports.new24h} 
            icon={FileText}
            description="Awaiting review"
            isAlert={stats.reports.pending > 0}
          />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          <ActionCard 
            title="User Management"
            description="Control user access, verify identities, and manage permissions across the platform."
            link="/control-users"
            buttonText="Manage Directory"
          />
          <ActionCard 
            title="Security & Reports"
            description="Investigate fraud cases and review user-generated reports to maintain platform integrity."
            link="/reports"
            buttonText="Review Safety"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1D1D1F] flex items-center justify-center mb-8 border border-white/5">
        <Shield className="w-8 h-8 text-[#86868B]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
      <p className="text-[#86868B] mb-10 max-w-xs text-sm">Authentication is required to access the administrative interface.</p>
      <Link
        href="/super-admin/login"
        className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-[#F5F5F7] transition-all text-sm"
      >
        Sign In
      </Link>
    </div>
  );
}

function StatCard({ label, value, trend, icon: Icon, description, isAlert = false }: any) {
  return (
    <div className="admin-card p-6 flex flex-col gap-4 bg-[#1D1D1F]/50 group">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-white/5 shadow-sm group-hover:border-white/10 transition-colors">
          <Icon className={`w-5 h-5 ${isAlert ? "text-rose-500" : "text-[#86868B]"}`} />
        </div>
        {trend > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            +{trend} today
          </div>
        )}
      </div>
      <div>
        <p className="text-[#86868B] text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] text-[#86868B] font-medium">{description}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, description, link, buttonText }: any) {
  return (
    <Link 
      href={link}
      className="admin-card p-8 flex flex-col justify-between group transition-all active:scale-[0.99] hover:bg-[#1D1D1F] border-transparent hover:border-white/10"
    >
      <div className="max-w-md">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className="text-[#86868B] text-base leading-relaxed">{description}</p>
      </div>
      <div className="mt-10 flex items-center gap-2 text-sm font-bold text-blue-500">
        {buttonText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
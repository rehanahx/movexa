"use client";

import React, { useState } from "react";
import {
  Settings,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Server,
  Film,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const handleSeedDatabase = async (force: boolean) => {
    setIsSeeding(true);
    setSeedResult(null);
    setSeedError(null);

    try {
      const res = await fetch(`/api/seed${force ? "?force=true" : ""}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to seed demo data");
      }

      setSeedResult(data);
    } catch (err: unknown) {
      setSeedError(err instanceof Error ? err.message : "Error seeding database");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
          System Settings & Showcase Utilities
        </h1>
        <p className="text-xs text-[#64748b] mt-1">
          Platform configurations, mock credentials reference, and database showcase seeder for project defense.
        </p>
      </div>

      {/* Admin Mock Reference Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <ShieldCheck size={18} className="text-amber-600" />
          <span>College Evaluation Mock Credentials</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          The administrator authentication is set up exactly as specified for project submission:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Email</span>
            <span className="font-mono font-bold text-slate-900 text-sm">admin@gamil.com</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">(also supports admin@gmail.com)</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Password</span>
            <span className="font-mono font-bold text-slate-900 text-sm">admin123</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Auto-upserted & active</span>
          </div>
        </div>
      </div>

      {/* Database Seeder Section (Crucial for Demo) */}
      <div className="bg-white border border-[#e8ecf2] rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-base">
              <Database size={18} className="text-[#ff5500]" />
              <span>Project Demo Data Seeder</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              Populate or refresh the database with blockbuster films (Dune 2, Oppenheimer, Silent Frequency), theater auditoriums (IMAX Laser & Dolby VIP), live upcoming showtimes across 3 days, and realistic customer ticket bookings.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5500] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
        </div>

        {seedResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 size={16} />
              <span>{seedResult.message}</span>
            </div>
            {seedResult.stats && (
              <p className="text-[11px] font-mono text-emerald-700">
                Seeded: {seedResult.stats.moviesCount} movies • {seedResult.stats.showsCreated} shows • {seedResult.stats.cinemas} cinemas
              </p>
            )}
          </div>
        )}

        {seedError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{seedError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleSeedDatabase(false)}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>Seed / Sync Showcase Data</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Reset and re-seed all shows, movies, and bookings from clean showcase state?")) {
                handleSeedDatabase(true);
              }
            }}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Clean Reset & Re-Seed
          </button>
        </div>
      </div>

      {/* System Status Table */}
      <div className="bg-white border border-[#e8ecf2] rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Server size={16} className="text-slate-400" />
          <span>Environment & Infrastructure Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Database</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MongoDB Atlas Active
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Session Auth</span>
            <span className="font-semibold text-slate-900 font-mono">
              HTTP-Only JWT Cookie
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Booking Engine</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Real-Time Seat Locking
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Framework</span>
            <span className="font-semibold text-slate-900 font-mono">
              Next.js 16 + React 19
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  Film,
  Ticket,
  Users,
  Calendar,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  todaysBookingsCount: number;
  activeMovies: number;
  totalCustomers: number;
  totalShows: number;
}

interface RecentBooking {
  _id: string;
  bookingReference: string;
  customerName?: string;
  customerEmail?: string;
  movieTitle?: string;
  cinemaName?: string;
  showTime?: string;
  totalAmount: number;
  bookingStatus: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  seats: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load dashboard metrics");
      }

      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Admin Overview & Analytics
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Real-time box office analytics, admission ticket reservations, and active screenings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
            title="Refresh stats"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Movie</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Box Office
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0f172a] font-mono">
              ₹{stats ? stats.totalRevenue.toLocaleString() : "..."}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <span>Gross ticket admissions</span>
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Reservations
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ff5500] flex items-center justify-center">
              <Ticket size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0f172a] font-mono">
              {stats ? stats.totalBookings : "..."}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              <span>Today: <strong>{stats ? stats.todaysBookingsCount : "0"}</strong> tickets</span>
            </p>
          </div>
        </div>

        {/* Active Movies */}
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Movies
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Film size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0f172a] font-mono">
              {stats ? stats.activeMovies : "..."}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              <span>{stats ? stats.totalShows : "0"} scheduled showtimes</span>
            </p>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Audience Members
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0f172a] font-mono">
              {stats ? stats.totalCustomers : "..."}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Registered customer accounts
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/movies"
          className="p-5 rounded-xl bg-white border border-neutral-200 hover:border-[#ff5500] shadow-2xs hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#ff5500]">
              Manage Movie Titles
            </h4>
            <p className="text-xs text-neutral-500">Edit, add, or delete movie catalog items</p>
          </div>
          <ArrowUpRight size={18} className="text-neutral-400 group-hover:text-[#ff5500]" />
        </Link>

        <Link
          href="/admin/showtimes"
          className="p-5 rounded-xl bg-white border border-neutral-200 hover:border-[#ff5500] shadow-2xs hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#ff5500]">
              Auditorium Showtimes
            </h4>
            <p className="text-xs text-neutral-500">Configure show slots and seat pricing</p>
          </div>
          <ArrowUpRight size={18} className="text-neutral-400 group-hover:text-[#ff5500]" />
        </Link>

        <Link
          href="/admin/bookings"
          className="p-5 rounded-xl bg-white border border-neutral-200 hover:border-[#ff5500] shadow-2xs hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#ff5500]">
              Customer Bookings
            </h4>
            <p className="text-xs text-neutral-500">Verify references, admission & seats</p>
          </div>
          <ArrowUpRight size={18} className="text-neutral-400 group-hover:text-[#ff5500]" />
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Recent Ticket Reservations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live transactions processed through the booking engine</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#ff5500] hover:underline"
          >
            View all bookings
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 size={24} className="animate-spin text-[#ff5500] mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading latest orders...</p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{b.customerName || "Customer"}</p>
                      <p className="text-[11px] text-slate-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {b.movieTitle || "Movie"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {b.seats?.map((s) => `${s.row}${s.number}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      ₹{b.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          b.bookingStatus === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {b.bookingStatus === "confirmed" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <XCircle size={11} />
                        )}
                        <span>{b.bookingStatus}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

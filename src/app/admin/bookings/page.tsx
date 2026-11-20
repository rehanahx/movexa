"use client";

import React, { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react";

interface BookingItem {
  _id: string;
  bookingReference: string;
  customerName?: string;
  customerEmail?: string;
  movieTitle?: string;
  cinemaName?: string;
  showTime?: string;
  showDate?: string;
  totalAmount: number;
  bookingStatus: "confirmed" | "pending" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  seats: {
    row: string;
    number: number;
    price: number;
  }[];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load bookings");
      }

      setBookings(data.bookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (id: string, newStatus: "confirmed" | "cancelled") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, bookingStatus: newStatus } : b))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Customer Ticket Reservations
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Track admission barcodes, seat reservations, revenue settlement, and gate access.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e8ecf2] rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reference, customer, or movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
          {["all", "confirmed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold text-[11px] capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Bookings Table */}
      {isLoading ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs">
          <Loader2 size={28} className="animate-spin text-[#ff5500] mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Loading reservation ledger...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs space-y-3">
          <Ticket size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No reservations match your criteria. When audience members book tickets, they appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie & Cinema</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{b.customerName || "Customer"}</p>
                      <p className="text-[11px] text-slate-400">{b.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{b.movieTitle || "Movie"}</p>
                      <p className="text-[11px] text-slate-400">
                        {b.cinemaName} • {b.showTime}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {b.seats?.map((s) => `${s.row}${s.number}`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
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
                    <td className="py-3 px-4 text-right">
                      {b.bookingStatus === "confirmed" ? (
                        <button
                          onClick={() => handleUpdateStatus(b._id, "cancelled")}
                          disabled={updatingId === b._id}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(b._id, "confirmed")}
                          disabled={updatingId === b._id}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

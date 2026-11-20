"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Printer,
  ChevronLeft,
  Loader2,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Film,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BookingItem {
  _id: string;
  bookingReference: string;
  movieTitle: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  seats: {
    row: string;
    number: number;
    price: number;
    type?: string;
  }[];
  totalAmount: number;
  bookingStatus: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export default function MyBookingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings");
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
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login?redirect=/bookings");
      } else {
        fetchBookings();
      }
    }
  }, [user, isAuthLoading, router]);

  const handleCancelBooking = async (id: string, ref: string) => {
    if (!confirm(`Are you sure you want to cancel booking ${ref}? Your seats will be released.`)) {
      return;
    }

    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: "cancelled" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      // Update state locally
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, bookingStatus: "cancelled" } : b))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error cancelling reservation");
    } finally {
      setCancellingId(null);
    }
  };

  if (isAuthLoading || (isLoading && bookings.length === 0)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-[#ff5500] mb-3" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Loading your reservations...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#ff5500] font-semibold uppercase tracking-wider mb-1">
                <Ticket size={14} />
                <span>Customer Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-sans">
                My Movie Reservations
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                View your confirmed e-tickets, digital barcodes, and booking history.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs w-fit"
            >
              <Film size={14} />
              <span>Browse More Movies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#ff5500] flex items-center justify-center mx-auto">
              <Ticket size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">No Reservations Yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                You haven&apos;t booked any tickets yet. Pick a blockbuster movie and reserve your favorite seats now!
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              <span>Explore Movies & Book</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isCancelled = booking.bookingStatus === "cancelled";

              return (
                <div
                  key={booking._id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12 ${
                    isCancelled ? "border-neutral-200 opacity-60" : "border-neutral-300"
                  }`}
                >
                  {/* Left Side: Ticket Main Details */}
                  <div className="md:col-span-8 p-6 sm:p-7 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#ff5500] uppercase">
                          PASS #{booking.bookingReference}
                        </span>
                        <h3 className="text-xl font-black text-neutral-900 tracking-tight mt-0.5">
                          {booking.movieTitle}
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                          isCancelled
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isCancelled ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                        <span>{booking.bookingStatus}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Cinema</span>
                        <span className="font-semibold text-neutral-800">{booking.cinemaName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Date & Time</span>
                        <span className="font-semibold text-neutral-800">
                          {booking.showDate ? new Date(booking.showDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"} • {booking.showTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Amount Paid</span>
                        <span className="font-bold text-neutral-900 font-mono text-sm">₹{booking.totalAmount}</span>
                      </div>
                    </div>

                    {/* Seats Pills */}
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold mb-1.5">
                        Allocated Seats ({booking.seats?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats?.map((seat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-800 font-mono text-xs font-bold"
                          >
                            Row {seat.row} - Seat {seat.number}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-neutral-100">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Print Pass</span>
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(booking._id, booking.bookingReference)}
                          disabled={cancellingId === booking._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === booking._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          <span>Cancel Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Side: QR Code Stub */}
                  <div className="md:col-span-4 bg-neutral-950 text-white p-6 sm:p-7 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-neutral-800 relative">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl mb-3 flex items-center justify-center shadow-lg">
                      <QrCode size={92} className="text-neutral-950" />
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      SCAN FOR GATE ENTRY
                    </span>
                    <span className="text-xs font-mono font-bold text-white mt-1">
                      {booking.bookingReference}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

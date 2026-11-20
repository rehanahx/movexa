"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Film,
  Calendar,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Ticket,
  CreditCard,
  QrCode,
  ShieldCheck,
  Sparkles,
  X,
  Printer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Seat {
  row: string;
  number: number;
  type: "regular" | "premium";
  price: number;
  status: "available" | "booked";
}

interface ShowDetail {
  _id: string;
  movie: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: { url: string };
    duration: number;
    genre: string[];
    language: string;
  };
  cinema: {
    _id: string;
    name: string;
    location: string;
    address: string;
  };
  screen: {
    _id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  seats: Seat[];
}

export default function BookShowPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [show, setShow] = useState<ShowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected seats state
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Checkout modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "counter">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch show details
  useEffect(() => {
    async function fetchShow() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/shows/${showId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load showtime details");
        }

        setShow(data.show);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error fetching showtime");
      } finally {
        setIsLoading(false);
      }
    }

    fetchShow();
  }, [showId]);

  // Handle seat click
  const toggleSeat = (seat: Seat) => {
    if (seat.status === "booked") return;

    const isAlreadySelected = selectedSeats.some(
      (s) => s.row === seat.row && s.number === seat.number
    );

    if (isAlreadySelected) {
      setSelectedSeats(
        selectedSeats.filter(
          (s) => !(s.row === seat.row && s.number === seat.number)
        )
      );
    } else {
      if (selectedSeats.length >= 8) {
        alert("You can select up to 8 seats per booking transaction.");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Group seats by rows
  const rowsMap = (show?.seats || []).reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  // Sort rows alphabetically
  const sortedRowKeys = Object.keys(rowsMap).sort();

  // Price calculation
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const bookingFee = selectedSeats.length > 0 ? 30 : 0;
  const grandTotal = subtotal + bookingFee;

  // Handle Booking submission
  const handleProceedToPayment = () => {
    if (!user) {
      // Prompt user to sign in
      router.push(`/login?redirect=/book/${showId}`);
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmBooking = async () => {
    setIsProcessingPayment(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId,
          seats: selectedSeats.map((s) => ({
            row: s.row,
            number: s.number,
            type: s.type,
            price: s.price,
          })),
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to confirm ticket reservation");
      }

      setConfirmedBooking(data.booking);
      // Mark locally booked seats
      if (show) {
        const bookedKeys = new Set(
          selectedSeats.map((s) => `${s.row}-${s.number}`)
        );
        const updatedSeats = show.seats.map((s) => {
          if (bookedKeys.has(`${s.row}-${s.number}`)) {
            return { ...s, status: "booked" as const };
          }
          return s;
        });
        setShow({ ...show, seats: updatedSeats });
      }
      setSelectedSeats([]);
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Payment error occurred");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-[#ff5500] mb-3" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Loading auditorium layout...
        </p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Showtime Unavailable</h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-6">{error || "This show is no longer active."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Return to Movies</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#161b22]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{show.movie?.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff5500]/20 text-[#ff7733] border border-[#ff5500]/30">
                  {show.screen?.name || "Auditorium"}
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>{show.cinema?.name}</span>
                <span>•</span>
                <span>{new Date(show.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span>•</span>
                <span className="text-white font-semibold">{show.startTime}</span>
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <span className="text-neutral-400">Step 2 of 2: Reserve Seats</span>
          </div>
        </div>
      </header>

      {/* Main Seat Map Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Seat Chart */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Cinema Curved Glowing Screen */}
          <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
            <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-transparent via-[#ff5500] to-transparent shadow-[0_0_25px_rgba(255,85,0,0.8)] mb-2" />
            <div className="w-5/6 h-6 border-t-2 border-white/20 rounded-[50%] opacity-50" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 font-mono font-semibold mt-1">
              ALL EYES THIS WAY • CINEMA SCREEN
            </span>
          </div>

          {/* Seat Grid Chart */}
          <div className="w-full overflow-x-auto pb-4 no-scrollbar flex flex-col items-center">
            <div className="min-w-[480px] space-y-3.5">
              {sortedRowKeys.map((rowKey) => {
                const rowSeats = rowsMap[rowKey].sort((a, b) => a.number - b.number);
                const isPremiumRow = rowKey === "F" || rowKey === "G";

                return (
                  <div key={rowKey} className="flex items-center justify-center gap-2 sm:gap-3">
                    {/* Row Letter Left */}
                    <span className="w-6 text-center text-xs font-mono font-bold text-neutral-400 select-none">
                      {rowKey}
                    </span>

                    {/* Seat Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {rowSeats.map((seat) => {
                        const isBooked = seat.status === "booked";
                        const isSelected = selectedSeats.some(
                          (s) => s.row === seat.row && s.number === seat.number
                        );

                        return (
                          <button
                            key={`${seat.row}-${seat.number}`}
                            disabled={isBooked}
                            onClick={() => toggleSeat(seat)}
                            title={`Row ${seat.row} Seat ${seat.number} (${seat.type} - ₹${seat.price})`}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md text-[10px] sm:text-[11px] font-mono font-semibold transition-all flex items-center justify-center select-none cursor-pointer ${
                              isBooked
                                ? "bg-neutral-800/80 text-neutral-600 border border-neutral-700/50 cursor-not-allowed opacity-40 line-through"
                                : isSelected
                                ? "bg-[#ff5500] text-white border-2 border-[#ff7733] shadow-[0_0_12px_rgba(255,85,0,0.7)] scale-110 z-10"
                                : isPremiumRow
                                ? "bg-amber-950/40 text-amber-200 border border-amber-600/40 hover:border-amber-400 hover:bg-amber-900/50"
                                : "bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-neutral-400 hover:bg-neutral-800"
                            }`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row Letter Right */}
                    <span className="w-6 text-center text-xs font-mono font-bold text-neutral-400 select-none">
                      {rowKey}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seat Status Legend */}
          <div className="mt-10 p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-neutral-900 border border-neutral-700" />
              <span>Available (₹250)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-amber-950/60 border border-amber-500/50" />
              <span>Premium VIP (₹450)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-[#ff5500] border border-[#ff7733] shadow-[0_0_6px_rgba(255,85,0,0.8)]" />
              <span className="text-[#ff7733] font-semibold">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-md bg-neutral-800 text-neutral-500 border border-neutral-700/50 line-through flex items-center justify-center text-[9px]">
                X
              </span>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 w-full sticky top-20">
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-start gap-3.5 border-b border-white/10 pb-5">
              <div className="relative w-16 h-22 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <Image
                  src={show.movie?.thumbnail?.url || "/images/hero-banner.jpg"}
                  alt={show.movie?.title || "Movie"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white leading-tight">
                  {show.movie?.title}
                </h3>
                <p className="text-xs text-neutral-400">
                  {show.movie?.language} • {show.movie?.duration} mins
                </p>
                <p className="text-xs text-[#ff7733] font-medium font-sans">
                  {show.screen?.name}
                </p>
              </div>
            </div>

            {/* Screening Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 text-neutral-300">
                <span className="text-neutral-500">Theater</span>
                <span className="font-medium text-white text-right">{show.cinema?.name}</span>
              </div>
              <div className="flex justify-between py-1 text-neutral-300">
                <span className="text-neutral-500">Date</span>
                <span className="font-medium text-white">
                  {new Date(show.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between py-1 text-neutral-300">
                <span className="text-neutral-500">Time</span>
                <span className="font-medium text-white">{show.startTime}</span>
              </div>
            </div>

            {/* Selected Seats Badges */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Seats Chosen ({selectedSeats.length})
                </span>
                {selectedSeats.length > 0 && (
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="text-[11px] text-[#ff7733] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  No seats selected yet. Click on the seat chart to reserve.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {selectedSeats.map((s) => (
                    <span
                      key={`${s.row}-${s.number}`}
                      className="px-2.5 py-1 rounded-md bg-[#ff5500]/20 text-[#ff7733] border border-[#ff5500]/40 text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <span>{s.row}{s.number}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">₹{s.price}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Total Price Breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Tickets Subtotal</span>
                <span className="text-white font-mono font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Convenience & Tech Fee</span>
                <span className="text-white font-mono font-medium">₹{bookingFee}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white border-t border-white/10 pt-3">
                <span>Grand Total</span>
                <span className="text-[#ff5500] font-mono text-lg">₹{grandTotal}</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0}
              className="w-full py-3.5 px-4 bg-[#ff5500] hover:bg-[#e64d00] disabled:opacity-40 disabled:hover:bg-[#ff5500] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Ticket size={16} />
              <span>{user ? `Book ${selectedSeats.length} Seat(s) • ₹${grandTotal}` : "Sign In to Complete Booking"}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Checkout Payment Modal */}
      {isCheckoutOpen && !confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#161b22] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ff5500]/20 text-[#ff5500] flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment & Confirmation</h3>
                  <p className="text-xs text-neutral-400">Finalize your ticket reservation</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {checkoutError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#ff5500] bg-[#ff5500]/10 text-white font-semibold"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <CreditCard size={20} className="mx-auto mb-1 text-[#ff7733]" />
                  <span className="text-xs block">Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-[#ff5500] bg-[#ff5500]/10 text-white font-semibold"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <QrCode size={20} className="mx-auto mb-1 text-emerald-400" />
                  <span className="text-xs block">UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("counter")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "counter"
                      ? "border-[#ff5500] bg-[#ff5500]/10 text-white font-semibold"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <Ticket size={20} className="mx-auto mb-1 text-blue-400" />
                  <span className="text-xs block">At Counter</span>
                </button>
              </div>
            </div>

            {/* Mock Payment Details */}
            {paymentMethod === "card" && (
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Card Number (Demo prefilled)</label>
                  <input
                    type="text"
                    readOnly
                    value="4532 •••• •••• 8892"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Expiry</label>
                    <input
                      type="text"
                      readOnly
                      value="12/28"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">CVV</label>
                    <input
                      type="text"
                      readOnly
                      value="842"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
                <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <QrCode size={90} className="text-neutral-900" />
                </div>
                <p className="text-xs text-neutral-300">Scan QR Code using any UPI App</p>
                <p className="text-[11px] font-mono text-emerald-400">movexa@instantpay</p>
              </div>
            )}

            {/* Total Due */}
            <div className="flex items-center justify-between p-3.5 bg-neutral-900 rounded-xl border border-white/10">
              <span className="text-xs text-neutral-400">Total Payable Amount</span>
              <span className="text-lg font-bold font-mono text-[#ff5500]">₹{grandTotal}</span>
            </div>

            {/* Confirm Submit */}
            <button
              onClick={handleConfirmBooking}
              disabled={isProcessingPayment}
              className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Pay ₹{grandTotal} & Book Seats</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Confirmed Booking E-Ticket Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#161b22] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                TICKETS CONFIRMED
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Booking Reference: {confirmedBooking.bookingReference}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                A digital pass has been issued and stored in your profile.
              </p>
            </div>

            {/* Digital Ticket Card Preview */}
            <div className="bg-white text-neutral-900 rounded-2xl p-5 text-left space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider text-[#ff5500] uppercase font-mono">
                    MOVEXA DIGITAL ADMISSION
                  </span>
                  <h4 className="text-base font-black tracking-tight">{confirmedBooking.movieTitle}</h4>
                </div>
                <div className="w-12 h-12 bg-neutral-100 p-1 rounded-lg border border-neutral-300 flex items-center justify-center">
                  <QrCode size={36} className="text-neutral-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Cinema</span>
                  <strong className="text-neutral-900 text-xs">{confirmedBooking.cinemaName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Showtime</span>
                  <strong className="text-neutral-900 text-xs">{confirmedBooking.showTime}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-neutral-500 block uppercase">Seats</span>
                  <strong className="text-neutral-900 font-mono text-sm">
                    {confirmedBooking.seats?.map((s: any) => `${s.row}${s.number}`).join(", ")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/bookings"
                className="w-full py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center shadow-md"
              >
                Go to My Bookings
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-semibold rounded-xl transition-colors text-center"
              >
                Book Another Movie
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

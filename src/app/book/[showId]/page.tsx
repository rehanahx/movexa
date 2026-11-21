"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  X,
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

// ── Seat shape SVG component ──────────────────────────────────────────────────
function SeatIcon({
  isBooked,
  isSelected,
  isPremium,
  size = 32,
}: {
  isBooked: boolean;
  isSelected: boolean;
  isPremium: boolean;
  size?: number;
}) {
  const fill = isBooked
    ? "#2a2a2a"
    : isSelected
    ? "#ff5500"
    : isPremium
    ? "#2d1f00"
    : "#1e2430";

  const stroke = isBooked
    ? "#3a3a3a"
    : isSelected
    ? "#ff7733"
    : isPremium
    ? "#b45309"
    : "#334155";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Seat back / headrest */}
      <rect x="4" y="2" width="24" height="5" rx="3" fill={stroke} opacity="0.7" />
      {/* Main seat body */}
      <rect x="3" y="7" width="26" height="16" rx="4" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Armrests */}
      <rect x="1" y="9" width="4" height="10" rx="2" fill={stroke} opacity="0.5" />
      <rect x="27" y="9" width="4" height="10" rx="2" fill={stroke} opacity="0.5" />
      {/* Seat cushion crease */}
      {!isBooked && (
        <rect x="8" y="13" width="16" height="2" rx="1" fill={isSelected ? "#ff7733" : isPremium ? "#b45309" : "#2a3444"} opacity="0.6" />
      )}
      {/* X mark for booked */}
      {isBooked && (
        <>
          <line x1="10" y1="10" x2="22" y2="20" stroke="#555" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="10" x2="10" y2="20" stroke="#555" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {/* Glow dot for selected */}
      {isSelected && (
        <circle cx="16" cy="15" r="4" fill="#ff7733" opacity="0.6" />
      )}
      {/* Legs */}
      <rect x="8" y="23" width="4" height="6" rx="1.5" fill={stroke} opacity="0.4" />
      <rect x="20" y="23" width="4" height="6" rx="1.5" fill={stroke} opacity="0.4" />
    </svg>
  );
}

export default function BookShowPage({
  params,
}: {
  params?: Promise<{ showId: string }>;
}) {
  const router = useRouter();
  const routeParams = useParams();

  let showId = "";
  if (routeParams && typeof routeParams.showId === "string") {
    showId = routeParams.showId;
  } else if (params) {
    try {
      const resolved = use(params);
      if (resolved && resolved.showId) {
        showId = resolved.showId;
      }
    } catch {
      // safe fallback
    }
  }

  const { user } = useAuth();

  const [show, setShow] = useState<ShowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "counter">("card");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch show
  useEffect(() => {
    if (!showId) return;
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

  const toggleSeat = useCallback((seat: Seat) => {
    if (seat.status === "booked") return;
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some(
        (s) => s.row === seat.row && s.number === seat.number
      );
      if (isAlreadySelected) {
        return prev.filter((s) => !(s.row === seat.row && s.number === seat.number));
      }
      if (prev.length >= 8) {
        alert("Max 8 seats per booking.");
        return prev;
      }
      return [...prev, seat];
    });
  }, []);

  // Group by rows
  const rowsMap = (show?.seats || []).reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedRowKeys = Object.keys(rowsMap).sort();

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const bookingFee = selectedSeats.length > 0 ? 30 : 0;
  const grandTotal = subtotal + bookingFee;

  const handleProceedToPayment = () => {
    if (!user) {
      router.push(`/login?redirect=/book/${showId}`);
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
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
        throw new Error(data.message || "Failed to confirm reservation");
      }
      setConfirmedBooking(data.booking);
      if (show) {
        const bookedKeys = new Set(selectedSeats.map((s) => `${s.row}-${s.number}`));
        const updatedSeats = show.seats.map((s) =>
          bookedKeys.has(`${s.row}-${s.number}`) ? { ...s, status: "booked" as const } : s
        );
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0d1117]">
        <Loader2 size={36} className="animate-spin text-[#ff5500] mb-3" />
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono">
          Loading auditorium layout...
        </p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#0d1117]">
        <div className="w-12 h-12 rounded-xl bg-rose-950 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Showtime Unavailable</h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-6">
          {error || "This show is no longer active."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-800 text-white text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Return to Movies</span>
        </Link>
      </div>
    );
  }

  const premiumRowKeys = sortedRowKeys.slice(-2);
  const regularRowKeys = sortedRowKeys.slice(0, -2);
  const totalSeats = show.seats.length;
  const bookedCount = show.seats.filter((s) => s.status === "booked").length;
  const availableCount = totalSeats - bookedCount;
  const occupancyPct = Math.round((bookedCount / totalSeats) * 100);

  return (
    <div className="min-h-screen bg-[#0a0d13] text-white flex flex-col">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer border border-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                <span>{show.movie?.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff5500]/20 text-[#ff7733] border border-[#ff5500]/30">
                  {show.screen?.name || "Auditorium"}
                </span>
              </h1>
              <p className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {show.cinema?.name}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(show.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-white font-semibold">
                  <Clock size={10} />
                  {show.startTime}
                </span>
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500">
            <span className="font-mono">
              <span className="text-emerald-400 font-bold">{availableCount}</span> seats available
            </span>
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#ff5500] rounded-full transition-all"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <span className="font-mono text-[#ff7733]">{occupancyPct}% full</span>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left: Auditorium Map ── */}
        <div className="lg:col-span-8 flex flex-col items-center select-none">

          {/* Distance indicator */}
          <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 mb-5">
            ← Optimal viewing distance from screen →
          </p>

          {/* SCREEN */}
          <div className="w-full max-w-[640px] mb-10 flex flex-col items-center">
            <div className="w-full h-3 rounded-full bg-gradient-to-r from-transparent via-[#ff5500] to-transparent shadow-[0_0_30px_8px_rgba(255,85,0,0.5)]" />
            <div className="w-[85%] h-8 border-t-2 border-white/10 rounded-[50%]"
              style={{ boxShadow: "0 -6px 20px rgba(255,85,0,0.1)" }}
            />
            <span className="mt-1 text-[9px] tracking-[0.4em] uppercase text-neutral-600 font-mono font-bold">
              SCREEN — FRONT OF AUDITORIUM
            </span>
          </div>

          {/* Tooltip (hover) */}
          {hoveredSeat && hoveredSeat.status !== "booked" && (
            <div
              className="fixed z-50 pointer-events-none bg-[#1a2033] border border-white/20 rounded-xl px-3 py-2 text-xs shadow-2xl"
              style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 48 }}
            >
              <span className="font-mono font-bold text-white">
                Row {hoveredSeat.row} · Seat {hoveredSeat.number}
              </span>
              <span className="ml-2 text-[#ff7733] font-semibold">
                {hoveredSeat.type === "premium" ? "Premium VIP" : "Regular"}
              </span>
              <span className="ml-2 text-emerald-400 font-mono font-bold">₹{hoveredSeat.price}</span>
            </div>
          )}

          {/* ── REGULAR SECTION ── */}
          <div className="w-full max-w-[640px] space-y-2 mb-6">
            {regularRowKeys.map((rowKey, rowIdx) => {
              const rowSeats = rowsMap[rowKey].sort((a, b) => a.number - b.number);
              // Slight indent to simulate perspective curve (front rows wider view)
              const indent = Math.max(0, (regularRowKeys.length - 1 - rowIdx) * 2);
              return (
                <div
                  key={rowKey}
                  className="flex items-center justify-center gap-1.5"
                  style={{ paddingLeft: indent, paddingRight: indent }}
                >
                  {/* Row label left */}
                  <span className="w-5 text-center text-[10px] font-mono font-bold text-neutral-600 select-none shrink-0">
                    {rowKey}
                  </span>

                  <div className="flex items-center gap-1">
                    {rowSeats.map((seat, seatIdx) => {
                      const isBooked = seat.status === "booked";
                      const isSelected = selectedSeats.some(
                        (s) => s.row === seat.row && s.number === seat.number
                      );
                      // Aisle gap after seat 5
                      const showAisle = seatIdx === 4;
                      return (
                        <React.Fragment key={`${seat.row}-${seat.number}`}>
                          {showAisle && <div className="w-4 shrink-0" />}
                          <button
                            disabled={isBooked}
                            onClick={() => toggleSeat(seat)}
                            onMouseEnter={(e) => {
                              setHoveredSeat(seat);
                              setTooltipPos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseLeave={() => setHoveredSeat(null)}
                            onMouseMove={(e) =>
                              setTooltipPos({ x: e.clientX, y: e.clientY })
                            }
                            className={`relative transition-all duration-150 cursor-pointer disabled:cursor-not-allowed outline-none group
                              ${isSelected ? "scale-110 drop-shadow-[0_0_8px_rgba(255,85,0,0.9)]" : ""}
                              ${isBooked ? "opacity-30" : "hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(255,85,0,0.5)]"}
                            `}
                            title={`${seat.row}${seat.number} · ${seat.type} · ₹${seat.price}`}
                          >
                            <SeatIcon
                              isBooked={isBooked}
                              isSelected={isSelected}
                              isPremium={false}
                              size={28}
                            />
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row label right */}
                  <span className="w-5 text-center text-[10px] font-mono font-bold text-neutral-600 select-none shrink-0">
                    {rowKey}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── PREMIUM DIVIDER ── */}
          <div className="w-full max-w-[640px] flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-700/40">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500">
                Premium VIP Recliners · ₹450
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" />
          </div>

          {/* ── PREMIUM SECTION ── */}
          <div className="w-full max-w-[640px] space-y-2">
            {premiumRowKeys.map((rowKey) => {
              const rowSeats = rowsMap[rowKey].sort((a, b) => a.number - b.number);
              return (
                <div key={rowKey} className="flex items-center justify-center gap-1.5">
                  <span className="w-5 text-center text-[10px] font-mono font-bold text-amber-700 select-none shrink-0">
                    {rowKey}
                  </span>

                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/20 border border-amber-900/30">
                    {rowSeats.map((seat, seatIdx) => {
                      const isBooked = seat.status === "booked";
                      const isSelected = selectedSeats.some(
                        (s) => s.row === seat.row && s.number === seat.number
                      );
                      const showAisle = seatIdx === 4;
                      return (
                        <React.Fragment key={`${seat.row}-${seat.number}`}>
                          {showAisle && <div className="w-5 shrink-0" />}
                          <button
                            disabled={isBooked}
                            onClick={() => toggleSeat(seat)}
                            onMouseEnter={(e) => {
                              setHoveredSeat(seat);
                              setTooltipPos({ x: e.clientX, y: e.clientY });
                            }}
                            onMouseLeave={() => setHoveredSeat(null)}
                            onMouseMove={(e) =>
                              setTooltipPos({ x: e.clientX, y: e.clientY })
                            }
                            className={`relative transition-all duration-150 cursor-pointer disabled:cursor-not-allowed outline-none
                              ${isSelected ? "scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]" : ""}
                              ${isBooked ? "opacity-30" : "hover:scale-110 hover:drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"}
                            `}
                            title={`${seat.row}${seat.number} · Premium VIP · ₹${seat.price}`}
                          >
                            <SeatIcon
                              isBooked={isBooked}
                              isSelected={isSelected}
                              isPremium={true}
                              size={32}
                            />
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <span className="w-5 text-center text-[10px] font-mono font-bold text-amber-700 select-none shrink-0">
                    {rowKey}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── LEGEND ── */}
          <div className="mt-10 w-full max-w-[640px] p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <SeatIcon isBooked={false} isSelected={false} isPremium={false} size={22} />
              <span>Available <span className="text-neutral-600 font-mono">(₹250)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <SeatIcon isBooked={false} isSelected={false} isPremium={true} size={22} />
              <span>Premium VIP <span className="text-neutral-600 font-mono">(₹450)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <SeatIcon isBooked={false} isSelected={true} isPremium={false} size={22} />
              <span className="text-[#ff7733] font-semibold">Your Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <SeatIcon isBooked={true} isSelected={false} isPremium={false} size={22} />
              <span className="text-neutral-600">Reserved</span>
            </div>
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:col-span-4 w-full sticky top-20">
          <div className="bg-[#141922] border border-white/[0.08] rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Movie info */}
            <div className="flex items-start gap-3.5 border-b border-white/[0.07] pb-5">
              <div className="relative w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <Image
                  src={show.movie?.thumbnail?.url || "/images/hero-banner.jpg"}
                  alt={show.movie?.title || "Movie"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white leading-tight truncate">
                  {show.movie?.title}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {show.movie?.language} · {show.movie?.duration} min
                </p>
                <p className="text-[11px] text-[#ff7733] font-medium font-mono">
                  {show.screen?.name}
                </p>
              </div>
            </div>

            {/* Show details */}
            <div className="space-y-2 text-xs">
              {[
                { label: "Theater", value: show.cinema?.name },
                {
                  label: "Date",
                  value: new Date(show.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }),
                },
                { label: "Time", value: show.startTime },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-0.5">
                  <span className="text-neutral-600">{row.label}</span>
                  <span className="font-medium text-neutral-200 text-right max-w-[55%] truncate">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Selected seats */}
            <div className="border-t border-white/[0.07] pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Selected Seats ({selectedSeats.length})
                </span>
                {selectedSeats.length > 0 && (
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="text-[11px] text-[#ff7733] hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-white/10 rounded-xl">
                  <Film size={18} className="mx-auto text-neutral-700 mb-1" />
                  <p className="text-[11px] text-neutral-600">
                    Click seats on the map to reserve
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map((s) => (
                    <span
                      key={`${s.row}-${s.number}`}
                      className="px-2.5 py-1 rounded-lg bg-[#ff5500]/15 text-[#ff7733] border border-[#ff5500]/30 text-xs font-mono font-bold flex items-center gap-1.5"
                    >
                      <span>
                        {s.row}
                        {s.number}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        ₹{s.price}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-white/[0.07] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Tickets Subtotal</span>
                <span className="font-mono text-neutral-300">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Convenience Fee</span>
                <span className="font-mono text-neutral-300">₹{bookingFee}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white border-t border-white/[0.07] pt-3">
                <span>Total</span>
                <span className="text-[#ff5500] font-mono text-lg">₹{grandTotal}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0}
              className="w-full py-3.5 px-4 bg-[#ff5500] hover:bg-[#e64d00] disabled:opacity-35 disabled:hover:bg-[#ff5500] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <Ticket size={16} />
              <span>
                {user
                  ? selectedSeats.length > 0
                    ? `Pay ₹${grandTotal} · ${selectedSeats.length} Seat${selectedSeats.length > 1 ? "s" : ""}`
                    : "Select Seats to Continue"
                  : "Sign In to Book"}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* ── Checkout Modal ── */}
      {isCheckoutOpen && !confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#141922] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ff5500]/20 text-[#ff5500] flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment & Confirmation</h3>
                  <p className="text-xs text-neutral-500">Finalize your ticket reservation</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/8 text-neutral-400 flex items-center justify-center hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {checkoutError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(["card", "upi", "counter"] as const).map((m) => {
                  const icons = {
                    card: <CreditCard size={20} className="text-[#ff7733]" />,
                    upi: <QrCode size={20} className="text-emerald-400" />,
                    counter: <Ticket size={20} className="text-blue-400" />,
                  };
                  const labels = { card: "Card", upi: "UPI / QR", counter: "At Counter" };
                  return (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === m
                          ? "border-[#ff5500] bg-[#ff5500]/10 text-white"
                          : "border-white/10 bg-white/5 text-neutral-500 hover:border-white/20"
                      }`}
                    >
                      <div className="mx-auto mb-1 w-5 h-5 flex items-center justify-center">
                        {icons[m]}
                      </div>
                      <span className="text-xs font-semibold block">{labels[m]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card mock fields */}
            {paymentMethod === "card" && (
              <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs">
                <div>
                  <label className="block text-neutral-500 mb-1">Card Number</label>
                  <input
                    readOnly
                    value="4532 •••• •••• 8892"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-500 mb-1">Expiry</label>
                    <input
                      readOnly
                      value="12/28"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">CVV</label>
                    <input
                      readOnly
                      value="•••"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI mock */}
            {paymentMethod === "upi" && (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-center space-y-2">
                <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <QrCode size={88} className="text-neutral-900" />
                </div>
                <p className="text-xs text-neutral-400">Scan with any UPI App</p>
                <p className="text-[11px] font-mono text-emerald-400">movexa@instantpay</p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/[0.07]">
              <span className="text-xs text-neutral-500">Total Payable</span>
              <span className="text-lg font-bold font-mono text-[#ff5500]">₹{grandTotal}</span>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isProcessingPayment}
              className="w-full py-3.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Pay ₹{grandTotal} & Confirm Seats</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmed E-Ticket ── */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#141922] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                TICKETS CONFIRMED
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {confirmedBooking.bookingReference}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Your digital pass has been stored in your profile.
              </p>
            </div>

            {/* E-ticket preview */}
            <div className="bg-white text-neutral-900 rounded-2xl p-5 text-left space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[9px] font-extrabold tracking-wider text-[#ff5500] uppercase font-mono block">
                    MOVEXA DIGITAL PASS
                  </span>
                  <h4 className="text-sm font-black tracking-tight">
                    {confirmedBooking.movieTitle}
                  </h4>
                </div>
                <div className="w-12 h-12 bg-neutral-100 p-1 rounded-lg border border-neutral-300 flex items-center justify-center">
                  <QrCode size={36} className="text-neutral-900" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Cinema</span>
                  <strong className="text-xs">{confirmedBooking.cinemaName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Time</span>
                  <strong className="text-xs">{confirmedBooking.showTime}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-neutral-500 block uppercase">Seats</span>
                  <strong className="font-mono text-sm">
                    {confirmedBooking.seats
                      ?.map((s: any) => `${s.row}${s.number}`)
                      .join(", ")}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href="/bookings"
                className="w-full py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 bg-white/8 hover:bg-white/15 text-neutral-400 text-xs font-semibold rounded-xl transition-colors text-center"
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


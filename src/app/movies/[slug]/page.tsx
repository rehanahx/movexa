"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  Star,
  MapPin,
  ChevronLeft,
  Play,
  Film,
  Ticket,
  Loader2,
  AlertCircle,
  Share2,
  X,
} from "lucide-react";

interface ShowItem {
  _id: string;
  movie: string;
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
  seats: any[];
}

interface MovieDetails {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: {
    url: string;
    publicId: string;
  };
  trailerUrl?: string;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  director?: string;
  cast: string[];
  rating?: number;
  status: "now_showing" | "coming_soon" | "ended";
}

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Generate next 5 dates
  const availableDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateObj: d,
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      fullDateStr: d.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    async function fetchMovieDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/movies/${slug}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load movie");
        }

        setMovie(data.movie);
        setShows(data.shows || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading movie details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovieDetails();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-[#ff5500] mb-3" />
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest font-mono">
          Loading movie showcase...
        </p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Movie Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm mb-6">{error || "The movie requested does not exist or has been removed."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Filter shows by selected date
  const selectedDateStr = availableDates[selectedDateIndex].fullDateStr;
  const filteredShows = shows.filter((s) => {
    const showDateStr = new Date(s.date).toISOString().split("T")[0];
    return showDateStr === selectedDateStr;
  });

  // Group shows by Cinema
  const groupedShowsByCinema = filteredShows.reduce((acc, show) => {
    const cinemaId = show.cinema?._id || "unknown";
    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinema: show.cinema,
        shows: [],
      };
    }
    acc[cinemaId].shows.push(show);
    return acc;
  }, {} as Record<string, { cinema: any; shows: ShowItem[] }>);

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>All Movies</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200 uppercase">
              {movie.status === "now_showing" ? "Now Showing" : "Coming Soon"}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <div className="relative bg-[#090d14] text-white overflow-hidden">
        {/* Ambient Backdrop Blurred */}
        <div className="absolute inset-0 opacity-25">
          <Image
            src={movie.thumbnail?.url || "/images/hero-banner.jpg"}
            alt={movie.title}
            fill
            className="object-cover filter blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d14] via-[#090d14]/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Poster Card */}
            <div className="md:col-span-4 lg:col-span-3 flex justify-center">
              <div className="relative w-56 sm:w-64 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <Image
                  src={movie.thumbnail?.url || "/images/hero-banner.jpg"}
                  alt={movie.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {movie.trailerUrl && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center hover:bg-[#ff5500] hover:border-[#ff5500] hover:scale-110 transition-all cursor-pointer shadow-lg"
                  >
                    <Play size={22} className="ml-1 fill-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Movie Meta Information */}
            <div className="md:col-span-8 lg:col-span-9 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {movie.genre?.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] font-medium tracking-wide px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-neutral-200"
                  >
                    {g}
                  </span>
                ))}
                <span className="text-[11px] font-medium tracking-wide px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{movie.rating ? movie.rating.toFixed(1) : "8.5"}/10</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-[#ff5500]" />
                  <span>{movie.duration} minutes</span>
                </span>
                <span>•</span>
                <span>Language: <strong className="text-white">{movie.language}</strong></span>
                <span>•</span>
                <span>Released: {new Date(movie.releaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-3xl pt-2">
                {movie.longDescription || movie.shortDescription}
              </p>

              {/* Director & Cast Chips */}
              <div className="pt-2 space-y-2 text-xs">
                {movie.director && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">Director:</span>
                    <span className="text-white font-medium">{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">Cast:</span>
                    {movie.cast.map((actor) => (
                      <span key={actor} className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-200">
                        {actor}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href="#book-tickets"
                  className="px-6 py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Ticket size={16} />
                  <span>Select Showtime & Seats</span>
                </a>
                {movie.trailerUrl && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div id="book-tickets" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 font-sans flex items-center gap-2">
            <span>Select Date & Showtime</span>
            <span className="text-xs font-mono font-normal text-neutral-400 px-2 py-0.5 rounded-md bg-neutral-100">
              Live Availability
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Choose your preferred date, theater auditorium, and time slot to book your reserved seats.
          </p>
        </div>

        {/* Date Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {availableDates.map((d, index) => {
            const isSelected = selectedDateIndex === index;
            return (
              <button
                key={d.fullDateStr}
                onClick={() => setSelectedDateIndex(index)}
                className={`flex flex-col items-center justify-center min-w-[84px] py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#111827] text-white border-[#111827] shadow-md scale-105"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? "text-orange-400" : "text-neutral-400"}`}>
                  {d.dayName}
                </span>
                <span className="text-xl font-extrabold my-0.5 font-sans">
                  {d.dateNum}
                </span>
                <span className="text-[10px] font-medium opacity-80 uppercase font-mono">
                  {d.month}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cinema & Shows List */}
        <div className="space-y-6">
          {Object.keys(groupedShowsByCinema).length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                <Calendar size={22} />
              </div>
              <h3 className="text-base font-bold text-neutral-900">No Showtimes on {availableDates[selectedDateIndex].dayName}</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Showtimes for this day have not been scheduled yet or tickets are sold out. Please select another date.
              </p>
            </div>
          ) : (
            Object.values(groupedShowsByCinema).map(({ cinema, shows: cinemaShows }) => (
              <div
                key={cinema?._id}
                className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-sm transition-shadow space-y-5"
              >
                {/* Cinema Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <Film size={18} className="text-[#ff5500]" />
                      <span>{cinema?.name || "Movexa Cinema"}</span>
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                      <MapPin size={13} className="text-neutral-400 shrink-0" />
                      <span>{cinema?.address || cinema?.location}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>M-Ticket & E-Pass Supported</span>
                  </div>
                </div>

                {/* Showtimes Pill Grid */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                    Available Time Slots
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {cinemaShows.map((show) => {
                      const availableCount = show.seats?.filter((s) => s.status === "available").length ?? 60;
                      return (
                        <Link
                          key={show._id}
                          href={`/book/${show._id}`}
                          className="group relative flex flex-col p-3.5 rounded-xl border border-neutral-200 hover:border-[#ff5500] bg-white hover:bg-[#fff9f5] transition-all min-w-[130px] shadow-2xs hover:shadow-md cursor-pointer"
                        >
                          <span className="text-base font-extrabold text-neutral-900 group-hover:text-[#ff5500] font-sans">
                            {show.startTime}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-medium mt-0.5">
                            {show.screen?.name || "Screen 1"}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 font-semibold mt-1">
                            {availableCount} seats left
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-sm font-bold text-white">{movie.title} — Official Trailer</span>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {movie.trailerUrl?.includes("youtube.com") || movie.trailerUrl?.includes("youtu.be") ? (
                <iframe
                  src={movie.trailerUrl.replace("watch?v=", "embed/")}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                  <Play size={48} className="mb-2 text-neutral-600" />
                  <p className="text-sm">Trailer player unavailable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

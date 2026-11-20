"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ticket,
  Play,
  Star,
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  Search,
  Sparkles,
  Film,
  ShieldCheck,
  CheckCircle2,
  Tv,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: {
    url: string;
    publicId: string;
  };
  trailerUrl?: string;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  rating?: number;
  status: "now_showing" | "coming_soon" | "ended";
}

const DEFAULT_HERO_SLIDES = [
  {
    title: "Dune: Part Two",
    slug: "dune-part-two",
    tag: "NOW SHOWING IN IMAX 70MM",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    image: "/images/dune-hero.jpg",
    rating: "8.8",
    duration: "2h 46m",
    genre: "Action • Adventure • Sci-Fi",
  },
  {
    title: "Oppenheimer",
    slug: "oppenheimer",
    tag: "SPECIAL 4K LASER SCREENING",
    synopsis: "The historical story of J. Robert Oppenheimer and his role in the Manhattan Project.",
    image: "/images/cinema-auth.jpg",
    rating: "8.9",
    duration: "3h 00m",
    genre: "Drama • Biography • History",
  },
  {
    title: "Silent Frequency",
    slug: "silent-frequency",
    tag: "PREMIERE SELECTION",
    synopsis: "An audio forensics investigator in a rain-soaked metropolis uncovers a secret broadcast hidden within city ambient frequencies.",
    image: "/images/poster-noir.jpg",
    rating: "9.1",
    duration: "2h 16m",
    genre: "Neo-Noir • Thriller",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Auto rotate hero slide
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % DEFAULT_HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch movies from API
  useEffect(() => {
    async function loadMovies() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/movies");
        const data = await res.json();
        if (data.success && data.movies && data.movies.length > 0) {
          setMovies(data.movies);
        } else {
          // If empty, try auto-triggering seed
          const seedRes = await fetch("/api/seed");
          const seedData = await seedRes.json();
          if (seedData.success) {
            const secondRes = await fetch("/api/movies");
            const secondData = await secondRes.json();
            if (secondData.success) {
              setMovies(secondData.movies || []);
            }
          }
        }
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, []);

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    const matchesStatus =
      statusFilter === "all" ? true : movie.status === statusFilter;
    const matchesQuery =
      searchQuery.trim() === "" ||
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const heroSlide = DEFAULT_HERO_SLIDES[activeHeroSlide];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Cinematic Hero Slider */}
      <section className="relative w-full h-[520px] sm:h-[600px] lg:h-[640px] bg-neutral-950 text-white overflow-hidden">
        {/* Background Backdrop Image */}
        <div className="absolute inset-0">
          <Image
            src={heroSlide.image}
            alt={heroSlide.title}
            fill
            priority
            className="object-cover object-center filter brightness-65 transition-all duration-700 ease-in-out"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto h-full px-6 lg:px-12 flex flex-col justify-end pb-16 sm:pb-20 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#ff5500]/90 text-white font-bold backdrop-blur-xs">
              {heroSlide.tag}
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{heroSlide.rating}/10</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans max-w-3xl leading-tight">
            {heroSlide.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 font-medium">
            <span>{heroSlide.genre}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-[#ff5500]" />
              <span>{heroSlide.duration}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-2xl leading-relaxed line-clamp-2">
            {heroSlide.synopsis}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/movies/${heroSlide.slug}`}
              className="px-6 py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Ticket size={16} />
              <span>Book Tickets & Choose Seats</span>
            </Link>

            <a
              href="#movies"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors backdrop-blur-xs"
            >
              Explore Schedule
            </a>
          </div>

          {/* Slider Indicator Dots */}
          <div className="flex items-center gap-2 pt-4">
            {DEFAULT_HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeHeroSlide === idx ? "w-8 bg-[#ff5500]" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Movies Catalog Section */}
      <section id="movies" className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              BOX OFFICE SCREENINGS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 mt-1 font-sans">
              Movies Showing Today
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select any movie to view showtimes, trailers, and reserve seats in real time.
            </p>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("now_showing")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === "now_showing"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Now Showing
              </button>
              <button
                onClick={() => setStatusFilter("coming_soon")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === "coming_soon"
                    ? "bg-white text-neutral-950 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-neutral-900 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="w-full aspect-[2/3] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center bg-[#fafbfc] border border-neutral-200 rounded-2xl space-y-3">
            <Film size={32} className="mx-auto text-neutral-400" />
            <h3 className="text-base font-bold text-neutral-800">No movies match your search</h3>
            <p className="text-xs text-neutral-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie._id}
                className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                  <Image
                    src={movie.thumbnail?.url || "/images/hero-banner.jpg"}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Link
                      href={`/movies/${movie.slug}`}
                      className="w-full py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center shadow-md transition-colors"
                    >
                      Book Seats
                    </Link>
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1 font-mono">
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <span>{movie.rating ? movie.rating.toFixed(1) : "8.5"}</span>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-white/90 text-neutral-900 backdrop-blur-sm">
                    {movie.status === "now_showing" ? "Active" : "Soon"}
                  </div>
                </div>

                {/* Info Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 group-hover:text-[#ff5500] transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {movie.genre?.join(" • ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                    <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                      <Clock size={12} className="text-neutral-400" />
                      <span>{movie.duration}m</span>
                    </span>
                    <Link
                      href={`/movies/${movie.slug}`}
                      className="text-xs font-bold text-[#ff5500] hover:underline flex items-center gap-1"
                    >
                      <span>Showtimes</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Theaters Showcase Section */}
      <section id="cinemas" className="bg-[#090d14] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              PREMIUM AUDITORIUMS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Movexa Cinema Experience
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Designed from the ground up for maximum visual clarity and earth-shaking acoustic precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#121824] border border-white/10 rounded-2xl p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#ff5500]/20 text-[#ff5500] flex items-center justify-center font-black text-xl">
                  IMAX
                </div>
                <div>
                  <h3 className="text-lg font-bold">Movexa Grand IMAX & Dolby</h3>
                  <p className="text-xs text-neutral-400">Downtown City Center, 742 Evergreen</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Featuring our flagship 70-foot custom curved screen, dual 4K laser projection, and Dolby Atmos 128-channel spatial sound.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  IMAX 70mm Compatible
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Dolby Atmos 3D
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Gourmet Concessions
                </span>
              </div>
            </div>

            <div className="bg-[#121824] border border-white/10 rounded-2xl p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xl">
                  VIP
                </div>
                <div>
                  <h3 className="text-lg font-bold">Movexa Royale Luxury Cinema</h3>
                  <p className="text-xs text-neutral-400">Westside Promenade, 100 Ocean Avenue</p>
                </div>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ultra-plush heated leather motorized recliners with in-theater dining brought right to your seat with the touch of a button.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Motorized Recliners
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Seat-Side Service
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Private VIP Lounge
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple 3-Step Booking Showcase */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-b border-neutral-100">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#ff5500] font-bold">
            FAST & SEAMLESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
            Book Tickets in 3 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-[#fafbfc] border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff5500] flex items-center justify-center mx-auto text-lg font-bold font-mono">
              01
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Choose Your Movie & Slot</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Explore currently playing movies, select your theater, and pick your preferred time slot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#fafbfc] border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-lg font-bold font-mono">
              02
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Select Your Preferred Seats</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Interactive seating chart allows you to reserve exact seats in regular or VIP recliner tiers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#fafbfc] border border-neutral-200/80 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-lg font-bold font-mono">
              03
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">Get Instant QR E-Ticket</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Receive your confirmed ticket pass with a scannable digital barcode stored in your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

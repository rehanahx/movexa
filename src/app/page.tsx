"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Ticket,
  Star,
  Clock,
  ChevronRight,
  Search,
  Film,
  Sparkles,
  Play,
  ChevronLeft,
  Calendar,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: { url: string; publicId?: string };
  bannerImage?: { url: string; publicId?: string };
  tagline?: string;
  isFeatured?: boolean;
  trailerUrl?: string;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  rating?: number;
  status: "now_showing" | "coming_soon" | "ended";
}

interface HeroSlide {
  id: string;
  title: string;
  slug: string;
  tag: string;
  synopsis: string;
  image: string;
  rating: string;
  duration: string;
  genre: string;
  isFeatured: boolean;
  trailerUrl?: string;
}

export default function HomePage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroTransitioning, setHeroTransitioning] = useState(false);

  // Fetch movies directly from MongoDB via API
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/movies");
        const data = await res.json();
        if (data.success && data.movies) {
          if (isMounted) setMovies(data.movies);
        }
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute database-driven hero slides
  const heroSlides = useMemo<HeroSlide[]>(() => {
    if (!movies || movies.length === 0) {
      return [];
    }

    // 1. Prioritize movies marked as isFeatured
    const featured = movies.filter((m) => m.isFeatured);
    // 2. Active now showing movies
    const nowShowing = movies.filter((m) => !m.isFeatured && m.status === "now_showing");
    // 3. Fallback remaining
    const others = movies.filter((m) => !m.isFeatured && m.status !== "now_showing");

    const pool = [...featured, ...nowShowing, ...others].slice(0, 5);

    return pool.map((m) => {
      const banner = m.bannerImage?.url || m.thumbnail?.url || "";
      const tag =
        m.tagline ||
        (m.isFeatured
          ? "FEATURED SELECTION"
          : m.status === "now_showing"
          ? "NOW PLAYING"
          : "COMING SOON");
      const durationStr =
        m.duration >= 60
          ? `${Math.floor(m.duration / 60)}h ${m.duration % 60}m`
          : `${m.duration}m`;

      return {
        id: m._id,
        title: m.title,
        slug: m.slug,
        tag,
        synopsis: m.shortDescription,
        image: banner,
        rating: m.rating ? m.rating.toFixed(1) : "8.5",
        duration: durationStr,
        genre: m.genre?.slice(0, 3).join(" • ") || "Cinema",
        isFeatured: !!m.isFeatured,
        trailerUrl: m.trailerUrl,
      };
    });
  }, [movies]);

  const goToSlide = useCallback(
    (idx: number) => {
      if (idx === activeHeroSlide || heroTransitioning) return;
      setHeroTransitioning(true);
      setTimeout(() => {
        setActiveHeroSlide(idx);
        setHeroTransitioning(false);
      }, 250);
    },
    [activeHeroSlide, heroTransitioning]
  );

  // Auto rotate hero
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setHeroTransitioning(true);
      setTimeout(() => {
        setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
        setHeroTransitioning(false);
      }, 250);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Filter movie catalog
  const filteredMovies = movies.filter((movie) => {
    const matchesStatus =
      statusFilter === "all" ? true : movie.status === statusFilter;
    const matchesQuery =
      searchQuery.trim() === "" ||
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.some((g) =>
        g.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      movie.language?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const currentSlide = heroSlides[activeHeroSlide] || heroSlides[0];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans">
      {/* ── Featured Hero Carousel ── */}
      {isLoading ? (
        <section className="w-full h-[520px] sm:h-[600px] lg:h-[660px] bg-[#0c1017] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-[#ff5500] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
              Loading featured cinema...
            </p>
          </div>
        </section>
      ) : heroSlides.length > 0 && currentSlide ? (
        <section className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] bg-[#0c1017] text-white overflow-hidden select-none">
          {/* Background image */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ease-out ${
              heroTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {currentSlide.image ? (
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                priority
                className="object-cover object-center filter brightness-[0.55]"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950" />
            )}

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-[#0c1017]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1017]/90 via-[#0c1017]/40 to-transparent" />
          </div>

          {/* Top Info Badge */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
            {currentSlide.isFeatured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5500] text-[10px] font-mono font-bold tracking-wider text-white shadow-sm">
                <Sparkles size={11} />
                FEATURED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-semibold tracking-wider text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                MOVEXA PREMIERE
              </span>
            )}
          </div>

          {/* Slide Navigation Controls */}
          {heroSlides.length > 1 && (
            <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-300">
                {String(activeHeroSlide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
              </span>
              <div className="w-px h-3 bg-white/20" />
              <button
                onClick={() =>
                  goToSlide((activeHeroSlide - 1 + heroSlides.length) % heroSlides.length)
                }
                className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => goToSlide((activeHeroSlide + 1) % heroSlides.length)}
                className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Content Info */}
          <div
            className={`relative max-w-7xl mx-auto h-full px-6 lg:px-14 flex flex-col justify-end pb-16 sm:pb-20 space-y-4 transition-all duration-500 ${
              heroTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Meta Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-0.5 rounded-md bg-[#ff5500] text-white font-bold">
                {currentSlide.tag}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>{currentSlide.rating} / 10</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                <Clock size={11} />
                <span>{currentSlide.duration}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.05]">
              {currentSlide.title}
            </h1>

            {/* Genre */}
            <p className="text-xs sm:text-sm text-[#ff7733] font-semibold tracking-wider uppercase font-mono">
              {currentSlide.genre}
            </p>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-200 font-light max-w-xl leading-relaxed line-clamp-2">
              {currentSlide.synopsis}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/movies/${currentSlide.slug}`}
                className="px-6 py-3 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/40 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Ticket size={16} />
                <span>Book Tickets & Choose Seats</span>
              </Link>

              <Link
                href={`/movies/${currentSlide.slug}#book-tickets`}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors backdrop-blur-md flex items-center gap-2"
              >
                <Play size={14} className="fill-white" />
                <span>View Showtimes</span>
              </Link>
            </div>
          </div>

          {/* Interactive Slide Thumbnails (Desktop) */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 hidden md:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              {heroSlides.map((slide, idx) => {
                const isActive = activeHeroSlide === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className={`group relative w-16 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#ff5500] scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    title={slide.title}
                  >
                    {slide.image && (
                      <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="64px" />
                    )}
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile slide dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex md:hidden items-center gap-1.5">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeHeroSlide === idx ? "w-6 bg-[#ff5500]" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Movie Catalog Section ── */}
      <section id="movies" className="max-w-7xl mx-auto px-6 lg:px-14 py-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              BOX OFFICE DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
              Currently Showing in Theaters
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any movie to view showtimes, screen details, and reserve your seats.
            </p>
          </div>

          {/* Filter tabs & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              {["all", "now_showing", "coming_soon"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer capitalize ${
                    statusFilter === tab
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="w-full aspect-[2/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
            <Film size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800">
              {movies.length === 0
                ? "No movies scheduled in the database yet"
                : "No movies match your current search"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {movies.length === 0
                ? "Administrators can log in to add new movie titles and showtimes to the platform."
                : "Try adjusting your search query or filter tags."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <Link
                key={movie._id}
                href={`/movies/${movie.slug}`}
                className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {/* Poster: Strict 2:3 aspect ratio, object-cover */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
                  {movie.thumbnail?.url && (
                    <Image
                      src={movie.thumbnail.url}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  )}

                  {/* Hover overlay button */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="w-full py-2 bg-[#ff5500] text-white font-bold text-xs uppercase tracking-wider rounded-lg text-center shadow-md">
                      Book Seats
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1 font-mono">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{movie.rating ? movie.rating.toFixed(1) : "8.5"}</span>
                  </div>

                  {/* Featured Badge */}
                  {movie.isFeatured && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#ff5500] flex items-center justify-center shadow-md text-white">
                      <Sparkles size={11} />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs border border-white/10">
                    {movie.status === "now_showing" ? "Active" : "Coming Soon"}
                  </div>
                </div>

                {/* Movie Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#ff5500] transition-colors line-clamp-1 leading-tight">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {movie.genre?.slice(0, 2).join(" · ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                      <Clock size={11} />
                      <span>{movie.duration}m</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#ff5500] flex items-center gap-0.5">
                      <span>Showtimes</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Cinema Auditoriums Showcase ── */}
      <section id="cinemas" className="bg-[#0e1420] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              PREMIUM AUDITORIUMS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Movexa Cinema Experience
            </h2>
            <p className="text-xs text-slate-400">
              Custom-built luxury screens with laser projection and multi-channel spatial sound.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141b29] border border-white/10 rounded-2xl p-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff5500]/20 text-[#ff5500] flex items-center justify-center font-black text-sm">
                  IMAX
                </div>
                <div>
                  <h3 className="text-base font-bold">Movexa Grand IMAX & Dolby</h3>
                  <p className="text-xs text-slate-400">Downtown City Center, 742 Evergreen</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Featuring our flagship 70-foot custom curved screen, dual 4K laser projection, and Dolby Atmos spatial audio.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  IMAX 70mm
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  Dolby Atmos
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  Reserved Seating
                </span>
              </div>
            </div>

            <div className="bg-[#141b29] border border-white/10 rounded-2xl p-7 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                  VIP
                </div>
                <div>
                  <h3 className="text-base font-bold">Movexa Royale Luxury Cinema</h3>
                  <p className="text-xs text-slate-400">Westside Promenade, 100 Ocean Avenue</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Motorized heated leather recliners with private seat-side gourmet dining service and luxury lounge access.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono pt-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  Motorized Recliners
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  Seat-Side Dining
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  VIP Lounge
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Simple Guide ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-14 py-16 border-b border-slate-200">
        <div className="text-center max-w-md mx-auto mb-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
            HOW IT WORKS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Book Tickets in 3 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff5500] flex items-center justify-center mx-auto text-base font-bold font-mono">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Select Movie & Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore currently playing movies, select your theater, and pick your preferred time slot.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-base font-bold font-mono">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Choose Your Seats</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Interactive auditorium map lets you pick your exact seats with regular and VIP tiers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-base font-bold font-mono">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Instant Digital Pass</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get an instant confirmed ticket with a scannable digital QR pass saved in your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

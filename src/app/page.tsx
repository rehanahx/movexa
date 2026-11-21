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
  Play,
  ChevronLeft,
  ArrowUpRight,
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

  // Fetch movies directly from database via API
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

    const featured = movies.filter((m) => m.isFeatured);
    const nowShowing = movies.filter((m) => !m.isFeatured && m.status === "now_showing");
    const others = movies.filter((m) => !m.isFeatured && m.status !== "now_showing");

    const pool = [...featured, ...nowShowing, ...others].slice(0, 5);

    return pool.map((m) => {
      const banner = m.bannerImage?.url || m.thumbnail?.url || "";
      const tag =
        m.tagline ||
        (m.isFeatured
          ? "FEATURED PRESENTATION"
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
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* ── Luxury Minimalist Hero ── */}
      {isLoading ? (
        <section className="w-full h-[520px] sm:h-[620px] lg:h-[680px] bg-[#0c0c0d] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-[11px] text-neutral-400 font-mono tracking-[0.2em] uppercase">
              Loading Cinema Catalog...
            </p>
          </div>
        </section>
      ) : heroSlides.length > 0 && currentSlide ? (
        <section className="relative w-full h-[540px] sm:h-[640px] lg:h-[700px] bg-[#0c0c0d] text-white overflow-hidden select-none">
          {/* Backdrop Image */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              heroTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {currentSlide.image ? (
              <Image
                src={currentSlide.image}
                alt={currentSlide.title}
                fill
                priority
                className="object-cover object-center filter brightness-[0.52]"
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-[#111]" />
            )}

            {/* Restrained Editorial Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-[#0c0c0d]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0d]/90 via-[#0c0c0d]/30 to-transparent" />
          </div>

          {/* Minimalist Slide Counter - Top Right */}
          {heroSlides.length > 1 && (
            <div className="absolute top-8 right-8 z-20 hidden sm:flex items-center gap-3 font-mono text-[11px] text-neutral-400">
              <span className="tracking-widest">
                {String(activeHeroSlide + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
              </span>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    goToSlide((activeHeroSlide - 1 + heroSlides.length) % heroSlides.length)
                  }
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => goToSlide((activeHeroSlide + 1) % heroSlides.length)}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Main Hero Content */}
          <div
            className={`relative max-w-7xl mx-auto h-full px-6 lg:px-14 flex flex-col justify-end pb-16 sm:pb-20 space-y-4 transition-all duration-500 ${
              heroTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Meta Line */}
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-300">
              <span className="text-white font-bold">{currentSlide.tag}</span>
              <span>·</span>
              <span>{currentSlide.genre}</span>
              <span>·</span>
              <span>{currentSlide.duration}</span>
              <span>·</span>
              <span className="text-amber-300">★ {currentSlide.rating}</span>
            </div>

            {/* Editorial Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.02]">
              {currentSlide.title}
            </h1>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl leading-relaxed line-clamp-2">
              {currentSlide.synopsis}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/movies/${currentSlide.slug}`}
                className="px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Ticket size={15} />
                <span>Reserve Tickets</span>
              </Link>

              <Link
                href={`/movies/${currentSlide.slug}#book-tickets`}
                className="px-6 py-3 bg-neutral-900/80 hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider border border-white/20 transition-colors inline-flex items-center gap-2"
              >
                <span>Showtimes</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Slide Indicator Dots (Mobile) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex md:hidden items-center gap-1.5">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1 transition-all cursor-pointer ${
                  activeHeroSlide === idx ? "w-6 bg-white" : "w-1.5 bg-white/30"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Movie Catalog Section ── */}
      <section id="movies" className="max-w-7xl mx-auto px-6 lg:px-14 py-16 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 font-medium">
              CURRENT PROGRAM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 mt-1">
              Screenings & Tickets
            </h2>
          </div>

          {/* Minimalist Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-neutral-200 p-0.5 rounded-lg text-xs font-mono">
              {[
                { key: "all", label: "ALL" },
                { key: "now_showing", label: "NOW SHOWING" },
                { key: "coming_soon", label: "COMING SOON" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer rounded-md ${
                    statusFilter === tab.key
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 text-neutral-900 w-44 sm:w-52 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="w-full aspect-[2/3] bg-neutral-100" />
                <div className="h-4 bg-neutral-100 w-3/4" />
                <div className="h-3 bg-neutral-100 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-16 text-center border border-neutral-200 rounded-lg space-y-3">
            <Film size={32} className="mx-auto text-neutral-400" />
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider font-mono">
              {movies.length === 0 ? "No Screenings Scheduled" : "No Matches Found"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {movies.length === 0
                ? "No movies are currently scheduled in the platform database."
                : "Try clearing your search query or selecting a different status filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {filteredMovies.map((movie) => (
              <Link
                key={movie._id}
                href={`/movies/${movie.slug}`}
                className="group flex flex-col space-y-3 cursor-pointer"
              >
                {/* Poster: Strict 2:3 aspect ratio, object-cover */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900 rounded-sm">
                  {movie.thumbnail?.url && (
                    <Image
                      src={movie.thumbnail.url}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  )}

                  {/* Clean hover action */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="w-full py-2 bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider text-center">
                      Select Seats
                    </span>
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 backdrop-blur-xs text-[10px] font-mono font-medium text-white border border-white/10">
                    ★ {movie.rating ? movie.rating.toFixed(1) : "8.5"}
                  </div>

                  {/* Featured Minimal Tag */}
                  {movie.isFeatured && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white text-neutral-950 text-[9px] font-mono font-bold tracking-widest uppercase">
                      Featured
                    </div>
                  )}
                </div>

                {/* Movie Details */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span>{movie.genre?.slice(0, 2).join(" / ")}</span>
                    <span>{movie.duration}m</span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-950 group-hover:text-neutral-600 transition-colors line-clamp-1 leading-snug">
                    {movie.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Auditoriums & Architecture ── */}
      <section id="cinemas" className="bg-[#0c0c0d] text-white py-20 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 space-y-12">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 font-medium">
              AUDITORIUM SPECIFICATIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Acoustic & Visual Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-white/10 p-8 space-y-4 hover:border-white/25 transition-colors">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 block">
                AUDITORIUM I // 70MM LASER
              </span>
              <h3 className="text-xl font-bold">Movexa Grand IMAX & Dolby</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Custom 70-foot curved display, dual 4K laser projection architecture, and Dolby Atmos 128-channel spatial sound matrix.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400 pt-2">
                <span className="px-2 py-1 border border-white/10">IMAX Laser</span>
                <span className="px-2 py-1 border border-white/10">Dolby Atmos</span>
                <span className="px-2 py-1 border border-white/10">Reserved Seating</span>
              </div>
            </div>

            <div className="border border-white/10 p-8 space-y-4 hover:border-white/25 transition-colors">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400 block">
                AUDITORIUM II // LUXURY RECLINERS
              </span>
              <h3 className="text-xl font-bold">Movexa Royale Luxury Cinema</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Motorized heated Italian leather recliners with in-theater dining service and acoustic room tuning for private screenings.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400 pt-2">
                <span className="px-2 py-1 border border-white/10">Motorized Recliners</span>
                <span className="px-2 py-1 border border-white/10">Seat-Side Service</span>
                <span className="px-2 py-1 border border-white/10">VIP Lounge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Simple Process ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-14 py-20 border-b border-neutral-200">
        <div className="max-w-md mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 font-medium">
            RESERVATION PROCESS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 mt-1">
            Three Steps to Your Seat
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-mono">
          <div className="border-t border-neutral-200 pt-6 space-y-2">
            <span className="text-xs text-neutral-400 block">01 / SELECTION</span>
            <h3 className="font-bold text-neutral-950 text-sm font-sans">
              Choose Title & Screening Slot
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Browse currently scheduled showtimes across our auditoriums and pick your preferred time.
            </p>
          </div>

          <div className="border-t border-neutral-200 pt-6 space-y-2">
            <span className="text-xs text-neutral-400 block">02 / RESERVATION</span>
            <h3 className="font-bold text-neutral-950 text-sm font-sans">
              Pick Exact Auditorium Seats
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Interactive seating chart allows you to choose standard or VIP recliner seats in real time.
            </p>
          </div>

          <div className="border-t border-neutral-200 pt-6 space-y-2">
            <span className="text-xs text-neutral-400 block">03 / ADMISSION</span>
            <h3 className="font-bold text-neutral-950 text-sm font-sans">
              Instant Digital Admission Pass
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Instant digital admission ticket pass with scannable barcode ready in your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

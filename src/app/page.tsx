"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: { url: string; publicId: string };
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
  title: string;
  slug: string;
  tag: string;
  synopsis: string;
  image: string;
  rating: string;
  duration: string;
  genre: string;
}

const STATIC_HERO_SLIDES: HeroSlide[] = [
  {
    title: "Dune: Part Two",
    slug: "dune-part-two",
    tag: "NOW SHOWING IN IMAX 70MM",
    synopsis:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    image: "/images/dune-hero.jpg",
    rating: "8.8",
    duration: "2h 46m",
    genre: "Action • Adventure • Sci-Fi",
  },
  {
    title: "Oppenheimer",
    slug: "oppenheimer",
    tag: "SPECIAL 4K LASER SCREENING",
    synopsis:
      "The historical story of J. Robert Oppenheimer and his role in the Manhattan Project.",
    image: "/images/cinema-auth.jpg",
    rating: "8.9",
    duration: "3h 00m",
    genre: "Drama • Biography • History",
  },
  {
    title: "Silent Frequency",
    slug: "silent-frequency",
    tag: "PREMIERE SELECTION",
    synopsis:
      "An audio forensics investigator in a rain-soaked metropolis uncovers a secret broadcast hidden within city ambient frequencies.",
    image: "/images/poster-noir.jpg",
    rating: "9.1",
    duration: "2h 16m",
    genre: "Neo-Noir • Thriller",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(STATIC_HERO_SLIDES);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroTransitioning, setHeroTransitioning] = useState(false);

  // Go to slide with fade transition
  const goToSlide = useCallback(
    (idx: number) => {
      if (idx === activeHeroSlide || heroTransitioning) return;
      setHeroTransitioning(true);
      setTimeout(() => {
        setActiveHeroSlide(idx);
        setHeroTransitioning(false);
      }, 300);
    },
    [activeHeroSlide, heroTransitioning]
  );

  // Auto-rotate hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroTransitioning(true);
      setTimeout(() => {
        setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
        setHeroTransitioning(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch movies + build dynamic hero from featured
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load all movies
        const res = await fetch("/api/movies");
        const data = await res.json();
        let allMovies: MovieItem[] = [];

        if (data.success && data.movies?.length > 0) {
          allMovies = data.movies;
        } else {
          // Auto-seed on empty DB
          const seedRes = await fetch("/api/seed");
          const seedData = await seedRes.json();
          if (seedData.success) {
            const r2 = await fetch("/api/movies");
            const d2 = await r2.json();
            allMovies = d2.movies || [];
          }
        }

        setMovies(allMovies);

        // Build hero from featured movies
        const featured = allMovies.filter((m) => m.isFeatured);
        if (featured.length > 0) {
          const dynamicSlides: HeroSlide[] = featured.map((m) => ({
            title: m.title,
            slug: m.slug,
            tag: m.tagline || "NOW SHOWING",
            synopsis: m.shortDescription,
            image: m.bannerImage?.url || m.thumbnail.url,
            rating: m.rating?.toFixed(1) || "8.5",
            duration: `${Math.floor(m.duration / 60)}h ${m.duration % 60}m`,
            genre: m.genre.slice(0, 3).join(" • "),
          }));
          setHeroSlides(dynamicSlides);
          setActiveHeroSlide(0);
        }
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    const matchesStatus =
      statusFilter === "all" ? true : movie.status === statusFilter;
    const matchesQuery =
      searchQuery.trim() === "" ||
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.some((g) =>
        g.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesQuery;
  });

  const heroSlide = heroSlides[activeHeroSlide] || heroSlides[0];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* ── Cinematic Hero Carousel ── */}
      <section className="relative w-full h-[560px] sm:h-[620px] lg:h-[680px] bg-neutral-950 text-white overflow-hidden">
        {/* Background layer */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            heroTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={heroSlide.image}
            alt={heroSlide.title}
            fill
            priority
            className="object-cover object-center brightness-[0.55]"
          />
          {/* Cinematic grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/20 to-transparent" />
        </div>

        {/* Slide indicators - top right */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all cursor-pointer rounded-full ${
                activeHeroSlide === idx
                  ? "w-6 h-1.5 bg-[#ff5500]"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={() =>
            goToSlide((activeHeroSlide - 1 + heroSlides.length) % heroSlides.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() =>
            goToSlide((activeHeroSlide + 1) % heroSlides.length)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Hero content */}
        <div
          className={`relative max-w-7xl mx-auto h-full px-6 lg:px-14 flex flex-col justify-end pb-16 sm:pb-20 space-y-4 transition-opacity duration-500 ${
            heroTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-[#ff5500] text-white font-bold">
              {heroSlide.tag}
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm flex items-center gap-1.5">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span>{heroSlide.rating}/10</span>
            </span>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm flex items-center gap-1.5">
              <Clock size={11} />
              <span>{heroSlide.duration}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-3xl leading-[1.0] drop-shadow-2xl">
            {heroSlide.title}
          </h1>

          {/* Genre */}
          <p className="text-xs sm:text-sm text-[#ff7733] font-semibold tracking-wider uppercase font-mono">
            {heroSlide.genre}
          </p>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl leading-relaxed line-clamp-2">
            {heroSlide.synopsis}
          </p>

          {/* CTA row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={`/movies/${heroSlide.slug}`}
              className="px-7 py-3.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-900/40 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-95"
            >
              <Ticket size={16} />
              <span>Book Tickets</span>
            </Link>
            <a
              href="#movies"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors backdrop-blur-sm flex items-center gap-2"
            >
              <Play size={14} />
              <span>All Showtimes</span>
            </a>
          </div>

          {/* Slide counter */}
          <p className="text-[10px] font-mono text-neutral-500 tracking-widest pt-1">
            {String(activeHeroSlide + 1).padStart(2, "0")} /{" "}
            {String(heroSlides.length).padStart(2, "0")}
          </p>
        </div>
      </section>

      {/* ── Now Showing Banner ── */}
      <div className="bg-neutral-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 py-3 flex items-center gap-6 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold whitespace-nowrap shrink-0">
            Now Playing
          </span>
          <div className="flex items-center gap-6">
            {movies
              .filter((m) => m.status === "now_showing")
              .slice(0, 6)
              .map((m, i) => (
                <Link
                  key={m._id}
                  href={`/movies/${m.slug}`}
                  className="text-[11px] text-neutral-400 hover:text-white transition-colors whitespace-nowrap font-medium"
                >
                  <span className="text-neutral-600 mr-1.5">{String(i + 1).padStart(2, "0")}.</span>
                  {m.title}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* ── Movies Catalog ── */}
      <section id="movies" className="max-w-7xl mx-auto px-6 lg:px-14 py-16 space-y-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              BOX OFFICE SCREENINGS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 mt-1">
              Movies Showing Today
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Select any movie to view showtimes and reserve your seats.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80 text-xs">
              {["all", "now_showing", "coming_soon"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer capitalize ${
                    statusFilter === tab
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-neutral-900 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>

        {/* Movies grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="w-full aspect-[2/3] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-16 text-center bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
            <Film size={36} className="mx-auto text-neutral-400" />
            <h3 className="text-base font-bold text-neutral-800">
              No movies match your search
            </h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your filters or search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredMovies.map((movie) => (
              <Link
                key={movie._id}
                href={`/movies/${movie.slug}`}
                className="group flex flex-col bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                  <Image
                    src={movie.thumbnail?.url || "/images/hero-banner.jpg"}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="w-full py-2.5 bg-[#ff5500] text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center shadow-md">
                      Book Seats
                    </span>
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1 font-mono">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{movie.rating?.toFixed(1) || "8.5"}</span>
                  </div>
                  {/* Featured star */}
                  {movie.isFeatured && (
                    <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#ff5500] flex items-center justify-center shadow-lg">
                      <Sparkles size={13} className="text-white" />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/10">
                    {movie.status === "now_showing" ? "● Live" : "Soon"}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-neutral-900 group-hover:text-[#ff5500] transition-colors line-clamp-1 leading-tight">
                      {movie.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {movie.genre?.slice(0, 2).join(" · ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                    <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                      <Clock size={11} className="text-neutral-400" />
                      <span>{movie.duration}m</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#ff5500] flex items-center gap-1">
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

      {/* ── Cinemas Section ── */}
      <section id="cinemas" className="bg-[#090d14] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-14 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
              PREMIUM AUDITORIUMS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Movexa Cinema Experience
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Engineered for maximum visual clarity and earth-shaking acoustic
              precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                label: "IMAX",
                color: "bg-[#ff5500]/20 text-[#ff5500]",
                name: "Movexa Grand IMAX & Dolby",
                address: "742 Evergreen Terrace, Downtown Metropolis",
                desc: "Flagship 70-foot custom curved screen, dual 4K laser projection, and Dolby Atmos 128-channel spatial sound.",
                tags: ["IMAX 70mm Compatible", "Dolby Atmos 3D", "Gourmet Concessions"],
              },
              {
                label: "VIP",
                color: "bg-amber-500/20 text-amber-400",
                name: "Movexa Royale Luxury Cinema",
                address: "100 Ocean Avenue, Westside Promenade, 4th Floor",
                desc: "Ultra-plush heated leather motorized recliners with in-theater dining brought right to your seat.",
                tags: ["Motorized Recliners", "Seat-Side Dining", "Private VIP Lounge"],
              },
            ].map((c) => (
              <div
                key={c.name}
                className="bg-[#121824] border border-white/10 rounded-2xl p-8 space-y-4 shadow-xl hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${c.color} flex items-center justify-center font-black text-sm`}
                  >
                    {c.label}
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{c.name}</h3>
                    <p className="text-xs text-neutral-400">{c.address}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{c.desc}</p>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-Step Guide ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-14 py-20 border-b border-neutral-100">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5500] font-bold">
            FAST & SEAMLESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-2">
            Book Tickets in 3 Easy Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              step: "01",
              color: "bg-orange-50 text-[#ff5500]",
              title: "Choose Your Movie & Slot",
              desc: "Explore currently playing movies, select your theater, and pick your preferred time slot.",
            },
            {
              step: "02",
              color: "bg-emerald-50 text-emerald-600",
              title: "Pick Your Exact Seats",
              desc: "Interactive auditorium map lets you choose exact seats — regular rows or premium VIP recliners.",
            },
            {
              step: "03",
              color: "bg-blue-50 text-blue-600",
              title: "Instant QR E-Ticket",
              desc: "Receive a confirmed ticket with a scannable digital QR barcode saved in your account.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="p-7 rounded-2xl bg-[#fafbfc] border border-neutral-200/80 space-y-3 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mx-auto text-lg font-bold font-mono`}
              >
                {s.step}
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">{s.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer note if not logged in ── */}
      {!user && (
        <section className="bg-[#ff5500] text-white py-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-black tracking-tight">
                Your seat is waiting.
              </h3>
              <p className="text-xs text-orange-100 mt-1 max-w-md">
                Create a free account to book tickets, track your bookings, and
                get instant e-tickets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3 bg-white text-[#ff5500] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-orange-50 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-white/30"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

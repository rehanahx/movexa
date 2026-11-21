"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Clock,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clapperboard,
  Trash2,
  Sparkles,
  X,
  Check,
  ImageIcon,
  Tag,
} from "lucide-react";

interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: { url: string; publicId: string };
  bannerImage?: { url: string; publicId?: string };
  tagline?: string;
  isFeatured?: boolean;
  genre: string[];
  language: string;
  duration: number;
  releaseDate: string;
  director?: string;
  cast: string[];
  rating?: number;
  status: "now_showing" | "coming_soon" | "ended";
  createdAt: string;
}

const BANNER_PRESETS = [
  { label: "Dune Hero", url: "/images/dune-hero.jpg" },
  { label: "Cinema Auth", url: "/images/cinema-auth.jpg" },
  { label: "Poster Noir", url: "/images/poster-noir.jpg" },
  { label: "Hero Banner", url: "/images/hero-banner.jpg" },
];

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Featured modal state
  const [featuredModal, setFeaturedModal] = useState<MovieItem | null>(null);
  const [featuredBannerUrl, setFeaturedBannerUrl] = useState("");
  const [featuredTagline, setFeaturedTagline] = useState("");
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());
      const res = await fetch(`/api/movies?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load movies");
      setMovies(data.movies || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading movies");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchMovies(), 250);
    return () => clearTimeout(timer);
  }, [fetchMovies]);

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will also remove scheduled showtimes.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/movies/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete movie");
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting movie");
    } finally {
      setDeletingId(null);
    }
  };

  const openFeaturedModal = (movie: MovieItem) => {
    setFeaturedModal(movie);
    setFeaturedBannerUrl(movie.bannerImage?.url || movie.thumbnail.url);
    setFeaturedTagline(movie.tagline || "");
    setFeaturedError(null);
  };

  const handleSaveFeatured = async (setFeatured: boolean) => {
    if (!featuredModal) return;
    setIsSavingFeatured(true);
    setFeaturedError(null);
    try {
      const res = await fetch(`/api/movies/${featuredModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeatured: setFeatured,
          bannerImage: setFeatured
            ? { url: featuredBannerUrl, publicId: "admin-banner" }
            : undefined,
          tagline: setFeatured ? featuredTagline : "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update featured status");
      // Update local state
      setMovies((prev) =>
        prev.map((m) =>
          m._id === featuredModal._id
            ? {
                ...m,
                isFeatured: setFeatured,
                bannerImage: setFeatured ? { url: featuredBannerUrl } : undefined,
                tagline: setFeatured ? featuredTagline : "",
              }
            : m
        )
      );
      setFeaturedModal(null);
    } catch (err: unknown) {
      setFeaturedError(err instanceof Error ? err.message : "Error updating movie");
    } finally {
      setIsSavingFeatured(false);
    }
  };

  const getStatusBadge = (status: MovieItem["status"]) => {
    switch (status) {
      case "now_showing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#f0fdf4] text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Now Showing
          </span>
        );
      case "coming_soon":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#fffbeb] text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Coming Soon
          </span>
        );
      case "ended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Ended
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Movies Directory</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Manage movie listings, featured status, and release metadata.
          </p>
        </div>
        <Link
          href="/admin/movies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer w-fit"
        >
          <Plus size={15} />
          <span>Add New Movie</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e8ecf2] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by title, genre, director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
          {["all", "now_showing", "coming_soon", "ended"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold text-[11px] capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#ff5500] mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Loading movie listings...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-sm space-y-3">
          <Clapperboard size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No movies found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No movie records match your current filters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Genre & Lang</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movies.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                          <Image
                            src={m.thumbnail?.url || "/images/hero-banner.jpg"}
                            alt={m.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            {m.title}
                            {m.isFeatured && (
                              <Sparkles size={12} className="text-[#ff5500]" />
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">{m.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{m.genre?.slice(0, 2).join(", ")}</p>
                      <p className="text-[11px] text-slate-400">{m.language}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {m.duration} min
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Star size={11} className="fill-amber-500 text-amber-500" />
                        {m.rating ? m.rating.toFixed(1) : "8.5"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(m.status)}</td>
                    <td className="py-3 px-4">
                      {m.isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-300">
                          <Sparkles size={10} />
                          Featured
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Featured toggle button */}
                        <button
                          onClick={() => openFeaturedModal(m)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1 ${
                            m.isFeatured
                              ? "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "border-slate-200 hover:bg-slate-100 text-slate-500"
                          }`}
                          title={m.isFeatured ? "Edit featured settings" : "Set as featured"}
                        >
                          <Sparkles size={13} />
                        </button>
                        <Link
                          href={`/movies/${m.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Preview public page"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => handleDeleteMovie(m._id, m.title)}
                          disabled={deletingId === m._id}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete movie"
                        >
                          {deletingId === m._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Featured Movie Modal ── */}
      {featuredModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ff5500]/10 text-[#ff5500] flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Featured Movie Settings</h3>
                  <p className="text-[11px] text-slate-500">{featuredModal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setFeaturedModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {featuredError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{featuredError}</span>
                </div>
              )}

              {/* Current banner preview */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ImageIcon size={13} />
                  Hero Banner Image (16:9 widescreen)
                </label>
                {featuredBannerUrl && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 mb-3">
                    <Image
                      src={featuredBannerUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4">
                      <span className="text-white text-xs font-bold drop-shadow">
                        {featuredModal.title}
                      </span>
                    </div>
                  </div>
                )}
                {/* Preset selector */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {BANNER_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      onClick={() => setFeaturedBannerUrl(p.url)}
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        featuredBannerUrl === p.url
                          ? "border-[#ff5500] ring-2 ring-orange-200"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <Image src={p.url} alt={p.label} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-white text-[10px] font-mono font-bold">
                          {p.label}
                        </span>
                      </div>
                      {featuredBannerUrl === p.url && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#ff5500] flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Custom URL */}
                <input
                  type="url"
                  placeholder="Or paste a custom image URL..."
                  value={featuredBannerUrl}
                  onChange={(e) => setFeaturedBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={13} />
                  Tagline / Badge Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. NOW SHOWING IN IMAX 70MM"
                  value={featuredTagline}
                  onChange={(e) => setFeaturedTagline(e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500] font-mono uppercase"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Appears as a badge on the hero carousel — keep it short and punchy
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {featuredModal.isFeatured ? (
                  <>
                    <button
                      onClick={() => handleSaveFeatured(true)}
                      disabled={isSavingFeatured || !featuredBannerUrl}
                      className="flex-1 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingFeatured ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      Update Featured
                    </button>
                    <button
                      onClick={() => handleSaveFeatured(false)}
                      disabled={isSavingFeatured}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-slate-200"
                    >
                      Remove Featured
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSaveFeatured(true)}
                    disabled={isSavingFeatured || !featuredBannerUrl}
                    className="flex-1 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingFeatured ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Set as Featured
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

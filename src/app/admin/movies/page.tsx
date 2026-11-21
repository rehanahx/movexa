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
  Edit,
  Eye,
} from "lucide-react";

interface MovieItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: { url: string; publicId?: string };
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

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

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
    if (!confirm(`Are you sure you want to delete "${title}"? This will also remove any scheduled showtimes.`)) {
      return;
    }
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

  const handleQuickToggleFeatured = async (movie: MovieItem) => {
    setTogglingFeaturedId(movie._id);
    const newFeatured = !movie.isFeatured;
    try {
      const res = await fetch(`/api/movies/${movie._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeatured: newFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update featured status");

      setMovies((prev) =>
        prev.map((m) => (m._id === movie._id ? { ...m, isFeatured: newFeatured } : m))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error toggling featured status");
    } finally {
      setTogglingFeaturedId(null);
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
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Movies Management</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Create, edit, feature, and manage movie listings and box office presentation.
          </p>
        </div>
        <Link
          href="/admin/movies/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold text-xs rounded-xl transition-colors shadow-sm cursor-pointer w-fit"
        >
          <Plus size={15} />
          <span>Add New Movie</span>
        </Link>
      </div>

      {/* Filters Bar */}
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

      {/* Error Banner */}
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
            No movie records match your current filters. Add a new movie to start scheduling shows.
          </p>
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <Plus size={14} />
            <span>Create Movie</span>
          </Link>
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
                        {/* Poster thumbnail - 2:3 aspect ratio */}
                        <div className="relative w-10 h-14 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                          <Image
                            src={m.thumbnail?.url || "/images/hero-banner.jpg"}
                            alt={m.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            <span>{m.title}</span>
                            {m.isFeatured && (
                              <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 shrink-0">
                                Featured
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{m.slug}</p>
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
                      <button
                        onClick={() => handleQuickToggleFeatured(m)}
                        disabled={togglingFeaturedId === m._id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border ${
                          m.isFeatured
                            ? "bg-orange-50 text-[#ff5500] border-orange-200 hover:bg-orange-100"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Click to toggle featured status"
                      >
                        {togglingFeaturedId === m._id ? (
                          <Loader2 size={11} className="animate-spin text-neutral-900" />
                        ) : (
                          <Star size={11} className={m.isFeatured ? "fill-neutral-900 text-neutral-900" : "text-neutral-400"} />
                        )}
                        <span>{m.isFeatured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Movie */}
                        <Link
                          href={`/admin/movies/${m._id}/edit`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                          title="Edit movie & banner"
                        >
                          <Edit size={13} />
                        </Link>

                        {/* Preview Public Page */}
                        <Link
                          href={`/movies/${m.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="View public page"
                        >
                          <Eye size={13} />
                        </Link>

                        {/* Delete Movie */}
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
    </div>
  );
}

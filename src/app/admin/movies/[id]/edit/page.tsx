"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const GENRE_PRESETS = [
  "Action",
  "Adventure",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Comedy",
  "Horror",
  "Animation",
  "Crime",
  "Mystery",
  "Biography",
  "History",
];

const LANGUAGE_PRESETS = [
  "English",
  "Spanish",
  "French",
  "Hindi",
  "Japanese",
  "Korean",
  "German",
  "Italian",
  "Mandarin",
];

export default function EditMoviePage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const routeParams = useParams();

  let movieId = "";
  if (routeParams && typeof routeParams.id === "string") {
    movieId = routeParams.id;
  } else if (params) {
    try {
      const resolved = use(params);
      if (resolved && resolved.id) {
        movieId = resolved.id;
      }
    } catch {}
  }

  // Loading state for fetching movie
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [newGenreInput, setNewGenreInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState<number | "">(120);
  const [releaseDate, setReleaseDate] = useState("");
  const [director, setDirector] = useState("");
  const [cast, setCast] = useState<string[]>([]);
  const [newCastInput, setNewCastInput] = useState("");
  const [rating, setRating] = useState<number | "">(8.5);
  const [status, setStatus] = useState<"now_showing" | "coming_soon" | "ended">(
    "now_showing"
  );

  // Poster Image (Portrait 2:3)
  const [thumbnail, setThumbnail] = useState<{
    url: string;
    publicId: string;
  } | null>(null);

  // Featured Movie & Banner Image (Landscape 16:9)
  const [isFeatured, setIsFeatured] = useState(false);
  const [bannerImage, setBannerImage] = useState<{
    url: string;
    publicId: string;
  } | null>(null);
  const [tagline, setTagline] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fetch movie data on mount
  useEffect(() => {
    if (!movieId) return;

    async function loadMovie() {
      setIsLoadingMovie(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/movies/${encodeURIComponent(movieId)}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.movie) {
          throw new Error(data.message || "Movie record not found.");
        }

        const m = data.movie;
        setTitle(m.title || "");
        setSlug(m.slug || "");
        setShortDescription(m.shortDescription || "");
        setLongDescription(m.longDescription || "");
        setTrailerUrl(m.trailerUrl || "");
        setGenres(m.genre || []);
        setLanguage(m.language || "English");
        setDuration(m.duration || 120);
        if (m.releaseDate) {
          setReleaseDate(new Date(m.releaseDate).toISOString().split("T")[0]);
        }
        setDirector(m.director || "");
        setCast(m.cast || []);
        setRating(m.rating !== undefined && m.rating !== null ? m.rating : "");
        setStatus(m.status || "now_showing");
        setThumbnail(m.thumbnail || null);
        setIsFeatured(!!m.isFeatured);
        setBannerImage(m.bannerImage || null);
        setTagline(m.tagline || "");
      } catch (err: unknown) {
        setFetchError(err instanceof Error ? err.message : "Error loading movie");
      } finally {
        setIsLoadingMovie(false);
      }
    }

    loadMovie();
  }, [movieId]);

  const handleAddCast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCastInput.trim();
    if (trimmed && !cast.includes(trimmed)) {
      setCast([...cast, trimmed]);
      setNewCastInput("");
    }
  };

  const handleRemoveCast = (actor: string) => {
    setCast(cast.filter((c) => c !== actor));
  };

  const handleToggleGenre = (g: string) => {
    if (genres.includes(g)) {
      if (genres.length > 1) {
        setGenres(genres.filter((item) => item !== g));
      }
    } else {
      setGenres([...genres, g]);
    }
  };

  const handleAddCustomGenre = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newGenreInput.trim();
    if (trimmed && !genres.includes(trimmed)) {
      setGenres([...genres, trimmed]);
      setNewGenreInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!thumbnail?.url) {
      setErrorBanner("Please provide a movie poster thumbnail.");
      return;
    }

    if (isFeatured && !bannerImage?.url) {
      setErrorBanner("Please upload or provide a widescreen banner image for the featured movie.");
      return;
    }

    if (genres.length === 0) {
      setErrorBanner("Please select at least one movie genre.");
      return;
    }

    if (cast.length === 0) {
      setErrorBanner("Please specify at least one cast member.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        thumbnail,
        bannerImage: isFeatured && bannerImage?.url ? bannerImage : null,
        isFeatured,
        tagline: isFeatured && tagline.trim() ? tagline.trim() : "",
        trailerUrl: trailerUrl.trim() || undefined,
        genre: genres,
        language: language.trim(),
        duration: Number(duration) || 120,
        releaseDate: new Date(releaseDate).toISOString(),
        director: director.trim() || undefined,
        cast,
        rating: rating !== "" ? Number(rating) : null,
        status,
      };

      const res = await fetch(`/api/movies/${movieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update movie.");
      }

      setSuccessBanner("Movie updated successfully! Returning to directory...");
      setTimeout(() => {
        router.push("/admin/movies");
      }, 900);
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : "Error updating movie");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMovie) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <Loader2 size={32} className="animate-spin text-[#ff5500] mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono">Loading movie details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Movie Not Found</h2>
        <p className="text-xs text-slate-500">{fetchError}</p>
        <Link
          href="/admin/movies"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          <span>Back to Movies</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies"
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Edit Movie: {title}</span>
              {isFeatured && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-50 text-[#ff5500] border border-orange-200 font-bold uppercase">
                  Featured
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Update movie information, release status, poster and widescreen banner assets.
            </p>
          </div>
        </div>

        <Link
          href={`/movies/${slug}`}
          target="_blank"
          className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors"
        >
          <span>View Public Page</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {errorBanner && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Core Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Movie Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Short Description / Synopsis <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={10}
              maxLength={300}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Full Synopsis / Long Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              minLength={20}
              maxLength={2000}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Release Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              >
                <option value="now_showing">Now Showing</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Runtime (minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Release Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              >
                {LANGUAGE_PRESETS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Director</label>
              <input
                type="text"
                placeholder="e.g. Christopher Nolan"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                IMDb / Critic Rating (0-10)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                placeholder="8.5"
                value={rating}
                onChange={(e) => setRating(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              YouTube Trailer URL
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
            />
          </div>
        </div>

        {/* SECTION 2: Genres & Cast */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Genres & Cast Members
          </h2>

          {/* Genres */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Genres <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {GENRE_PRESETS.map((g) => {
                const isSelected = genres.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => handleToggleGenre(g)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#ff5500] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-sm mt-2">
              <input
                type="text"
                placeholder="Add other genre..."
                value={newGenreInput}
                onChange={(e) => setNewGenreInput(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 flex-1"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                disabled={!newGenreInput.trim()}
                className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>

          {/* Cast */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Cast Members <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cast.map((actor) => (
                <span
                  key={actor}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200"
                >
                  <span>{actor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCast(actor)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Add actor name..."
                value={newCastInput}
                onChange={(e) => setNewCastInput(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 flex-1"
              />
              <button
                type="button"
                onClick={handleAddCast}
                disabled={!newCastInput.trim()}
                className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-40"
              >
                Add Actor
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Movie Poster Upload (Portrait 2:3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Movie Poster <span className="text-rose-500">*</span>
          </h2>

          <ImageUploader
            label="Portrait Movie Poster"
            helperText="Upload the official vertical movie poster. It will be preserved at approximately 2:3 aspect ratio without stretching or distortion."
            aspectRatio="portrait"
            value={thumbnail}
            onChange={setThumbnail}
            disabled={isSubmitting}
          />
        </div>

        {/* SECTION 4: Featured Movie & Widescreen Banner (Landscape 16:9) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#ff5500]" />
              <span>4. Featured Movie Presentation</span>
            </h2>
          </div>

          {/* Feature this movie Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="featureMovieToggleEdit"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#ff5500] focus:ring-[#ff5500] cursor-pointer"
            />
            <label htmlFor="featureMovieToggleEdit" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-slate-900 block text-sm">
                Feature this movie on homepage carousel
              </span>
              <span className="text-slate-500 block mt-0.5">
                When enabled, Movexa will showcase this title in the dynamic hero carousel with a custom landscape banner.
              </span>
            </label>
          </div>

          {/* Conditional Banner Upload Field */}
          {isFeatured && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              <ImageUploader
                label="Landscape Banner Image (16:9)"
                helperText="Upload a high-resolution widescreen banner image. This image will be used in the featured hero slider."
                aspectRatio="landscape"
                value={bannerImage}
                onChange={setBannerImage}
                disabled={isSubmitting}
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Custom Tagline / Badge Text (Optional)
                </label>
                <input
                  type="text"
                  maxLength={60}
                  placeholder="e.g. NOW SHOWING IN IMAX 70MM"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase focus:outline-none focus:border-[#ff5500]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Short punchy tag displayed above the movie title in the hero banner.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/admin/movies"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#ff5500] hover:bg-[#e64d00] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

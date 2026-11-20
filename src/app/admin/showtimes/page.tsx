"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Clock,
  Film,
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Search,
} from "lucide-react";

interface ShowItem {
  _id: string;
  movie?: {
    _id: string;
    title: string;
    duration: number;
  };
  cinema?: {
    _id: string;
    name: string;
  };
  screen?: {
    _id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  seats: any[];
}

interface MovieOption {
  _id: string;
  title: string;
  duration: number;
}

interface CinemaOption {
  _id: string;
  name: string;
  screens: {
    _id: string;
    name: string;
  }[];
}

export default function AdminShowtimesPage() {
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [movies, setMovies] = useState<MovieOption[]>([]);
  const [cinemas, setCinemas] = useState<CinemaOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [showDate, setShowDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("06:30 PM");
  const [endTime, setEndTime] = useState("09:15 PM");
  const [regularPrice, setRegularPrice] = useState(250);
  const [premiumPrice, setPremiumPrice] = useState(450);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [showsRes, moviesRes, cinemasRes] = await Promise.all([
        fetch("/api/shows"),
        fetch("/api/movies"),
        fetch("/api/cinemas"),
      ]);

      const [showsData, moviesData, cinemasData] = await Promise.all([
        showsRes.json(),
        moviesRes.json(),
        cinemasRes.json(),
      ]);

      if (showsData.success) setShows(showsData.shows || []);
      if (moviesData.success) {
        setMovies(moviesData.movies || []);
        if (moviesData.movies?.length > 0 && !selectedMovieId) {
          setSelectedMovieId(moviesData.movies[0]._id);
        }
      }
      if (cinemasData.success) {
        setCinemas(cinemasData.cinemas || []);
        if (cinemasData.cinemas?.length > 0 && !selectedCinemaId) {
          setSelectedCinemaId(cinemasData.cinemas[0]._id);
          if (cinemasData.cinemas[0].screens?.length > 0) {
            setSelectedScreenId(cinemasData.cinemas[0].screens[0]._id);
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading showtimes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update screens when cinema changes
  const handleCinemaChange = (cinId: string) => {
    setSelectedCinemaId(cinId);
    const cin = cinemas.find((c) => c._id === cinId);
    if (cin && cin.screens && cin.screens.length > 0) {
      setSelectedScreenId(cin.screens[0]._id);
    } else {
      setSelectedScreenId("");
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovieId,
          cinemaId: selectedCinemaId,
          screenId: selectedScreenId,
          date: showDate,
          startTime,
          endTime,
          regularPrice,
          premiumPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to schedule showtime");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to create showtime");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this showtime?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/shows?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete showtime");
      }

      setShows((prev) => prev.filter((s) => s._id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting showtime");
    } finally {
      setDeletingId(null);
    }
  };

  const currentCinemaScreens =
    cinemas.find((c) => c._id === selectedCinemaId)?.screens || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
            Auditorium Showtimes & Schedules
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Assign movies to cinema screens, configure time slots, and manage live seat allocations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm cursor-pointer w-fit"
        >
          <Plus size={15} />
          <span>Schedule New Showtime</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Shows Table */}
      {isLoading ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs">
          <Loader2 size={28} className="animate-spin text-[#ff5500] mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">Loading showtime matrix...</p>
        </div>
      ) : shows.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] rounded-xl p-12 text-center shadow-2xs space-y-3">
          <Calendar size={32} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No showtimes scheduled</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Schedule a showtime by clicking the button above or seed sample data in Settings.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8ecf2] rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Cinema & Screen</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {shows.map((show) => {
                  const bookedSeats =
                    show.seats?.filter((s) => s.status === "booked").length || 0;
                  const totalSeats = show.seats?.length || 70;
                  const percent = Math.round((bookedSeats / totalSeats) * 100);

                  return (
                    <tr key={show._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{show.movie?.title || "Movie"}</p>
                        <p className="text-[11px] text-slate-400">{show.movie?.duration || 120} mins</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{show.cinema?.name || "Cinema"}</p>
                        <p className="text-[11px] text-[#ff5500] font-medium">{show.screen?.name || "Screen 1"}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {new Date(show.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {show.startTime} - {show.endTime}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#ff5500] h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-500 font-semibold">
                            {bookedSeats}/{totalSeats} ({percent}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteShow(show._id)}
                          disabled={deletingId === show._id}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete showtime"
                        >
                          {deletingId === show._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Showtime Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Schedule Showtime</h3>
                <p className="text-xs text-neutral-500">Add a screening to the cinema schedule</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
              {/* Select Movie */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Movie
                </label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Cinema & Screen */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Cinema
                  </label>
                  <select
                    value={selectedCinemaId}
                    onChange={(e) => handleCinemaChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Auditorium Screen
                  </label>
                  <select
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  >
                    {currentCinemaScreens.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 06:30 PM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 09:15 PM"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Regular Seat Price (₹)
                  </label>
                  <input
                    type="number"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Premium Recliner (₹)
                  </label>
                  <input
                    type="number"
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#ff5500] hover:bg-[#e64d00] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Showtime</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

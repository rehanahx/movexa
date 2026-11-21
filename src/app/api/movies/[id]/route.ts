import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Movie from "@/models/Movie";
import Show from "@/models/Show";
import { ensureShowsForMovie } from "@/lib/cinemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Movie identifier is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const decodedId = decodeURIComponent(id).trim();

    // 1. Try finding by MongoDB ObjectId
    let movie = null;
    if (decodedId.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(decodedId).lean();
    }

    // 2. Try exact slug case-insensitive
    if (!movie) {
      const escaped = decodedId.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      movie = await Movie.findOne({
        slug: { $regex: new RegExp(`^${escaped}$`, "i") },
      }).lean();
    }

    // 3. Try exact title case-insensitive
    if (!movie) {
      const escaped = decodedId.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      movie = await Movie.findOne({
        title: { $regex: new RegExp(`^${escaped}$`, "i") },
      }).lean();
    }

    // 4. Try slug partial match
    if (!movie) {
      const escaped = decodedId.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      movie = await Movie.findOne({
        slug: { $regex: new RegExp(escaped, "i") },
      }).lean();
    }

    if (!movie) {
      const suggestions = await Movie.find({})
        .select("title slug thumbnail")
        .limit(4)
        .lean();

      return NextResponse.json(
        {
          success: false,
          message: `Movie "${decodedId}" not found`,
          suggestions,
        },
        { status: 404 }
      );
    }

    // Ensure upcoming shows exist for this movie
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let shows = await Show.find({
      movie: (movie as any)._id,
      date: { $gte: today },
    })
      .populate("cinema", "name location address")
      .populate("screen", "name")
      .sort({ date: 1, startTime: 1 })
      .lean();

    if (shows.length === 0) {
      await ensureShowsForMovie((movie as any)._id);
      shows = await Show.find({
        movie: (movie as any)._id,
        date: { $gte: today },
      })
        .populate("cinema", "name location address")
        .populate("screen", "name")
        .sort({ date: 1, startTime: 1 })
        .lean();
    }

    return NextResponse.json({
      success: true,
      movie,
      shows,
    });
  } catch (error) {
    console.error("GET_MOVIE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const updated = await Movie.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie updated successfully",
      movie: updated,
    });
  } catch (error) {
    console.error("UPDATE_MOVIE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update movie" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;
    await connectDB();

    const deleted = await Movie.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Movie not found" },
        { status: 404 }
      );
    }

    // Clean up any shows for this movie
    await Show.deleteMany({ movie: id });

    return NextResponse.json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_MOVIE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete movie" },
      { status: 500 }
    );
  }
}

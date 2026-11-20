import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Show, { IShowSeat } from "@/models/Show";
import Screen from "@/models/Screen";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const movieId = searchParams.get("movie");
    const cinemaId = searchParams.get("cinema");
    const dateStr = searchParams.get("date");

    const filter: Record<string, any> = {};
    if (movieId) filter.movie = movieId;
    if (cinemaId) filter.cinema = cinemaId;
    if (dateStr) {
      const d = new Date(dateStr);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const shows = await Show.find(filter)
      .populate("movie", "title slug thumbnail duration genre rating status")
      .populate("cinema", "name location address")
      .populate("screen", "name")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    console.error("GET_SHOWS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch shows" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { movieId, cinemaId, screenId, date, startTime, endTime, regularPrice = 250, premiumPrice = 450 } = body;

    if (!movieId || !cinemaId || !screenId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "All show parameters are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch the screen to construct show seats
    const screen = await Screen.findById(screenId);
    let seats: IShowSeat[] = [];

    if (screen && screen.seats && screen.seats.length > 0) {
      seats = screen.seats.map((s) => ({
        row: s.row,
        number: s.number,
        type: s.type,
        price: s.type === "premium" ? Number(premiumPrice) : Number(regularPrice),
        status: "available",
      } as IShowSeat));
    } else {
      // Default 70-seat layout
      const rows = ["A", "B", "C", "D", "E", "F", "G"];
      rows.forEach((row, rIdx) => {
        const isPremium = rIdx >= 5;
        for (let num = 1; num <= 10; num++) {
          seats.push({
            row,
            number: num,
            type: isPremium ? "premium" : "regular",
            price: isPremium ? Number(premiumPrice) : Number(regularPrice),
            status: "available",
          } as IShowSeat);
        }
      });
    }

    const showDate = new Date(date);
    const dateOnly = new Date(showDate.getFullYear(), showDate.getMonth(), showDate.getDate());

    const newShow = await Show.create({
      movie: movieId,
      cinema: cinemaId,
      screen: screenId,
      date: dateOnly,
      startTime,
      endTime,
      seats,
    });

    const populatedShow = await Show.findById(newShow._id)
      .populate("movie", "title")
      .populate("cinema", "name")
      .populate("screen", "name");

    return NextResponse.json({
      success: true,
      message: "Showtime scheduled successfully",
      show: populatedShow,
    }, { status: 201 });
  } catch (error) {
    console.error("CREATE_SHOW_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create showtime: " + (error instanceof Error ? error.message : "") },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Show ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await Show.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Showtime deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_SHOW_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete showtime" },
      { status: 500 }
    );
  }
}

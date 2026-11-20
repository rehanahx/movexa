import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Show from "@/models/Show";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";
import Screen from "@/models/Screen";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const show = await Show.findById(id)
      .populate("movie")
      .populate("cinema")
      .populate("screen")
      .lean();

    if (!show) {
      return NextResponse.json(
        { success: false, message: "Showtime not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      show,
    });
  } catch (error) {
    console.error("GET_SHOW_ID_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch showtime details" },
      { status: 500 }
    );
  }
}

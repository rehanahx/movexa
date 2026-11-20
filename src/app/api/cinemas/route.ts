import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Cinema from "@/models/Cinema";
import Screen from "@/models/Screen";

export async function GET() {
  try {
    await connectDB();
    const cinemas = await Cinema.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // Fetch screens for each cinema
    const cinemasWithScreens = await Promise.all(
      cinemas.map(async (c) => {
        const screens = await Screen.find({ cinema: c._id }).lean();
        return {
          ...c,
          screens,
        };
      })
    );

    return NextResponse.json({
      success: true,
      cinemas: cinemasWithScreens,
    });
  } catch (error) {
    console.error("GET_CINEMAS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cinemas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, location, address, description } = body;

    if (!name || !location || !address) {
      return NextResponse.json(
        { success: false, message: "Name, location, and address are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const cinema = await Cinema.create({
      name,
      location,
      address,
      description,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      cinema,
    }, { status: 201 });
  } catch (error) {
    console.error("CREATE_CINEMA_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create cinema" },
      { status: 500 }
    );
  }
}

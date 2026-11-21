import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedDatabase";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const forceReset = url.searchParams.get("force") === "true";

    const result = await seedDatabase(forceReset);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with pristine college project data!",
      stats: {
        admin: "admin@gamil.com",
        studentDemo: "student@demo.com",
        moviesCount: result.savedMovies.length,
        showsCreated: result.createdShowsCount,
        cinemas: 2,
        screens: 2,
      },
    });
  } catch (error) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}

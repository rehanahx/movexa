import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Booking from "@/models/Booking";
import Movie from "@/models/Movie";
import User from "@/models/User";
import Show from "@/models/Show";

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const [totalBookings, activeMovies, totalUsers, bookings] = await Promise.all([
      Booking.countDocuments(),
      Movie.countDocuments({ status: "now_showing" }),
      User.countDocuments({ role: "user" }),
      Booking.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    // Calculate total revenue from confirmed bookings
    const confirmedBookings = await Booking.find({
      bookingStatus: "confirmed",
    }).lean();

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    // Calculate today's bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const totalShows = await Show.countDocuments();

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        todaysBookingsCount,
        activeMovies,
        totalCustomers: totalUsers,
        totalShows,
      },
      recentBookings: bookings,
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}

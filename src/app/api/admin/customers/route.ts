import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Booking from "@/models/Booking";

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdmin(request);
    if (authError) return authError;

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    const filter: Record<string, any> = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();

    // Attach booking stats for each customer
    const customersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingsCount = await Booking.countDocuments({ user: u._id });
        const userBookings = await Booking.find({ user: u._id, bookingStatus: "confirmed" }).lean();
        const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          bookingsCount,
          totalSpent,
        };
      })
    );

    return NextResponse.json({
      success: true,
      customers: customersWithStats,
    });
  } catch (error) {
    console.error("ADMIN_CUSTOMERS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer directory" },
      { status: 500 }
    );
  }
}

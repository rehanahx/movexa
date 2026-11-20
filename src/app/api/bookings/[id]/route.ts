import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth";
import Booking from "@/models/Booking";
import Show from "@/models/Show";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id)
      .populate("show")
      .populate("user", "name email")
      .lean();

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    // Permission check: owner or admin
    if (auth.role !== "admin" && (booking.user as any)?._id?.toString() !== auth.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("GET_BOOKING_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch booking details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { bookingStatus } = body;

    await connectDB();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (auth.role !== "admin" && booking.user.toString() !== auth.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    // If cancelling, release the seats in Show!
    if (bookingStatus === "cancelled" && booking.bookingStatus !== "cancelled") {
      const show = await Show.findById(booking.show);
      if (show) {
        const bookedSeatKeys = new Set(
          booking.seats.map((s) => `${s.row}-${s.number}`)
        );
        show.seats.forEach((seat) => {
          if (bookedSeatKeys.has(`${seat.row}-${seat.number}`)) {
            seat.status = "available";
          }
        });
        await show.save();
      }
    }

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("PATCH_BOOKING_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

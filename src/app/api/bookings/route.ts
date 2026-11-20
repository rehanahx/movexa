import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthPayload } from "@/lib/auth";
import Booking, { IBookingSeat } from "@/models/Booking";
import Show from "@/models/Show";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const status = searchParams.get("status");

    let filter: Record<string, any> = {};

    // If regular user, only view own bookings
    if (auth.role !== "admin") {
      filter.user = auth.userId;
    } else {
      if (status && status !== "all") {
        filter.bookingStatus = status;
      }
      if (query) {
        filter.$or = [
          { bookingReference: { $regex: query, $options: "i" } },
          { customerName: { $regex: query, $options: "i" } },
          { customerEmail: { $regex: query, $options: "i" } },
          { movieTitle: { $regex: query, $options: "i" } },
        ];
      }
    }

    const bookings = await Booking.find(filter)
      .populate("show")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("GET_BOOKINGS_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Please log in to complete your ticket booking" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { showId, seats } = body;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return NextResponse.json(
        { success: false, message: "Show ID and at least one seat must be selected" },
        { status: 400 }
      );
    }

    await connectDB();

    const [user, show] = await Promise.all([
      User.findById(auth.userId),
      Show.findById(showId).populate("movie").populate("cinema"),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    if (!show) {
      return NextResponse.json(
        { success: false, message: "Selected showtime does not exist" },
        { status: 404 }
      );
    }

    // Check if any seat is already booked
    const requestedSeatKeys = new Set(
      seats.map((s: IBookingSeat) => `${s.row}-${s.number}`)
    );

    let conflictSeat = "";
    for (const seat of show.seats) {
      const key = `${seat.row}-${seat.number}`;
      if (requestedSeatKeys.has(key)) {
        if (seat.status === "booked") {
          conflictSeat = `${seat.row}${seat.number}`;
          break;
        }
      }
    }

    if (conflictSeat) {
      return NextResponse.json(
        {
          success: false,
          message: `Seat ${conflictSeat} is already reserved by another customer. Please choose different seats.`,
        },
        { status: 409 }
      );
    }

    // Atomically mark seats as booked
    let totalAmount = 0;
    const formattedBookingSeats: IBookingSeat[] = [];

    show.seats.forEach((seat) => {
      const key = `${seat.row}-${seat.number}`;
      if (requestedSeatKeys.has(key)) {
        seat.status = "booked";
        totalAmount += seat.price;
        formattedBookingSeats.push({
          row: seat.row,
          number: seat.number,
          type: seat.type,
          price: seat.price,
        });
      }
    });

    await show.save();

    // Generate unique reference e.g. MVX-491823
    const refCode = "MVX-" + Math.floor(100000 + Math.random() * 900000);

    const newBooking = await Booking.create({
      bookingReference: refCode,
      user: user._id,
      show: show._id,
      seats: formattedBookingSeats,
      totalAmount,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
      customerName: user.name,
      customerEmail: user.email,
      movieTitle: (show.movie as any)?.title || "Movie",
      cinemaName: (show.cinema as any)?.name || "Movexa Cinema",
      showDate: show.date,
      showTime: show.startTime,
    });

    return NextResponse.json({
      success: true,
      message: "Ticket booking confirmed successfully!",
      booking: newBooking,
    }, { status: 201 });
  } catch (error) {
    console.error("BOOKING_CREATE_ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process booking: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

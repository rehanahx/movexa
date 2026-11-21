import { connectDB } from "@/lib/db";
import Cinema from "@/models/Cinema";
import Screen from "@/models/Screen";
import Show from "@/models/Show";
import mongoose from "mongoose";

export function generateDefaultSeats() {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];
  const seats: { row: string; number: number; type: "regular" | "premium" }[] = [];
  rows.forEach((row, rowIndex) => {
    const isPremium = rowIndex >= 5;
    for (let num = 1; num <= 10; num++) {
      seats.push({
        row,
        number: num,
        type: isPremium ? "premium" : "regular",
      });
    }
  });
  return seats;
}

export async function ensureDefaultCinemas() {
  await connectDB();

  // 1. Cinema 1
  let cinema1 = await Cinema.findOne({ name: "Movexa Grand IMAX & Dolby" });
  if (!cinema1) {
    cinema1 = await Cinema.create({
      name: "Movexa Grand IMAX & Dolby",
      location: "Downtown City Center",
      address: "742 Evergreen Terrace, Downtown Metropolis",
      description: "Flagship 70-foot dual 4K laser projection with Dolby Atmos 128-channel spatial audio.",
      isActive: true,
    });
  }

  let screen1 = await Screen.findOne({ cinema: cinema1._id, name: "Auditorium 1 - IMAX Laser" });
  if (!screen1) {
    screen1 = await Screen.create({
      cinema: cinema1._id,
      name: "Auditorium 1 - IMAX Laser",
      seats: generateDefaultSeats(),
      isActive: true,
    });
  }

  // 2. Cinema 2
  let cinema2 = await Cinema.findOne({ name: "Movexa Royale Luxury Cinema" });
  if (!cinema2) {
    cinema2 = await Cinema.create({
      name: "Movexa Royale Luxury Cinema",
      location: "Westside Promenade",
      address: "100 Ocean Avenue, Promenade Mall, 4th Floor",
      description: "Heated motorized leather recliners with in-theater seat-side dining.",
      isActive: true,
    });
  }

  let screen2 = await Screen.findOne({ cinema: cinema2._id, name: "Auditorium 1 - Dolby VIP" });
  if (!screen2) {
    screen2 = await Screen.create({
      cinema: cinema2._id,
      name: "Auditorium 1 - Dolby VIP",
      seats: generateDefaultSeats(),
      isActive: true,
    });
  }

  return { cinema1, screen1, cinema2, screen2 };
}

export async function ensureShowsForMovie(movieId: string | mongoose.Types.ObjectId) {
  await connectDB();
  const { cinema1, screen1, cinema2, screen2 } = await ensureDefaultCinemas();

  const now = new Date();
  const dates = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
  ];

  const slots = [
    { start: "10:30 AM", end: "01:15 PM" },
    { start: "02:00 PM", end: "04:45 PM" },
    { start: "06:00 PM", end: "08:45 PM" },
    { start: "09:30 PM", end: "12:15 AM" },
  ];

  const defaultSeats = generateDefaultSeats().map((s) => ({
    row: s.row,
    number: s.number,
    type: s.type,
    price: s.type === "premium" ? 450 : 250,
    status: "available" as const,
  }));

  for (const dateOnly of dates) {
    for (let i = 0; i < 2; i++) {
      const cinema = i === 0 ? cinema1 : cinema2;
      const screen = i === 0 ? screen1 : screen2;
      const slot1 = slots[i * 2];
      const slot2 = slots[i * 2 + 1];

      for (const slot of [slot1, slot2]) {
        const existing = await Show.findOne({
          movie: movieId,
          cinema: cinema._id,
          date: dateOnly,
          startTime: slot.start,
        });

        if (!existing) {
          await Show.create({
            movie: movieId,
            cinema: cinema._id,
            screen: screen._id,
            date: dateOnly,
            startTime: slot.start,
            endTime: slot.end,
            seats: defaultSeats,
          });
        }
      }
    }
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";
import Screen from "@/models/Screen";
import Show, { IShowSeat } from "@/models/Show";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";

function generateSeatGrid(): { screenSeats: any[]; showSeats: IShowSeat[] } {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];
  const screenSeats: any[] = [];
  const showSeats: IShowSeat[] = [];

  rows.forEach((row, rowIndex) => {
    const isPremium = rowIndex >= 5; // Rows F & G are Premium
    const price = isPremium ? 450 : 250;

    for (let num = 1; num <= 10; num++) {
      screenSeats.push({
        row,
        number: num,
        type: isPremium ? "premium" : "regular",
      });

      // Pre-book random 15% of seats to make seat selection look authentic
      const isPreBooked = (rowIndex === 2 && (num === 4 || num === 5)) ||
                          (rowIndex === 4 && (num === 6 || num === 7 || num === 8)) ||
                          (rowIndex === 6 && (num === 3 || num === 4));

      showSeats.push({
        row,
        number: num,
        type: isPremium ? "premium" : "regular",
        price,
        status: isPreBooked ? "booked" : "available",
      } as IShowSeat);
    }
  });

  return { screenSeats, showSeats };
}

export async function POST(request: Request) {
  try {
    await connectDB();

    // 1. Ensure Admin User
    const adminEmail = "admin@gamil.com";
    const existingAdmin = await User.findOne({
      email: { $in: ["admin@gamil.com", "admin@gmail.com"] },
    });

    let adminUser = existingAdmin;
    if (!existingAdmin) {
      const hashed = await hashPassword("admin123");
      adminUser = await User.create({
        name: "College Project Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
    }

    // 2. Ensure Sample Student User
    const studentEmail = "student@demo.com";
    let studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
      const hashedStudent = await hashPassword("student123");
      studentUser = await User.create({
        name: "Alex Johnson",
        email: studentEmail,
        password: hashedStudent,
        role: "user",
      });
    }

    // 3. Clear existing shows, screens, cinemas, movies (or refresh)
    const url = new URL(request.url);
    const forceReset = url.searchParams.get("force") === "true";

    if (forceReset) {
      await Show.deleteMany({});
      await Screen.deleteMany({});
      await Cinema.deleteMany({});
      await Movie.deleteMany({});
      await Booking.deleteMany({});
    }

    // 4. Create Cinemas
    let cinema1 = await Cinema.findOne({ name: "Movexa Grand IMAX & Dolby" });
    if (!cinema1) {
      cinema1 = await Cinema.create({
        name: "Movexa Grand IMAX & Dolby",
        location: "Downtown City Center",
        address: "742 Evergreen Terrace, Downtown Metropolis",
        description: "State-of-the-art dual 4K laser projection with immersive Dolby Atmos 128-channel audio.",
        isActive: true,
      });
    }

    let cinema2 = await Cinema.findOne({ name: "Movexa Royale Luxury Cinema" });
    if (!cinema2) {
      cinema2 = await Cinema.create({
        name: "Movexa Royale Luxury Cinema",
        location: "Westside Promenade",
        address: "100 Ocean Avenue, Promenade Mall, 4th Floor",
        description: "Bespoke motorized leather recliners, gourmet dining service at your seat.",
        isActive: true,
      });
    }

    // 5. Create Screens
    const { screenSeats, showSeats } = generateSeatGrid();

    let screen1 = await Screen.findOne({ cinema: cinema1._id, name: "Screen 1 - IMAX Laser" });
    if (!screen1) {
      screen1 = await Screen.create({
        cinema: cinema1._id,
        name: "Screen 1 - IMAX Laser",
        seats: screenSeats,
        isActive: true,
      });
    }

    let screen2 = await Screen.findOne({ cinema: cinema2._id, name: "Screen 1 - Dolby VIP" });
    if (!screen2) {
      screen2 = await Screen.create({
        cinema: cinema2._id,
        name: "Screen 1 - Dolby VIP",
        seats: screenSeats,
        isActive: true,
      });
    }

    // 6. Seed Movies
    const seedMovies = [
      {
        title: "Dune: Part Two",
        slug: "dune-part-two",
        shortDescription: "Paul Atreides unites with Chani and the Fremen while seeking revenge against conspirators.",
        longDescription: "Dune: Part Two explores the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
        thumbnail: {
          url: "/images/dune-hero.jpg",
          publicId: "seed-dune-2",
        },
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
        genre: ["Action", "Adventure", "Sci-Fi", "Drama"],
        language: "English",
        duration: 166,
        releaseDate: new Date("2024-03-01"),
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem", "Austin Butler"],
        rating: 8.8,
        status: "now_showing" as const,
      },
      {
        title: "Oppenheimer",
        slug: "oppenheimer",
        shortDescription: "The historical story of J. Robert Oppenheimer and his role in the Manhattan Project.",
        longDescription: "Written and directed by Christopher Nolan, Oppenheimer is an IMAX-shot epic thriller that thrusts audiences into the pulse-pounding paradox of the enigmatic man who must risk destroying the world in order to save it.",
        thumbnail: {
          url: "/images/cinema-auth.jpg",
          publicId: "seed-oppenheimer",
        },
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        genre: ["Biography", "Drama", "History"],
        language: "English",
        duration: 180,
        releaseDate: new Date("2023-07-21"),
        director: "Christopher Nolan",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh"],
        rating: 8.9,
        status: "now_showing" as const,
      },
      {
        title: "Silent Frequency",
        slug: "silent-frequency",
        shortDescription: "An audio forensics investigator in a rain-soaked metropolis uncovers a secret broadcast.",
        longDescription: "Set in a sprawling cyberpunk neo-noir city, an audio specialist uncovers hidden subsonic frequencies buried inside commercial radio broadcasts that correlate with mysterious disappearances across the city skyline.",
        thumbnail: {
          url: "/images/poster-noir.jpg",
          publicId: "seed-silent-frequency",
        },
        trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        genre: ["Neo-Noir", "Mystery", "Thriller"],
        language: "English",
        duration: 136,
        releaseDate: new Date("2024-09-15"),
        director: "Marcus Vance",
        cast: ["Christian Bale", "Ana de Armas", "Woody Harrelson"],
        rating: 9.1,
        status: "now_showing" as const,
      },
      {
        title: "Astral Horizon",
        slug: "astral-horizon",
        shortDescription: "A deep-space reconnaissance crew encounters an unprecedented gravitational rift along Saturn.",
        longDescription: "Humanity's first deep space mission beyond Jupiter's gravitational field encounters an anomalous spatial gate near Saturn's outer rings. The crew must decipher an ancient extraterrestrial beacon before their vessel is pulled into the singularity.",
        thumbnail: {
          url: "/images/hero-banner.jpg",
          publicId: "seed-astral-horizon",
        },
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        genre: ["Sci-Fi", "Space Exploration", "Adventure"],
        language: "English",
        duration: 168,
        releaseDate: new Date("2024-11-10"),
        director: "Elena Rostova",
        cast: ["Matthew McConaughey", "Jessica Chastain", "Michael Caine"],
        rating: 8.9,
        status: "now_showing" as const,
      },
      {
        title: "Avatar: Fire and Ash",
        slug: "avatar-fire-and-ash",
        shortDescription: "Jake Sully and Neytiri encounter a hostile new clan of volcanic Na'vi on Pandora.",
        longDescription: "The third installment of James Cameron's visionary saga introduces the Ash People, a volcanic clan of Na'vi on Pandora whose aggressive culture clashes with the Omatikaya and Metkayina reef tribes.",
        thumbnail: {
          url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
          publicId: "seed-avatar-3",
        },
        trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
        genre: ["Action", "Adventure", "Fantasy", "Sci-Fi"],
        language: "English",
        duration: 195,
        releaseDate: new Date("2025-12-19"),
        director: "James Cameron",
        cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang"],
        rating: 9.2,
        status: "coming_soon" as const,
      },
      {
        title: "Gladiator II",
        slug: "gladiator-ii",
        shortDescription: "Lucius enters the Colosseum to restore Rome to its former glory.",
        longDescription: "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
        thumbnail: {
          url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
          publicId: "seed-gladiator-2",
        },
        trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
        genre: ["Action", "Adventure", "Drama"],
        language: "English",
        duration: 148,
        releaseDate: new Date("2024-11-22"),
        director: "Ridley Scott",
        cast: ["Paul Mescal", "Pedro Pascal", "Denzel Washington", "Connie Nielsen"],
        rating: 8.4,
        status: "now_showing" as const,
      },
    ];

    const savedMovies = [];
    for (const movData of seedMovies) {
      let existing = await Movie.findOne({ slug: movData.slug });
      if (!existing) {
        existing = await Movie.create(movData);
      }
      savedMovies.push(existing);
    }

    // 7. Seed Shows for Today, Tomorrow, and Next Day
    const dates = [
      new Date(),
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 48 * 60 * 60 * 1000),
    ];

    const timeSlots = [
      { start: "10:30 AM", end: "01:15 PM" },
      { start: "02:00 PM", end: "04:45 PM" },
      { start: "06:00 PM", end: "08:45 PM" },
      { start: "09:30 PM", end: "12:15 AM" },
    ];

    let createdShowsCount = 0;
    const nowShowingMovies = savedMovies.filter((m) => m.status === "now_showing");

    for (const d of dates) {
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      for (let i = 0; i < nowShowingMovies.length; i++) {
        const movie = nowShowingMovies[i];
        // Assign screen 1 or 2
        const screen = i % 2 === 0 ? screen1 : screen2;
        const cinema = i % 2 === 0 ? cinema1 : cinema2;

        const slot = timeSlots[i % timeSlots.length];

        const existingShow = await Show.findOne({
          movie: movie._id,
          cinema: cinema._id,
          date: dateOnly,
          startTime: slot.start,
        });

        if (!existingShow) {
          const { showSeats: freshSeats } = generateSeatGrid();
          await Show.create({
            movie: movie._id,
            cinema: cinema._id,
            screen: screen._id,
            date: dateOnly,
            startTime: slot.start,
            endTime: slot.end,
            seats: freshSeats,
          });
          createdShowsCount++;
        }
      }
    }

    // 8. Create Sample Booking for Alex Johnson / demo
    const sampleShow = await Show.findOne({}).populate("movie").populate("cinema");
    if (sampleShow && studentUser) {
      const existingBooking = await Booking.findOne({ user: studentUser._id });
      if (!existingBooking) {
        const bookingRef = "MVX-" + Math.floor(100000 + Math.random() * 900000);
        await Booking.create({
          bookingReference: bookingRef,
          user: studentUser._id,
          show: sampleShow._id,
          seats: [
            { row: "C", number: 4, type: "regular", price: 250 },
            { row: "C", number: 5, type: "regular", price: 250 },
          ],
          totalAmount: 500,
          bookingStatus: "confirmed",
          paymentStatus: "paid",
          customerName: studentUser.name,
          customerEmail: studentUser.email,
          movieTitle: (sampleShow.movie as any)?.title || "Dune: Part Two",
          cinemaName: (sampleShow.cinema as any)?.name || "Movexa Grand IMAX",
          showDate: sampleShow.date,
          showTime: sampleShow.startTime,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with pristine college project data!",
      stats: {
        admin: adminEmail,
        studentDemo: studentEmail,
        moviesCount: savedMovies.length,
        showsCreated: createdShowsCount,
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

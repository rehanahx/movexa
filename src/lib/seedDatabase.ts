import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Cinema from "@/models/Cinema";
import Screen from "@/models/Screen";
import Show, { IShowSeat } from "@/models/Show";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";
import { ensureDefaultCinemas, generateDefaultSeats } from "@/lib/cinemas";

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
      const isPreBooked =
        (rowIndex === 2 && (num === 4 || num === 5)) ||
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

export const SEED_MOVIES_DATA = [
  {
    title: "Dune: Part Two",
    slug: "dune-part-two",
    shortDescription:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against conspirators.",
    longDescription:
      "Dune: Part Two explores the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    thumbnail: {
      url: "/images/dune-hero.jpg",
      publicId: "seed-dune-2",
    },
    bannerImage: {
      url: "/images/dune-hero.jpg",
      publicId: "seed-dune-2-banner",
    },
    isFeatured: true,
    tagline: "NOW SHOWING IN IMAX 70MM",
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
    shortDescription:
      "The historical story of J. Robert Oppenheimer and his role in the Manhattan Project.",
    longDescription:
      "Written and directed by Christopher Nolan, Oppenheimer is an IMAX-shot epic thriller that thrusts audiences into the pulse-pounding paradox of the enigmatic man who must risk destroying the world in order to save it.",
    thumbnail: {
      url: "/images/cinema-auth.jpg",
      publicId: "seed-oppenheimer",
    },
    bannerImage: {
      url: "/images/cinema-auth.jpg",
      publicId: "seed-oppenheimer-banner",
    },
    isFeatured: true,
    tagline: "SPECIAL 4K LASER SCREENING",
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
    shortDescription:
      "An audio forensics investigator in a rain-soaked metropolis uncovers a secret broadcast.",
    longDescription:
      "Set in a sprawling cyberpunk neo-noir city, an audio specialist uncovers hidden subsonic frequencies buried inside commercial radio broadcasts that correlate with mysterious disappearances across the city skyline.",
    thumbnail: {
      url: "/images/poster-noir.jpg",
      publicId: "seed-silent-frequency",
    },
    bannerImage: {
      url: "/images/poster-noir.jpg",
      publicId: "seed-silent-frequency-banner",
    },
    isFeatured: true,
    tagline: "PREMIERE SELECTION",
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
    shortDescription:
      "A deep-space reconnaissance crew encounters an unprecedented gravitational rift along Saturn.",
    longDescription:
      "Humanity's first deep space mission beyond Jupiter's gravitational field encounters an anomalous spatial gate near Saturn's outer rings. The crew must decipher an ancient extraterrestrial beacon before their vessel is pulled into the singularity.",
    thumbnail: {
      url: "/images/hero-banner.jpg",
      publicId: "seed-astral-horizon",
    },
    bannerImage: {
      url: "/images/hero-banner.jpg",
      publicId: "seed-astral-horizon-banner",
    },
    isFeatured: true,
    tagline: "INTERSTELLAR JOURNEY",
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
    shortDescription:
      "Jake Sully and Neytiri encounter a hostile new clan of volcanic Na'vi on Pandora.",
    longDescription:
      "The third installment of James Cameron's visionary saga introduces the Ash People, a volcanic clan of Na'vi on Pandora whose aggressive culture clashes with the Omatikaya and Metkayina reef tribes.",
    thumbnail: {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      publicId: "seed-avatar-3",
    },
    bannerImage: {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      publicId: "seed-avatar-3-banner",
    },
    isFeatured: false,
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
    shortDescription:
      "Lucius enters the Colosseum to restore Rome to its former glory.",
    longDescription:
      "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    thumbnail: {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      publicId: "seed-gladiator-2",
    },
    bannerImage: {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      publicId: "seed-gladiator-2-banner",
    },
    isFeatured: false,
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

export async function seedDatabase(forceReset = false) {
  await connectDB();

  // 1. Ensure Admin User
  const adminEmail = "admin@gamil.com";
  let existingAdmin = await User.findOne({
    email: { $in: ["admin@gamil.com", "admin@gmail.com"] },
  });

  if (!existingAdmin) {
    const hashed = await hashPassword("admin123");
    await User.create({
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

  if (forceReset) {
    await Show.deleteMany({});
    await Screen.deleteMany({});
    await Cinema.deleteMany({});
    await Movie.deleteMany({});
    await Booking.deleteMany({});
  }

  // 3. Ensure Default Cinemas & Screens
  const { cinema1, screen1, cinema2, screen2 } = await ensureDefaultCinemas();

  // 4. Upsert Movies
  const savedMovies = [];
  for (const movData of SEED_MOVIES_DATA) {
    let existing = await Movie.findOne({ slug: movData.slug });
    if (!existing) {
      existing = await Movie.create(movData);
    } else {
      // Sync featured flags
      existing.isFeatured = movData.isFeatured;
      existing.tagline = movData.tagline;
      existing.bannerImage = movData.bannerImage;
      await existing.save();
    }
    savedMovies.push(existing);
  }

  // 5. Ensure Shows for Today and Next 3 Days
  const now = new Date();
  const dates = [
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
  ];

  const timeSlots = [
    { start: "10:30 AM", end: "01:15 PM" },
    { start: "02:00 PM", end: "04:45 PM" },
    { start: "06:00 PM", end: "08:45 PM" },
    { start: "09:30 PM", end: "12:15 AM" },
  ];

  let createdShowsCount = 0;
  const nowShowingMovies = savedMovies.filter((m) => m.status === "now_showing");

  for (const dateOnly of dates) {
    for (let i = 0; i < nowShowingMovies.length; i++) {
      const movie = nowShowingMovies[i];
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

  return {
    savedMovies,
    createdShowsCount,
  };
}

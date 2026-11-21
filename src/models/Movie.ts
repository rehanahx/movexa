import mongoose, { Schema, Model, Document } from "mongoose";

export type MovieStatus = "now_showing" | "coming_soon" | "ended";

export interface IMovie {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;

  thumbnail: {
    url: string;
    publicId: string;
  };

  // Optional widescreen hero banner image for featured movies
  bannerImage?: {
    url: string;
    publicId?: string;
  } | null;

  // Toggle whether this movie appears in the primary hero banner carousel
  isFeatured?: boolean;

  // Custom banner tagline e.g. "NOW SHOWING IN IMAX 70MM"
  tagline?: string | null;

  trailerUrl?: string | null;

  genre: string[];
  language: string;
  duration: number;

  releaseDate: Date;

  director?: string | null;
  cast: string[];

  rating?: number | null;
  status: MovieStatus;

  createdAt: Date;
  updatedAt: Date;
}

const movieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 200,
      trim: true,
    },
    longDescription: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1000,
      trim: true,
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    bannerImage: {
      url: {
        type: String,
        required: false,
      },
      publicId: {
        type: String,
        required: false,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    tagline: {
      type: String,
      required: false,
      trim: true,
    },
    trailerUrl: {
      type: String,
      required: false,
    },
    genre: {
      type: [String],
      required: true,
      validate: {
        validator: function (value: string[]) {
          return value.length > 0;
        },
        message: "At least one genre is required.",
      },
    },
    language: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    director: {
      type: String,
      required: false,
    },
    cast: {
      type: [String],
      required: true,
      validate: {
        validator: function (value: string[]) {
          return value.length > 0;
        },
        message: "At least one cast member is required.",
      },
    },
    rating: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ["now_showing", "coming_soon", "ended"],
      default: "coming_soon",
    },
  },
  { timestamps: true }
);

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;

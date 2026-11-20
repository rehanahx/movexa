import mongoose, { Schema, Document, Model } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface IBookingSeat {
  row: string;
  number: number;
  type?: "regular" | "premium";
  price: number;
}

export interface IBooking extends Document {
  bookingReference: string;
  user: mongoose.Types.ObjectId;
  show: mongoose.Types.ObjectId;
  seats: IBookingSeat[];
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  customerName?: string;
  customerEmail?: string;
  movieTitle?: string;
  cinemaName?: string;
  showDate?: Date;
  showTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSeatSchema = new Schema<IBookingSeat>(
  {
    row: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["regular", "premium"],
      default: "regular",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: {
      type: [bookingSeatSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid",
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    movieTitle: {
      type: String,
    },
    cinemaName: {
      type: String,
    },
    showDate: {
      type: Date,
    },
    showTime: {
      type: String,
    },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;

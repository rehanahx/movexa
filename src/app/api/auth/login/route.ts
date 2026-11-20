import { NextResponse } from "next/server";
import type { LoginInput } from "@/types/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, hashPassword } from "@/lib/password";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body: LoginInput = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    await connectDB();

    // Special handler for requested admin mock credentials:
    // email: admin@gamil.com (or admin@gmail.com) and pass: admin123
    const isAdminMock =
      (cleanEmail === "admin@gamil.com" || cleanEmail === "admin@gmail.com") &&
      password === "admin123";

    if (isAdminMock) {
      let adminUser = await User.findOne({
        email: { $in: ["admin@gamil.com", "admin@gmail.com"] },
      }).select("+password");

      if (!adminUser) {
        const hashedPassword = await hashPassword("admin123");
        adminUser = await User.create({
          name: "System Administrator",
          email: "admin@gamil.com",
          password: hashedPassword,
          role: "admin",
        });
      } else {
        // Ensure role is admin
        if (adminUser.role !== "admin") {
          adminUser.role = "admin";
          await adminUser.save();
        }
      }

      const token = createToken({
        userId: adminUser._id.toString(),
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        message: "Administrator login successful",
        user: {
          id: adminUser._id.toString(),
          name: adminUser.name,
          email: adminUser.email,
          role: "admin",
        },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // Standard user login
    const user = await User.findOne({
      email: cleanEmail,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const token = createToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during login",
      },
      { status: 500 }
    );
  }
}

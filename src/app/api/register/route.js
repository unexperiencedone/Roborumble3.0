import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    await connectDB();

    // Check if leader email is already registered
    const existingUser = await User.findOne({ "leader.email": body.leader.email });
    if (existingUser) {
      return NextResponse.json({ message: "Leader email already registered!" }, { status: 400 });
    }

    // Save registration to MongoDB
    const newUser = await User.create(body);

    return NextResponse.json({
      message: "Registration Successful!",
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ message: "Internal Server Err" }, { status: 500 });
  }
}
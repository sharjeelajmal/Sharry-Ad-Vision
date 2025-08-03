import mongooseConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await mongooseConnect();
    const { email, password } = await req.json();

    // Check karein ke kya pehle se koi admin mojood hai
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return NextResponse.json(
        { message: "An admin account already exists. Registration is closed." },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ email, password: hashedPassword });

    return NextResponse.json({ message: "Admin registered." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the admin." },
      { status: 500 }
    );
  }
}

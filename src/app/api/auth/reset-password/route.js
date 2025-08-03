import mongooseConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await mongooseConnect();
    const { token, password } = await req.json();

    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check karein ke token expire to nahi hua
    });

    if (!admin) {
      return NextResponse.json({ message: "Password reset token is invalid or has expired." }, { status: 400 });
    }

    // Naya password set karein
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}

import mongooseConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { transporter, mailOptions } from "@/lib/nodemailer";

export async function POST(req) {
  try {
    await mongooseConnect();
    const { email } = await req.json();

    const admin = await Admin.findOne({ email });

    // Agar admin nahi milta, tab bhi success message bhejein taake koi email check na kar sake
    if (!admin) {
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });
    }

    // Reset token generate karein
    const token = crypto.randomBytes(32).toString("hex");
    admin.resetPasswordToken = token;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 ghante ke liye valid
    await admin.save();

    // Reset URL banayein
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

    // Email bhejein
    await transporter.sendMail({
      ...mailOptions,
      to: admin.email,
      subject: "Password Reset Request for Your Admin Panel",
      html: `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste it into your browser to complete the process:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    });

    return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}

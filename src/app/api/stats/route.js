// src/app/api/stats/route.js
import { NextResponse } from "next/server";
import mongooseConnect from '@/lib/mongodb';
import Stat from '@/models/Stat';



export async function GET() {
  try {
    let stats = await Stat.find({});
await mongooseConnect();
    // Agar stats nahi hain, to default bhejein, lekin DB mein insert na karein
    if (stats.length === 0) {
      console.log("No stats found in DB, returning default stats.");
      return NextResponse.json([
        { label: "Users", value: "4123" },
        { label: "Orders", value: "112306" },
        { label: "Designs Delivered", value: "850" },
        { label: "Websites Built", value: "220" }
      ]);
    }
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/stats Error:", error);
    return NextResponse.json(
      { error: "Error reading stats data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
await mongooseConnect();
    const newStats = await request.json();

    if (!Array.isArray(newStats)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of stat objects.' },
        { status: 400 }
      );
    }

    // Delete all existing stats and insert the new ones
    // This is a common approach for managing a fixed set of "stats"
    await Stat.deleteMany({});
    const savedStats = await Stat.insertMany(newStats);

    return NextResponse.json(savedStats, { status: 201 });
  } catch (error) {
    console.error("POST /api/stats Error:", error);
    return NextResponse.json(
      { error: "Error saving stats", details: error.message },
      { status: 500 }
    );
  }
}
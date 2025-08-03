import { NextResponse } from "next/server";
import mongooseConnect from '@/lib/mongodb';
import Stat from '@/models/Stat';

export async function GET() {
  try {
    await mongooseConnect();
    let stats = await Stat.find({});
    if (stats.length === 0) {
      return NextResponse.json([
        { label: "Users", value: "4123" },
        { label: "Orders", value: "112306" },
        { label: "Designs Delivered", value: "850" },
        { label: "Websites Built", value: "220" }
      ]);
    }
    return NextResponse.json(stats);
  } catch (error) {
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
    await Stat.deleteMany({});
    const savedStats = await Stat.insertMany(newStats);

    // ▼▼▼ YEH LINE ADD KI GAYI HAI ▼▼▼
    if (request.socket?.server?.io) {
        request.socket.server.io.emit('serviceUpdate');
    }

    return NextResponse.json(savedStats, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error saving stats", details: error.message },
      { status: 500 }
    );
  }
}

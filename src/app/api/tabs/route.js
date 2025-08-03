import { NextResponse } from "next/server";
import mongooseConnect from '@/lib/mongodb';
import Tab from '@/models/Tab';

export const revalidate = 3600; 

export async function GET() {
  try {
    await mongooseConnect();
    let tabs = await Tab.find({}).sort({ createdAt: 1 });
    if (tabs.length === 0) {
      const defaultTabNames = ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
      const defaultTabs = defaultTabNames.map(name => ({ name }));
      await Tab.insertMany(defaultTabs);
      tabs = await Tab.find({}).sort({ createdAt: 1 });
    }
    return NextResponse.json(tabs.map(tab => tab.name));
  } catch (error) {
    console.error("GET /api/tabs Error:", error);
    return NextResponse.json(
      { error: "Error reading tabs data", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await mongooseConnect();
    const newTabNames = await request.json();
    if (!Array.isArray(newTabNames)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of tab names (strings).' },
        { status: 400 }
      );
    }
    const tabsToSave = newTabNames.map(name => ({ name: String(name).trim() }));
    await Tab.deleteMany({});
    const savedTabs = await Tab.insertMany(tabsToSave);

    // ▼▼▼ YEH LINE ADD KI GAYI HAI ▼▼▼
    if (request.socket?.server?.io) {
      request.socket.server.io.emit('serviceUpdate');
    }

    return NextResponse.json(savedTabs.map(tab => tab.name), { status: 201 });
  } catch (error) {
    console.error("POST /api/tabs Error:", error);
    return NextResponse.json(
      { error: "Error saving tabs", details: error.message },
      { status: 500 }
    );
  }
}

// src/app/api/tabs/route.js
import { NextResponse } from "next/server";
import mongooseConnect from '@/lib/mongodb';
import Tab from '@/models/Tab';

// Database se ek baar connect karein jab module load ho
mongooseConnect();

export async function GET() {
  try {
    let tabs = await Tab.find({}).sort({ createdAt: 1 });

    // Agar database mein koi tabs nahi hain, to default tabs return karein
    // Isse live request ke dauran database write operation se bacha ja sakta hai
    if (tabs.length === 0) {
      console.log("No tabs found in DB, returning default tabs.");
      const defaultTabNames = ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
      return NextResponse.json(defaultTabNames);
    }
    
    // Frontend ko sirf names ka array chahiye, isliye map karein
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
    // Yahan se mongooseConnect() call hata di gayi hai
    const newTabNames = await request.json();

    if (!Array.isArray(newTabNames)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of tab names (strings).' },
        { status: 400 }
      );
    }

    const tabsToSave = newTabNames.map(name => ({ name: String(name).trim() }));

    // Pehle se mojood sabhi tabs ko delete karein aur naye wale daalein
    await Tab.deleteMany({});
    const savedTabs = await Tab.insertMany(tabsToSave);

    // Frontend ko sirf names ka array return karein
    return NextResponse.json(savedTabs.map(tab => tab.name), { status: 201 });
  } catch (error)
   {
    console.error("POST /api/tabs Error:", error);
    return NextResponse.json(
      { error: "Error saving tabs", details: error.message },
      { status: 500 }
    );
  }
}

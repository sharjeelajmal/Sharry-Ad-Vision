// src/app/api/tabs/route.js
import { NextResponse } from "next/server";
import mongooseConnect from '@/lib/mongodb'; // Corrected import
import Tab from '@/models/Tab'; // Corrected model path

export async function GET() {
  try {
    await mongooseConnect(); // Call the function directly
    let tabs = await Tab.find({}).sort({ createdAt: 1 }); // Sort by creation to maintain a logical order

    // Agar database mein koi tabs nahi hain, to default tabs insert karo
    if (tabs.length === 0) {
      const defaultTabNames = ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
      const defaultTabs = defaultTabNames.map(name => ({ name }));
      await Tab.insertMany(defaultTabs);
      tabs = await Tab.find({}).sort({ createdAt: 1 }); // Insert karne ke baad dobara fetch karo
    }
    // Frontend expects an array of strings, so map accordingly
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
    await mongooseConnect(); // Call the function directly
    const newTabNames = await request.json();

    if (!Array.isArray(newTabNames)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of tab names (strings).' },
        { status: 400 }
      );
    }

    // Convert string names to objects for the schema
    const tabsToSave = newTabNames.map(name => ({ name: String(name).trim() }));

    // Delete all existing tabs and insert the new ones
    await Tab.deleteMany({});
    const savedTabs = await Tab.insertMany(tabsToSave);

    // Frontend expects an array of strings, so map accordingly
    return NextResponse.json(savedTabs.map(tab => tab.name), { status: 201 });
  } catch (error) {
    console.error("POST /api/tabs Error:", error);
    return NextResponse.json(
      { error: "Error saving tabs", details: error.message },
      { status: 500 }
    );
  }
}
// src/app/api/alerts/route.js
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb'; // Corrected import
import Alert from '@/models/Alert'; // Corrected model path

// Connect to the database once when the module loads
mongooseConnect();

export async function GET() {
  try {
  
    // Get the latest alert. If multiple alerts can exist, you might need to adjust logic.
    // For a single persistent alert, findOne is suitable.
    const alert = await Alert.findOne().sort({ updatedAt: -1 });

    if (!alert) {
      // Agar koi alert nahi hai, toh default data ke saath response do
      return NextResponse.json(null);
    }
    return NextResponse.json(alert);
  } catch (error) {
    console.error('GET /api/alerts Error:', error);
    return NextResponse.json(
      { error: 'Failed to load alert', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
   
    const alertData = await request.json();

    // Validate incoming data
    if (!alertData.title || !alertData.message) {
      return NextResponse.json(
        { error: 'Title and message are required for the alert.' },
        { status: 400 }
      );
    }

    // Upsert the alert: find one and update it, or create if not found.
    // This ensures there's typically only one "active" alert configuration.
    const updatedAlert = await Alert.findOneAndUpdate(
      {}, // Filter: find any document
      { ...alertData }, // Update data
      {
        new: true, // Return the updated document
        upsert: true, // Create if no document matches
        runValidators: true, // Run schema validators
      }
    );

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('POST /api/alerts Error:', error);
    return NextResponse.json(
      { error: 'Failed to save alert', details: error.message },
      { status: 500 }
    );
  }
}
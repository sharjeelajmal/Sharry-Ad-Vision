import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Alert from '@/models/Alert';

export async function GET() {
  try {
    await mongooseConnect();
    const alert = await Alert.findOne().sort({ updatedAt: -1 });
    return NextResponse.json(alert); // Agar alert nahi hai to null jayega
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
    await mongooseConnect();
    const alertData = await request.json();
    if (!alertData.title || !alertData.message) {
      return NextResponse.json(
        { error: 'Title and message are required for the alert.' },
        { status: 400 }
      );
    }

    const updatedAlert = await Alert.findOneAndUpdate(
      {}, 
      { ...alertData },
      { new: true, upsert: true, runValidators: true }
    );

    // Socket event bhejein
    if (request.socket?.server?.io) {
        request.socket.server.io.emit('serviceUpdate');
    }

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('POST /api/alerts Error:', error);
    return NextResponse.json(
      { error: 'Failed to save alert', details: error.message },
      { status: 500 }
    );
  }
}

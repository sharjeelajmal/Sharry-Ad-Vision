import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Service from '@/models/Service';

export async function POST(request) {
  try {
    await mongooseConnect();
    const orderedServices = await request.json();

    if (!Array.isArray(orderedServices)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of service order objects.' },
        { status: 400 }
      );
    }

    const operations = orderedServices.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { orderIndex: item.orderIndex } }
      }
    }));

    if (operations.length > 0) {
        await Service.bulkWrite(operations);
    }

    // ▼▼▼ YEH LINE ADD KI GAYI HAI ▼▼▼
    if (request.socket?.server?.io) {
        request.socket.server.io.emit('serviceUpdate');
    }
    
    const updatedServices = await Service.find({}).sort({ orderIndex: 1, createdAt: -1 });
    return NextResponse.json(updatedServices, { status: 200 });
    
  } catch (error) {
    console.error('POST /api/services/reorder Error:', error);
    return NextResponse.json(
      { error: 'Failed to save service order', details: error.message },
      { status: 500 }
    );
  }
}

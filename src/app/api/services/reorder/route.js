// src/app/api/services/reorder/route.js
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import mongoose from 'mongoose';



export async function POST(request) {
  try {
await mongooseConnect();
    const orderedServices = await request.json(); // Array of { id: 'serviceId', orderIndex: 0 }

    if (!Array.isArray(orderedServices)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of service order objects.' },
        { status: 400 }
      );
    }

    // Create bulk operations to update orderIndex for all services
    const operations = orderedServices.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { orderIndex: item.orderIndex } }
      }
    }));

    await Service.bulkWrite(operations); // Efficiently update multiple documents

    // Optionally, return the newly ordered services from the database
    // This fetches all services again, sorted by the new orderIndex
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
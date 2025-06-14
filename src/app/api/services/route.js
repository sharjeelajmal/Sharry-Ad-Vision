// src/app/api/services/route.js
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb'; // Corrected import
import Service from '@/models/Service';
import mongoose from 'mongoose';

// Helper function to handle errors
function handleError(error, message) {
  console.error(message, error);
  return NextResponse.json(
    {
      error: message,
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    { status: 500 }
  );
}

// GET all services
export async function GET() {
  try {
    console.log('[GET /api/services] Connecting to MongoDB...');
    await mongooseConnect(); // Call the function directly
    console.log('[GET /api/services] Fetching services...');

    const services = await Service.find().sort({ createdAt: -1 });
    console.log(`[GET /api/services] Found ${services.length} services`);

    return NextResponse.json(services);
  } catch (error) {
    console.error('[GET /api/services] Error:', error);
    return handleError(error, 'Error fetching services');
  }
}

// CREATE new service
export async function POST(request) {
  try {
    console.log('[POST /api/services] Connecting to MongoDB...');
    await mongooseConnect(); // Call the function directly

    const body = await request.json();
    console.log('[POST /api/services] Request body:', body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error('[POST /api/services] Missing fields:', missingFields);
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    console.log('[POST /api/services] Creating new service...');
    const newService = new Service(body);
    const savedService = await newService.save();
    console.log('[POST /api/services] Service created:', savedService._id);

    return NextResponse.json(savedService, { status: 201 });
  } catch (error) {
    console.error('[POST /api/services] Error:', error);
    return handleError(error, 'Error creating service');
  }
}

// UPDATE existing service
export async function PUT(request) {
  try {
    await mongooseConnect(); // Call the function directly

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updateData = await request.json();

    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid service ID format' },
        { status: 400 }
      );
    }

    // Convert price to number if it exists
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
      if (isNaN(updateData.price)) {
        return NextResponse.json(
          { error: 'Price must be a valid number' },
          { status: 400 }
        );
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedService);

  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      {
        error: error.message,
        details: error.errors || undefined
      },
      { status: 400 }
    );
  }
}
// DELETE service
export async function DELETE(request) {
  try {
    console.log('[DELETE /api/services] Connecting to MongoDB...');
    await mongooseConnect(); // Call the function directly

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log(`[DELETE /api/services] Deleting service: ${id}`);

    if (!id) {
      console.error('[DELETE /api/services] Missing service ID');
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      console.error(`[DELETE /api/services] Service not found: ${id}`);
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    console.log(`[DELETE /api/services] Service deleted: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/services] Error:', error);
    return handleError(error, 'Error deleting service');
  }
}
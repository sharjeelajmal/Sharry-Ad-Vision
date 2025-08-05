import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import mongoose from 'mongoose';
import { pusher } from '@/lib/pusher';

function handleError(error, message) {
  console.error(message, error);
  return NextResponse.json({
    error: message,
    details: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  }, { status: 500 });
}

export async function GET(request) {
  try {
    await mongooseConnect();
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');
    const category = searchParams.get('category');
    let query = {};
    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }
    if (category && category.toLowerCase() !== 'all' && category !== 'undefined') {
      if (category.toLowerCase() === 'offers') {
        query.title = { $regex: 'offer', $options: 'i' };
      } else {
        query.category = new RegExp(category, 'i');
      }
    }
    const services = await Service.find(query).sort({ orderIndex: 1, createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    return handleError(error, 'Error fetching services');
  }
}

export async function POST(request) {
  try {
    await mongooseConnect();
    const body = await request.json();
    const requiredFields = ['title', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json({ error: 'Missing required fields', missingFields }, { status: 400 });
    }
    const latestService = await Service.findOne().sort({ orderIndex: -1 });
    const newOrderIndex = latestService ? latestService.orderIndex + 1 : 0;
    const newService = new Service({ ...body, orderIndex: newOrderIndex });
    const savedService = await newService.save();
    
    // Pusher event trigger karein
    await pusher.trigger('updates-channel', 'service-update', { message: 'Service added' });

    return NextResponse.json(savedService, { status: 201 });
  } catch (error) {
    return handleError(error, 'Error creating service');
  }
}

export async function PUT(request) {
  try {
    await mongooseConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updateData = await request.json();
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid service ID format' }, { status: 400 });
    }
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
      if (isNaN(updateData.price)) {
        return NextResponse.json({ error: 'Price must be a valid number' }, { status: 400 });
      }
    }
    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Pusher event trigger karein
    await pusher.trigger('updates-channel', 'service-update', { message: 'Service updated' });

    return NextResponse.json(updatedService);
  } catch (error) {
    return NextResponse.json({ error: error.message, details: error.errors || undefined }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    await mongooseConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Pusher event trigger karein
    await pusher.trigger('updates-channel', 'service-update', { message: 'Service deleted' });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, 'Error deleting service');
  }
}
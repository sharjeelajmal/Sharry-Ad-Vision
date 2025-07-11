// src/app/api/currencies/route.js
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb'; // Corrected im
// port
import Currency from '@/models/Currency'; // Already correct

// Connect to the database once when the module loads
mongooseConnect();

export async function GET() {
  try {

    const currencies = await Currency.find({}).sort({ code: 1 });
    return NextResponse.json(currencies);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {

    const currencyData = await request.json();

    // Basic validation
    if (!Array.isArray(currencyData)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of currencies.' },
        { status: 400 }
      );
    }

    // Delete all existing currencies
    await Currency.deleteMany({});

    // Insert new currencies with validation
    const savedCurrencies = await Currency.insertMany(
      currencyData.map(c => ({
        code: String(c.code).toUpperCase().substring(0, 3),
        name: String(c.name),
        symbol: String(c.symbol || c.code),
        rate: parseFloat(c.rate) || 0
      }))
    );

    return NextResponse.json(savedCurrencies);
  } catch (error) {
    console.error('POST Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}
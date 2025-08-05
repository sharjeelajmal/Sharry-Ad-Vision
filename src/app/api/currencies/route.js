import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Currency from '@/models/Currency';
import { pusher } from '@/lib/pusher';

export const revalidate = 3600;

export async function GET() {
  try {
    await mongooseConnect();
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
    await mongooseConnect();
    const currencyData = await request.json();

    if (!Array.isArray(currencyData)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of currencies.' },
        { status: 400 }
      );
    }

    await Currency.deleteMany({});
    const savedCurrencies = await Currency.insertMany(
      currencyData.map(c => ({
        code: String(c.code).toUpperCase().substring(0, 3),
        name: String(c.name),
        symbol: String(c.symbol || c.code),
        rate: parseFloat(c.rate) || 0
      }))
    );

    // Pusher event trigger karein
    await pusher.trigger('updates-channel', 'service-update', { message: 'Currencies updated' });

    return NextResponse.json(savedCurrencies);
  } catch (error) {
    console.error('POST Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Database operation failed' },
      { status: 500 }
    );
  }
}
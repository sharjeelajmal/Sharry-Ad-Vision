import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    await mongooseConnect();
    const settings = await Setting.find({});
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await mongooseConnect();
    const body = await request.json();
    const operations = Object.keys(body).map(key => ({
      updateOne: {
        filter: { key },
        update: { $set: { value: body[key] } },
        upsert: true,
      },
    }));
    if (operations.length > 0) {
      await Setting.bulkWrite(operations);
    }
    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
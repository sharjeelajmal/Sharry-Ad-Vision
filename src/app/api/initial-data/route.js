// src/app/api/initial-data/route.js
import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import Tab from '@/models/Tab';
import Currency from '@/models/Currency';
import Setting from '@/models/Setting';
import Media from '@/models/Media';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await mongooseConnect();

    const [services, tabs, currencies, settings, gallery] = await Promise.all([
      Service.find({}).sort({ orderIndex: 1, createdAt: -1 }).lean(),
      Tab.find({}).sort({ createdAt: 1 }).lean(),
      Currency.find({}).sort({ createdAt: 1 }).lean(),
      Setting.find({}).lean(),
      Media.find({}).sort({ createdAt: -1 }).lean()
    ]);

    const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    return NextResponse.json({
      services: services || [],
      tabs: tabs.map(t => t.name) || [],
      currencies: currencies || [],
      settings: settingsMap || {},
      gallery: gallery || [],
    });

  } catch (error) {
    console.error('[GET /api/initial-data] Error:', error);
    return NextResponse.json(
      { error: 'Initial data fetch karne mein error', details: error.message },
      { status: 500 }
    );
  }
}
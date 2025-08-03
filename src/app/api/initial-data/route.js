import { NextResponse } from 'next/server';
import mongooseConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import Tab from '@/models/Tab';
import Currency from '@/models/Currency';
import Setting from '@/models/Setting';
import Media from '@/models/Media';
import Stat from '@/models/Stat'; // <-- YEH IMPORT ADD KIYA GAYA HAI

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await mongooseConnect();

    // ▼▼▼ STATS KO BHI FETCH KIYA JA RAHA HAI ▼▼▼
    const [services, tabs, currencies, settings, gallery, stats] = await Promise.all([
      Service.find({}).sort({ orderIndex: 1, createdAt: -1 }).lean(),
      Tab.find({}).sort({ createdAt: 1 }).lean(),
      Currency.find({}).sort({ createdAt: 1 }).lean(),
      Setting.find({}).lean(),
      Media.find({}).sort({ createdAt: -1 }).lean(),
      Stat.find({}).lean() // <-- YEH LINE ADD KI GAYI HAI
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
      stats: stats || [], // <-- STATS KO RESPONSE MEIN ADD KIYA GAYA HAI
    });

  } catch (error) {
    console.error('[GET /api/initial-data] Error:', error);
    return NextResponse.json(
      { error: 'Initial data fetch karne mein error', details: error.message },
      { status: 500 }
    );
  }
}

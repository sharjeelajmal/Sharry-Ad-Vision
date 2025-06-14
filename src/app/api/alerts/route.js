import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'alerts.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(filePath))) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(null);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load alert" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const alertData = await request.json();
    fs.writeFileSync(filePath, JSON.stringify(alertData, null, 2));
    return NextResponse.json(alertData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save alert" },
      { status: 500 }
    );
  }
}
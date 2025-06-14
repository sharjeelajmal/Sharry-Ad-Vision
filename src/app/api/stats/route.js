import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataFilePath = path.join(process.cwd(), 'data', 'stats.json');

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default stats if file doesn't exist
    return [
      { id: 1, label: "Users", value: "4123" },
      { id: 2, label: "Orders", value: "112306" },
      { id: 3, label: "Designs Delivered", value: "850" },
      { id: 4, label: "Websites Built", value: "220" }
    ];
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Error reading stats data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newStats = await request.json();
    await writeData(newStats);
    return NextResponse.json(newStats, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error saving stats" },
      { status: 500 }
    );
  }
}
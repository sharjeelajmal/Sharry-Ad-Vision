import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataFilePath = path.join(process.cwd(), 'data', 'tabs.json');

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default tabs if file doesn't exist
    return ["Tiktok", "Youtube", "Facebook", "Instagram", "X-Twitter", "Whatsapp", "Website Development", "Graphics Designing", "Offers"];
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
      { error: "Error reading tabs data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newTabs = await request.json();
    await writeData(newTabs);
    return NextResponse.json(newTabs, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error saving tabs" },
      { status: 500 }
    );
  }
}
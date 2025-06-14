import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'currencies.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    const defaultData = [
      { code: "PKR", name: "Pakistani Rupee", symbol: "₨", rate: 1 },
      { code: "USD", name: "US Dollar", symbol: "$", rate: 0.0036 },
      { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 0.30 }
    ];
    
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch (error) {
      // If file doesn't exist, create it with default data
      await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2));
      return NextResponse.json(defaultData);
    }
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { error: "Error reading currencies data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureDataDir();
    const newCurrencies = await request.json();
    
    // Validate currencies
    const validCurrencies = newCurrencies.filter(currency => 
      currency?.code && currency?.name && currency?.symbol && !isNaN(currency?.rate)
    );
    
    await fs.writeFile(dataFilePath, JSON.stringify(validCurrencies, null, 2));
    return NextResponse.json(validCurrencies, { status: 201 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Error saving currencies" },
      { status: 500 }
    );
  }
}
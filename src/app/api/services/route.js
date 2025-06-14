import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const dataDir = path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'services.json');

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
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      return NextResponse.json(JSON.parse(data));
    } catch (error) {
      // Return empty array if file doesn't exist
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error in GET:", error);
    return NextResponse.json(
      { error: "Error reading services data" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await ensureDataDir();
    const newService = await request.json();
    let services = [];
    
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      services = JSON.parse(data);
    } catch (error) {
      console.log("Creating new services file");
    }

    // Generate ID for new service
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    const serviceToAdd = { ...newService, id: newId };
    
    await fs.writeFile(dataFilePath, JSON.stringify([...services, serviceToAdd], null, 2));
    return NextResponse.json(serviceToAdd, { status: 201 });
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Error saving service" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await ensureDataDir();
    const updatedService = await request.json();
    let services = [];
    
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      services = JSON.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: "No services found to update" },
        { status: 404 }
      );
    }

    const index = services.findIndex(s => s.id === updatedService.id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    services[index] = updatedService;
    await fs.writeFile(dataFilePath, JSON.stringify(services, null, 2));
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { error: "Error updating service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    
    await ensureDataDir();
    let services = [];
    
    try {
      const data = await fs.readFile(dataFilePath, 'utf8');
      services = JSON.parse(data);
    } catch (error) {
      return NextResponse.json(
        { error: "No services found" },
        { status: 404 }
      );
    }

    const filteredServices = services.filter(service => service.id !== id);
    if (services.length === filteredServices.length) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    await fs.writeFile(dataFilePath, JSON.stringify(filteredServices, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      { error: "Error deleting service" },
      { status: 500 }
    );
  }
}
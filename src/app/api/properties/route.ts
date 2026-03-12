import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "properties.json");

interface PropertyInput {
  title: string;
  address: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  description: string;
  splatUrl: string;
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  features: string[];
}

async function getProperties() {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveProperties(properties: PropertyInput[]) {
  const dir = path.dirname(DATA_FILE);
  await mkdir(dir, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(properties, null, 2));
}

export async function GET() {
  const properties = await getProperties();
  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  try {
    const body: PropertyInput = await request.json();

    if (!body.title || !body.address || !body.splatUrl) {
      return NextResponse.json(
        { error: "Title, address, and splat URL are required" },
        { status: 400 }
      );
    }

    const properties = await getProperties();
    const id = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newProperty = {
      id: `${id}-${Date.now()}`,
      ...body,
      thumbnailUrl: "",
      createdAt: new Date().toISOString().split("T")[0],
    };

    properties.unshift(newProperty);
    await saveProperties(properties);

    return NextResponse.json({ success: true, property: newProperty });
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

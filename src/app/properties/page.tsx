import { getAllProperties, Property } from "@/lib/properties";
import PropertyCard from "@/components/PropertyCard";
import { Search } from "lucide-react";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Properties | SplatView",
  description: "Explore immersive 3D property tours",
};

async function getAll(): Promise<Property[]> {
  const demo = getAllProperties();

  // Also load user-uploaded properties
  try {
    const dataFile = path.join(process.cwd(), "data", "properties.json");
    const data = await readFile(dataFile, "utf-8");
    const uploaded: Property[] = JSON.parse(data);
    return [...uploaded, ...demo];
  } catch {
    return demo;
  }
}

export default async function PropertiesPage() {
  const properties = await getAll();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Properties</h1>
          <p className="text-zinc-400 max-w-lg">
            Walk through properties in immersive 3D. Click any listing to start
            your virtual tour.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by location, type, or price..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-3 glass rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">
              All Types
            </button>
            <button className="px-4 py-3 glass rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">
              Price Range
            </button>
            <button className="px-4 py-3 glass rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">
              Bedrooms
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-24">
            <p className="text-zinc-500 text-lg">No properties yet.</p>
            <p className="text-zinc-600 text-sm mt-2">
              Be the first to upload a 3D tour!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

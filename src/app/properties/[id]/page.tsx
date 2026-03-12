import { notFound } from "next/navigation";
import { getProperty, getAllProperties, Property } from "@/lib/properties";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Phone,
  Mail,
  Share2,
  Heart,
  Calendar,
  Check,
} from "lucide-react";
import PropertyTourViewer from "@/components/PropertyTourViewer";
import { readFile } from "fs/promises";
import path from "path";

// Make this page dynamic so it can serve uploaded properties
export const dynamic = "force-dynamic";

async function findProperty(id: string): Promise<Property | undefined> {
  // Check demo properties first
  const demo = getProperty(id);
  if (demo) return demo;

  // Check user-uploaded properties
  try {
    const dataFile = path.join(process.cwd(), "data", "properties.json");
    const data = await readFile(dataFile, "utf-8");
    const properties: Property[] = JSON.parse(data);
    return properties.find((p) => p.id === id);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await findProperty(id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.title} | SplatView`,
    description: property.description,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await findProperty(id);
  if (!property) notFound();

  return (
    <div className="min-h-screen pt-20">
      {/* 3D Viewer - full width */}
      <div className="w-full h-[60vh] lg:h-[70vh] bg-zinc-900">
        <PropertyTourViewer splatUrl={property.splatUrl} />
      </div>

      {/* Property Details */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex items-center gap-1 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.address}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 glass rounded-lg hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 glass rounded-lg hover:bg-white/10 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price & Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <p className="text-3xl font-bold text-blue-400">
                {property.price}
              </p>
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4" />
                  <span className="text-sm">
                    {property.bedrooms} Bedrooms
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4" />
                  <span className="text-sm">
                    {property.bathrooms} Bathrooms
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Square className="w-4 h-4" />
                  <span className="text-sm">
                    {property.sqft.toLocaleString()} sqft
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">About this property</h2>
              <p className="text-zinc-400 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Agent Card */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Listing Agent
              </h3>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                  {property.agent.name?.[0] || "A"}
                </div>
                <div>
                  <p className="font-semibold">{property.agent.name || "Agent"}</p>
                  <p className="text-xs text-zinc-500">SplatView Agent</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {property.agent.phone && (
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {property.agent.phone}
                  </a>
                )}
                {property.agent.email && (
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {property.agent.email}
                  </a>
                )}
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors mb-3">
                Contact Agent
              </button>
              <button className="w-full py-3 glass hover:bg-white/10 font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Viewing
              </button>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-zinc-600">
                  Listed on {property.createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

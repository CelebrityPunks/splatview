import Link from "next/link";
import { Bed, Bath, Square, MapPin, Eye } from "lucide-react";
import { Property } from "@/lib/properties";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
        {/* Thumbnail / Preview */}
        <div className="relative h-52 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                Click to explore 3D tour
              </p>
            </div>
          </div>
          {/* Price badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-sm font-semibold text-white">
              {property.price}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mb-4">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" />
            <p className="text-sm text-zinc-500">{property.address}</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4" />
              <span>{property.sqft.toLocaleString()} sqft</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

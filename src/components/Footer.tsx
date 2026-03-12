import { Box } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Box className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold">
                Splat<span className="text-blue-500">View</span>
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-md">
              Immersive 3D property tours powered by Gaussian Splatting.
              Capture with your phone, share with the world.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/properties"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Browse Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Upload Tour
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-zinc-500">hello@splatview.com</li>
              <li className="text-sm text-zinc-500">(555) 000-0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} SplatView. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

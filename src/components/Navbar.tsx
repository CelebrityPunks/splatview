"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Box } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Box className="w-7 h-7 text-blue-500" />
            <span className="text-xl font-bold tracking-tight">
              Splat<span className="text-blue-500">View</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/properties"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Properties
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/upload"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Upload Tour
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/properties"
              className="block text-sm text-zinc-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Properties
            </Link>
            <Link
              href="/pricing"
              className="block text-sm text-zinc-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/upload"
              className="block text-sm text-zinc-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Upload Tour
            </Link>
            <Link
              href="/upload"
              className="block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

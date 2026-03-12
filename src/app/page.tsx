import Link from "next/link";
import {
  Smartphone,
  Upload,
  Eye,
  Share2,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  Box,
  Camera,
  Monitor,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-zinc-400">
              Powered by Gaussian Splatting Technology
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Sell homes faster with{" "}
            <span className="gradient-text">immersive 3D tours</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Capture any property with your phone. Instantly create photorealistic
            3D walkthroughs that let buyers explore every room as if they were
            really there.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/upload"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all animate-pulse-glow"
            >
              Create Your First Tour
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/properties"
              className="flex items-center gap-2 px-8 py-4 glass hover:bg-white/10 font-medium rounded-xl transition-colors"
            >
              View Demo Tours
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-white">10x</p>
              <p className="text-xs text-zinc-500 mt-1">More engagement</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Free</p>
              <p className="text-xs text-zinc-500 mt-1">To get started</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5 min</p>
              <p className="text-xs text-zinc-500 mt-1">Setup time</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              From phone scan to shareable 3D tour in three simple steps. No
              expensive equipment. No technical skills needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass rounded-2xl p-8 relative group hover:border-blue-500/30 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Smartphone className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Scan the property</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Walk through the property recording with{" "}
                <strong className="text-zinc-300">Scaniverse</strong> (free
                app, no account needed). Just walk around slowly — your phone does the rest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass rounded-2xl p-8 relative group hover:border-purple-500/30 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Upload className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload the scan</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Export the <strong className="text-zinc-300">.PLY file</strong>{" "}
                from the app and upload it here. Add property details, photos,
                and your contact info.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass rounded-2xl p-8 relative group hover:border-pink-500/30 transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                <Share2 className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Share the tour</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Get a shareable link. Buyers can walk through the property in
                first person from{" "}
                <strong className="text-zinc-300">any device</strong> — phone,
                tablet, or desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why agents choose SplatView
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Listings with 3D tours get 10x more engagement and sell faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Eye className="w-5 h-5 text-blue-400" />}
              title="Photorealistic Quality"
              description="Gaussian splatting creates stunningly realistic 3D environments — far beyond traditional 360 photos or virtual tours."
            />
            <FeatureCard
              icon={<Camera className="w-5 h-5 text-purple-400" />}
              title="Phone Capture"
              description="No expensive cameras or drones. Any modern smartphone with the free Scaniverse app creates professional-quality scans."
            />
            <FeatureCard
              icon={<Monitor className="w-5 h-5 text-pink-400" />}
              title="Works Everywhere"
              description="Tours load fast on any device — desktop, tablet, or mobile. No app downloads needed for viewers."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              title="Lightning Fast"
              description="Progressive loading means buyers start exploring immediately. No waiting for massive files to download."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5 text-green-400" />}
              title="Easy Sharing"
              description="One link is all you need. Share on MLS, social media, email — embed on your website with a simple code snippet."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5 text-cyan-400" />}
              title="Your Branding"
              description="Custom branded tour pages with your logo, contact info, and listing details. White-label available."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <Box className="w-12 h-12 text-blue-500 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to transform your listings?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Join the future of real estate marketing. Create your first 3D
                tour today — it&apos;s free to start.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-xl p-6 hover:border-white/20 transition-all">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

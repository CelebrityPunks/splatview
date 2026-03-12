import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing | SplatView",
  description: "Simple, transparent pricing for 3D property tours",
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for trying out 3D tours on a single listing.",
    features: [
      "1 active property tour",
      "Up to 500MB scan file",
      "Shareable link",
      "Mobile-friendly viewer",
      "SplatView branding",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For active agents with multiple listings.",
    features: [
      "Up to 15 active tours",
      "Up to 2GB scan files",
      "Custom branding",
      "Analytics dashboard",
      "Priority processing",
      "Embed on your website",
      "No SplatView branding",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: "$149",
    period: "/month",
    description: "For brokerages and teams.",
    features: [
      "Unlimited tours",
      "Up to 5GB scan files",
      "White-label solution",
      "Team accounts",
      "API access",
      "Custom domain",
      "Priority support",
      "Bulk upload",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Start free. Upgrade when you need more tours, bigger files, or your
            own branding.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 relative ${
                plan.highlight
                  ? "bg-gradient-to-b from-blue-500/10 to-purple-500/10 border border-blue-500/30"
                  : "glass"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-zinc-500">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-zinc-500 mb-6">{plan.description}</p>

              <Link
                href="/upload"
                className={`block text-center py-3 rounded-xl font-medium transition-colors mb-8 ${
                  plan.highlight
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FaqItem
              q="What equipment do I need?"
              a="Just a modern smartphone. We recommend the free Scaniverse app to capture your scans. iPhones with LiDAR (iPhone 12 Pro and newer) produce the best results, but any recent smartphone works."
            />
            <FaqItem
              q="How long does a property scan take?"
              a="A typical home scan takes 15-30 minutes. Walk through each room slowly, capturing all angles. The app handles the rest."
            />
            <FaqItem
              q="What file formats are supported?"
              a="We support .PLY and .SPLAT files — the standard formats exported by Scaniverse and other 3D scanning apps."
            />
            <FaqItem
              q="Can buyers view tours on their phone?"
              a="Yes! Tours work on any modern device — desktop, tablet, or mobile. No app download required. Just open the link and start exploring."
            />
            <FaqItem
              q="Can I embed tours on my website?"
              a="Pro and Agency plans include an embed code you can drop into any website — WordPress, Squarespace, Wix, or custom HTML."
            />
            <FaqItem
              q="How is this different from Matterport?"
              a="Matterport requires a $3,000+ camera and monthly subscription. SplatView uses free smartphone apps and produces more photorealistic results using Gaussian Splatting technology."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="glass rounded-xl group">
      <summary className="px-6 py-4 cursor-pointer flex items-center justify-between">
        <span className="font-medium text-sm">{q}</span>
        <ArrowRight className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-90" />
      </summary>
      <div className="px-6 pb-4">
        <p className="text-sm text-zinc-400 leading-relaxed">{a}</p>
      </div>
    </details>
  );
}

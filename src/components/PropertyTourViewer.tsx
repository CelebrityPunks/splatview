"use client";

import dynamic from "next/dynamic";

const SplatViewer = dynamic(() => import("@/components/SplatViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function PropertyTourViewer({ splatUrl }: { splatUrl: string }) {
  return <SplatViewer splatUrl={splatUrl} className="w-full h-full" />;
}

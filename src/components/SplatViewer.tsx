"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RotateCcw, Move, Info } from "lucide-react";

interface SplatViewerProps {
  splatUrl: string;
  className?: string;
}

export default function SplatViewer({ splatUrl, className = "" }: SplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    async function initViewer() {
      try {
        const THREE = await import("three");
        const GaussianSplats3D = await import("@mkkellogg/gaussian-splats-3d");

        if (cancelled || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const viewer = new GaussianSplats3D.Viewer({
          renderer,
          cameraUp: [0, -1, 0],
          initialCameraPosition: [0, -2, 6],
          initialCameraLookAt: [0, 0, 0],
          dynamicScene: false,
          selfDrivenMode: true,
        });

        viewerRef.current = viewer;

        // Simulate loading progress for demo
        const progressInterval = setInterval(() => {
          setLoadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 15;
          });
        }, 200);

        await viewer.addSplatScene(splatUrl, {
          showLoadingUI: false,
          progressiveLoad: true,
        });

        clearInterval(progressInterval);
        setLoadProgress(100);

        if (!cancelled) {
          setIsLoading(false);
          viewer.start();
        }

        // Handle resize
        const handleResize = () => {
          if (container) {
            renderer.setSize(container.clientWidth, container.clientHeight);
          }
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        if (!cancelled) {
          console.error("Splat viewer error:", err);
          setError(
            "Could not load 3D tour. Please ensure a .ply or .splat file is available."
          );
          setIsLoading(false);
        }
      }
    }

    initViewer();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        try {
          (viewerRef.current as { dispose?: () => void }).dispose?.();
        } catch {
          // ignore cleanup errors
        }
      }
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        if (canvas) canvas.remove();
      }
    };
  }, [splatUrl]);

  useEffect(() => {
    // Auto-hide controls after 5 seconds
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-zinc-900 rounded-xl overflow-hidden ${className}`}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900">
          <div className="w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div
              className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
            />
          </div>
          <p className="text-sm text-zinc-400 mb-2">Loading 3D Tour...</p>
          <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">{Math.round(loadProgress)}%</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900 p-8">
          <div className="w-20 h-20 mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
            <Move className="w-8 h-8 text-zinc-500" />
          </div>
          <p className="text-zinc-400 text-center mb-2">3D Tour Preview</p>
          <p className="text-xs text-zinc-600 text-center max-w-sm">
            Upload a .ply or .splat file captured with Polycam or Scaniverse to
            see the interactive 3D walkthrough here.
          </p>
        </div>
      )}

      {/* Controls overlay */}
      {!isLoading && !error && (
        <div
          className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={toggleFullscreen}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Controls hint */}
      {!isLoading && !error && (
        <div
          className={`absolute bottom-4 left-4 z-20 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="glass rounded-lg px-3 py-2 flex items-center gap-2">
            <Info className="w-3 h-3 text-zinc-400" />
            <p className="text-xs text-zinc-400">
              Click & drag to orbit / Scroll to zoom / Right-click to pan
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

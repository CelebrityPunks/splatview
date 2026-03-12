"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileUp,
  X,
  Plus,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  Video,
  Loader2,
} from "lucide-react";

type UploadMode = "video" | "splat";

export default function UploadPage() {
  const [mode, setMode] = useState<UploadMode>("video");
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState("");
  const [processingJobId, setProcessingJobId] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    description: "",
    agentName: "",
    agentPhone: "",
    agentEmail: "",
    features: [""],
  });

  // Poll for processing status
  useEffect(() => {
    if (!processingJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/process/status?id=${processingJobId}`);
        const data = await res.json();
        if (data.status === "complete") {
          clearInterval(interval);
          setProcessingStatus("complete");
          // Create the property listing with the generated splat
          const propertyRes = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              address: formData.address,
              price: formData.price,
              bedrooms: Number(formData.bedrooms) || 0,
              bathrooms: Number(formData.bathrooms) || 0,
              sqft: Number(formData.sqft.replace(/,/g, "")) || 0,
              description: formData.description,
              splatUrl: data.splatUrl,
              agent: {
                name: formData.agentName,
                phone: formData.agentPhone,
                email: formData.agentEmail,
              },
              features: formData.features.filter((f) => f.trim() !== ""),
            }),
          });
          if (propertyRes.ok) {
            const propertyData = await propertyRes.json();
            setCreatedPropertyId(propertyData.property.id);
          }
          setUploadComplete(true);
          setIsUploading(false);
        }
      } catch {
        // Keep polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [processingJobId, formData]);

  const acceptedTypes = mode === "video"
    ? ".mp4,.mov,.avi,.mkv,.webm"
    : ".ply,.splat";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      if (mode === "video") {
        // Video mode: upload and start processing
        const fileForm = new FormData();
        fileForm.append("video", file);
        fileForm.append("title", formData.title);

        const res = await fetch("/api/process", {
          method: "POST",
          body: fileForm,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setProcessingJobId(data.jobId);
        setProcessingStatus("processing");
        // Don't set isUploading to false — polling will handle it
      } else {
        // Splat mode: direct upload
        const fileForm = new FormData();
        fileForm.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();

        const propertyRes = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            address: formData.address,
            price: formData.price,
            bedrooms: Number(formData.bedrooms) || 0,
            bathrooms: Number(formData.bathrooms) || 0,
            sqft: Number(formData.sqft.replace(/,/g, "")) || 0,
            description: formData.description,
            splatUrl: uploadData.url,
            agent: {
              name: formData.agentName,
              phone: formData.agentPhone,
              email: formData.agentEmail,
            },
            features: formData.features.filter((f) => f.trim() !== ""),
          }),
        });

        if (!propertyRes.ok) throw new Error("Failed to create property");

        const propertyData = await propertyRes.json();
        setCreatedPropertyId(propertyData.property.id);
        setUploadComplete(true);
        setIsUploading(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setUploadComplete(false);
    setStep(1);
    setFile(null);
    setProcessingJobId("");
    setProcessingStatus("");
    setCreatedPropertyId("");
    setFormData({
      title: "", address: "", price: "", bedrooms: "", bathrooms: "",
      sqft: "", description: "", agentName: "", agentPhone: "",
      agentEmail: "", features: [""],
    });
  };

  // Processing state
  if (processingStatus === "processing" && !uploadComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Processing Your Tour</h1>
          <p className="text-zinc-400 mb-4">
            We&apos;re generating your 3D gaussian splat from the video. This typically takes 10-30 minutes depending on the video length.
          </p>
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-500">Status</span>
              <span className="text-blue-400">Processing...</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Job ID</span>
              <span className="text-zinc-400 font-mono text-xs">{processingJobId}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            You can close this page. The tour will appear in Properties when ready.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (uploadComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Tour Created!</h1>
          <p className="text-zinc-400 mb-8">
            Your 3D property tour is live and ready to share.
          </p>
          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-xs text-zinc-500 mb-1">Shareable Link</p>
            <a
              href={`/properties/${createdPropertyId}`}
              className="text-sm text-blue-400 font-mono hover:underline"
            >
              splatview.com/properties/{createdPropertyId || "new-listing"}
            </a>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Upload Another
            </button>
            <a
              href={createdPropertyId ? `/properties/${createdPropertyId}` : "/properties"}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center"
            >
              View Tour
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a 3D Tour</h1>
          <p className="text-zinc-400">
            Upload a video walkthrough and we&apos;ll generate an interactive 3D tour automatically.
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setMode("video"); setFile(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              mode === "video"
                ? "bg-blue-600 text-white"
                : "glass text-zinc-400 hover:text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            Upload Video
          </button>
          <button
            onClick={() => { setMode("splat"); setFile(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              mode === "splat"
                ? "bg-blue-600 text-white"
                : "glass text-zinc-400 hover:text-white"
            }`}
          >
            <FileUp className="w-4 h-4" />
            Upload .PLY / .SPLAT
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? "bg-blue-600 text-white" : "bg-white/5 text-zinc-600"
                }`}
              >
                {s}
              </div>
              <span className={`text-sm hidden sm:inline ${step >= s ? "text-white" : "text-zinc-600"}`}>
                {s === 1 ? (mode === "video" ? "Upload Video" : "Upload Scan") : s === 2 ? "Property Details" : "Agent Info"}
              </span>
              {s < 3 && (
                <div className={`flex-1 h-px ${step > s ? "bg-blue-600" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div>
            {/* Instructions */}
            <div className="glass rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">
                    {mode === "video" ? "How to capture a video" : "How to capture"}
                  </h3>
                  {mode === "video" ? (
                    <ol className="text-sm text-zinc-400 space-y-1">
                      <li>1. Open your phone&apos;s camera app</li>
                      <li>2. Walk through the property <strong className="text-zinc-300">slowly and steadily</strong></li>
                      <li>3. Cover every room — move in smooth arcs, avoid shaky movements</li>
                      <li>4. Good lighting is key — turn on all the lights</li>
                      <li>5. Upload the video below — we handle the rest</li>
                    </ol>
                  ) : (
                    <ol className="text-sm text-zinc-400 space-y-1">
                      <li>1. Scan with <strong className="text-zinc-300">Scaniverse</strong>{" "}or similar app</li>
                      <li>2. Export as <strong className="text-zinc-300">.PLY</strong> file</li>
                      <li>3. Upload the file below</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-500/5"
                  : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div>
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="font-semibold text-green-400 mb-1">{file.name}</p>
                  <p className="text-sm text-zinc-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-3 text-xs text-zinc-500 hover:text-white underline"
                  >
                    Remove and choose different file
                  </button>
                </div>
              ) : (
                <div>
                  {mode === "video" ? (
                    <Video className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  ) : (
                    <FileUp className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  )}
                  <p className="font-medium mb-1">
                    {mode === "video"
                      ? "Drop your video file here"
                      : "Drop your .PLY or .SPLAT file here"}
                  </p>
                  <p className="text-sm text-zinc-500">or click to browse your files</p>
                  <p className="text-xs text-zinc-600 mt-3">
                    {mode === "video"
                      ? "Supports MP4, MOV, AVI, MKV, WEBM up to 2GB"
                      : "Supports .ply and .splat formats up to 500MB"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!file}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl transition-colors"
              >
                Next: Property Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Property Title</label>
                <input type="text" value={formData.title} onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g. Modern Downtown Loft"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Address</label>
                <input type="text" value={formData.address} onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="Full property address"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Price</label>
                <input type="text" value={formData.price} onChange={(e) => updateForm("price", e.target.value)}
                  placeholder="$500,000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Square Feet</label>
                <input type="text" value={formData.sqft} onChange={(e) => updateForm("sqft", e.target.value)}
                  placeholder="2,000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bedrooms</label>
                <input type="number" value={formData.bedrooms} onChange={(e) => updateForm("bedrooms", e.target.value)}
                  placeholder="3"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bathrooms</label>
                <input type="number" value={formData.bathrooms} onChange={(e) => updateForm("bathrooms", e.target.value)}
                  placeholder="2"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe the property..." rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 resize-none" />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Features</label>
              <div className="space-y-2">
                {formData.features.map((feature, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={feature} onChange={(e) => updateFeature(i, e.target.value)}
                      placeholder="e.g. Hardwood floors"
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
                    {formData.features.length > 1 && (
                      <button onClick={() => removeFeature(i)}
                        className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addFeature}
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add feature
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)}
                className="px-6 py-3 glass hover:bg-white/10 font-medium rounded-xl transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={!formData.title || !formData.address}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-xl transition-colors">
                Next: Agent Info
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Agent Info */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Agent Name</label>
                <input type="text" value={formData.agentName} onChange={(e) => updateForm("agentName", e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input type="tel" value={formData.agentPhone} onChange={(e) => updateForm("agentPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input type="email" value={formData.agentEmail} onChange={(e) => updateForm("agentEmail", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">{mode === "video" ? "Video" : "Scan File"}</p>
                  <p className="text-zinc-300">{file?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Title</p>
                  <p className="text-zinc-300">{formData.title || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Address</p>
                  <p className="text-zinc-300">{formData.address || "—"}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Price</p>
                  <p className="text-zinc-300">{formData.price || "—"}</p>
                </div>
              </div>
              {mode === "video" && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-zinc-500">
                    Your video will be processed into a 3D gaussian splat. This takes ~10-30 minutes.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)}
                className="px-6 py-3 glass hover:bg-white/10 font-medium rounded-xl transition-colors">
                Back
              </button>
              <button onClick={handleSubmit} disabled={isUploading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium rounded-xl transition-colors">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === "video" ? "Uploading Video..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {mode === "video" ? "Upload & Process" : "Create Tour"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  RefreshCw,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Check,
  ImageIcon,
} from "lucide-react";

interface ImageUploaderProps {
  label: string;
  helperText?: string;
  aspectRatio: "portrait" | "landscape"; // portrait = 2:3, landscape = 16:9
  value: { url: string; publicId?: string } | null;
  onChange: (value: { url: string; publicId: string } | null) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  label,
  helperText,
  aspectRatio,
  value,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const aspectClass =
    aspectRatio === "portrait"
      ? "aspect-[2/3] max-w-[240px]"
      : "aspect-[16/9] max-w-full";

  const recommendedSize =
    aspectRatio === "portrait" ? "Recommended 800 × 1200 (2:3)" : "Recommended 1920 × 1080 (16:9)";

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WEBP, AVIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folder",
        aspectRatio === "portrait" ? "movexa/posters" : "movexa/banners"
      );

      const res = await fetch("/api/uploads/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image.");
      }

      onChange({
        url: data.data.url,
        publicId: data.data.publicId || "upload-" + Date.now(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
      onChange({
        url: trimmed,
        publicId: "url-" + Date.now(),
      });
      setUrlInput("");
      setError(null);
    } catch {
      setError("Please enter a valid image URL (e.g. https://...)");
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 tracking-wide">
          {label}
        </label>
        <span className="text-[11px] font-mono text-slate-400">{recommendedSize}</span>
      </div>

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value?.url ? (
        /* Preview container with strict aspect ratio preservation */
        <div className="space-y-2">
          <div
            className={`relative ${aspectClass} w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group`}
          >
            <Image
              src={value.url}
              alt={label}
              fill
              className="object-cover"
              sizes={aspectRatio === "portrait" ? "240px" : "(max-width: 768px) 100vw, 800px"}
            />
            {/* Overlay action bar on hover */}
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] truncate max-w-sm">
              {value.url.startsWith("data:") ? "Image loaded (base64 data)" : value.url}
            </span>
          </div>
        </div>
      ) : (
        /* Upload / URL Dropzone */
        <div className="space-y-2">
          {/* Mode switch tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                mode === "upload"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                mode === "url"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              Paste Image URL
            </button>
          </div>

          {mode === "upload" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#ff5500] bg-orange-50/50"
                  : "border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              {isUploading ? (
                <div className="space-y-2 py-4">
                  <Loader2 size={24} className="animate-spin text-[#ff5500] mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">Uploading image...</p>
                  <p className="text-[11px] text-slate-400 font-mono">Optimizing for display</p>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      JPEG, PNG, WEBP or AVIF (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#ff5500]"
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Apply
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste any high-resolution public image URL.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

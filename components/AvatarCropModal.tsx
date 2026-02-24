"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";

type AvatarCropModalProps = {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
};

export default function AvatarCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch {
      setSaving(false);
    }
  }, [imageSrc, croppedAreaPixels, onConfirm]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div
        className="absolute inset-0"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="relative flex w-full max-w-lg flex-col rounded-lg border border-brand-black/20 bg-brand-white shadow-xl tracking-tight text-brand-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-black/10 bg-brand-tan px-4 py-3 rounded-t-lg">
          <h2 id="crop-modal-title" className="text-lg font-semibold tracking-tight text-brand-black">
            Crop profile photo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded p-1 text-brand-black/70 hover:bg-brand-black/10 hover:text-brand-black"
            aria-label="Cancel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="px-4 py-2 text-sm tracking-tight text-brand-black/80">
          Drag to reposition, then use the slider to zoom. Photo will be saved as a square (1:1) JPG, max 1024×1024.
        </p>
        <div className="relative h-[min(60vw,320px)] w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 8 },
              cropAreaStyle: { border: "2px solid var(--brand-tan, #D4C298)" },
            }}
          />
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
          <label className="text-xs font-medium tracking-tight text-brand-black">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-2 w-full accent-brand-tan"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded border border-brand-black/20 px-4 py-2 text-sm font-medium tracking-tight hover:bg-brand-black/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || !croppedAreaPixels}
              className="flex-1 rounded bg-brand-black px-4 py-2 text-sm font-semibold tracking-tight text-brand-white hover:bg-brand-black/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Use photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import Button from "@/components/ui/Button";
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: "round" | "rect";
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const safeWidth = image.width * cos + image.height * sin;
  const safeHeight = image.width * sin + image.height * cos;

  const safeCanvas = document.createElement("canvas");
  const safeCtx = safeCanvas.getContext("2d");
  if (!safeCtx) throw new Error("No 2d context");

  safeCanvas.width = safeWidth;
  safeCanvas.height = safeHeight;

  safeCtx.translate(safeWidth / 2, safeHeight / 2);
  safeCtx.rotate(radians);
  safeCtx.translate(-image.width / 2, -image.height / 2);
  safeCtx.drawImage(image, 0, 0);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    safeCanvas,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.9
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = "round",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cropError, setCropError] = useState("");

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    setCropError("");
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error("Crop failed:", e);
      setCropError("Failed to process image. Please try a different photo.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Your Photo</h3>
          <p className="text-sm text-gray-500">Drag to reposition, use the slider to zoom</p>
        </div>

        <div className="relative w-full h-72 sm:h-80 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        <div className="px-4 py-3 space-y-3 border-t border-gray-100">
          {cropError && (
            <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{cropError}</div>
          )}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-coral-500"
            />
            <ZoomIn className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Rotate
            </button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={processing || !croppedAreaPixels}
              >
                <Check className="h-4 w-4 mr-1" />
                {processing ? "Processing..." : "Apply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

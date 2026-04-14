"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type VehicleImageGalleryProps = {
  title: string;
  images: string[];
};

export default function VehicleImageGallery({
  title,
  images,
}: VehicleImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-gray-50 text-sm text-[color:var(--muted)]">
        No image uploaded
      </div>
    );
  }

  const activeImage = images[activeIndex];

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="relative overflow-hidden rounded-lg bg-gray-50">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={activeImage}
            alt={`${title} image ${activeIndex + 1}`}
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={image}
                type="button"
                aria-label={`Show image ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`relative overflow-hidden rounded-md border transition ${
                  isActive
                    ? "border-black ring-1 ring-black"
                    : "border-[color:var(--border)] hover:border-neutral-400"
                }`}
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={image}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

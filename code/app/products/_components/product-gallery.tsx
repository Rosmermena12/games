"use client";

import { useState } from "react";

import { GridIcon, SlideshowIcon } from "@/app/_components/icons";
import { ImageCarousel } from "./image-carousel";

type GalleryMode = "carousel" | "grid";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [mode, setMode] = useState<GalleryMode>("carousel");
  const [startIndex, setStartIndex] = useState(0);

  const hasMany = images.length > 1;

  /** Desde la rejilla, la miniatura elegida abre el carrusel en esa imagen. */
  function showImageInCarousel(index: number) {
    setStartIndex(index);
    setMode("carousel");
  }

  return (
    <section className="flex flex-col gap-3" aria-label={`Galería de ${title}`}>
      {hasMany ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-fg-faint">{images.length} imágenes</span>

          <button
            type="button"
            onClick={() => setMode(mode === "carousel" ? "grid" : "carousel")}
            aria-pressed={mode === "grid"}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            {mode === "carousel" ? (
              <GridIcon width={15} height={15} />
            ) : (
              <SlideshowIcon width={15} height={15} />
            )}
            {mode === "carousel" ? "Ver todas" : "Ver carrusel"}
          </button>
        </div>
      ) : null}

      {mode === "carousel" ? (
        <ImageCarousel
          images={images}
          alt={title}
          variant="detail"
          initialIndex={startIndex}
          className="aspect-[4/3] w-full"
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => showImageInCarousel(index)}
              aria-label={`Ver imagen ${index + 1} en el carrusel`}
              className="group aspect-square overflow-hidden rounded-lg bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} — imagen ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@/app/_components/icons";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  /** `card` es compacto; `detail` ocupa el ancho del modal y muestra contador. */
  variant?: "card" | "detail";
  initialIndex?: number;
  className?: string;
}

export function ImageCarousel({
  images,
  alt,
  variant = "card",
  initialIndex = 0,
  className = "",
}: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(initialIndex);

  const isDetail = variant === "detail";
  const hasMany = images.length > 1;

  const scrollToIndex = useCallback((next: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;

    if (!track) return;

    track.scrollTo({ left: track.clientWidth * next, behavior });
  }, []);

  // Coloca la vista en la imagen inicial sin animación al montar.
  useEffect(() => {
    scrollToIndex(initialIndex, "auto");
  }, [initialIndex, scrollToIndex]);

  // El índice se deriva del scroll real: así el arrastre táctil también lo actualiza.
  function handleScroll() {
    const track = trackRef.current;

    if (!track || track.clientWidth === 0) return;

    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  function go(delta: number) {
    const next = (index + delta + images.length) % images.length;

    setIndex(next);
    scrollToIndex(next);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[calc(var(--radius-card)-2px)] bg-surface-2 ${className}`}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Imágenes de ${alt}`}
      onKeyDown={(event) => {
        if (!hasMany) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
      tabIndex={0}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((src, i) => (
          <div key={src} className="h-full w-full shrink-0 snap-center">
            {/* Imágenes remotas de mock: <img> evita configurar el loader de Next. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${alt} — imagen ${i + 1} de ${images.length}`}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {hasMany ? (
        <>
          <CarouselButton side="left" onClick={() => go(-1)} isDetail={isDetail} />
          <CarouselButton side="right" onClick={() => go(1)} isDetail={isDetail} />

          {/* Contador en lugar de puntos: legible con cualquier número de imágenes. */}
          <span
            aria-live="polite"
            className={`absolute rounded-full bg-black/55 font-medium tabular-nums text-white backdrop-blur-sm ${
              isDetail
                ? "right-3 top-3 px-2.5 py-1 text-xs"
                : "bottom-2.5 right-2.5 px-2 py-0.5 text-[11px]"
            }`}
          >
            {index + 1} / {images.length}
          </span>
        </>
      ) : null}
    </div>
  );
}

function CarouselButton({
  side,
  onClick,
  isDetail,
}: {
  side: "left" | "right";
  onClick: () => void;
  isDetail: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Imagen anterior" : "Imagen siguiente"}
      className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-2" : "right-2"} inline-flex items-center justify-center rounded-full bg-white/85 text-zinc-900 shadow-sm backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        isDetail ? "size-10" : "size-8"
      }`}
    >
      {side === "left" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </button>
  );
}

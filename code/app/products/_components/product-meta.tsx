"use client";

import { CalendarIcon, PinIcon } from "@/app/_components/icons";
import { formatPublishedDate } from "@/app/_utils/format";

interface ProductMetaProps {
  category: string;
  publishedAt: string;
  location: string | null;
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-fg-muted">
      {category}
    </span>
  );
}

export function ProductMeta({ category, publishedAt, location }: ProductMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <CategoryBadge category={category} />

      <span className="inline-flex items-center gap-1.5 text-xs text-fg-faint">
        <CalendarIcon width={14} height={14} />
        <time dateTime={publishedAt}>{formatPublishedDate(publishedAt)}</time>
      </span>

      {location ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-fg-faint">
          <PinIcon width={14} height={14} />
          {location}
        </span>
      ) : null}
    </div>
  );
}
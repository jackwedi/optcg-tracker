"use client";

import React from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  isCard?: boolean;
}

export default function LeaderThumbnail({
  src,
  alt = "",
  className = "",
  isCard = false,
}: Props) {
  const isRemote = /^https?:\/\//i.test(src);
  const normalizedSrc = isRemote || src.startsWith("/") ? src : `/${src}`;

  const imageNode = (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = "/placeholder.png";
      }}
    />
  );

  if (!isCard) {
    return imageNode;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10 transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl">
      {imageNode}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_40%)]" />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  src: string;
  alt?: string;
  className?: string;
  isCard?: boolean;
}

export default function LeaderThumbnail({
  src,
  alt = '',
  className = '',
  isCard = false,
}: Props) {
  const [current, setCurrent] = useState(src.startsWith('/') ? src : `/${src}`);

  useEffect(() => {
    setCurrent(src.startsWith('/') ? src : `/${src}`);
  }, [src]);

  const imageNode = (
    // img onError is handled inside client component so server components don't receive event handlers
    // and we can safely update the src when it fails
    // eslint-disable-next-line jsx-a11y/img-redundant-alt
    <img
      src={current}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = '/leader-images/placeholder.png';
        setCurrent('/leader-images/placeholder.png');
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

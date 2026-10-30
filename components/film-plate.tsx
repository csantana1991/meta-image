"use client";

import { useState } from "react";
import Image from "next/image";
import type { Study } from "@/lib/catalog";

function rnd(seed: number) {
  let s = seed + 1;
  return () => {
    s = (s * 16807 + 11) % 2147483647;
    return (s & 2147483646) / 2147483646;
  };
}

export function FilmPlate({
  study,
  src,
  alt,
  priority = false,
}: {
  study: Study;
  src?: string;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <span className="relative block h-full w-full">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 25vw, 50vw"
          className="object-cover outline -outline-offset-1 outline-bone/10"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 320 320"
      role="img"
      aria-label={alt}
      className="h-full w-full bg-film-ink"
    >
      <PlateBody study={study} />
    </svg>
  );
}

function PlateBody({ study }: { study: Study }) {
  const rand = rnd(study.index * 97 + 13);
  const uid = study.id.replace(/[^a-z0-9]/gi, "");
  if (study.modality === "xray") return <Xray study={study} rand={rand} uid={uid} />;
  if (study.modality === "ct") return <Ct study={study} rand={rand} uid={uid} />;
  if (study.modality === "mri") return <Mri study={study} rand={rand} uid={uid} />;
  return <Pet study={study} rand={rand} uid={uid} />;
}

function Burn({ study, side }: { study: Study; side: string }) {
  return (
    <g fill="var(--color-film-hi)" opacity="0.72" fontFamily="IBM Plex Sans, sans-serif">
      <text x="18" y="36" fontSize="18" letterSpacing="1">
        {side}
      </text>
      <text x="18" y="300" fontSize="11" opacity="0.8">
        {study.id}
      </text>
      <text x="18" y="284" fontSize="10" opacity="0.55">
        {study.plane}
      </text>
    </g>
  );
}

function Xray({
  study,
  rand,
  uid,
}: {
  study: Study;
  rand: () => number;
  uid: string;
}) {
  const lung = 34 + rand() * 10;
  const shift = (rand() - 0.5) * 10;
  const ribs = [0, 1, 2, 3, 4].map((i) => {
    const y = 118 + i * 22 + rand() * 4;
    return `M78 ${y} Q160 ${y + 16} 242 ${y - 2}`;
  });
  const side = study.index % 2 === 0 ? "L" : "R";
  return (
    <g>
      <rect width="320" height="320" fill="var(--color-film-ink)" />
      <radialGradient id={`${uid}-fog`} cx="50%" cy="48%" r="58%">
        <stop offset="0%" stopColor="var(--color-film-hi)" />
        <stop offset="46%" stopColor="var(--color-film-mid)" />
        <stop offset="100%" stopColor="var(--color-film-lo)" />
      </radialGradient>
      <ellipse cx={160 + shift} cy="168" rx="124" ry="132" fill={`url(#${uid}-fog)`} />
      <ellipse cx={112 + shift} cy="156" rx={lung} ry={68 + rand() * 8} fill="var(--color-film-lo)" opacity="0.55" />
      <ellipse cx={208 + shift} cy="156" rx={lung - 2} ry={66 + rand() * 8} fill="var(--color-film-lo)" opacity="0.5" />
      <path
        d={`M${152 + shift} 88 C${160 + shift} 140 ${148 + shift} 190 ${158 + shift} 248`}
        stroke="var(--color-film-hi)"
        strokeWidth="16"
        fill="none"
        opacity="0.28"
      />
      {ribs.map((d) => (
        <path key={d} d={d} stroke="var(--color-film-hi)" strokeWidth="1.4" fill="none" opacity="0.28" />
      ))}
      <path d="M72 214 Q160 262 248 214" stroke="var(--color-film-hi)" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M64 102 Q118 78 156 112" stroke="var(--color-film-hi)" strokeWidth="2" fill="none" opacity="0.35" />
      <path d="M256 102 Q202 78 164 112" stroke="var(--color-film-hi)" strokeWidth="2" fill="none" opacity="0.35" />
      <Burn study={study} side={side} />
    </g>
  );
}

function Ct({
  study,
  rand,
  uid,
}: {
  study: Study;
  rand: () => number;
  uid: string;
}) {
  const hole = 28 + rand() * 8;
  const spin = (rand() - 0.5) * 8;
  return (
    <g>
      <rect width="320" height="320" fill="var(--color-bg)" />
      <circle cx="160" cy="160" r="132" fill="var(--color-film-ink)" stroke="var(--color-film-mid)" strokeWidth="10" />
      <ellipse
        cx="160"
        cy="160"
        rx={108 + spin}
        ry={96 - spin}
        fill="var(--color-film-lo)"
        transform={`rotate(${spin} 160 160)`}
      />
      <ellipse cx={118} cy={148} rx={hole} ry={hole * 0.72} fill="var(--color-bg)" />
      <ellipse cx={198} cy={150} rx={hole - 2} ry={hole * 0.7} fill="var(--color-bg)" />
      <circle cx="160" cy="214" r={10 + rand() * 4} fill="var(--color-film-hi)" />
      <circle cx="160" cy="198" r="5" fill="var(--color-film-mid)" opacity="0.7" />
      <text
        x="24"
        y="40"
        fill="var(--color-film-hi)"
        fontSize="11"
        fontFamily="IBM Plex Sans, sans-serif"
        opacity="0.7"
      >
        {study.plane} · {study.id}
      </text>
      <radialGradient id={`${uid}-win`} cx="50%" cy="50%" r="50%">
        <stop offset="62%" stopColor="var(--color-bg)" stopOpacity="0" />
        <stop offset="100%" stopColor="var(--color-bg)" />
      </radialGradient>
      <circle cx="160" cy="160" r="132" fill={`url(#${uid}-win)`} />
    </g>
  );
}

function Mri({
  study,
  rand,
  uid,
}: {
  study: Study;
  rand: () => number;
  uid: string;
}) {
  const tilt = (rand() - 0.5) * 12;
  const folds = [0, 1, 2, 3, 4, 5].map((i) => {
    const y = 110 + i * 18;
    const wobble = 8 + rand() * 10;
    return `M92 ${y} Q130 ${y - wobble} 160 ${y + 2} T228 ${y - rand() * 6}`;
  });
  return (
    <g>
      <rect width="320" height="320" fill="var(--color-bg)" />
      <radialGradient id={`${uid}-head`} cx="50%" cy="46%" r="60%">
        <stop offset="0%" stopColor="var(--color-film-lo)" />
        <stop offset="70%" stopColor="var(--color-film-ink)" />
        <stop offset="100%" stopColor="var(--color-bg)" />
      </radialGradient>
      <ellipse cx="160" cy="158" rx="108" ry="124" fill={`url(#${uid}-head)`} transform={`rotate(${tilt} 160 158)`} />
      <ellipse cx="160" cy="150" rx="78" ry="90" fill="none" stroke="var(--color-film-hi)" strokeWidth="3" opacity="0.35" />
      {folds.map((d) => (
        <path key={d} d={d} stroke="var(--color-film-mid)" strokeWidth="1.2" fill="none" opacity="0.7" />
      ))}
      <ellipse cx="142" cy="156" rx="10" ry="16" fill="var(--color-bg)" opacity="0.9" />
      <ellipse cx="176" cy="156" rx="10" ry="16" fill="var(--color-bg)" opacity="0.9" />
      <text
        x="20"
        y="300"
        fill="var(--color-film-hi)"
        fontSize="11"
        fontFamily="IBM Plex Sans, sans-serif"
        opacity="0.65"
      >
        {study.id}
      </text>
    </g>
  );
}

function Pet({
  study,
  rand,
  uid,
}: {
  study: Study;
  rand: () => number;
  uid: string;
}) {
  const spots = [0, 1, 2].map((i) => ({
    cx: 100 + rand() * 120,
    cy: 90 + rand() * 140,
    r: 18 + rand() * 28,
    color: i === 0 ? "var(--color-pet-r)" : i === 1 ? "var(--color-pet-y)" : "var(--color-pet-g)",
  }));
  return (
    <g>
      <rect width="320" height="320" fill="var(--color-bg)" />
      <ellipse cx="160" cy="150" rx="46" ry="58" fill="var(--color-film-ink)" />
      <rect x="128" y="190" width="64" height="78" rx="24" fill="var(--color-film-ink)" />
      {spots.map((spot, i) => (
        <g key={`${uid}-${i}`}>
          <radialGradient id={`${uid}-h${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={spot.color} />
            <stop offset="55%" stopColor="var(--color-pet-b)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-pet-b)" stopOpacity="0" />
          </radialGradient>
          <circle cx={spot.cx} cy={spot.cy} r={spot.r} fill={`url(#${uid}-h${i})`} />
        </g>
      ))}
      <g transform="translate(286 48)">
        <rect width="10" height="28" fill="var(--color-pet-r)" />
        <rect y="28" width="10" height="28" fill="var(--color-pet-y)" />
        <rect y="56" width="10" height="28" fill="var(--color-pet-g)" />
        <rect y="84" width="10" height="28" fill="var(--color-pet-b)" />
      </g>
      <text
        x="18"
        y="300"
        fill="var(--color-film-hi)"
        fontSize="11"
        fontFamily="IBM Plex Sans, sans-serif"
        opacity="0.7"
      >
        {study.id}
      </text>
    </g>
  );
}

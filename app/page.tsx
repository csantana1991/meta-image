"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Archive, type ArchiveState } from "@/components/archive";
import type { ModalityFilter } from "@/lib/catalog";

const VIEWS: ModalityFilter[] = ["all", "xray", "ct", "mri", "pet"];

function Gallery() {
  const params = useSearchParams();
  const router = useRouter();
  const viewRaw = params.get("view") ?? "all";
  const view = VIEWS.includes(viewRaw as ModalityFilter) ? (viewRaw as ModalityFilter) : "all";
  const pageNum = Number(params.get("page") ?? "1");
  const page = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;
  const q = params.get("q") ?? "";
  const study = params.get("study") || undefined;
  const state: ArchiveState = { view, page, q, study };

  return (
    <Archive
      blobBase={process.env.NEXT_PUBLIC_BLOB_BASE}
      state={state}
      onChange={(next, mode = "push") => {
        const sp = new URLSearchParams();
        if (next.view !== "all") sp.set("view", next.view);
        if (next.page > 1) sp.set("page", String(next.page));
        if (next.q) sp.set("q", next.q);
        if (next.study) sp.set("study", next.study);
        const href = sp.size ? `/?${sp.toString()}` : "/";
        if (mode === "replace") router.replace(href, { scroll: false });
        else router.push(href, { scroll: false });
      }}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg" />}>
      <Gallery />
    </Suspense>
  );
}

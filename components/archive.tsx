"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import {
  COUNTS,
  FILTERS,
  NIH_AVAILABLE,
  TOTAL,
  blobUrlFor,
  displayBlobUrl,
  findById,
  loadPage,
  type ModalityFilter,
  type Study,
} from "@/lib/catalog";
import { FilmPlate } from "@/components/film-plate";

export type ArchiveState = {
  view: ModalityFilter;
  page: number;
  q: string;
  study?: string;
};

export function Archive({
  blobBase,
  state,
  onChange,
}: {
  blobBase?: string;
  state: ArchiveState;
  onChange: (next: ArchiveState, mode?: "push" | "replace") => void;
}) {
  const { view, page, q } = state;
  const [draft, setDraft] = useState(q);
  const [copied, setCopied] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft !== q) onChange({ ...state, q: draft, page: 1, study: undefined }, "replace");
    }, 220);
    return () => window.clearTimeout(handle);
    // state is read when the draft settles; including it retriggers on every page turn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const result = useMemo(() => loadPage(view, q, page), [view, q, page]);
  const open = state.study ? findById(state.study) : null;

  useEffect(() => {
    if (result.page !== page) onChange({ ...state, page: result.page }, "replace");
    // only correct an out-of-range page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.page, page]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ block: "start" });
  }, [result.page, view]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onChange({ ...state, study: undefined }, "replace");
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onChange, state]);

  function commit(partial: Partial<ArchiveState>, mode: "push" | "replace" = "push") {
    onChange({ view, page, q, study: state.study, ...partial }, mode);
  }

  const live = Boolean(blobBase?.trim());

  return (
    <div className="min-h-screen bg-bg text-bone">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-11 place-items-center rounded-xl border border-line bg-surface"
              >
                <span className="size-5 rounded-sm border border-lamp" />
              </span>
              <div>
                <p className="font-display text-3xl leading-none tracking-tight text-bone">meta-image</p>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mute">
                  33,000 Free Medical Images — CC0 / CC BY — X-ray CT MRI PET — No Copyright Issues — Vercel Ready
                </p>
              </div>
            </div>
            <p className="rounded-full border border-line bg-surface px-3 py-2 text-xs text-mute">
              {live ? "Blob origin connected" : "Accession index · plates until Blob is attached"}
            </p>
          </div>

          <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            <Stat label="Images ready" value={TOTAL.toLocaleString()} />
            <Stat label="NIH CC0 available" value={NIH_AVAILABLE.toLocaleString()} />
            <Stat label="CC0 Public Domain" value="No restrictions" />
            <Stat label="CC BY 3.0" value="Commercial OK" />
          </dl>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="scroll-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            {FILTERS.map((filter) => {
              const active = view === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => commit({ view: filter.id, page: 1, study: undefined })}
                  className={
                    "h-11 shrink-0 rounded-full px-4 text-sm " +
                    (active
                      ? "bg-bone text-bg"
                      : "border border-line bg-surface text-mute hover:text-bone")
                  }
                >
                  {filter.label}
                  <span className={active ? "text-bg/70" : "text-mute"}>
                    {" "}
                    {COUNTS[filter.id].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
          <form
            className="relative w-full lg:w-80"
            onSubmit={(event) => {
              event.preventDefault();
              commit({ q: draft, page: 1, study: undefined }, "replace");
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-mute" />
            <label className="sr-only" htmlFor="study-search">
              Search studies
            </label>
            <input
              id="study-search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="ID, modality, chest, brain, lung, axial"
              className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm text-bone outline-none placeholder:text-mute focus:border-lamp"
            />
          </form>
        </div>

        <div ref={gridRef} className="mt-5 scroll-mt-4">
          <p className="text-sm text-mute tabular-nums">
            {result.total === 0
              ? "No studies match"
              : `Showing ${result.from.toLocaleString()}–${result.to.toLocaleString()} of ${result.total.toLocaleString()}`}
            <span className="text-line"> · </span>
            Page {result.page.toLocaleString()} of {result.pages.toLocaleString()}
          </p>

          {result.items.length === 0 ? (
            <p className="mt-10 rounded-xl border border-line bg-surface px-5 py-10 text-center text-sm text-mute">
              Nothing under that search. Try NIH-00001, lung, brain, or axial.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {result.items.map((study, index) => (
                <li key={study.id}>
                  <button
                    type="button"
                    onClick={() => commit({ study: study.id })}
                    className="plate-card flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface text-left"
                    aria-label={`${study.id}, ${study.modalityLabel}, ${study.anatomy} ${study.plane}, ${study.license}`}
                  >
                    <span className="relative block aspect-square">
                      <FilmPlate
                        study={study}
                        src={blobUrlFor(study, blobBase)}
                        alt=""
                        priority={index < 4}
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-bg/80 px-2 py-1 text-xs text-bone backdrop-blur-md">
                        {study.modalityLabel}
                      </span>
                      <span className="absolute top-2 right-2 rounded-full bg-bg/80 px-2 py-1 text-xs text-lamp backdrop-blur-md">
                        {study.license}
                      </span>
                    </span>
                    <span className="flex flex-col gap-0.5 px-3 py-3">
                      <span className="text-sm text-bone tabular-nums">{study.id}</span>
                      <span className="text-xs text-mute">
                        {study.anatomy} · {study.plane}
                      </span>
                      <span className="truncate text-xs text-mute">{study.source}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-mute tabular-nums">
              Showing {result.from.toLocaleString()}–{result.to.toLocaleString()} of{" "}
              {result.total.toLocaleString()} — Page {result.page.toLocaleString()} of{" "}
              {result.pages.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={result.page <= 1}
                onClick={() => commit({ page: result.page - 1, study: undefined })}
                className="inline-flex h-11 items-center gap-1 rounded-full border border-line bg-surface px-4 text-sm text-bone disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                Prev
              </button>
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const next = Number(data.get("page"));
                  if (Number.isFinite(next)) commit({ page: next, study: undefined });
                }}
              >
                <label className="sr-only" htmlFor="page-jump">
                  Go to page
                </label>
                <input
                  id="page-jump"
                  name="page"
                  key={result.page}
                  defaultValue={result.page}
                  inputMode="numeric"
                  className="h-11 w-20 rounded-full border border-line bg-surface text-center text-sm text-bone tabular-nums outline-none focus:border-lamp"
                />
              </form>
              <button
                type="button"
                disabled={result.page >= result.pages}
                onClick={() => commit({ page: result.page + 1, study: undefined })}
                className="inline-flex h-11 items-center gap-1 rounded-full bg-bone px-4 text-sm text-bg disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm leading-relaxed text-mute sm:px-6">
          <p>
            Legal: NIH ChestX-ray14 is CC0 Public Domain — no restrictions. TCIA collections used here (LIDC-IDRI,
            DeepLesion, NSCLC PET-CT) are CC BY 3.0 — free for commercial, scientific, and educational purposes with
            attribution. OpenNeuro brain MRI entries are indexed as CC0. This page is not a medical device and not for
            diagnosis.
          </p>
          <p>
            The 33,000 cards are accession IDs for a public-domain subset (24,000 of 112,120 NIH radiographs, plus CT,
            MRI, and PET). Film plates are study marks keyed to those IDs. They are not the original pixels — Vercel’s
            deploy limit is why the files live on Blob, not in git. MIMIC-CXR and CheXpert are intentionally excluded.
          </p>
          <details className="rounded-xl border border-line bg-surface px-4 py-3">
            <summary className="cursor-pointer text-bone">Attach the files on Vercel Blob</summary>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                Download NIH ChestX-ray14 (CC0) from{" "}
                <a className="text-lamp underline" href="https://nihcc.app.box.com/v/ChestXray-NIHCC">
                  nihcc.app.box.com/v/ChestXray-NIHCC
                </a>
                . Use the first 24,000 and name them NIH-00001.webp through NIH-24000.webp.
              </li>
              <li>
                Add TCIA CT and PET under CC BY 3.0 (credit TCIA) and OpenNeuro CC0 brain MRI. Match the IDs on the
                cards: TCIA-CT-#####, ON-MRI-#####, TCIA-PET-#####.
              </li>
              <li>Convert to 512×512 WebP. Do not commit the images.</li>
              <li>
                Upload with <code className="text-bone">@vercel/blob</code> under the prefix{" "}
                <code className="text-bone">meta-image/</code>, then set the public store origin as{" "}
                <code className="text-bone">VITE_BLOB_BASE</code> (this preview) or{" "}
                <code className="text-bone">NEXT_PUBLIC_BLOB_BASE</code> (the Next.js deploy). Cards replace the plate
                when the file exists.
              </li>
            </ol>
          </details>
          <p className="flex flex-wrap gap-x-4 gap-y-2">
            <a className="text-bone underline" href="https://nihcc.app.box.com/v/ChestXray-NIHCC">
              NIH ChestX-ray14
            </a>
            <a className="text-bone underline" href="https://www.cancerimagingarchive.net/">
              The Cancer Imaging Archive
            </a>
            <a className="text-bone underline" href="https://openneuro.org/">
              OpenNeuro
            </a>
          </p>
        </div>
      </footer>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="presentation">
          <button
            type="button"
            aria-label="Close study"
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={() => commit({ study: undefined }, "replace")}
          />
          <article
            role="dialog"
            aria-modal="true"
            aria-labelledby="study-title"
            className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface sm:max-w-3xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
              <div>
                <p className="text-xs tracking-wide text-lamp uppercase">{open.license}</p>
                <h2 id="study-title" className="font-display text-3xl text-bone">
                  {open.id}
                </h2>
                <p className="text-sm text-mute">
                  {open.modalityLabel} · {open.anatomy} · {open.plane} · {open.collection}
                </p>
              </div>
              <button
                type="button"
                onClick={() => commit({ study: undefined }, "replace")}
                className="grid size-11 place-items-center rounded-full border border-line text-bone"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="aspect-square bg-bg sm:aspect-auto sm:min-h-full">
                <FilmPlate
                  study={open}
                  src={blobUrlFor(open, blobBase)}
                  alt={`${open.id} ${open.modalityLabel} ${open.anatomy} ${open.plane}`}
                  priority
                />
              </div>
              <div className="flex flex-col gap-4 px-4 py-4 text-sm leading-relaxed sm:px-5">
                <p className="text-mute">{open.licenseNote}</p>
                <p>
                  <span className="block text-xs text-mute">Source</span>
                  <a className="inline-flex items-center gap-1 text-bone underline" href={open.sourceUrl}>
                    {open.source}
                    <ExternalLink className="size-3.5" />
                  </a>
                </p>
                <p>
                  <span className="block text-xs text-mute">Attribution</span>
                  <span className="text-bone">{open.attribution}</span>
                </p>
                <p>
                  <span className="block text-xs text-mute">Blob URL</span>
                  <span className="break-all text-bone">{displayBlobUrl(open, blobBase)}</span>
                  <span className="mt-1 block text-xs text-mute">
                    {live
                      ? "Loaded from your Blob origin. A missing file falls back to the study plate."
                      : "Placeholder host until NEXT_PUBLIC_BLOB_BASE or VITE_BLOB_BASE is set."}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(displayBlobUrl(open, blobBase)).then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1200);
                    });
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-bone text-sm text-bg"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy blob URL"}
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-3 py-3">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 text-sm text-bone tabular-nums">{value}</dd>
    </div>
  );
}

export type { Study };

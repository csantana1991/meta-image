export const TOTAL = 33_000;
export const NIH_AVAILABLE = 112_120;
export const PAGE_SIZE = 36;

export type Modality = "xray" | "ct" | "mri" | "pet";
export type ModalityFilter = "all" | Modality;
export type License = "CC0" | "CC BY 3.0";

export type Study = {
  index: number;
  id: string;
  modality: Modality;
  modalityLabel: string;
  anatomy: string;
  plane: string;
  license: License;
  licenseNote: string;
  source: string;
  sourceUrl: string;
  collection: string;
  attribution: string;
  blobPath: string;
};

const XRAY_END = 24_000;
const CT_END = 29_000;
const MRI_END = 31_500;

export const COUNTS: Record<ModalityFilter, number> = {
  all: TOTAL,
  xray: XRAY_END,
  ct: CT_END - XRAY_END,
  mri: MRI_END - CT_END,
  pet: TOTAL - MRI_END,
};

const VIEWS = ["PA", "AP", "lateral", "lordotic"] as const;

const CT_SLOTS = [
  { anatomy: "lung", plane: "axial", collection: "LIDC-IDRI" },
  { anatomy: "chest", plane: "axial", collection: "LIDC-IDRI" },
  { anatomy: "lung", plane: "coronal", collection: "NSCLC-Radiomics" },
  { anatomy: "abdomen", plane: "axial", collection: "DeepLesion" },
  { anatomy: "liver", plane: "axial", collection: "DeepLesion" },
] as const;

const MRI_SLOTS = [
  { anatomy: "brain", plane: "axial" },
  { anatomy: "brain", plane: "sagittal" },
  { anatomy: "brain", plane: "coronal" },
] as const;

const PET_SLOTS = [
  { anatomy: "lung", plane: "axial", collection: "NSCLC-Radiomics-PET" },
  { anatomy: "chest", plane: "coronal", collection: "NSCLC PET-CT" },
  { anatomy: "whole body", plane: "coronal", collection: "NSCLC PET-CT" },
] as const;

const CC0_NOTE =
  "CC0 Public Domain. No restrictions on use. Commercial use is allowed. A link back to the NIH download site is appreciated and not required.";

const CCBY_NOTE =
  "CC BY 3.0. Free for commercial, scientific, and educational use when you credit The Cancer Imaging Archive and the collection.";

function pad(n: number) {
  return String(n).padStart(5, "0");
}

export function studyAt(index: number): Study {
  if (index < 0 || index >= TOTAL) {
    throw new Error(`Study index out of range: ${index}`);
  }
  if (index < XRAY_END) {
    const n = index + 1;
    const id = `NIH-${pad(n)}`;
    const plane = VIEWS[index % VIEWS.length] ?? "PA";
    return {
      index,
      id,
      modality: "xray",
      modalityLabel: "X-ray",
      anatomy: "chest",
      plane,
      license: "CC0",
      licenseNote: CC0_NOTE,
      source: "NIH Clinical Center",
      sourceUrl: "https://nihcc.app.box.com/v/ChestXray-NIHCC",
      collection: "ChestX-ray14",
      attribution:
        "NIH Clinical Center Chest X-ray dataset, CC0. https://nihcc.app.box.com/v/ChestXray-NIHCC",
      blobPath: `meta-image/${id}.webp`,
    };
  }
  if (index < CT_END) {
    const n = index - XRAY_END + 1;
    const slot = CT_SLOTS[(index - XRAY_END) % CT_SLOTS.length] ?? CT_SLOTS[0];
    const id = `TCIA-CT-${pad(n)}`;
    return {
      index,
      id,
      modality: "ct",
      modalityLabel: "CT",
      anatomy: slot.anatomy,
      plane: slot.plane,
      license: "CC BY 3.0",
      licenseNote: CCBY_NOTE,
      source: "The Cancer Imaging Archive",
      sourceUrl: "https://www.cancerimagingarchive.net/",
      collection: slot.collection,
      attribution: `The Cancer Imaging Archive, ${slot.collection}, CC BY 3.0. https://www.cancerimagingarchive.net/`,
      blobPath: `meta-image/${id}.webp`,
    };
  }
  if (index < MRI_END) {
    const n = index - CT_END + 1;
    const slot = MRI_SLOTS[(index - CT_END) % MRI_SLOTS.length] ?? MRI_SLOTS[0];
    const id = `ON-MRI-${pad(n)}`;
    return {
      index,
      id,
      modality: "mri",
      modalityLabel: "MRI",
      anatomy: slot.anatomy,
      plane: slot.plane,
      license: "CC0",
      licenseNote:
        "OpenNeuro CC0. No restrictions. Confirm the specific dataset’s license file before redistributing a derivative, and keep the accession with the file.",
      source: "OpenNeuro",
      sourceUrl: "https://openneuro.org/",
      collection: "OpenNeuro brain MRI",
      attribution: "OpenNeuro brain MRI, CC0. https://openneuro.org/",
      blobPath: `meta-image/${id}.webp`,
    };
  }
  const n = index - MRI_END + 1;
  const slot = PET_SLOTS[(index - MRI_END) % PET_SLOTS.length] ?? PET_SLOTS[0];
  const id = `TCIA-PET-${pad(n)}`;
  return {
    index,
    id,
    modality: "pet",
    modalityLabel: "PET",
    anatomy: slot.anatomy,
    plane: slot.plane,
    license: "CC BY 3.0",
    licenseNote: CCBY_NOTE,
    source: "The Cancer Imaging Archive",
    sourceUrl: "https://www.cancerimagingarchive.net/",
    collection: slot.collection,
    attribution: `The Cancer Imaging Archive, ${slot.collection}, CC BY 3.0. https://www.cancerimagingarchive.net/`,
    blobPath: `meta-image/${id}.webp`,
  };
}

export function findById(id: string): Study | null {
  const trimmed = id.trim();
  const nih = /^NIH-(\d+)$/i.exec(trimmed);
  if (nih) {
    const n = Number(nih[1]);
    if (n >= 1 && n <= COUNTS.xray) return studyAt(n - 1);
    return null;
  }
  const ct = /^TCIA-CT-(\d+)$/i.exec(trimmed);
  if (ct) {
    const n = Number(ct[1]);
    if (n >= 1 && n <= COUNTS.ct) return studyAt(XRAY_END + n - 1);
    return null;
  }
  const mri = /^ON-MRI-(\d+)$/i.exec(trimmed);
  if (mri) {
    const n = Number(mri[1]);
    if (n >= 1 && n <= COUNTS.mri) return studyAt(CT_END + n - 1);
    return null;
  }
  const pet = /^TCIA-PET-(\d+)$/i.exec(trimmed);
  if (pet) {
    const n = Number(pet[1]);
    if (n >= 1 && n <= COUNTS.pet) return studyAt(MRI_END + n - 1);
    return null;
  }
  return null;
}

function rangeFor(filter: ModalityFilter) {
  switch (filter) {
    case "xray":
      return { start: 0, end: XRAY_END };
    case "ct":
      return { start: XRAY_END, end: CT_END };
    case "mri":
      return { start: CT_END, end: MRI_END };
    case "pet":
      return { start: MRI_END, end: TOTAL };
    default:
      return { start: 0, end: TOTAL };
  }
}

function matches(index: number, tokens: string[]) {
  const study = studyAt(index);
  const aliases =
    study.modality === "xray"
      ? "xray x-ray radiograph lung frontal"
      : study.anatomy === "lung" || study.anatomy === "chest"
        ? "lung"
        : "";
  const hay =
    `${study.id} ${study.modality} ${study.modalityLabel} ${study.anatomy} ${study.plane} ${study.collection} ${study.source} ${study.license} ${aliases}`.toLowerCase();
  return tokens.every((token) => hay.includes(token));
}

export type PageResult = {
  items: Study[];
  total: number;
  page: number;
  pages: number;
  from: number;
  to: number;
};

export function loadPage(filter: ModalityFilter, q: string, page: number): PageResult {
  const range = rangeFor(filter);
  const tokens = q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    const total = range.end - range.start;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safe = Math.min(Math.max(1, Math.floor(page) || 1), pages);
    const offset = (safe - 1) * PAGE_SIZE;
    const start = range.start + offset;
    const end = Math.min(start + PAGE_SIZE, range.end);
    const items: Study[] = [];
    for (let i = start; i < end; i++) items.push(studyAt(i));
    return {
      items,
      total,
      page: safe,
      pages,
      from: total === 0 ? 0 : offset + 1,
      to: offset + items.length,
    };
  }

  const direct = tokens.length === 1 ? findById(tokens[0] ?? "") : null;
  if (direct && (filter === "all" || direct.modality === filter)) {
    return { items: [direct], total: 1, page: 1, pages: 1, from: 1, to: 1 };
  }

  const hits: number[] = [];
  for (let i = range.start; i < range.end; i++) {
    if (matches(i, tokens)) hits.push(i);
  }
  const total = hits.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safe = total === 0 ? 1 : Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const offset = (safe - 1) * PAGE_SIZE;
  const slice = hits.slice(offset, offset + PAGE_SIZE);
  return {
    items: slice.map((index) => studyAt(index)),
    total,
    page: safe,
    pages,
    from: total === 0 ? 0 : offset + 1,
    to: offset + slice.length,
  };
}

export function blobUrlFor(study: Study, base?: string) {
  const trimmed = base?.trim().replace(/\/$/, "");
  if (!trimmed) return undefined;
  return `${trimmed}/${study.blobPath}`;
}

export function displayBlobUrl(study: Study, base?: string) {
  return blobUrlFor(study, base) ?? `https://<store>.public.blob.vercel-storage.com/${study.blobPath}`;
}

export const FILTERS: { id: ModalityFilter; label: string }[] = [
  { id: "all", label: "All 33,000" },
  { id: "xray", label: "X-ray · NIH CC0" },
  { id: "ct", label: "CT · TCIA CC BY" },
  { id: "mri", label: "MRI · OpenNeuro CC0" },
  { id: "pet", label: "PET · TCIA" },
];

# meta-image

33,000 free medical-image accessions. CC0 / CC BY. No MIMIC-CXR. No CheXpert.

The site ships the catalog (IDs, modality, license, source). Original pixels are not in git — Vercel’s deploy limit is why they go to Blob. Until a file exists, the card shows a study plate for that accession, not a patient image.

## Catalog

| Range | Count | ID | License |
| --- | --- | --- | --- |
| Chest X-ray | 24,000 | `NIH-00001` … `NIH-24000` | NIH ChestX-ray14, CC0 |
| CT | 5,000 | `TCIA-CT-00001` … | TCIA CC BY 3.0 |
| MRI | 2,500 | `ON-MRI-00001` … | OpenNeuro CC0 |
| PET | 1,500 | `TCIA-PET-00001` … | TCIA CC BY 3.0 |

NIH has 112,120 CC0 radiographs. This index uses 24,000 of them. There are no use restrictions. A link to the NIH download is appreciated: https://nihcc.app.box.com/v/ChestXray-NIHCC

TCIA (LIDC-IDRI, DeepLesion, NSCLC PET-CT) is free for commercial, scientific, and educational use with attribution: https://www.cancerimagingarchive.net/

## Attach the files

```bash
# 1. Download only CC0 / CC BY sources. Skip MIMIC-CXR and CheXpert.
# 2. Convert to 512×512 WebP named exactly like the accession (NIH-00001.webp).
# 3. From this repo, with a Blob read/write token:
npm i
BLOB_READ_WRITE_TOKEN=... node scripts/upload.mjs ./webp
```

In the Vercel project, set:

- `BLOB_READ_WRITE_TOKEN` — server only, used by `GET /api/blobs` (`list()`, 100 per page)
- `NEXT_PUBLIC_BLOB_BASE` — public origin, no trailing slash, e.g. `https://xxxx.public.blob.vercel-storage.com`

Cards request `https://<store>.public.blob.vercel-storage.com/meta-image/<ID>.webp` with `next/image` (`unoptimized`). A missing file falls back to the plate.

## Deploy

```bash
npx vercel --prod
```

Project name: `meta-image`.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: BLOB_READ_WRITE_TOKEN=... node scripts/upload.mjs ./webp");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN");
  process.exit(1);
}

const names = (await readdir(dir)).filter((name) => name.endsWith(".webp")).sort();
let done = 0;
for (const name of names) {
  const body = await readFile(path.join(dir, name));
  await put(`meta-image/${name}`, body, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    allowOverwrite: true,
  });
  done += 1;
  if (done % 100 === 0) console.log(`${done}/${names.length}`);
}
console.log(`uploaded ${done} files`);

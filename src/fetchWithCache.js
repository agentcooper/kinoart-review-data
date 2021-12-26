import fetch from "node-fetch";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

import { join } from "path";
import { __dirname } from "./path.js";

function toFileName(url) {
  return Buffer.from(url).toString("base64").replace(/\//g, "_");
}

export async function fetchWithCache(
  url,
  { directory = "cache", cacheKey, afterFetch = () => {} }
) {
  const fileName = `${toFileName(cacheKey)}`;
  const path = join(__dirname, "../", directory, fileName);

  if (existsSync(path)) {
    return readFileSync(path, { encoding: "utf-8" });
  }

  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Bad fetch");
    process.exit(1);
  }

  const text = await res.text();
  await afterFetch();

  mkdirSync(directory, { recursive: true });
  writeFileSync(path, text);
  return text;
}

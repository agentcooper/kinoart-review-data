import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { __dirname } from "./path.js";

import Papa from "papaparse";

const OUTPUT_CSV_PATH = join(__dirname, "../data/output.csv");

export function getItems() {
  try {
    return Papa.parse(readFileSync(OUTPUT_CSV_PATH, { encoding: "utf-8" }), {
      header: true,
    }).data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function saveItems(items) {
  items.sort((a, b) => {
    return b.Year - a.Year;
  });

  const csv = Papa.unparse(items);

  writeFileSync(OUTPUT_CSV_PATH, csv);
}

export function getCorrections() {
  return JSON.parse(
    readFileSync(join(__dirname, "../data/corrections.json"), {
      encoding: "utf-8",
    })
  );
}

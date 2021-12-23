import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { join } from "path";

import Papa from "papaparse";

import { fetchPost, fetchPosts, findTitleAndYear } from "./kinoart.js";
import { search } from "./tmdb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_CSV_PATH = join(__dirname, "../data/output.csv");

const corrections = JSON.parse(
  readFileSync(join(__dirname, "../data/corrections.json"), {
    encoding: "utf-8",
  })
);

function getItems() {
  try {
    return Papa.parse(readFileSync(OUTPUT_CSV_PATH, { encoding: "utf-8" }), {
      header: true,
    }).data;
  } catch (e) {
    return [];
  }
}

async function findMovieOrTV(title, year, slug) {
  if (corrections[slug]) {
    const infoFromCorrections = await search(corrections[slug]);
    return infoFromCorrections;
  }

  const movie = await find(title, year, "/movie");
  if (movie) {
    return movie;
  }

  const tv = await find(title, year, "/tv");
  if (tv) {
    return tv;
  }

  return undefined;
}

async function find(title, year, type) {
  if (year) {
    const infoFromYear = await search(`${title} y:${year}`, type);

    if (infoFromYear) {
      return infoFromYear;
    }
  }

  const info = await search(`${title}`, type);
  if (info) {
    return info;
  }

  return undefined;
}

function fullURL(slug) {
  return `http://kinoart.ru/reviews/${slug}`;
}

async function main() {
  const posts = await fetchPosts();

  const items = getItems();

  for await (const [id, { slug }] of Object.entries(posts)) {
    const reviewURL = fullURL(slug);
    if (items.find((item) => item["Review URL"] === reviewURL)) {
      continue;
    }

    const fullPost = await fetchPost(slug);
    const { title, year } = findTitleAndYear(fullPost);

    const found = await findMovieOrTV(title, year, slug);

    if (!found) {
      console.warn(`Not found: ${title} (${year}), from ${reviewURL}`);
      continue;
    }

    const tmdbYear = found.releaseDate
      ? found.releaseDate.getFullYear()
      : undefined;

    if (typeof year === "number" && tmdbYear) {
      if (Math.abs(tmdbYear - year) > 1) {
        console.warn(
          `Year mismatch: ${title} (${year}), found ${found.title} (${tmdbYear}), from ${reviewURL}`
        );
      }
    }

    items.push({
      Title: found.title,
      Year: tmdbYear,
      "Review Title": title,
      "Review URL": reviewURL,
      "TMDB URL": `https://www.themoviedb.org${found.href}`,
    });
  }

  items.sort((a, b) => {
    return b.Year - a.Year;
  });

  writeFileSync(OUTPUT_CSV_PATH, toCSV(items));
}

function toCSV(items) {
  return Papa.unparse(items);
}

main();

#!/usr/bin/env node

import { fetchPost, fetchPosts, extractTitleAndYear } from "../src/kinoart.js";
import { search } from "../src/tmdb.js";
import { getCorrections, getItems, saveItems } from "../src/data.js";

const corrections = getCorrections();

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
    const { title, year } = extractTitleAndYear(fullPost);

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

  saveItems(items);
}

main();

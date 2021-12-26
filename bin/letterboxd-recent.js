#!/usr/bin/env node

import { basename } from "path";

import { JSDOM } from "jsdom";
import fetch from "node-fetch";

import { getItems } from "../src/data.js";

const username = process.argv[2];

const USAGE = `Usage: node ${basename(process.argv[1])} <username>`;

if (!username) {
  console.error(`❌ No Letterboxd username provided.\n\n${USAGE}`);
  process.exit(1);
}

async function getLetterboxdFeedTitles() {
  const res = await fetch(`https://letterboxd.com/${username}/rss/`);
  const feed = await res.text();

  const dom = new JSDOM(feed, {
    contentType: "text/xml",
  });

  return Array.from(
    dom.window.document.getElementsByTagName("letterboxd:filmTitle")
  ).map((node) => node.textContent);
}

const recentTitles = await getLetterboxdFeedTitles();
const items = getItems();

const reviews = recentTitles.flatMap((recentTitle) => {
  const review = items.find((item) => item.Title === recentTitle);
  if (review) {
    return [review];
  }
  return [];
});

if (reviews.length === 0) {
  console.log(`Didn't match any of ${items.length} reviews.`);
  process.exit(0);
}

for (const review of reviews) {
  console.log(`${review["Title"]}\n${review["Review URL"]}\n`);
}

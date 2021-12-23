import { JSDOM } from "jsdom";
import { fetchWithCache } from "./fetchWithCache.js";
import { delay } from "./delay.js";

export async function search(query, type = "") {
  const html = await fetchWithCache(
    `https://www.themoviedb.org/search${type}?query=${encodeURIComponent(
      query
    )}`,
    {
      cacheKey: `${type}_${query}`,
      directory: "_tmdb",
      afterFetch: () => delay(200),
    }
  );

  const dom = new JSDOM(html);
  const node = dom.window.document.querySelector(".card");
  if (node) {
    const aNode = node.querySelector("a[href]");
    const titleNode = node.querySelector(".result > h2");
    const releaseDateNode = node.querySelector(".release_date");

    const releaseDate = releaseDateNode
      ? new Date(releaseDateNode.textContent)
      : undefined;

    return {
      title: titleNode ? titleNode.textContent : undefined,
      releaseDate,
      href: aNode ? aNode.getAttribute("href") : undefined,
    };
  }

  // allow GC
  await delay(0);

  return undefined;
}

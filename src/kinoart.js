import { delay } from "./delay.js";
import { fetchWithCache } from "./fetchWithCache.js";

export async function fetchPost(slug) {
  const content = await fetchWithCache(`https://api.kinoart.ru/posts/${slug}`, {
    cacheKey: slug,
    directory: "_posts",
    afterFetch: () => delay(50),
  });

  return JSON.parse(content);
}

export async function fetchPosts() {
  const allPosts = {};

  for await (const page of fetchPages()) {
    for (const post of page.posts) {
      allPosts[post.id] = post;
    }
  }

  return allPosts;
}

async function* fetchPages() {
  let offset = 0;

  while (true) {
    const jsonText = await fetchWithCache(
      `https://api.kinoart.ru/posts?type=review&offset=${offset}&limit=100`,
      {
        cacheKey: String(offset),
        directory: "_all_posts",
        afterFetch: () => delay(500),
      }
    );

    const obj = JSON.parse(jsonText);

    yield obj;

    if (obj.posts.length === 0) {
      return;
    }

    offset += obj.posts.length;
  }
}

// Post utilities

function extractQuoted(input) {
  if (!input) {
    return undefined;
  }

  const match = input.match(/«([^»]+)»/);
  if (!match) {
    return undefined;
  }

  return match[1];
}

function extractYear(input) {
  if (!input) {
    return undefined;
  }

  const matchComma = input.match(/,\s+(\d\d\d\d)/);
  if (matchComma) {
    return Number(matchComma[1]);
  }

  const matchParens = input.match(/\((\d\d\d\d)\)/);
  if (matchParens) {
    return Number(matchParens[1]);
  }

  return undefined;
}

export function findTitleAndYear(post) {
  const { caption } = post.post.thumbnail;

  const captionTitle = extractQuoted(caption);
  if (captionTitle) {
    const year = extractYear(caption);

    return { title: captionTitle, year };
  }

  const title = extractQuoted(post.post.title);
  if (title) {
    return { title };
  }

  const leadTitle = extractQuoted(post.post.lead);
  if (leadTitle) {
    return { title: leadTitle };
  }

  return { title: undefined };
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchThumbnailFromOEmbed(url) {
  try {
    // Clean the URL - remove tracking parameters
    const cleanUrl = url.split('?')[0];
    const oembedUrl = "https://api.instagram.com/oembed?url=" + encodeURIComponent(cleanUrl);

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    if (response.status !== 200) {
      console.log("  oEmbed status:", response.status);
      return null;
    }

    const data = await response.json();
    return data.thumbnail_url ? decodeHtmlEntities(data.thumbnail_url) : null;
  } catch (error) {
    console.log("  oEmbed error:", error.message);
    return null;
  }
}

async function fetchThumbnailFromPage(url) {
  try {
    // Try to fetch the page and extract og:image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      }
    });

    if (response.status !== 200) {
      console.log("  Page fetch status:", response.status);
      return null;
    }

    const html = await response.text();

    // Look for og:image meta tag
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return decodeHtmlEntities(ogImageMatch[1]);
    }

    // Try alternate pattern
    const ogImageMatch2 = html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
    if (ogImageMatch2 && ogImageMatch2[1]) {
      return decodeHtmlEntities(ogImageMatch2[1]);
    }

    return null;
  } catch (error) {
    console.log("  Page fetch error:", error.message);
    return null;
  }
}

async function fetchThumbnail(url) {
  // Try oEmbed first
  let thumbnail = await fetchThumbnailFromOEmbed(url);
  if (thumbnail) return thumbnail;

  // Fall back to scraping og:image
  thumbnail = await fetchThumbnailFromPage(url);
  return thumbnail;
}

async function main() {
  // Update all Instagram posts (to fix HTML-encoded URLs)
  const posts = await prisma.ugcPost.findMany({
    where: { mediaType: "instagram" }
  });

  console.log("Found", posts.length, "Instagram posts to update");

  for (const post of posts) {
    console.log("Fetching thumbnail for:", post.instagramUrl);
    const thumbnail = await fetchThumbnail(post.instagramUrl);
    if (thumbnail) {
      await prisma.ugcPost.update({
        where: { id: post.id },
        data: { thumbnailUrl: thumbnail }
      });
      console.log("  Updated with thumbnail");
    } else {
      console.log("  No thumbnail found");
    }
  }
}

main().then(() => prisma.$disconnect());

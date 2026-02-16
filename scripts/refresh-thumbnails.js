const { PrismaClient } = require('@prisma/client');
const { writeFile, mkdir } = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchThumbnailUrl(url) {
  const cleanUrl = url.split('?')[0];

  // Try oEmbed first
  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    const resp = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.thumbnail_url) return decodeHtmlEntities(data.thumbnail_url);
    }
  } catch (e) {
    // oEmbed failed
  }

  // Fallback: fetch page og:image
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
      },
    });
    if (resp.ok) {
      const html = await resp.text();
      const m = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
      if (m && m[1]) return decodeHtmlEntities(m[1]);
      const m2 = html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
      if (m2 && m2[1]) return decodeHtmlEntities(m2[1]);
    }
  } catch (e) {
    // fallback failed
  }

  return null;
}

async function downloadAndSave(postId, imageUrl) {
  try {
    const resp = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length === 0) return null;

    const ct = resp.headers.get('content-type') || 'image/jpeg';
    let ext = '.jpg';
    if (ct.includes('png')) ext = '.png';
    else if (ct.includes('webp')) ext = '.webp';

    const basePath = process.env.NODE_ENV === 'production'
      ? '/var/data/pilareta-uploads/ugc'
      : path.join(process.cwd(), 'public/uploads/ugc');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dirPath = path.join(basePath, 'thumbnails', String(year), month);
    const fileName = `${postId}-thumb${ext}`;
    const filePath = path.join(dirPath, fileName);
    const publicUrl = `/uploads/ugc/thumbnails/${year}/${month}/${fileName}`;

    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
    await writeFile(filePath, buf);
    return publicUrl;
  } catch (e) {
    console.error(`  Error downloading: ${e.message}`);
    return null;
  }
}

(async () => {
  console.log('Fetching Instagram posts...');
  const posts = await prisma.ugcPost.findMany({
    where: { mediaType: 'instagram', instagramUrl: { not: null } },
    select: { id: true, instagramUrl: true, thumbnailUrl: true },
  });

  console.log(`Found ${posts.length} Instagram posts`);
  let updated = 0, failed = 0, skipped = 0;

  for (const post of posts) {
    // Skip posts that already have local thumbnails AND the file exists on disk
    if (post.thumbnailUrl && post.thumbnailUrl.startsWith('/uploads/')) {
      const uploadsBase = process.env.NODE_ENV === 'production'
        ? '/var/data/pilareta-uploads'
        : path.join(process.cwd(), 'public/uploads');
      const relativePath = post.thumbnailUrl.replace(/^\/uploads\//, '');
      const filePath = path.join(uploadsBase, relativePath);
      if (existsSync(filePath)) {
        skipped++;
        continue;
      }
      console.log(`  File missing on disk: ${post.thumbnailUrl}`);
    }

    if (!post.instagramUrl) {
      skipped++;
      continue;
    }

    console.log(`Processing: ${post.id} (${post.instagramUrl})`);

    const thumbUrl = await fetchThumbnailUrl(post.instagramUrl);
    if (!thumbUrl) {
      console.log('  Failed to get thumbnail URL');
      failed++;
      continue;
    }

    const localUrl = await downloadAndSave(post.id, thumbUrl);
    if (localUrl) {
      await prisma.ugcPost.update({
        where: { id: post.id },
        data: { thumbnailUrl: localUrl },
      });
      console.log(`  Saved: ${localUrl}`);
      updated++;
    } else {
      console.log('  Failed to download');
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`);
  await prisma.$disconnect();
})();

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/ugc/tags - Get all tags
export async function GET() {
  try {
    const tags = await prisma.ugcTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'approved',
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        postCount: tag._count.posts,
      })),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

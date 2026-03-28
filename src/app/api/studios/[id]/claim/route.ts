import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';

interface ClaimRequestBody {
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  businessRole: string;
  proofDescription?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = await rateLimit(request, { limit: 5, window: 60 });
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const { id } = await params;
    const body: ClaimRequestBody = await request.json();

    // Validate required fields
    if (!body.claimantName || !body.claimantEmail || !body.businessRole) {
      return NextResponse.json(
        { error: 'Missing required fields: claimantName, claimantEmail, businessRole' },
        { status: 400 }
      );
    }

    // Validate business role
    const validRoles = ['owner', 'manager', 'employee'];
    if (!validRoles.includes(body.businessRole)) {
      return NextResponse.json(
        { error: 'Invalid business role. Must be: owner, manager, or employee' },
        { status: 400 }
      );
    }

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id },
    });

    if (!studio) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    // Check for existing pending claim from same email
    const existingClaim = await prisma.studioClaim.findFirst({
      where: {
        studioId: id,
        claimantEmail: body.claimantEmail.toLowerCase(),
        status: 'pending',
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this studio' },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = await prisma.studioClaim.create({
      data: {
        studioId: id,
        claimantName: body.claimantName,
        claimantEmail: body.claimantEmail.toLowerCase(),
        claimantPhone: body.claimantPhone,
        businessRole: body.businessRole,
        proofDescription: body.proofDescription,
        status: 'pending',
      },
    });

    return NextResponse.json({
      claim,
      message: 'Claim submitted successfully. We will review your request.',
    }, { status: 201 });
  } catch (error) {
    logger.error('studios/claim', 'Failed to submit claim', error);
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Admins can see all claims; regular users only see their own
    const where: Record<string, unknown> = { studioId: id };
    if (!session.isAdmin) {
      where.claimantEmail = session.email;
    }

    const claims = await prisma.studioClaim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    logger.error('studios/claim', 'Failed to fetch claims', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

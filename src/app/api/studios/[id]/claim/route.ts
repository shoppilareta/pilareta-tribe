import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ClaimRequestBody {
  claimantName: string;
  claimantEmail: string;
  claimantPhone?: string;
  businessRole: string;
  proofDescription?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    console.error('Error creating studio claim:', error);
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const claims = await prisma.studioClaim.findMany({
      where: { studioId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching studio claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

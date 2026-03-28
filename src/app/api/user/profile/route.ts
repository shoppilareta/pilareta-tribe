import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateCsrf } from '@/lib/csrf';
import { logger } from '@/lib/logger';

const VALID_FITNESS_GOALS = [
  'weight_loss',
  'maintenance',
  'muscle_gain',
  'flexibility',
  'general',
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upsert: return existing profile or create a default one
    let profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId: session.userId,
          displayName: session.firstName
            ? `${session.firstName}${session.lastName ? ` ${session.lastName}` : ''}`
            : null,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    logger.error('user/profile', 'Failed to get profile', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const session = await getSession(request);

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      displayName,
      bio,
      weight,
      height,
      age,
      dailyCalorieTarget,
      weeklyCalorieTarget,
      fitnessGoal,
    } = body;

    // Validate fitnessGoal if provided
    if (fitnessGoal !== undefined && fitnessGoal !== null) {
      if (!VALID_FITNESS_GOALS.includes(fitnessGoal)) {
        return NextResponse.json(
          { error: `Invalid fitness goal. Must be one of: ${VALID_FITNESS_GOALS.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (weight !== undefined && weight !== null && (typeof weight !== 'number' || weight <= 0 || weight > 500)) {
      return NextResponse.json({ error: 'Weight must be between 0 and 500 kg' }, { status: 400 });
    }
    if (height !== undefined && height !== null && (typeof height !== 'number' || height <= 0 || height > 300)) {
      return NextResponse.json({ error: 'Height must be between 0 and 300 cm' }, { status: 400 });
    }
    if (age !== undefined && age !== null && (typeof age !== 'number' || age < 1 || age > 150 || !Number.isInteger(age))) {
      return NextResponse.json({ error: 'Age must be an integer between 1 and 150' }, { status: 400 });
    }
    if (dailyCalorieTarget !== undefined && dailyCalorieTarget !== null && (typeof dailyCalorieTarget !== 'number' || dailyCalorieTarget < 0 || !Number.isInteger(dailyCalorieTarget))) {
      return NextResponse.json({ error: 'Daily calorie target must be a non-negative integer' }, { status: 400 });
    }
    if (weeklyCalorieTarget !== undefined && weeklyCalorieTarget !== null && (typeof weeklyCalorieTarget !== 'number' || weeklyCalorieTarget < 0 || !Number.isInteger(weeklyCalorieTarget))) {
      return NextResponse.json({ error: 'Weekly calorie target must be a non-negative integer' }, { status: 400 });
    }

    // Validate string lengths
    if (displayName !== undefined && displayName !== null && typeof displayName === 'string' && displayName.length > 100) {
      return NextResponse.json({ error: 'Display name must be 100 characters or less' }, { status: 400 });
    }
    if (bio !== undefined && bio !== null && typeof bio === 'string' && bio.length > 500) {
      return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
    }

    // Build update data only for provided fields
    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;
    if (age !== undefined) updateData.age = age;
    if (dailyCalorieTarget !== undefined) updateData.dailyCalorieTarget = dailyCalorieTarget;
    if (weeklyCalorieTarget !== undefined) updateData.weeklyCalorieTarget = weeklyCalorieTarget;
    if (fitnessGoal !== undefined) updateData.fitnessGoal = fitnessGoal;

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.userId },
      update: updateData,
      create: {
        userId: session.userId,
        ...updateData,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    logger.error('user/profile', 'Failed to update profile', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

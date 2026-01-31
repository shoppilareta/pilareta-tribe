import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

interface BuildSessionRequest {
  goal: string;
  duration: number;
  level: string;
  constraints: string[];
}

// Define focus areas for each goal
const GOAL_FOCUS_AREAS: Record<string, string[]> = {
  core_stability: ['core', 'back'],
  glutes: ['glutes', 'legs'],
  legs: ['legs', 'glutes'],
  posture: ['posture', 'back', 'core'],
  mobility: ['mobility', 'back'],
  full_body: ['core', 'glutes', 'legs', 'arms', 'back'],
};

// Session structure based on duration (in minutes)
const SESSION_STRUCTURE: Record<number, { warmup: number; activation: number; main: number; cooldown: number }> = {
  15: { warmup: 2, activation: 2, main: 8, cooldown: 3 },
  20: { warmup: 3, activation: 3, main: 10, cooldown: 4 },
  30: { warmup: 4, activation: 4, main: 17, cooldown: 5 },
  45: { warmup: 5, activation: 6, main: 27, cooldown: 7 },
  60: { warmup: 6, activation: 8, main: 37, cooldown: 9 },
};

export async function POST(request: NextRequest) {
  try {
    const body: BuildSessionRequest = await request.json();
    const { goal, duration, level, constraints } = body;

    // Get user session (optional - can build sessions without login)
    const session = await getSession(request);
    const userId = session?.userId || null;

    // Get focus areas for this goal
    const focusAreas = GOAL_FOCUS_AREAS[goal] || ['core'];

    // Fetch all reformer exercises
    const allExercises = await prisma.exercise.findMany({
      where: {
        equipment: { in: ['reformer', 'both'] },
      },
    });

    // Filter exercises by level and constraints
    const validExercises = allExercises.filter(exercise => {
      // Check level compatibility
      const levelOrder = ['beginner', 'intermediate', 'advanced'];
      const exerciseLevelIndex = levelOrder.indexOf(exercise.difficulty);
      const userLevelIndex = levelOrder.indexOf(level);

      // Only include exercises at or below user's level
      if (exerciseLevelIndex > userLevelIndex) return false;

      // Check constraints (contraindications)
      if (constraints.length > 0) {
        const hasConflict = constraints.some(c =>
          exercise.contraindications.includes(c)
        );
        if (hasConflict) return false;
      }

      return true;
    });

    // Categorize exercises by type (based on common exercise patterns)
    const categorized = {
      warmup: validExercises.filter(e =>
        e.slug.includes('footwork') ||
        e.slug.includes('running') ||
        e.slug.includes('hundred-prep') ||
        e.slug.includes('leg-circles')
      ),
      activation: validExercises.filter(e =>
        e.slug.includes('abdominal') ||
        e.slug.includes('bridging') ||
        e.slug.includes('frog') ||
        (e.focusAreas.includes('core') && e.rpeTarget <= 5)
      ),
      main: validExercises.filter(e =>
        e.rpeTarget >= 4 &&
        !e.slug.includes('stretch') &&
        !e.slug.includes('footwork')
      ),
      cooldown: validExercises.filter(e =>
        e.slug.includes('stretch') ||
        e.slug.includes('mermaid') ||
        e.slug.includes('cat-stretch') ||
        e.rpeTarget <= 3
      ),
    };

    // Prioritize exercises that match focus areas
    const prioritize = (exercises: typeof validExercises, areas: string[]) => {
      return exercises.sort((a, b) => {
        const aMatch = a.focusAreas.filter(f => areas.includes(f)).length;
        const bMatch = b.focusAreas.filter(f => areas.includes(f)).length;
        return bMatch - aMatch;
      });
    };

    // Get session structure timing
    const structure = SESSION_STRUCTURE[duration] || SESSION_STRUCTURE[30];

    // Select exercises for each section
    const selectExercises = (
      pool: typeof validExercises,
      targetMinutes: number,
      section: string
    ) => {
      const selected: Array<{
        exercise: (typeof validExercises)[0];
        sets: number;
        reps: number | null;
        duration: number | null;
      }> = [];
      let totalTime = 0;

      // Prioritize by focus areas
      const prioritized = prioritize([...pool], focusAreas);

      for (const exercise of prioritized) {
        if (totalTime >= targetMinutes * 60) break;

        // Calculate exercise time
        const sets = exercise.defaultSets || 1;
        const repsTime = exercise.defaultReps ? exercise.defaultReps * 3 : 0; // ~3 sec per rep
        const durationTime = exercise.defaultDuration || 0;
        const exerciseTime = sets * (repsTime || durationTime || 30) + (sets - 1) * 30; // add rest between sets

        // Don't add if already selected
        if (selected.some(s => s.exercise.id === exercise.id)) continue;

        selected.push({
          exercise,
          sets,
          reps: exercise.defaultReps,
          duration: exercise.defaultDuration,
        });
        totalTime += exerciseTime;
      }

      return selected;
    };

    // Build the session
    const warmupExercises = selectExercises(categorized.warmup, structure.warmup, 'warmup');
    const activationExercises = selectExercises(categorized.activation, structure.activation, 'activation');
    const mainExercises = selectExercises(categorized.main, structure.main, 'main');
    const cooldownExercises = selectExercises(categorized.cooldown, structure.cooldown, 'cooldown');

    // Calculate totals
    const allSelected = [...warmupExercises, ...activationExercises, ...mainExercises, ...cooldownExercises];
    const totalSets = allSelected.reduce((sum, s) => sum + s.sets, 0);
    const totalReps = allSelected.reduce((sum, s) => sum + (s.reps || 0) * s.sets, 0);
    const totalDuration = duration * 60;

    // Calculate average RPE
    const avgRpe = Math.round(
      allSelected.reduce((sum, s) => sum + s.exercise.rpeTarget, 0) / allSelected.length
    );

    // Generate session name
    const goalLabel = goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
    const sessionName = `${duration}-Min ${goalLabel} Session (${levelLabel})`;

    // Generate rationale
    const rationale = [
      `Designed for ${levelLabel.toLowerCase()} practitioners focusing on ${goalLabel.toLowerCase()}.`,
      `Session includes ${warmupExercises.length} warmup, ${activationExercises.length} activation, ${mainExercises.length} main, and ${cooldownExercises.length} cooldown exercises.`,
      constraints.length > 0
        ? `Modified to accommodate ${constraints.map(c => c.replace('_', ' ')).join(', ')}.`
        : 'No physical constraints applied.',
      `Target RPE: ${avgRpe}/10 - ${avgRpe <= 5 ? 'moderate effort' : avgRpe <= 7 ? 'challenging' : 'high intensity'}.`,
    ];

    // Create the session in the database
    const pilatesSession = await prisma.pilatesSession.create({
      data: {
        userId,
        name: sessionName,
        description: `A personalized ${duration}-minute reformer session targeting ${goalLabel.toLowerCase()}.`,
        goal,
        equipment: 'reformer',
        level,
        durationMinutes: duration,
        focusAreas,
        constraints,
        totalSets,
        totalReps,
        totalDuration,
        rpeTarget: avgRpe,
        rationale,
        status: 'created',
        items: {
          create: allSelected.map((item, index) => {
            let section = 'main';
            if (index < warmupExercises.length) section = 'warmup';
            else if (index < warmupExercises.length + activationExercises.length) section = 'activation';
            else if (index >= warmupExercises.length + activationExercises.length + mainExercises.length) section = 'cooldown';

            return {
              exerciseId: item.exercise.id,
              orderIndex: index,
              section,
              sets: item.sets,
              reps: item.reps,
              duration: item.duration,
              tempo: item.exercise.defaultTempo,
              restSeconds: 30,
              springSetting: item.exercise.springSuggestion,
              rpeTarget: item.exercise.rpeTarget,
              showCues: item.exercise.cues.slice(0, 3),
              showMistakes: item.exercise.commonMistakes.slice(0, 2),
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            exercise: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      sessionId: pilatesSession.id,
      session: pilatesSession,
    });
  } catch (error) {
    console.error('Error building session:', error);
    return NextResponse.json(
      { error: 'Failed to build session' },
      { status: 500 }
    );
  }
}

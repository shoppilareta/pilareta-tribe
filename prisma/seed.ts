import { PrismaClient } from '@prisma/client';
import { reformerExercises } from './seed-data/exercises';
import { programs } from './seed-data/programs';
import { ugcTags } from './seed-data/ugc';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed exercises
  console.log('\n📚 Seeding exercises...');
  for (const exercise of reformerExercises) {
    const { instructorNotes, ...exerciseData } = exercise;

    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {
        ...exerciseData,
        instructorNotes: instructorNotes ?? undefined,
      },
      create: {
        ...exerciseData,
        instructorNotes: instructorNotes ?? undefined,
      },
    });
    console.log(`  ✓ ${exercise.name}`);
  }
  console.log(`\n✅ Seeded ${reformerExercises.length} exercises`);

  // Seed programs with weeks and sessions
  console.log('\n📋 Seeding programs...');
  for (const program of programs) {
    const { weeks, ...programData } = program;

    // Create or update program
    const createdProgram = await prisma.program.upsert({
      where: { slug: program.slug },
      update: {
        ...programData,
        isPublished: true,
      },
      create: {
        ...programData,
        isPublished: true,
      },
    });
    console.log(`  📁 ${program.name}`);

    // Create weeks and sessions
    for (const week of weeks) {
      const { sessions, ...weekData } = week;

      // Create or update week
      const createdWeek = await prisma.programWeek.upsert({
        where: {
          programId_weekNumber: {
            programId: createdProgram.id,
            weekNumber: week.weekNumber,
          },
        },
        update: weekData,
        create: {
          ...weekData,
          programId: createdProgram.id,
        },
      });
      console.log(`    📅 Week ${week.weekNumber}: ${week.title}`);

      // Create session templates for each day
      for (const session of sessions) {
        // Create a session template
        const templateSlug = `${program.slug}-w${week.weekNumber}-d${session.dayNumber}`;

        // Delete existing template items first (to handle updates cleanly)
        await prisma.sessionTemplateItem.deleteMany({
          where: {
            template: { slug: templateSlug },
          },
        });

        // Create or update session template
        const template = await prisma.sessionTemplate.upsert({
          where: { slug: templateSlug },
          update: {
            name: session.title || `${program.name} - Week ${week.weekNumber}, Day ${session.dayNumber}`,
            goal: program.focusAreas[0] || 'full_body',
            equipment: program.equipment,
            level: program.level,
            durationMinutes: 30,
            focusAreas: program.focusAreas,
            rpeTarget: week.weekNumber <= 2 ? 5 : week.weekNumber === 3 ? 6 : 7,
          },
          create: {
            slug: templateSlug,
            name: session.title || `${program.name} - Week ${week.weekNumber}, Day ${session.dayNumber}`,
            goal: program.focusAreas[0] || 'full_body',
            equipment: program.equipment,
            level: program.level,
            durationMinutes: 30,
            focusAreas: program.focusAreas,
            rpeTarget: week.weekNumber <= 2 ? 5 : week.weekNumber === 3 ? 6 : 7,
          },
        });

        // Create template items for each exercise
        for (let i = 0; i < session.exercises.length; i++) {
          const exerciseRef = session.exercises[i];

          // Find the exercise by slug
          const exercise = await prisma.exercise.findUnique({
            where: { slug: exerciseRef.slug },
          });

          if (!exercise) {
            console.warn(`      ⚠️ Exercise not found: ${exerciseRef.slug}`);
            continue;
          }

          // Apply reps multiplier from week
          const adjustedReps = exerciseRef.reps
            ? Math.round(exerciseRef.reps * week.repsMultiplier)
            : null;

          await prisma.sessionTemplateItem.create({
            data: {
              templateId: template.id,
              exerciseId: exercise.id,
              orderIndex: i,
              section: exerciseRef.section,
              sets: exerciseRef.sets,
              reps: adjustedReps,
              duration: exerciseRef.duration || null,
              tempo: exercise.defaultTempo,
              restSeconds: 30,
              springSetting: exercise.springSuggestion,
              rpeTarget: exercise.rpeTarget,
            },
          });
        }

        // Create program session linking to template
        await prisma.programSession.upsert({
          where: {
            weekId_dayNumber: {
              weekId: createdWeek.id,
              dayNumber: session.dayNumber,
            },
          },
          update: {
            title: session.title,
            templateId: template.id,
          },
          create: {
            weekId: createdWeek.id,
            dayNumber: session.dayNumber,
            title: session.title,
            templateId: template.id,
          },
        });

        console.log(`      🏋️ Day ${session.dayNumber}: ${session.title} (${session.exercises.length} exercises)`);
      }
    }
  }
  console.log(`\n✅ Seeded ${programs.length} programs`);

  // Seed UGC tags
  console.log('\n🏷️ Seeding UGC tags...');
  for (const tag of ugcTags) {
    await prisma.ugcTag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
    console.log(`  ✓ #${tag.name}`);
  }
  console.log(`\n✅ Seeded ${ugcTags.length} UGC tags`);

  // Create admin user for testing
  console.log('\n👤 Creating admin user...');
  await prisma.user.upsert({
    where: { email: 'demo@pilareta.com' },
    update: { isAdmin: true },
    create: {
      shopifyId: 'demo-user-001',
      email: 'demo@pilareta.com',
      firstName: 'Pilareta',
      lastName: 'Admin',
      isAdmin: true,
    },
  });
  console.log('  ✓ Admin user created/updated');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

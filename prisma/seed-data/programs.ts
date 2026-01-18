// Program Seed Data
// 2 Sample Programs with 4 weeks, 3 sessions per week

export const programs = [
  {
    slug: "core-control-4-week",
    name: "4-Week Core Control",
    description: "Build deep core stability and spinal control through progressive Pilates exercises. This program focuses on developing the foundational strength needed for all Pilates movements, emphasizing quality of movement over quantity.",
    durationWeeks: 4,
    sessionsPerWeek: 3,
    equipment: "reformer",
    level: "beginner",
    focusAreas: ["core", "back", "posture"],
    progressionType: "reps",
    progressionNotes: "Each week increases base repetitions by 10-15% while maintaining perfect form. If form breaks down, maintain previous week's reps until mastered.",
    benefits: [
      "Develop deep core stability and control",
      "Improve spinal mobility and awareness",
      "Build foundation for advanced Pilates movements",
      "Reduce lower back discomfort through proper activation",
      "Enhance body awareness and mind-muscle connection"
    ],
    prerequisites: "No prior Pilates experience required. Medical clearance recommended for those with spinal conditions.",
    weeks: [
      {
        weekNumber: 1,
        title: "Foundation",
        focus: "Learning basic positions, breath patterns, and core activation. Focus is on understanding proper form rather than intensity.",
        repsMultiplier: 1.0,
        intensityNotes: "RPE 4-5. Focus on technique.",
        sessions: [
          {
            dayNumber: 1,
            title: "Core Basics A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 8 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 30 },
              { slug: "abdominal-curls", section: "activation", sets: 2, reps: 6 },
              { slug: "bridging", section: "main", sets: 2, reps: 6 },
              { slug: "single-leg-stretch", section: "main", sets: 1, reps: 6 },
              { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 6 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 30 }
            ]
          },
          {
            dayNumber: 2,
            title: "Core Basics B",
            exercises: [
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 8 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 4 },
              { slug: "abdominal-curls", section: "activation", sets: 2, reps: 6 },
              { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 5 },
              { slug: "mermaid", section: "main", sets: 1, reps: 3 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 30 }
            ]
          },
          {
            dayNumber: 3,
            title: "Core Basics C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 40 },
              { slug: "abdominal-curls", section: "activation", sets: 2, reps: 8 },
              { slug: "frog", section: "main", sets: 2, reps: 8 },
              { slug: "bridging", section: "main", sets: 2, reps: 8 },
              { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
            ]
          }
        ]
      },
      {
        weekNumber: 2,
        title: "Building Control",
        focus: "Increasing body awareness and control. Introduction of more complex exercises with focus on precision.",
        repsMultiplier: 1.1,
        intensityNotes: "RPE 5-6. Slight increase in reps.",
        sessions: [
          {
            dayNumber: 1,
            title: "Control Development A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
              { slug: "hundred-prep", section: "activation", sets: 1, duration: 45 },
              { slug: "coordination", section: "main", sets: 2, reps: 5 },
              { slug: "single-leg-stretch", section: "main", sets: 2, reps: 8 },
              { slug: "bridging", section: "main", sets: 2, reps: 10 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 }
            ]
          },
          {
            dayNumber: 2,
            title: "Control Development B",
            exercises: [
              { slug: "running", section: "warmup", sets: 1, duration: 45 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 5 },
              { slug: "abdominal-curls", section: "activation", sets: 2, reps: 10 },
              { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 6 },
              { slug: "elephant", section: "main", sets: 2, reps: 6 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
            ]
          },
          {
            dayNumber: 3,
            title: "Control Development C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 50 },
              { slug: "coordination", section: "activation", sets: 2, reps: 6 },
              { slug: "knee-stretches-round", section: "main", sets: 2, reps: 8 },
              { slug: "arm-circles", section: "main", sets: 2, reps: 6 },
              { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
            ]
          }
        ]
      },
      {
        weekNumber: 3,
        title: "Integration",
        focus: "Combining movements and increasing flow between exercises. Building endurance for longer sequences.",
        repsMultiplier: 1.2,
        intensityNotes: "RPE 6-7. Focus on flow and endurance.",
        sessions: [
          {
            dayNumber: 1,
            title: "Integration Flow A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
              { slug: "hundred-prep", section: "activation", sets: 1, duration: 60 },
              { slug: "coordination", section: "main", sets: 2, reps: 8 },
              { slug: "single-leg-stretch", section: "main", sets: 2, reps: 10 },
              { slug: "rowing-from-chest", section: "main", sets: 2, reps: 5 },
              { slug: "elephant", section: "main", sets: 2, reps: 8 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 }
            ]
          },
          {
            dayNumber: 2,
            title: "Integration Flow B",
            exercises: [
              { slug: "running", section: "warmup", sets: 1, duration: 60 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
              { slug: "abdominal-curls", section: "activation", sets: 2, reps: 10 },
              { slug: "bridging", section: "main", sets: 2, reps: 10 },
              { slug: "knee-stretches-round", section: "main", sets: 2, reps: 10 },
              { slug: "chest-expansion", section: "main", sets: 2, reps: 6 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
            ]
          },
          {
            dayNumber: 3,
            title: "Integration Flow C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 60 },
              { slug: "coordination", section: "activation", sets: 2, reps: 8 },
              { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 8 },
              { slug: "pulling-straps", section: "main", sets: 2, reps: 8 },
              { slug: "frog", section: "main", sets: 2, reps: 10 },
              { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
            ]
          }
        ]
      },
      {
        weekNumber: 4,
        title: "Mastery",
        focus: "Refining all movements with increased challenge. Final week emphasizes control at higher intensities.",
        repsMultiplier: 1.3,
        intensityNotes: "RPE 7-8. Push towards mastery.",
        sessions: [
          {
            dayNumber: 1,
            title: "Mastery Session A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
              { slug: "hundred-prep", section: "activation", sets: 1, duration: 90 },
              { slug: "coordination", section: "main", sets: 3, reps: 8 },
              { slug: "single-leg-stretch", section: "main", sets: 2, reps: 12 },
              { slug: "elephant", section: "main", sets: 2, reps: 10 },
              { slug: "rowing-from-chest", section: "main", sets: 2, reps: 6 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
            ]
          },
          {
            dayNumber: 2,
            title: "Mastery Session B",
            exercises: [
              { slug: "running", section: "warmup", sets: 1, duration: 90 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
              { slug: "abdominal-curls", section: "activation", sets: 3, reps: 10 },
              { slug: "bridging", section: "main", sets: 3, reps: 10 },
              { slug: "knee-stretches-round", section: "main", sets: 3, reps: 10 },
              { slug: "pulling-straps", section: "main", sets: 2, reps: 10 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 3,
            title: "Mastery Session C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 100 },
              { slug: "coordination", section: "activation", sets: 3, reps: 8 },
              { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 10 },
              { slug: "chest-expansion", section: "main", sets: 2, reps: 8 },
              { slug: "frog", section: "main", sets: 2, reps: 12 },
              { slug: "arm-circles", section: "main", sets: 2, reps: 10 },
              { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 10 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
            ]
          }
        ]
      }
    ]
  },
  {
    slug: "glute-hip-stability-4-week",
    name: "4-Week Glute & Hip Stability",
    description: "Develop powerful, stable hips and glutes through targeted reformer exercises. This program addresses common imbalances and builds the posterior chain strength essential for injury prevention and daily function.",
    durationWeeks: 4,
    sessionsPerWeek: 3,
    equipment: "reformer",
    level: "intermediate",
    focusAreas: ["glutes", "legs", "core", "mobility"],
    progressionType: "reps",
    progressionNotes: "Progression focuses on increasing reps and adding challenging variations. Week 3 introduces more complex movement patterns.",
    benefits: [
      "Strengthen glutes and hip stabilizers",
      "Improve hip mobility and range of motion",
      "Address common muscle imbalances",
      "Build functional lower body strength",
      "Support knee and lower back health through better hip function"
    ],
    prerequisites: "Basic Pilates experience recommended. Familiarity with footwork and basic core exercises.",
    weeks: [
      {
        weekNumber: 1,
        title: "Hip Awareness",
        focus: "Building awareness of hip position and activation patterns. Learning to isolate glute engagement from lower back compensation.",
        repsMultiplier: 1.0,
        intensityNotes: "RPE 5-6. Focus on proper activation.",
        sessions: [
          {
            dayNumber: 1,
            title: "Glute Activation A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
              { slug: "bridging", section: "activation", sets: 3, reps: 8 },
              { slug: "frog", section: "main", sets: 2, reps: 10 },
              { slug: "leg-circles-supine", section: "main", sets: 2, reps: 5 },
              { slug: "side-lying-leg-press", section: "main", sets: 2, reps: 8 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
            ]
          },
          {
            dayNumber: 2,
            title: "Glute Activation B",
            exercises: [
              { slug: "running", section: "warmup", sets: 1, duration: 60 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 45 },
              { slug: "bridging", section: "activation", sets: 2, reps: 10 },
              { slug: "scooter", section: "main", sets: 2, reps: 8 },
              { slug: "standing-leg-pumps", section: "main", sets: 2, reps: 8 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
            ]
          },
          {
            dayNumber: 3,
            title: "Glute Activation C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
              { slug: "frog", section: "activation", sets: 2, reps: 10 },
              { slug: "side-lying-leg-press", section: "main", sets: 2, reps: 10 },
              { slug: "elephant", section: "main", sets: 2, reps: 6 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
            ]
          }
        ]
      },
      {
        weekNumber: 2,
        title: "Building Strength",
        focus: "Increasing resistance and adding more challenging positions. Building endurance in glute activation.",
        repsMultiplier: 1.15,
        intensityNotes: "RPE 6-7. Increase intensity.",
        sessions: [
          {
            dayNumber: 1,
            title: "Strength Building A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
              { slug: "bridging", section: "activation", sets: 3, reps: 10 },
              { slug: "frog", section: "main", sets: 3, reps: 10 },
              { slug: "scooter", section: "main", sets: 2, reps: 10 },
              { slug: "leg-circles-supine", section: "main", sets: 2, reps: 6 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
            ]
          },
          {
            dayNumber: 2,
            title: "Strength Building B",
            exercises: [
              { slug: "running", section: "warmup", sets: 1, duration: 60 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 60 },
              { slug: "side-lying-leg-press", section: "activation", sets: 2, reps: 12 },
              { slug: "standing-leg-pumps", section: "main", sets: 3, reps: 10 },
              { slug: "knee-stretches-round", section: "main", sets: 2, reps: 10 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 3,
            title: "Strength Building C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
              { slug: "bridging", section: "activation", sets: 3, reps: 10 },
              { slug: "elephant", section: "main", sets: 2, reps: 8 },
              { slug: "scooter", section: "main", sets: 3, reps: 10 },
              { slug: "frog", section: "main", sets: 2, reps: 12 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 }
            ]
          }
        ]
      },
      {
        weekNumber: 3,
        title: "Complex Patterns",
        focus: "Introducing more challenging movement patterns and unilateral work. Testing stability under increasing demands.",
        repsMultiplier: 1.25,
        intensityNotes: "RPE 7. More complex exercises added.",
        sessions: [
          {
            dayNumber: 1,
            title: "Complex Patterns A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
              { slug: "running", section: "warmup", sets: 1, duration: 60 },
              { slug: "bridging", section: "activation", sets: 2, reps: 10 },
              { slug: "standing-side-splits", section: "main", sets: 2, reps: 6 },
              { slug: "scooter", section: "main", sets: 3, reps: 12 },
              { slug: "side-lying-leg-press", section: "main", sets: 3, reps: 12 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 2,
            title: "Complex Patterns B",
            exercises: [
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
              { slug: "frog", section: "activation", sets: 2, reps: 12 },
              { slug: "standing-leg-pumps", section: "main", sets: 3, reps: 12 },
              { slug: "elephant", section: "main", sets: 3, reps: 10 },
              { slug: "coordination", section: "main", sets: 2, reps: 6 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 3,
            title: "Complex Patterns C",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 60 },
              { slug: "bridging", section: "activation", sets: 3, reps: 12 },
              { slug: "standing-side-splits", section: "main", sets: 2, reps: 8 },
              { slug: "knee-stretches-round", section: "main", sets: 3, reps: 12 },
              { slug: "scooter", section: "main", sets: 3, reps: 12 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
            ]
          }
        ]
      },
      {
        weekNumber: 4,
        title: "Power & Control",
        focus: "Maximum challenge with maintained control. Bringing together all learned patterns with higher intensity.",
        repsMultiplier: 1.35,
        intensityNotes: "RPE 7-8. Peak intensity week.",
        sessions: [
          {
            dayNumber: 1,
            title: "Power Session A",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
              { slug: "running", section: "warmup", sets: 1, duration: 90 },
              { slug: "bridging", section: "activation", sets: 3, reps: 12 },
              { slug: "standing-side-splits", section: "main", sets: 3, reps: 8 },
              { slug: "scooter", section: "main", sets: 3, reps: 15 },
              { slug: "frog", section: "main", sets: 3, reps: 12 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 2,
            title: "Power Session B",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
              { slug: "side-lying-leg-press", section: "activation", sets: 3, reps: 15 },
              { slug: "standing-leg-pumps", section: "main", sets: 3, reps: 15 },
              { slug: "elephant", section: "main", sets: 3, reps: 12 },
              { slug: "knee-stretches-round", section: "main", sets: 3, reps: 12 },
              { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
            ]
          },
          {
            dayNumber: 3,
            title: "Power Session C - Finale",
            exercises: [
              { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
              { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
              { slug: "hundred-prep", section: "warmup", sets: 1, duration: 90 },
              { slug: "bridging", section: "activation", sets: 3, reps: 15 },
              { slug: "standing-side-splits", section: "main", sets: 3, reps: 10 },
              { slug: "scooter", section: "main", sets: 3, reps: 15 },
              { slug: "side-lying-leg-press", section: "main", sets: 3, reps: 15 },
              { slug: "coordination", section: "main", sets: 2, reps: 8 },
              { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
              { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 90 }
            ]
          }
        ]
      }
    ]
  }
];

export const PROGRAM_COUNT = programs.length;

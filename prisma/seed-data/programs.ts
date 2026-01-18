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

// Additional Programs

// Program 3: Posture & Spinal Health (Beginner)
const postureSpinalHealth = {
  slug: "posture-spinal-health-4-week",
  name: "4-Week Posture & Spinal Health",
  description: "Improve your posture and spinal mobility through gentle, progressive exercises. This beginner-friendly program focuses on developing awareness of spinal alignment, strengthening postural muscles, and building the mobility needed for daily comfort.",
  durationWeeks: 4,
  sessionsPerWeek: 3,
  equipment: "reformer",
  level: "beginner",
  focusAreas: ["back", "posture", "mobility", "core"],
  progressionType: "reps",
  progressionNotes: "Gradual progression focusing on quality of movement. Each week builds on spinal awareness and adds gentle challenges to postural endurance.",
  benefits: [
    "Improve overall posture and alignment",
    "Increase spinal mobility in all directions",
    "Strengthen muscles that support good posture",
    "Reduce tension in neck and upper back",
    "Build awareness of body positioning"
  ],
  prerequisites: "No prior Pilates experience required. Consult a healthcare provider if you have spinal conditions.",
  weeks: [
    {
      weekNumber: 1,
      title: "Spinal Awareness",
      focus: "Learning to feel and control spinal position. Gentle movements to increase awareness of posture.",
      repsMultiplier: 1.0,
      intensityNotes: "RPE 3-4. Very gentle focus on awareness.",
      sessions: [
        {
          dayNumber: 1,
          title: "Awareness Session A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 8 },
            { slug: "pelvic-lift", section: "warmup", sets: 1, reps: 6 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 6 },
            { slug: "bridging", section: "main", sets: 2, reps: 6 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 5 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 3 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 30 }
          ]
        },
        {
          dayNumber: 2,
          title: "Awareness Session B",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 8 },
            { slug: "hundred-prep", section: "warmup", sets: 1, duration: 30 },
            { slug: "abdominal-curls", section: "activation", sets: 2, reps: 6 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 5 },
            { slug: "cat-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 30 }
          ]
        },
        {
          dayNumber: 3,
          title: "Awareness Session C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "running", section: "warmup", sets: 1, duration: 30 },
            { slug: "pelvic-lift", section: "activation", sets: 2, reps: 6 },
            { slug: "bridging", section: "main", sets: 2, reps: 8 },
            { slug: "arm-circles", section: "main", sets: 1, reps: 5 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 3 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 30 }
          ]
        }
      ]
    },
    {
      weekNumber: 2,
      title: "Building Mobility",
      focus: "Increasing range of motion in the spine. Adding extension and rotation work.",
      repsMultiplier: 1.1,
      intensityNotes: "RPE 4-5. Gentle increase in movement range.",
      sessions: [
        {
          dayNumber: 1,
          title: "Mobility Session A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 6 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "main", sets: 2, reps: 4 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 2,
          title: "Mobility Session B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 45 },
            { slug: "hundred-prep", section: "warmup", sets: 1, duration: 40 },
            { slug: "pelvic-lift", section: "activation", sets: 2, reps: 8 },
            { slug: "bridging", section: "main", sets: 2, reps: 8 },
            { slug: "chest-expansion", section: "main", sets: 2, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 3,
          title: "Mobility Session C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 4 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 6 },
            { slug: "arm-circles", section: "main", sets: 2, reps: 6 },
            { slug: "rowing-from-chest", section: "main", sets: 1, reps: 4 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 }
          ]
        }
      ]
    },
    {
      weekNumber: 3,
      title: "Strengthening Support",
      focus: "Building strength in postural muscles. Introduction of more back extension work.",
      repsMultiplier: 1.15,
      intensityNotes: "RPE 5-6. More strengthening work added.",
      sessions: [
        {
          dayNumber: 1,
          title: "Strengthening A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 50 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 8 },
            { slug: "pulling-straps", section: "main", sets: 2, reps: 6 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 6 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 2,
          title: "Strengthening B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "pelvic-lift", section: "warmup", sets: 1, reps: 8 },
            { slug: "abdominal-curls", section: "activation", sets: 2, reps: 8 },
            { slug: "bridging", section: "main", sets: 3, reps: 8 },
            { slug: "chest-expansion", section: "main", sets: 2, reps: 6 },
            { slug: "elephant", section: "main", sets: 2, reps: 6 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 3,
          title: "Strengthening C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 5 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 6 },
            { slug: "rowing-from-chest", section: "main", sets: 2, reps: 5 },
            { slug: "mermaid", section: "main", sets: 2, reps: 4 },
            { slug: "arm-circles", section: "cooldown", sets: 1, reps: 6 }
          ]
        }
      ]
    },
    {
      weekNumber: 4,
      title: "Integration",
      focus: "Combining all elements for improved functional posture. Building endurance for postural control.",
      repsMultiplier: 1.2,
      intensityNotes: "RPE 5-6. Focus on sustained good posture.",
      sessions: [
        {
          dayNumber: 1,
          title: "Integration A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 60 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 8 },
            { slug: "pulling-straps", section: "main", sets: 2, reps: 8 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 8 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 }
          ]
        },
        {
          dayNumber: 2,
          title: "Integration B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "pelvic-lift", section: "warmup", sets: 1, reps: 8 },
            { slug: "abdominal-curls", section: "activation", sets: 2, reps: 10 },
            { slug: "bridging", section: "main", sets: 3, reps: 10 },
            { slug: "elephant", section: "main", sets: 2, reps: 8 },
            { slug: "chest-expansion", section: "main", sets: 2, reps: 8 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Integration C - Finale",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 8 },
            { slug: "rowing-from-chest", section: "main", sets: 2, reps: 6 },
            { slug: "arm-circles", section: "main", sets: 2, reps: 8 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 8 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    }
  ]
};

// Program 4: Total Body Conditioning (Intermediate)
const totalBodyConditioning = {
  slug: "total-body-conditioning-4-week",
  name: "4-Week Total Body Conditioning",
  description: "A comprehensive full-body reformer program that builds balanced strength, flexibility, and control. This intermediate program incorporates exercises for every major muscle group and movement pattern.",
  durationWeeks: 4,
  sessionsPerWeek: 3,
  equipment: "reformer",
  level: "intermediate",
  focusAreas: ["full_body", "core", "legs", "back"],
  progressionType: "reps",
  progressionNotes: "Progressive overload through increased reps and exercise complexity. Week 3-4 introduces more challenging variations.",
  benefits: [
    "Develop balanced full-body strength",
    "Improve overall movement quality",
    "Build functional fitness for daily activities",
    "Increase muscular endurance",
    "Enhance coordination and body awareness"
  ],
  prerequisites: "Basic familiarity with reformer exercises. Should be comfortable with footwork, bridging, and basic core work.",
  weeks: [
    {
      weekNumber: 1,
      title: "Foundation Building",
      focus: "Establishing baseline for all movement patterns. Full-body approach with moderate intensity.",
      repsMultiplier: 1.0,
      intensityNotes: "RPE 5-6. Well-rounded sessions.",
      sessions: [
        {
          dayNumber: 1,
          title: "Full Body A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 50 },
            { slug: "coordination", section: "main", sets: 2, reps: 6 },
            { slug: "pulling-straps", section: "main", sets: 2, reps: 8 },
            { slug: "scooter", section: "main", sets: 2, reps: 8 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 2,
          title: "Full Body B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 5 },
            { slug: "abdominal-curls", section: "activation", sets: 2, reps: 8 },
            { slug: "bridging", section: "main", sets: 2, reps: 10 },
            { slug: "elephant", section: "main", sets: 2, reps: 8 },
            { slug: "chest-expansion", section: "main", sets: 2, reps: 6 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 }
          ]
        },
        {
          dayNumber: 3,
          title: "Full Body C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-heels", section: "warmup", sets: 1, reps: 10 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "frog", section: "main", sets: 2, reps: 10 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 6 },
            { slug: "arm-circles", section: "main", sets: 2, reps: 6 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
          ]
        }
      ]
    },
    {
      weekNumber: 2,
      title: "Increasing Challenge",
      focus: "Building on foundation with increased volume and introducing standing work.",
      repsMultiplier: 1.15,
      intensityNotes: "RPE 6-7. More volume and standing exercises.",
      sessions: [
        {
          dayNumber: 1,
          title: "Challenge A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 60 },
            { slug: "coordination", section: "main", sets: 2, reps: 8 },
            { slug: "stomach-massage-round", section: "main", sets: 2, reps: 8 },
            { slug: "standing-leg-pumps", section: "main", sets: 2, reps: 10 },
            { slug: "pulling-straps", section: "main", sets: 2, reps: 10 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 }
          ]
        },
        {
          dayNumber: 2,
          title: "Challenge B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
            { slug: "abdominal-curls", section: "activation", sets: 2, reps: 10 },
            { slug: "knee-stretches-round", section: "main", sets: 2, reps: 10 },
            { slug: "elephant", section: "main", sets: 2, reps: 10 },
            { slug: "side-lying-leg-press", section: "main", sets: 2, reps: 10 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
          ]
        },
        {
          dayNumber: 3,
          title: "Challenge C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-wide-v", section: "warmup", sets: 1, reps: 10 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 10 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 8 },
            { slug: "scooter", section: "main", sets: 2, reps: 10 },
            { slug: "rowing-from-chest", section: "main", sets: 2, reps: 6 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 45 }
          ]
        }
      ]
    },
    {
      weekNumber: 3,
      title: "Complex Movements",
      focus: "Introduction of more challenging exercises. Building flow between movements.",
      repsMultiplier: 1.2,
      intensityNotes: "RPE 7. New challenging exercises added.",
      sessions: [
        {
          dayNumber: 1,
          title: "Complex A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 70 },
            { slug: "stomach-massage-round", section: "main", sets: 2, reps: 10 },
            { slug: "stomach-massage-flat", section: "main", sets: 2, reps: 8 },
            { slug: "long-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "kneeling-arm-press", section: "main", sets: 2, reps: 8 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Complex B",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
            { slug: "coordination", section: "activation", sets: 2, reps: 8 },
            { slug: "up-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "side-lying-leg-press", section: "main", sets: 3, reps: 10 },
            { slug: "chest-expansion", section: "main", sets: 2, reps: 8 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 8 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Complex C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-heels", section: "warmup", sets: 1, reps: 12 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 12 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 8 },
            { slug: "teaser-prep", section: "main", sets: 2, reps: 5 },
            { slug: "standing-side-splits", section: "main", sets: 2, reps: 6 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    },
    {
      weekNumber: 4,
      title: "Peak Performance",
      focus: "Bringing together all elements with highest intensity. Full-body integration at advanced level.",
      repsMultiplier: 1.3,
      intensityNotes: "RPE 7-8. Peak intensity and complexity.",
      sessions: [
        {
          dayNumber: 1,
          title: "Peak A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 90 },
            { slug: "stomach-massage-round", section: "main", sets: 2, reps: 12 },
            { slug: "stomach-massage-flat", section: "main", sets: 2, reps: 10 },
            { slug: "long-stretch", section: "main", sets: 3, reps: 8 },
            { slug: "teaser-prep", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Peak B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 90 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
            { slug: "coordination", section: "activation", sets: 3, reps: 8 },
            { slug: "up-stretch", section: "main", sets: 2, reps: 8 },
            { slug: "down-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "kneeling-arm-circles-bilateral", section: "main", sets: 2, reps: 8 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 10 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Peak C - Finale",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-wide-v", section: "warmup", sets: 1, reps: 12 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 15 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 10 },
            { slug: "standing-side-splits", section: "main", sets: 3, reps: 8 },
            { slug: "scooter", section: "main", sets: 3, reps: 12 },
            { slug: "pulling-straps", section: "main", sets: 2, reps: 12 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    }
  ]
};

// Program 5: Flexibility & Flow (Intermediate)
const flexibilityFlow = {
  slug: "flexibility-flow-4-week",
  name: "4-Week Flexibility & Flow",
  description: "Enhance your flexibility and movement flow through this mobility-focused program. Combines dynamic stretching, spinal articulation, and flowing sequences to create suppleness throughout the body.",
  durationWeeks: 4,
  sessionsPerWeek: 3,
  equipment: "reformer",
  level: "intermediate",
  focusAreas: ["mobility", "back", "core", "legs"],
  progressionType: "reps",
  progressionNotes: "Focus on increasing range of motion and smoothness of transitions. Later weeks introduce more complex flowing sequences.",
  benefits: [
    "Increase overall flexibility and range of motion",
    "Develop smooth, flowing movement patterns",
    "Improve spinal articulation in all directions",
    "Release muscular tension and tightness",
    "Build body awareness through mindful movement"
  ],
  prerequisites: "Some reformer experience recommended. Should be comfortable with basic exercises and have no acute injuries.",
  weeks: [
    {
      weekNumber: 1,
      title: "Opening Up",
      focus: "Gentle opening of major muscle groups. Focus on breath and slow, controlled movement.",
      repsMultiplier: 1.0,
      intensityNotes: "RPE 4-5. Slow, mindful movements.",
      sessions: [
        {
          dayNumber: 1,
          title: "Opening A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 8 },
            { slug: "running", section: "warmup", sets: 1, duration: 45 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "main", sets: 2, reps: 4 },
            { slug: "leg-circles-supine", section: "main", sets: 2, reps: 5 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 2,
          title: "Opening B",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 8 },
            { slug: "pelvic-lift", section: "warmup", sets: 1, reps: 6 },
            { slug: "bridging", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 6 },
            { slug: "short-spine-massage", section: "main", sets: 2, reps: 4 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Opening C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "hundred-prep", section: "warmup", sets: 1, duration: 40 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "frog", section: "main", sets: 2, reps: 8 },
            { slug: "side-lying-circles", section: "main", sets: 2, reps: 5 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 4 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 45 }
          ]
        }
      ]
    },
    {
      weekNumber: 2,
      title: "Deepening Range",
      focus: "Working deeper into stretches. Introduction of more challenging hip openers.",
      repsMultiplier: 1.1,
      intensityNotes: "RPE 5-6. Deeper stretches.",
      sessions: [
        {
          dayNumber: 1,
          title: "Deepening A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "spine-stretch-forward", section: "activation", sets: 2, reps: 6 },
            { slug: "short-spine-massage", section: "main", sets: 3, reps: 5 },
            { slug: "semi-circle", section: "main", sets: 2, reps: 4 },
            { slug: "mermaid", section: "main", sets: 2, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 2,
          title: "Deepening B",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 8 },
            { slug: "kneeling-lunge", section: "main", sets: 2, reps: 6 },
            { slug: "tree", section: "main", sets: 2, reps: 4 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Deepening C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "pelvic-lift", section: "warmup", sets: 1, reps: 8 },
            { slug: "bridging", section: "activation", sets: 2, reps: 10 },
            { slug: "frog", section: "main", sets: 2, reps: 10 },
            { slug: "side-lying-circles", section: "main", sets: 2, reps: 6 },
            { slug: "elephant", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        }
      ]
    },
    {
      weekNumber: 3,
      title: "Flowing Sequences",
      focus: "Connecting exercises into flowing sequences. Building movement memory and smooth transitions.",
      repsMultiplier: 1.15,
      intensityNotes: "RPE 5-6. Focus on flow and transitions.",
      sessions: [
        {
          dayNumber: 1,
          title: "Flow A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 10 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 10 },
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "short-spine-massage", section: "main", sets: 3, reps: 5 },
            { slug: "long-spine-massage", section: "main", sets: 2, reps: 4 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 8 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 2,
          title: "Flow B",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 6 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 8 },
            { slug: "swan-prep", section: "main", sets: 2, reps: 8 },
            { slug: "kneeling-lunge", section: "main", sets: 2, reps: 8 },
            { slug: "semi-circle", section: "main", sets: 2, reps: 5 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 3,
          title: "Flow C",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "hundred-prep", section: "warmup", sets: 1, duration: 50 },
            { slug: "bridging", section: "activation", sets: 2, reps: 10 },
            { slug: "tree", section: "main", sets: 2, reps: 5 },
            { slug: "side-lying-circles", section: "main", sets: 2, reps: 8 },
            { slug: "elephant", section: "main", sets: 2, reps: 8 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    },
    {
      weekNumber: 4,
      title: "Full Expression",
      focus: "Bringing together all elements with deeper range and smoother flow. Full expression of mobility.",
      repsMultiplier: 1.2,
      intensityNotes: "RPE 5-6. Emphasis on quality and range.",
      sessions: [
        {
          dayNumber: 1,
          title: "Expression A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "running", section: "warmup", sets: 1, duration: 60 },
            { slug: "spine-stretch-forward", section: "activation", sets: 2, reps: 8 },
            { slug: "short-spine-massage", section: "main", sets: 3, reps: 6 },
            { slug: "long-spine-massage", section: "main", sets: 3, reps: 5 },
            { slug: "semi-circle", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 90 }
          ]
        },
        {
          dayNumber: 2,
          title: "Expression B",
          exercises: [
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
            { slug: "cat-stretch", section: "activation", sets: 2, reps: 10 },
            { slug: "swan-prep", section: "main", sets: 3, reps: 8 },
            { slug: "tree", section: "main", sets: 2, reps: 6 },
            { slug: "kneeling-lunge", section: "main", sets: 2, reps: 8 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 90 }
          ]
        },
        {
          dayNumber: 3,
          title: "Expression C - Finale",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
            { slug: "bridging", section: "activation", sets: 2, reps: 10 },
            { slug: "short-spine-massage", section: "main", sets: 3, reps: 6 },
            { slug: "side-lying-circles", section: "main", sets: 2, reps: 8 },
            { slug: "elephant", section: "main", sets: 2, reps: 10 },
            { slug: "spine-stretch-forward", section: "main", sets: 2, reps: 10 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 90 }
          ]
        }
      ]
    }
  ]
};

// Program 6: Advanced Reformer Challenge (Advanced)
const advancedChallenge = {
  slug: "advanced-reformer-challenge-4-week",
  name: "4-Week Advanced Reformer Challenge",
  description: "Push your Pilates practice to the next level with this advanced program. Features challenging exercises, complex movement patterns, and demanding sequences for experienced practitioners.",
  durationWeeks: 4,
  sessionsPerWeek: 3,
  equipment: "reformer",
  level: "advanced",
  focusAreas: ["full_body", "core", "back", "legs"],
  progressionType: "reps",
  progressionNotes: "High-intensity progression with increasing complexity. Each week introduces more advanced variations and longer sequences.",
  benefits: [
    "Master advanced Pilates exercises",
    "Build exceptional core strength and control",
    "Develop high-level coordination and balance",
    "Challenge muscular endurance",
    "Achieve peak reformer proficiency"
  ],
  prerequisites: "Strong intermediate Pilates background required. Must be proficient in stomach massage, elephant, and coordination exercises.",
  weeks: [
    {
      weekNumber: 1,
      title: "Advanced Foundation",
      focus: "Establishing baseline with advanced exercises. Testing current capabilities.",
      repsMultiplier: 1.0,
      intensityNotes: "RPE 7. Advanced exercises at moderate volume.",
      sessions: [
        {
          dayNumber: 1,
          title: "Advanced A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 12 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 12 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 90 },
            { slug: "stomach-massage-round", section: "main", sets: 2, reps: 10 },
            { slug: "stomach-massage-flat", section: "main", sets: 2, reps: 8 },
            { slug: "stomach-massage-reach", section: "main", sets: 2, reps: 6 },
            { slug: "long-stretch", section: "main", sets: 2, reps: 8 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Advanced B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 90 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
            { slug: "coordination", section: "activation", sets: 3, reps: 8 },
            { slug: "up-stretch", section: "main", sets: 2, reps: 8 },
            { slug: "down-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "elephant", section: "main", sets: 2, reps: 10 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Advanced C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-heels", section: "warmup", sets: 1, reps: 12 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 12 },
            { slug: "swan-full", section: "main", sets: 2, reps: 5 },
            { slug: "teaser-prep", section: "main", sets: 2, reps: 6 },
            { slug: "front-splits", section: "main", sets: 2, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    },
    {
      weekNumber: 2,
      title: "Building Power",
      focus: "Increasing intensity and adding power movements. Building endurance for longer sequences.",
      repsMultiplier: 1.15,
      intensityNotes: "RPE 7-8. Higher intensity.",
      sessions: [
        {
          dayNumber: 1,
          title: "Power A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 100 },
            { slug: "stomach-massage-round", section: "main", sets: 3, reps: 10 },
            { slug: "stomach-massage-reach", section: "main", sets: 2, reps: 8 },
            { slug: "tendon-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "backstroke", section: "main", sets: 2, reps: 6 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Power B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 90 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
            { slug: "coordination", section: "activation", sets: 3, reps: 10 },
            { slug: "long-stretch", section: "main", sets: 3, reps: 8 },
            { slug: "up-stretch", section: "main", sets: 3, reps: 8 },
            { slug: "down-stretch", section: "main", sets: 2, reps: 8 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 10 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Power C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-wide-v", section: "warmup", sets: 1, reps: 12 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 15 },
            { slug: "swan-full", section: "main", sets: 3, reps: 6 },
            { slug: "breaststroke", section: "main", sets: 2, reps: 6 },
            { slug: "thigh-stretch", section: "main", sets: 2, reps: 6 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    },
    {
      weekNumber: 3,
      title: "Complex Integration",
      focus: "Introducing the most challenging exercises. Complex sequences requiring high coordination.",
      repsMultiplier: 1.2,
      intensityNotes: "RPE 8. Most challenging exercises added.",
      sessions: [
        {
          dayNumber: 1,
          title: "Integration A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 100 },
            { slug: "short-spine-massage", section: "main", sets: 3, reps: 5 },
            { slug: "long-spine-massage", section: "main", sets: 2, reps: 4 },
            { slug: "corkscrew", section: "main", sets: 2, reps: 4 },
            { slug: "balance-control-front", section: "main", sets: 2, reps: 4 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Integration B",
          exercises: [
            { slug: "running", section: "warmup", sets: 1, duration: 90 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 8 },
            { slug: "coordination", section: "activation", sets: 3, reps: 10 },
            { slug: "snake-twist", section: "main", sets: 2, reps: 4 },
            { slug: "front-splits", section: "main", sets: 2, reps: 6 },
            { slug: "kneeling-side-arm", section: "main", sets: 2, reps: 8 },
            { slug: "elephant", section: "main", sets: 3, reps: 10 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 60 }
          ]
        },
        {
          dayNumber: 3,
          title: "Integration C",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-heels", section: "warmup", sets: 1, reps: 15 },
            { slug: "single-leg-stretch", section: "activation", sets: 2, reps: 15 },
            { slug: "swan-full", section: "main", sets: 3, reps: 8 },
            { slug: "horseback", section: "main", sets: 2, reps: 5 },
            { slug: "skating", section: "main", sets: 2, reps: 8 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 60 }
          ]
        }
      ]
    },
    {
      weekNumber: 4,
      title: "Peak Challenge",
      focus: "Maximum challenge with all advanced exercises. Full expression of reformer mastery.",
      repsMultiplier: 1.25,
      intensityNotes: "RPE 8-9. Peak intensity.",
      sessions: [
        {
          dayNumber: 1,
          title: "Peak Challenge A",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-v-position", section: "warmup", sets: 1, reps: 15 },
            { slug: "running", section: "warmup", sets: 1, duration: 90 },
            { slug: "hundred-prep", section: "activation", sets: 1, duration: 100 },
            { slug: "stomach-massage-round", section: "main", sets: 3, reps: 12 },
            { slug: "stomach-massage-reach", section: "main", sets: 3, reps: 10 },
            { slug: "tendon-stretch", section: "main", sets: 3, reps: 8 },
            { slug: "balance-control-front", section: "main", sets: 2, reps: 5 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 }
          ]
        },
        {
          dayNumber: 2,
          title: "Peak Challenge B",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "leg-circles-supine", section: "warmup", sets: 1, reps: 10 },
            { slug: "coordination", section: "activation", sets: 3, reps: 12 },
            { slug: "long-stretch", section: "main", sets: 3, reps: 10 },
            { slug: "up-stretch", section: "main", sets: 3, reps: 10 },
            { slug: "snake-twist", section: "main", sets: 2, reps: 5 },
            { slug: "corkscrew", section: "main", sets: 2, reps: 5 },
            { slug: "cat-stretch", section: "cooldown", sets: 1, reps: 10 },
            { slug: "hip-stretch-series", section: "cooldown", sets: 1, duration: 90 }
          ]
        },
        {
          dayNumber: 3,
          title: "Peak Challenge C - Finale",
          exercises: [
            { slug: "footwork-parallel", section: "warmup", sets: 1, reps: 15 },
            { slug: "footwork-wide-v", section: "warmup", sets: 1, reps: 15 },
            { slug: "single-leg-stretch", section: "activation", sets: 3, reps: 15 },
            { slug: "swan-full", section: "main", sets: 3, reps: 8 },
            { slug: "front-splits", section: "main", sets: 3, reps: 8 },
            { slug: "horseback", section: "main", sets: 2, reps: 6 },
            { slug: "thigh-stretch", section: "main", sets: 2, reps: 8 },
            { slug: "skating", section: "main", sets: 2, reps: 10 },
            { slug: "mermaid", section: "cooldown", sets: 1, reps: 5 },
            { slug: "hamstring-stretch", section: "cooldown", sets: 1, duration: 90 }
          ]
        }
      ]
    }
  ]
};

// Add new programs to the array
programs.push(postureSpinalHealth, totalBodyConditioning, flexibilityFlow, advancedChallenge);

export const PROGRAM_COUNT = programs.length;

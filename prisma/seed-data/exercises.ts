// Reformer Exercise Seed Data
// NOTE: Fields marked with TODO require instructor review for accuracy

export const reformerExercises = [
  // ============================================
  // WARMUP EXERCISES
  // ============================================
  {
    slug: "footwork-parallel",
    name: "Footwork - Parallel",
    description: "Foundation reformer exercise focusing on alignment, breath coordination, and lower body engagement. Performed lying supine with feet on the footbar in parallel position.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "core"],
    setupSteps: [
      "Lie supine on the carriage with head on headrest",
      "Place feet hip-width apart on footbar, heels lifted (toes and balls of feet on bar)",
      "Arms rest by sides, palms down",
      "Neutral spine with natural lumbar curve"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale and press through feet to extend legs, maintaining parallel alignment",
      "Keep pelvis stable and core engaged throughout",
      "Inhale at full extension",
      "Exhale and control the return, resisting the spring tension"
    ],
    cues: [
      "Press evenly through all ten toes",
      "Maintain neutral pelvis throughout",
      "Think of lengthening through the crown of the head"
    ],
    commonMistakes: [
      "Allowing knees to roll inward or outward",
      "Gripping with hip flexors",
      "Losing neutral spine at end range"
    ],
    modifications: {
      easier: ["Reduce spring tension", "Smaller range of motion"],
      harder: ["Single leg variation", "Add arm coordination"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Ensure knees track over second and third toes. Stop if any knee discomfort.",
    primaryMuscles: ["quadriceps", "gastrocnemius"],
    secondaryMuscles: ["hamstrings", "transverse_abdominis"],
    defaultReps: 10,
    defaultSets: 1,
    defaultTempo: "2-0-2",
    rpeTarget: 3,
    springSuggestion: "3-4 springs (heavy)",
    instructorNotes: "TODO: Verify exact spring recommendation varies by reformer brand"
  },
  {
    slug: "footwork-v-position",
    name: "Footwork - V Position",
    description: "Variation of footwork with heels together and toes apart, targeting the inner thighs and external rotators.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "glutes"],
    setupSteps: [
      "Lie supine on the carriage",
      "Place heels together on footbar, toes apart in a small V (about 45 degrees)",
      "Wrap toes over the bar edge",
      "Arms by sides, neutral spine"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, press through feet maintaining the V shape",
      "Keep inner thighs engaged and heels connected",
      "Inhale at extension",
      "Exhale, control the return"
    ],
    cues: [
      "Squeeze heels together throughout",
      "Rotate from the hip, not the knee",
      "Maintain connection through the inner thigh line"
    ],
    commonMistakes: [
      "Letting heels separate during movement",
      "Over-rotating causing knee strain",
      "Tucking pelvis"
    ],
    modifications: {
      easier: ["Reduce spring tension", "Smaller range"],
      harder: ["Relevé variation", "Tempo changes"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "External rotation should come from hips, not forced through knees.",
    primaryMuscles: ["quadriceps", "adductors"],
    secondaryMuscles: ["external_hip_rotators", "gastrocnemius"],
    defaultReps: 10,
    defaultSets: 1,
    defaultTempo: "2-0-2",
    rpeTarget: 3,
    springSuggestion: "3-4 springs (heavy)",
    instructorNotes: null
  },
  {
    slug: "hundred-prep",
    name: "Hundred Prep",
    description: "Preparatory version of the classic Hundred, building core endurance and breath control without full leg extension.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["core"],
    setupSteps: [
      "Lie supine, legs in tabletop position (90-90)",
      "Hold straps with arms extended toward ceiling",
      "Head and shoulders can remain down for prep level"
    ],
    executionSteps: [
      "Curl head, neck, and shoulders off the carriage",
      "Lower arms to hip height",
      "Begin pumping arms in small controlled movements",
      "Breathe in for 5 pumps, out for 5 pumps",
      "Maintain stable torso throughout"
    ],
    cues: [
      "Pump from the shoulder, not the wrist",
      "Keep lower back connected to carriage",
      "Gaze toward navel, chin slightly tucked"
    ],
    commonMistakes: [
      "Neck tension - pulling with neck instead of abs",
      "Lower back arching off carriage",
      "Holding breath"
    ],
    modifications: {
      easier: ["Keep head down", "Feet on footbar instead of tabletop"],
      harder: ["Extend legs to 45 degrees", "Full Hundred with legs lower"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Modify head position if neck strain occurs. Core should do the work, not neck.",
    primaryMuscles: ["rectus_abdominis", "transverse_abdominis"],
    secondaryMuscles: ["hip_flexors", "anterior_deltoids"],
    defaultDuration: 60,
    defaultSets: 1,
    rpeTarget: 5,
    springSuggestion: "1 spring (light)",
    instructorNotes: "TODO: Confirm spring tension recommendation"
  },

  // ============================================
  // CORE ACTIVATION
  // ============================================
  {
    slug: "abdominal-curls",
    name: "Abdominal Curls",
    description: "Controlled spinal flexion exercise using the straps to target the abdominals while maintaining proper alignment.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["core"],
    setupSteps: [
      "Lie supine with feet in straps or on footbar",
      "Hold straps, arms extended toward ceiling",
      "Neutral pelvis, natural breath"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, nod chin and curl up sequentially through the spine",
      "Reach arms toward thighs as you lift",
      "Inhale, hold at top",
      "Exhale, roll down vertebra by vertebra"
    ],
    cues: [
      "Initiate with breath, then movement",
      "Scoop the abdominals - navel to spine",
      "Keep shoulders away from ears"
    ],
    commonMistakes: [
      "Using momentum instead of control",
      "Pulling with arms instead of core",
      "Flattening lower back excessively"
    ],
    modifications: {
      easier: ["Smaller range of motion", "Feet on footbar for stability"],
      harder: ["Add rotation", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Stop if lower back pain occurs. Focus on quality over height of curl.",
    primaryMuscles: ["rectus_abdominis"],
    secondaryMuscles: ["obliques", "transverse_abdominis"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "coordination",
    name: "Coordination",
    description: "Classic Pilates exercise challenging core stability while coordinating arm and leg movements.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "legs"],
    setupSteps: [
      "Lie supine, hold straps with bent elbows by sides",
      "Legs in tabletop position",
      "Head and shoulders lifted (curl up position)"
    ],
    executionSteps: [
      "Exhale and simultaneously extend arms down and legs out to 45 degrees",
      "Open legs hip-width, close legs",
      "Bend knees back to tabletop",
      "Bend elbows to return to start",
      "Maintain curl throughout"
    ],
    cues: [
      "Everything moves together on the extension",
      "Keep lower back anchored",
      "Control the sequence - don't rush"
    ],
    commonMistakes: [
      "Losing the upper body curl",
      "Lower back arching when legs extend",
      "Arms and legs moving at different times"
    ],
    modifications: {
      easier: ["Keep legs higher (60 degrees)", "Smaller range"],
      harder: ["Lower leg angle", "Add beats"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Only lower legs as far as core can maintain stability.",
    primaryMuscles: ["rectus_abdominis", "transverse_abdominis"],
    secondaryMuscles: ["hip_flexors", "adductors", "triceps"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "1-1-1-1",
    rpeTarget: 6,
    springSuggestion: "1 spring (light)",
    instructorNotes: null
  },
  {
    slug: "single-leg-stretch",
    name: "Single Leg Stretch",
    description: "Core stability exercise with alternating leg movements, challenging the ability to maintain a stable pelvis.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["core"],
    setupSteps: [
      "Lie supine, curl head and shoulders up",
      "Hold straps or place hands on shins",
      "One leg extended, one leg bent to chest"
    ],
    executionSteps: [
      "Exhale, switch legs - extend bent leg, bend extended leg",
      "Maintain upper body curl throughout",
      "Keep pelvis stable - no rocking",
      "Continue alternating with breath"
    ],
    cues: [
      "Reach long through the extended leg",
      "Pull navel to spine",
      "Keep shoulders stable and down"
    ],
    commonMistakes: [
      "Rocking pelvis side to side",
      "Dropping the head between reps",
      "Extended leg dropping too low"
    ],
    modifications: {
      easier: ["Keep extended leg higher", "Head down"],
      harder: ["Lower extended leg", "Add arm pattern"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Keep extended leg only as low as pelvis can stay stable.",
    primaryMuscles: ["rectus_abdominis", "transverse_abdominis"],
    secondaryMuscles: ["hip_flexors", "obliques"],
    defaultReps: 10,
    defaultSets: 1,
    defaultTempo: "1-1",
    rpeTarget: 5,
    springSuggestion: "No springs (body weight) or 1 light spring for assistance",
    instructorNotes: "TODO: Verify if this is typically done with or without springs"
  },

  // ============================================
  // GLUTE & HIP EXERCISES
  // ============================================
  {
    slug: "bridging",
    name: "Bridging",
    description: "Spinal articulation exercise targeting the glutes and hamstrings while mobilizing the spine.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["glutes", "core", "back"],
    setupSteps: [
      "Lie supine with feet on footbar, hip-width apart",
      "Arms by sides, palms down",
      "Neutral spine to start"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, tilt pelvis and peel spine off carriage vertebra by vertebra",
      "Lift until weight is on shoulder blades (not neck)",
      "Inhale, hold at top",
      "Exhale, roll down from upper back through to tailbone"
    ],
    cues: [
      "Articulate through each vertebra",
      "Keep weight out of neck",
      "Squeeze glutes at the top"
    ],
    commonMistakes: [
      "Lifting too high onto neck",
      "Using momentum instead of articulation",
      "Knees falling inward"
    ],
    modifications: {
      easier: ["Smaller range", "Feet on carriage instead of footbar"],
      harder: ["Single leg bridge", "Add marching at top"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Weight should be on shoulder blades, never on cervical spine.",
    primaryMuscles: ["gluteus_maximus", "hamstrings"],
    secondaryMuscles: ["erector_spinae", "transverse_abdominis"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 4,
    springSuggestion: "2-3 springs (medium to heavy)",
    instructorNotes: null
  },
  {
    slug: "leg-circles-supine",
    name: "Leg Circles (Supine)",
    description: "Hip mobility exercise performed lying down with one leg in the strap, circling to improve range of motion.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "mobility"],
    setupSteps: [
      "Lie supine with one leg extended on carriage, one leg in strap",
      "Strap leg extended toward ceiling",
      "Arms by sides, pelvis neutral"
    ],
    executionSteps: [
      "Circle the leg across the body, down, out, and back up",
      "Keep the circle controlled and within stable pelvis range",
      "Complete circles in one direction, then reverse",
      "Maintain length in both legs throughout"
    ],
    cues: [
      "Keep pelvis absolutely still",
      "Circle from the hip socket",
      "Maintain length through the moving leg"
    ],
    commonMistakes: [
      "Pelvis rocking with the circle",
      "Circles too large for stability",
      "Bending the knee of circling leg"
    ],
    modifications: {
      easier: ["Smaller circles", "Bend bottom leg for stability"],
      harder: ["Larger circles", "Both legs in straps"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Only circle as large as pelvis can stay stable.",
    primaryMuscles: ["hip_flexors", "adductors", "abductors"],
    secondaryMuscles: ["transverse_abdominis", "hamstrings"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-0-0",
    rpeTarget: 3,
    springSuggestion: "1 spring (light)",
    instructorNotes: "5 circles each direction per set"
  },
  {
    slug: "side-lying-leg-press",
    name: "Side-Lying Leg Press",
    description: "Lateral hip strengthening exercise targeting the gluteus medius and external rotators.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["glutes", "legs"],
    setupSteps: [
      "Lie on side with bottom shoulder against shoulder rest",
      "Bottom leg bent for stability",
      "Top foot on footbar, leg extended"
    ],
    executionSteps: [
      "Exhale, press through top foot to push carriage away",
      "Maintain alignment - hip stacked over hip",
      "Inhale, control the return",
      "Keep pelvis stable throughout"
    ],
    cues: [
      "Press through the whole foot",
      "Don't let top hip roll forward or back",
      "Lengthen through the crown of head"
    ],
    commonMistakes: [
      "Hip rolling forward (losing neutral)",
      "Using momentum",
      "Collapsing through the waist"
    ],
    modifications: {
      easier: ["Reduce spring tension", "Smaller range"],
      harder: ["Add external rotation at top", "Tempo variations"]
    },
    contraindications: ["shoulder_sensitive", "lower_back_sensitive"],
    safetyNotes: "Ensure proper shoulder positioning to avoid strain.",
    primaryMuscles: ["gluteus_medius", "gluteus_minimus"],
    secondaryMuscles: ["quadriceps", "obliques"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "frog",
    name: "Frog",
    description: "Inner thigh and core exercise performed supine with both legs in straps in an externally rotated position.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "glutes", "core"],
    setupSteps: [
      "Lie supine with both feet in straps",
      "Heels together, toes apart (frog position)",
      "Knees bent and open to sides",
      "Arms by sides, neutral spine"
    ],
    executionSteps: [
      "Exhale, extend legs out to 45-degree angle, keeping heels together",
      "Maintain external rotation throughout",
      "Inhale, bend knees back to frog position",
      "Control the movement in both directions"
    ],
    cues: [
      "Keep heels glued together",
      "Rotate from the hips, not the knees",
      "Lower back stays connected to carriage"
    ],
    commonMistakes: [
      "Heels separating during extension",
      "Lower back arching",
      "Losing external rotation"
    ],
    modifications: {
      easier: ["Higher leg angle (60 degrees)", "Lighter springs"],
      harder: ["Lower leg angle", "Pause at extension"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Do not force external rotation. Work within comfortable range.",
    primaryMuscles: ["adductors", "hip_flexors"],
    secondaryMuscles: ["quadriceps", "transverse_abdominis"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 4,
    springSuggestion: "2 springs (medium)",
    instructorNotes: null
  },
  {
    slug: "standing-side-splits",
    name: "Standing Side Splits",
    description: "Advanced standing exercise for inner thigh, core stability, and balance.",
    equipment: "reformer",
    difficulty: "advanced",
    focusAreas: ["legs", "core", "mobility"],
    setupSteps: [
      "Stand with one foot on carriage, one on platform",
      "Feet parallel, facing the side of reformer",
      "Arms in T position or hands on hips for balance"
    ],
    executionSteps: [
      "Inhale, allow carriage to slide out, lowering into a wide stance",
      "Keep weight centered, torso upright",
      "Exhale, draw carriage back using inner thigh of carriage leg",
      "Return to start position with control"
    ],
    cues: [
      "Initiate return from the inner thigh",
      "Keep torso absolutely vertical",
      "Move with control, not momentum"
    ],
    commonMistakes: [
      "Leaning toward platform leg",
      "Going too wide and losing control",
      "Using momentum to return"
    ],
    modifications: {
      easier: ["Hold onto footbar for balance", "Smaller range"],
      harder: ["Add arm movements", "Slower tempo"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Only go as wide as you can control. This is an advanced exercise.",
    primaryMuscles: ["adductors", "quadriceps"],
    secondaryMuscles: ["gluteus_medius", "core_stabilizers"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "3-0-3",
    rpeTarget: 7,
    springSuggestion: "1 spring (light)",
    instructorNotes: "TODO: Review spring tension - varies significantly by client"
  },

  // ============================================
  // ARM & UPPER BODY
  // ============================================
  {
    slug: "arm-circles",
    name: "Arm Circles",
    description: "Shoulder mobility and stability exercise performed lying supine with straps.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["arms", "posture"],
    setupSteps: [
      "Lie supine with arms extended toward ceiling, holding straps",
      "Legs can be in tabletop or feet on footbar",
      "Neutral spine, shoulders down and back"
    ],
    executionSteps: [
      "Open arms out to sides (T position)",
      "Continue circle down toward hips",
      "Bring arms together at hips",
      "Return to ceiling position",
      "Reverse direction after set"
    ],
    cues: [
      "Keep ribcage anchored - don't let it pop up",
      "Move from the shoulder socket",
      "Maintain even tension on both straps"
    ],
    commonMistakes: [
      "Ribcage lifting when arms go overhead",
      "Uneven tension causing asymmetry",
      "Rushing the movement"
    ],
    modifications: {
      easier: ["Smaller circles", "Heavier springs for assistance"],
      harder: ["Larger circles", "Add leg coordination"]
    },
    contraindications: ["shoulder_sensitive"],
    safetyNotes: "Keep movement within pain-free range. Stop if shoulder impingement symptoms occur.",
    primaryMuscles: ["pectoralis_major", "latissimus_dorsi", "deltoids"],
    secondaryMuscles: ["rotator_cuff", "serratus_anterior"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "3-0-0",
    rpeTarget: 3,
    springSuggestion: "1 spring (light)",
    instructorNotes: "8 circles each direction"
  },
  {
    slug: "pulling-straps",
    name: "Pulling Straps",
    description: "Back extension and posterior chain strengthening exercise performed prone on the long box.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["back", "arms", "posture"],
    setupSteps: [
      "Place long box on carriage",
      "Lie prone with chest just off the front edge of box",
      "Hold straps, arms extended forward",
      "Legs together and extended"
    ],
    executionSteps: [
      "Inhale to prepare with length through spine",
      "Exhale, pull straps toward hips while lifting chest into extension",
      "Squeeze shoulder blades together at the top",
      "Inhale, hold",
      "Exhale, return with control"
    ],
    cues: [
      "Lead with the chest, not the head",
      "Pull shoulder blades down and back",
      "Keep legs engaged and together"
    ],
    commonMistakes: [
      "Over-extending the neck",
      "Lifting only from lower back",
      "Arms pulling unevenly"
    ],
    modifications: {
      easier: ["Smaller extension", "Heavier springs"],
      harder: ["T-pull variation", "Hold at top longer"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Extension should be distributed through thoracic spine. Do not compress lower back.",
    primaryMuscles: ["erector_spinae", "rhomboids", "latissimus_dorsi"],
    secondaryMuscles: ["posterior_deltoids", "triceps", "gluteus_maximus"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light)",
    instructorNotes: null
  },
  {
    slug: "chest-expansion",
    name: "Chest Expansion",
    description: "Postural exercise that opens the chest and shoulders while strengthening the back.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["posture", "arms", "back"],
    setupSteps: [
      "Kneel on carriage facing the footbar",
      "Hold straps with arms extended forward at shoulder height",
      "Tall kneeling position with hips over knees"
    ],
    executionSteps: [
      "Inhale, pull straps back past hips, opening chest",
      "Look right, look left, look center (while holding)",
      "Exhale, return arms forward with control"
    ],
    cues: [
      "Lead with the chest, not the arms",
      "Keep abdominals engaged to support spine",
      "Head turns happen without body moving"
    ],
    commonMistakes: [
      "Leaning back instead of opening chest",
      "Shrugging shoulders toward ears",
      "Letting ribcage flare"
    ],
    modifications: {
      easier: ["Omit head turns", "Lighter springs"],
      harder: ["Standing variation", "Tempo changes"]
    },
    contraindications: ["knee_sensitive", "shoulder_sensitive"],
    safetyNotes: "Use padding under knees if sensitive. Keep movement within comfortable range.",
    primaryMuscles: ["rhomboids", "posterior_deltoids"],
    secondaryMuscles: ["latissimus_dorsi", "triceps", "erector_spinae"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "2-2-2",
    rpeTarget: 4,
    springSuggestion: "1-2 springs (light)",
    instructorNotes: "Look pattern: right-left-center (or omit for beginners)"
  },
  {
    slug: "rowing-from-chest",
    name: "Rowing from Chest",
    description: "Complex rowing exercise that challenges core stability while mobilizing the spine and shoulders.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "back", "arms"],
    setupSteps: [
      "Sit on carriage facing rear, legs extended (or crossed for stability)",
      "Hold straps at chest height with elbows bent",
      "Sit tall with neutral spine"
    ],
    executionSteps: [
      "Round spine back while pressing arms forward",
      "Roll back to about a 45-degree angle",
      "Open arms to T position",
      "Reach arms back behind body",
      "Circle arms forward and down",
      "Roll up through spine to return to start"
    ],
    cues: [
      "Articulate through the spine",
      "Scoop the abdominals throughout",
      "Keep shoulders down as arms move"
    ],
    commonMistakes: [
      "Collapsing in the low back instead of rounding",
      "Using momentum to roll up",
      "Losing arm-spring connection"
    ],
    modifications: {
      easier: ["Smaller range of motion", "Bend knees for stability"],
      harder: ["Lower carriage (more challenge to roll up)", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "This is a complex exercise. Master individual components first.",
    primaryMuscles: ["rectus_abdominis", "latissimus_dorsi"],
    secondaryMuscles: ["rhomboids", "posterior_deltoids", "erector_spinae"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-1-3-1",
    rpeTarget: 6,
    springSuggestion: "1 spring (light)",
    instructorNotes: "TODO: Multiple rowing variations exist - verify this is 'Rowing Front' or 'Rowing from Chest'"
  },

  // ============================================
  // SPINAL MOBILITY
  // ============================================
  {
    slug: "spine-stretch-forward",
    name: "Spine Stretch Forward",
    description: "Seated forward flexion exercise focusing on spinal articulation and hamstring length.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["back", "mobility"],
    setupSteps: [
      "Sit on carriage facing footbar, legs extended through straps or resting on carriage",
      "Hold footbar or straps",
      "Sit tall with arms extended forward"
    ],
    executionSteps: [
      "Inhale, sit even taller",
      "Exhale, nod chin and round forward from the crown of the head",
      "Articulate through each vertebra, reaching forward",
      "Inhale, hold at maximum flexion",
      "Exhale, roll up vertebra by vertebra to tall sitting"
    ],
    cues: [
      "Round forward like you're going over a beach ball",
      "Keep abdominals scooped throughout",
      "Lead with the crown of the head on the return"
    ],
    commonMistakes: [
      "Collapsing rather than articulating",
      "Hiking shoulders",
      "Bending from the hips instead of articulating spine"
    ],
    modifications: {
      easier: ["Sit on box for height", "Bend knees slightly"],
      harder: ["Add rotation", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Focus on articulation quality over depth of flexion.",
    primaryMuscles: ["erector_spinae", "rectus_abdominis"],
    secondaryMuscles: ["hamstrings", "rhomboids"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 3,
    springSuggestion: "1 spring (light) or no springs",
    instructorNotes: null
  },
  {
    slug: "mermaid",
    name: "Mermaid",
    description: "Lateral flexion exercise that stretches the side body and mobilizes the spine.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["back", "mobility", "core"],
    setupSteps: [
      "Sit sideways on carriage, legs folded (mermaid position)",
      "Inside hand on footbar, outside arm reaching up",
      "Sit tall before starting"
    ],
    executionSteps: [
      "Inhale, reach up and over toward footbar",
      "Push carriage away with hand as you side bend",
      "Feel stretch along outside of body",
      "Exhale, return to start using obliques",
      "Repeat, then switch sides"
    ],
    cues: [
      "Reach out before you go over",
      "Keep both hips grounded",
      "Think of making a rainbow arc"
    ],
    commonMistakes: [
      "Rotating instead of pure lateral flexion",
      "Lifting opposite hip",
      "Collapsing into the stretch"
    ],
    modifications: {
      easier: ["Smaller range", "Lighter spring"],
      harder: ["Add rotation variation", "Hold stretch longer"]
    },
    contraindications: ["shoulder_sensitive", "lower_back_sensitive"],
    safetyNotes: "Keep movement in a pain-free range. Do not force the stretch.",
    primaryMuscles: ["obliques", "quadratus_lumborum"],
    secondaryMuscles: ["latissimus_dorsi", "intercostals"],
    defaultReps: 4,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 3,
    springSuggestion: "1 spring (light)",
    instructorNotes: "4 reps each side per set"
  },
  {
    slug: "cat-stretch",
    name: "Cat Stretch",
    description: "Spinal mobility exercise performed in quadruped position, flexing and extending the spine.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["back", "mobility"],
    setupSteps: [
      "Kneel on carriage with hands on footbar",
      "Wrists under shoulders, knees under hips",
      "Start in neutral spine position"
    ],
    executionSteps: [
      "Exhale, round spine toward ceiling (cat position)",
      "Tuck chin and tailbone under",
      "Inhale, arch spine, lifting head and tailbone (cow position)",
      "Flow between positions with breath"
    ],
    cues: [
      "Move from the center of your spine outward",
      "Let the breath initiate the movement",
      "Keep arms straight throughout"
    ],
    commonMistakes: [
      "Only moving from the lower back",
      "Holding breath",
      "Rushing the movement"
    ],
    modifications: {
      easier: ["Smaller range of motion"],
      harder: ["Add thread the needle rotation", "One arm variation"]
    },
    contraindications: ["wrist_sensitive", "knee_sensitive"],
    safetyNotes: "Use wrist support if needed. Move gently within comfortable range.",
    primaryMuscles: ["erector_spinae", "rectus_abdominis"],
    secondaryMuscles: ["multifidus", "transverse_abdominis"],
    defaultReps: 8,
    defaultSets: 1,
    defaultTempo: "2-0-2",
    rpeTarget: 2,
    springSuggestion: "2 springs (medium) for stability",
    instructorNotes: null
  },
  {
    slug: "elephant",
    name: "Elephant",
    description: "Standing pike position exercise that challenges hamstring flexibility and spinal articulation.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["legs", "back", "core"],
    setupSteps: [
      "Stand on carriage with heels against shoulder rests",
      "Hands on footbar, arms straight",
      "Pike position with head between arms"
    ],
    executionSteps: [
      "Inhale, push carriage back by hinging at hips",
      "Keep legs as straight as possible",
      "Exhale, pull carriage forward using core and hip flexors",
      "Maintain rounded upper back throughout"
    ],
    cues: [
      "Push through the heels",
      "Scoop the abdominals to pull carriage in",
      "Keep head heavy between arms"
    ],
    commonMistakes: [
      "Bending the knees excessively",
      "Using arms to push instead of legs",
      "Flattening lower back"
    ],
    modifications: {
      easier: ["Bend knees slightly", "Smaller range"],
      harder: ["Single leg variation", "Tempo changes"]
    },
    contraindications: ["wrist_sensitive", "lower_back_sensitive"],
    safetyNotes: "Requires adequate hamstring flexibility. Modify range as needed.",
    primaryMuscles: ["hamstrings", "rectus_abdominis"],
    secondaryMuscles: ["hip_flexors", "erector_spinae", "deltoids"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "2 springs (medium)",
    instructorNotes: null
  },

  // ============================================
  // LEG & HIP (ADDITIONAL)
  // ============================================
  {
    slug: "running",
    name: "Running",
    description: "Dynamic footwork variation mimicking running motion, great for calf and ankle work.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs"],
    setupSteps: [
      "Lie supine with balls of feet on footbar, legs extended",
      "Heels lifted (relevé position)",
      "Arms by sides, neutral spine"
    ],
    executionSteps: [
      "Press out to full leg extension",
      "Begin alternating heel drops - one heel lowers under bar as other lifts",
      "Maintain stable pelvis and continuous movement",
      "Keep movement smooth and controlled"
    ],
    cues: [
      "Think of prancing, not stomping",
      "Keep pelvis still - no rocking",
      "Maintain even pace"
    ],
    commonMistakes: [
      "Pelvis rocking side to side",
      "Moving too fast",
      "Letting knees bend during heel drops"
    ],
    modifications: {
      easier: ["Slower pace", "Smaller range in heels"],
      harder: ["Faster tempo", "Single spring"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Stop if calf cramping occurs. Ensure adequate calf flexibility.",
    primaryMuscles: ["gastrocnemius", "soleus"],
    secondaryMuscles: ["quadriceps", "tibialis_anterior"],
    defaultDuration: 60,
    defaultSets: 1,
    rpeTarget: 4,
    springSuggestion: "3-4 springs (heavy)",
    instructorNotes: null
  },
  {
    slug: "standing-leg-pumps",
    name: "Standing Leg Pumps",
    description: "Standing single-leg exercise for glute and leg strength with balance challenge.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["legs", "glutes", "core"],
    setupSteps: [
      "Stand on platform facing footbar",
      "One foot on carriage, one on platform",
      "Hands on footbar for support",
      "Hinge slightly forward from hips"
    ],
    executionSteps: [
      "Exhale, press carriage back with the leg on carriage",
      "Extend leg fully while maintaining hip hinge",
      "Inhale, return carriage with control",
      "Keep standing leg stable throughout"
    ],
    cues: [
      "Press through the whole foot on the carriage",
      "Keep hips square",
      "Maintain slight forward lean"
    ],
    commonMistakes: [
      "Standing leg collapsing",
      "Hips rotating open",
      "Using momentum"
    ],
    modifications: {
      easier: ["Smaller range", "Lighter spring"],
      harder: ["Release hands from bar", "Add pulse at extension"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Ensure stable standing leg. Hold footbar as long as needed for balance.",
    primaryMuscles: ["gluteus_maximus", "quadriceps", "hamstrings"],
    secondaryMuscles: ["core_stabilizers", "hip_flexors"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: "10 reps each leg"
  },
  {
    slug: "scooter",
    name: "Scooter",
    description: "Standing hip extension exercise targeting the glutes while challenging balance and stability.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["glutes", "legs", "core"],
    setupSteps: [
      "Stand on carriage with one foot, other foot on platform",
      "Hands on footbar, body in slight forward lean",
      "Platform leg is the working leg"
    ],
    executionSteps: [
      "Exhale, press platform foot back to push carriage",
      "Extend hip while keeping spine neutral",
      "Inhale, return with control",
      "Keep standing leg on carriage stable"
    ],
    cues: [
      "Squeeze glute to drive the movement",
      "Don't let lower back arch",
      "Keep hips level"
    ],
    commonMistakes: [
      "Arching lower back to get more range",
      "Rotating hips",
      "Bouncing at end range"
    ],
    modifications: {
      easier: ["Smaller range", "Hold footbar firmly"],
      harder: ["Let go of footbar", "Add external rotation"]
    },
    contraindications: ["lower_back_sensitive", "knee_sensitive"],
    safetyNotes: "Do not sacrifice form for range. Stop if lower back strain.",
    primaryMuscles: ["gluteus_maximus"],
    secondaryMuscles: ["hamstrings", "erector_spinae", "core_stabilizers"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: "10 reps each leg"
  },
  {
    slug: "knee-stretches-round",
    name: "Knee Stretches (Round Back)",
    description: "Dynamic core and hip flexor exercise performed in quadruped with rounded spine.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "legs"],
    setupSteps: [
      "Kneel on carriage with hands on footbar",
      "Feet against shoulder rests",
      "Round spine deeply (C-curve)",
      "Keep abdominals scooped"
    ],
    executionSteps: [
      "Maintain rounded spine throughout",
      "Exhale, push carriage back with feet",
      "Inhale, pull carriage in using core",
      "Keep the rounding constant - no flattening"
    ],
    cues: [
      "Pull navel to spine throughout",
      "Think of the carriage as being pulled by your abs",
      "Keep shoulders over wrists"
    ],
    commonMistakes: [
      "Flattening back during movement",
      "Using arms to push",
      "Losing the C-curve at end range"
    ],
    modifications: {
      easier: ["Smaller range", "Slower tempo"],
      harder: ["Flat back variation", "Tempo changes"]
    },
    contraindications: ["wrist_sensitive", "knee_sensitive"],
    safetyNotes: "Wrist padding may help. Focus on maintaining spinal position.",
    primaryMuscles: ["rectus_abdominis", "transverse_abdominis"],
    secondaryMuscles: ["hip_flexors", "quadriceps"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "1-0-1",
    rpeTarget: 6,
    springSuggestion: "2 springs (medium)",
    instructorNotes: null
  },

  // ============================================
  // COOLDOWN
  // ============================================
  {
    slug: "hip-stretch-series",
    name: "Hip Stretch Series",
    description: "Kneeling stretch series targeting hip flexors and quadriceps.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["mobility", "legs"],
    setupSteps: [
      "Kneel on carriage with one foot on footbar (lunge position)",
      "Back knee on carriage near shoulder rest",
      "Hands on footbar for balance"
    ],
    executionSteps: [
      "Allow carriage to slide back gently, deepening hip flexor stretch",
      "Keep pelvis square and torso upright",
      "Hold stretch for 30-60 seconds",
      "Optional: add side bend for IT band stretch"
    ],
    cues: [
      "Tuck pelvis slightly to deepen hip flexor stretch",
      "Keep chest lifted",
      "Breathe into the stretch"
    ],
    commonMistakes: [
      "Letting lower back arch",
      "Twisting torso",
      "Bouncing in the stretch"
    ],
    modifications: {
      easier: ["Smaller range", "Use padding under knee"],
      harder: ["Add arm reaches", "Add rotation"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Use knee padding. Move gently into stretch, never force.",
    primaryMuscles: ["hip_flexors", "quadriceps"],
    secondaryMuscles: ["psoas", "rectus_femoris"],
    defaultDuration: 45,
    defaultSets: 1,
    rpeTarget: 2,
    springSuggestion: "1 spring (light) for stability",
    instructorNotes: "45 seconds each side"
  },
  {
    slug: "hamstring-stretch",
    name: "Hamstring Stretch",
    description: "Supine hamstring stretch using the straps for support and assistance.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["mobility", "legs"],
    setupSteps: [
      "Lie supine with one leg in strap",
      "Extend leg toward ceiling",
      "Other leg extended on carriage or bent with foot on footbar"
    ],
    executionSteps: [
      "Use strap to gently pull leg toward chest",
      "Keep leg straight (or slightly soft knee)",
      "Hold stretch while breathing deeply",
      "Gently release and switch sides"
    ],
    cues: [
      "Relax into the stretch",
      "Keep pelvis neutral - don't tuck",
      "Breathe and let muscle release"
    ],
    commonMistakes: [
      "Forcing the stretch too aggressively",
      "Bending knee excessively",
      "Holding breath"
    ],
    modifications: {
      easier: ["Bend knee more", "Smaller range"],
      harder: ["Add ankle circles while holding", "Point and flex foot"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Stretch should feel comfortable, not painful. Ease into it gradually.",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["gastrocnemius", "gluteus_maximus"],
    defaultDuration: 45,
    defaultSets: 1,
    rpeTarget: 2,
    springSuggestion: "1 spring (light)",
    instructorNotes: "45 seconds each leg"
  },

  // ============================================
  // ADDITIONAL CLASSIC REFORMER EXERCISES
  // ============================================
  {
    slug: "short-spine-massage",
    name: "Short Spine Massage",
    description: "Classic reformer exercise for spinal articulation and hip mobility. The carriage movement assists in rolling the spine up and down while the legs are supported in the straps.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["back", "mobility", "core"],
    setupSteps: [
      "Lie supine with feet in straps, headrest flat",
      "Legs extended at approximately 45 degrees",
      "Arms by sides, palms down",
      "Ensure adequate strap length for movement"
    ],
    executionSteps: [
      "Inhale, bring legs to tabletop then extend toward ceiling",
      "Exhale, use core to lift hips and roll spine off carriage",
      "Continue rolling until weight is on shoulder blades, knees near forehead",
      "Bend knees toward shoulders, keeping heels together",
      "Inhale, hold",
      "Exhale, roll down through spine one vertebra at a time",
      "Extend legs to return to start position"
    ],
    cues: [
      "Articulate through each vertebra",
      "Keep weight off the neck - support on shoulder blades",
      "Control the descent with your abdominals"
    ],
    commonMistakes: [
      "Rolling too high onto the neck",
      "Using momentum instead of control",
      "Allowing straps to go slack"
    ],
    modifications: {
      easier: ["Smaller range of motion", "Keep knees bent throughout"],
      harder: ["Pause at each phase", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Ensure headrest is flat. Do not roll onto neck. Those with cervical issues should avoid.",
    primaryMuscles: ["erector_spinae", "rectus_abdominis"],
    secondaryMuscles: ["hamstrings", "hip_flexors", "multifidus"],
    defaultReps: 5,
    defaultSets: 1,
    defaultTempo: "3-1-3",
    rpeTarget: 5,
    springSuggestion: "2 springs (medium)",
    instructorNotes: "TODO: Verify strap length recommendations vary by reformer"
  },
  {
    slug: "long-spine-massage",
    name: "Long Spine Massage",
    description: "Advanced spinal articulation exercise similar to Short Spine but with legs remaining straight throughout, requiring greater hamstring flexibility and core control.",
    equipment: "reformer",
    difficulty: "advanced",
    focusAreas: ["back", "mobility", "core"],
    setupSteps: [
      "Lie supine with feet in straps, headrest flat",
      "Legs extended at approximately 45 degrees",
      "Arms by sides pressing lightly into carriage",
      "Verify hamstring flexibility is adequate"
    ],
    executionSteps: [
      "Inhale, bring straight legs toward ceiling",
      "Exhale, continue lifting legs overhead while rolling spine off carriage",
      "Roll up until legs are parallel to floor overhead, weight on shoulder blades",
      "Inhale, open legs to shoulder width",
      "Exhale, roll down through spine with legs apart",
      "Close legs at bottom to return to start"
    ],
    cues: [
      "Keep legs straight and together during the roll up",
      "Open legs only at the top",
      "Roll down with control, feeling each vertebra"
    ],
    commonMistakes: [
      "Bending knees during movement",
      "Rolling onto neck",
      "Losing control on the way down"
    ],
    modifications: {
      easier: ["Perform Short Spine Massage instead", "Reduce range"],
      harder: ["Pause at top with legs together", "Ultra-slow tempo"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Advanced exercise requiring adequate hamstring flexibility. Do not attempt if Short Spine is not mastered.",
    primaryMuscles: ["erector_spinae", "rectus_abdominis", "hamstrings"],
    secondaryMuscles: ["hip_flexors", "adductors", "multifidus"],
    defaultReps: 4,
    defaultSets: 1,
    defaultTempo: "4-1-4",
    rpeTarget: 7,
    springSuggestion: "2 springs (medium)",
    instructorNotes: "TODO: Prerequisite flexibility assessment needed"
  },
  {
    slug: "semi-circle",
    name: "Semi-Circle",
    description: "Hip and spine mobility exercise performed with feet on the footbar and pelvis suspended, creating a circular movement pattern through the hips.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["mobility", "glutes", "back"],
    setupSteps: [
      "Lie supine and place feet on footbar, hip-width apart",
      "Lift pelvis into bridge position",
      "Slide body toward footbar until arms are long, hands holding shoulder rests",
      "Pelvis remains lifted throughout setup"
    ],
    executionSteps: [
      "From bridge position, press carriage out while keeping hips high",
      "At full extension, lower pelvis down toward carriage (arching spine)",
      "Pull carriage in while keeping pelvis low",
      "At home position, roll spine up to return to bridge",
      "Reverse direction for the second half"
    ],
    cues: [
      "Create a smooth circular motion with the pelvis",
      "Keep arms straight and shoulders stable",
      "Move through the full available range"
    ],
    commonMistakes: [
      "Losing the circular pattern",
      "Collapsing in the shoulders",
      "Moving too quickly"
    ],
    modifications: {
      easier: ["Smaller range of motion", "Lighter springs"],
      harder: ["Pause at each position", "Single leg variation"]
    },
    contraindications: ["shoulder_sensitive", "wrist_sensitive", "lower_back_sensitive"],
    safetyNotes: "Requires shoulder stability and wrist strength. Stop if any shoulder discomfort.",
    primaryMuscles: ["gluteus_maximus", "hamstrings", "erector_spinae"],
    secondaryMuscles: ["quadriceps", "hip_flexors", "deltoids"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-0-3",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: "5 reps each direction per set"
  },
  {
    slug: "stomach-massage-round",
    name: "Stomach Massage - Round Back",
    description: "Seated exercise on the carriage with feet on footbar, maintaining a rounded spine position while pressing out and in. First in the Stomach Massage series.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "legs", "posture"],
    setupSteps: [
      "Sit on front edge of carriage facing footbar",
      "Place balls of feet on footbar, heels lifted",
      "Hands hold front edge of carriage",
      "Round spine deeply, creating C-curve"
    ],
    executionSteps: [
      "Maintain rounded spine throughout",
      "Exhale, press feet to extend carriage",
      "Lower heels under footbar at extension",
      "Lift heels back to relevé",
      "Inhale, return carriage with control"
    ],
    cues: [
      "Scoop abdominals deeply throughout",
      "Keep shoulders down away from ears",
      "Press through the balls of feet evenly"
    ],
    commonMistakes: [
      "Losing the C-curve during movement",
      "Shoulders rising toward ears",
      "Sitting too far back on carriage"
    ],
    modifications: {
      easier: ["Omit heel lowering", "Lighter springs"],
      harder: ["Add more springs", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive", "knee_sensitive"],
    safetyNotes: "Maintain the rounded spine shape throughout. Do not flatten back.",
    primaryMuscles: ["rectus_abdominis", "quadriceps"],
    secondaryMuscles: ["gastrocnemius", "hip_flexors", "transverse_abdominis"],
    defaultReps: 8,
    defaultSets: 1,
    defaultTempo: "2-1-2",
    rpeTarget: 5,
    springSuggestion: "3 springs (medium-heavy)",
    instructorNotes: "TODO: Spring recommendations vary - start lighter for beginners"
  },
  {
    slug: "stomach-massage-flat",
    name: "Stomach Massage - Flat Back",
    description: "Second in the Stomach Massage series. Same leg action as Round Back but with a tall, flat spine and hands behind on the shoulder rests.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["posture", "legs", "core"],
    setupSteps: [
      "Sit on front edge of carriage facing footbar",
      "Place balls of feet on footbar, heels lifted",
      "Hands reach back to hold shoulder rests",
      "Lift tall through spine, chest open"
    ],
    executionSteps: [
      "Maintain tall spine throughout",
      "Exhale, press feet to extend carriage",
      "Lower heels under footbar at extension",
      "Lift heels back to relevé",
      "Inhale, return carriage with control"
    ],
    cues: [
      "Lift through the crown of the head",
      "Open chest, draw shoulder blades together",
      "Keep sitting bones grounded on carriage"
    ],
    commonMistakes: [
      "Leaning back instead of sitting tall",
      "Rounding forward as fatigue sets in",
      "Lifting sitting bones during movement"
    ],
    modifications: {
      easier: ["Omit heel lowering", "Reduce springs"],
      harder: ["Add springs", "Single leg variation"]
    },
    contraindications: ["shoulder_sensitive", "knee_sensitive"],
    safetyNotes: "If shoulder flexibility is limited, modify hand position.",
    primaryMuscles: ["erector_spinae", "quadriceps"],
    secondaryMuscles: ["gastrocnemius", "rhomboids", "transverse_abdominis"],
    defaultReps: 8,
    defaultSets: 1,
    defaultTempo: "2-1-2",
    rpeTarget: 5,
    springSuggestion: "2-3 springs (medium)",
    instructorNotes: "Usually performed with one less spring than Round Back"
  },
  {
    slug: "stomach-massage-reach",
    name: "Stomach Massage - Reach/Arms Off",
    description: "Third in the Stomach Massage series. Flat back position with arms reaching forward, challenging balance and core stability.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "posture", "legs"],
    setupSteps: [
      "Sit on front edge of carriage facing footbar",
      "Place balls of feet on footbar, heels lifted",
      "Arms reach forward at shoulder height",
      "Maintain tall spine without back support"
    ],
    executionSteps: [
      "Keep arms reaching forward throughout",
      "Exhale, press feet to extend carriage",
      "Lower heels under footbar at extension",
      "Lift heels back to relevé",
      "Inhale, return carriage with control"
    ],
    cues: [
      "Balance comes from core engagement",
      "Reach arms forward as counterbalance",
      "Maintain vertical torso throughout"
    ],
    commonMistakes: [
      "Leaning back for balance",
      "Dropping arms as fatigue sets in",
      "Rounding spine forward"
    ],
    modifications: {
      easier: ["Light fingertip touch on footbar for balance", "Fewer reps"],
      harder: ["Add twist at extension", "Hold weight in hands"]
    },
    contraindications: ["lower_back_sensitive", "knee_sensitive"],
    safetyNotes: "Core must be strong enough to maintain balance without hand support.",
    primaryMuscles: ["rectus_abdominis", "quadriceps", "erector_spinae"],
    secondaryMuscles: ["anterior_deltoids", "transverse_abdominis", "hip_flexors"],
    defaultReps: 6,
    defaultSets: 1,
    defaultTempo: "2-1-2",
    rpeTarget: 6,
    springSuggestion: "2 springs (medium)",
    instructorNotes: "Usually performed with fewer springs than Flat Back"
  },
  {
    slug: "swan-prep",
    name: "Swan Prep",
    description: "Preparatory back extension exercise performed prone on the long box, building strength for the full Swan.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["back", "posture"],
    setupSteps: [
      "Place long box on carriage",
      "Lie prone with chest at front edge of box",
      "Hands on footbar, arms extended",
      "Legs together and extended behind"
    ],
    executionSteps: [
      "Inhale to prepare, lengthening through spine",
      "Exhale, press hands into footbar to extend spine",
      "Lift chest while keeping hips on box",
      "Inhale at top of extension",
      "Exhale, lower with control"
    ],
    cues: [
      "Lengthen before you lift",
      "Keep neck in line with spine",
      "Draw shoulder blades down and together"
    ],
    commonMistakes: [
      "Overextending through lower back",
      "Lifting head first instead of chest",
      "Shrugging shoulders toward ears"
    ],
    modifications: {
      easier: ["Smaller range of extension", "Heavier springs"],
      harder: ["Hold at top longer", "Add arm circles"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Extension should be distributed through thoracic spine. Stop if lower back pain occurs.",
    primaryMuscles: ["erector_spinae", "trapezius"],
    secondaryMuscles: ["rhomboids", "posterior_deltoids", "gluteus_maximus"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 4,
    springSuggestion: "1-2 springs (light)",
    instructorNotes: null
  },
  {
    slug: "swan-full",
    name: "Swan",
    description: "Full back extension exercise on the long box with a dynamic rocking component, challenging back strength and coordination.",
    equipment: "reformer",
    difficulty: "advanced",
    focusAreas: ["back", "posture", "core"],
    setupSteps: [
      "Place long box on carriage",
      "Lie prone with chest at front edge of box",
      "Hands on footbar, arms extended",
      "Legs together, engaged and lifted slightly"
    ],
    executionSteps: [
      "Press into footbar to extend spine fully",
      "Release hands and reach arms forward",
      "Rock forward on box as legs lift behind",
      "Catch footbar as body rocks back",
      "Press up into extension again",
      "Repeat rocking motion with control"
    ],
    cues: [
      "Use momentum with control",
      "Keep legs engaged throughout",
      "Time the hand catch precisely"
    ],
    commonMistakes: [
      "Losing control of the rocking motion",
      "Not engaging legs sufficiently",
      "Compressing lower back"
    ],
    modifications: {
      easier: ["Swan Prep without rocking", "Hold extension statically"],
      harder: ["More rocking cycles", "Higher leg lift"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Advanced exercise. Master Swan Prep first. Spot may be needed initially.",
    primaryMuscles: ["erector_spinae", "gluteus_maximus"],
    secondaryMuscles: ["hamstrings", "trapezius", "posterior_deltoids"],
    defaultReps: 5,
    defaultSets: 1,
    defaultTempo: "continuous",
    rpeTarget: 7,
    springSuggestion: "1 spring (light)",
    instructorNotes: "TODO: Requires instructor supervision for beginners"
  },
  {
    slug: "long-stretch",
    name: "Long Stretch",
    description: "Plank position exercise pressing the carriage out and in, building core stability, shoulder strength, and full-body integration.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "arms", "posture"],
    setupSteps: [
      "Place hands on footbar, shoulder-width apart",
      "Step feet back onto headrest or carriage",
      "Establish plank position with body in one line",
      "Engage core, glutes, and legs"
    ],
    executionSteps: [
      "Inhale, push carriage back by hinging at shoulders",
      "Maintain plank position throughout",
      "Body moves as one unit",
      "Exhale, pull carriage forward using core"
    ],
    cues: [
      "Keep body in one straight line",
      "Don't let hips pike up or sag down",
      "Initiate return from the core, not arms"
    ],
    commonMistakes: [
      "Hips sagging toward carriage",
      "Hips piking up too high",
      "Using only arms instead of whole body"
    ],
    modifications: {
      easier: ["Knees on carriage", "Smaller range"],
      harder: ["Single leg variation", "Add push-up at home"]
    },
    contraindications: ["wrist_sensitive", "shoulder_sensitive"],
    safetyNotes: "Ensure wrists are properly aligned. Stop if shoulder or wrist pain occurs.",
    primaryMuscles: ["rectus_abdominis", "pectoralis_major", "anterior_deltoids"],
    secondaryMuscles: ["triceps", "serratus_anterior", "gluteus_maximus"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 6,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "up-stretch",
    name: "Up Stretch",
    description: "Pike position exercise on the reformer, moving the carriage with a focus on spinal articulation and core control.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "back", "arms"],
    setupSteps: [
      "Place hands on footbar, shoulder-width apart",
      "Feet on headrest or carriage, heels lifted",
      "Pike hips up, creating inverted V shape",
      "Head between arms, gazing toward feet"
    ],
    executionSteps: [
      "Inhale, push carriage back maintaining pike",
      "Exhale, shift forward into plank position",
      "Inhale, press hips up and back to pike",
      "Exhale, pull carriage in from pike"
    ],
    cues: [
      "Keep shoulders stable over wrists in plank",
      "Lead with the hips when returning to pike",
      "Maintain length through spine in pike"
    ],
    commonMistakes: [
      "Shoulders moving past wrists",
      "Losing the pike position",
      "Rounding upper back excessively"
    ],
    modifications: {
      easier: ["Stay in pike, no plank transition", "Smaller range"],
      harder: ["Lower to hover in plank", "Add more transitions"]
    },
    contraindications: ["wrist_sensitive", "shoulder_sensitive"],
    safetyNotes: "Requires adequate hamstring flexibility for pike position.",
    primaryMuscles: ["rectus_abdominis", "deltoids", "hamstrings"],
    secondaryMuscles: ["pectoralis_major", "triceps", "erector_spinae"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 6,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "down-stretch",
    name: "Down Stretch",
    description: "Back extension exercise from a kneeling position on the carriage, emphasizing hip flexor stretch and thoracic extension.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["back", "posture", "mobility"],
    setupSteps: [
      "Kneel on carriage with feet against shoulder rests",
      "Hands on footbar, shoulder-width apart",
      "Hips forward, chest lifted",
      "Create slight back extension"
    ],
    executionSteps: [
      "Inhale, push carriage back with feet",
      "Maintain extension through spine",
      "Hips press forward, stretching hip flexors",
      "Exhale, pull carriage in using core and hip extensors",
      "Return to start with control"
    ],
    cues: [
      "Lead with the chest, not the head",
      "Keep hips pressing forward",
      "Feel the stretch through the front of hips"
    ],
    commonMistakes: [
      "Collapsing into lower back",
      "Letting hips sit back toward heels",
      "Overextending the neck"
    ],
    modifications: {
      easier: ["Smaller range of motion", "More springs for support"],
      harder: ["Hold at extension", "Single arm variation"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Keep extension in mid-back, not lower back. Use padding under knees if sensitive.",
    primaryMuscles: ["erector_spinae", "hip_flexors", "quadriceps"],
    secondaryMuscles: ["pectoralis_major", "deltoids", "rectus_abdominis"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 5,
    springSuggestion: "2 springs (medium)",
    instructorNotes: null
  },
  {
    slug: "tendon-stretch",
    name: "Tendon Stretch",
    description: "Standing exercise on the carriage targeting the Achilles tendon and calves while challenging balance and core stability.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["legs", "core", "mobility"],
    setupSteps: [
      "Stand on carriage facing footbar",
      "Place balls of feet on edge of carriage, heels hanging off",
      "Hands on footbar for balance",
      "Slight pike in hips, similar to elephant position"
    ],
    executionSteps: [
      "Lower heels down toward springs, stretching calves",
      "Press through balls of feet to rise to relevé",
      "Maintain hip position throughout",
      "Control the lowering phase"
    ],
    cues: [
      "Keep weight forward over balls of feet",
      "Control the descent - don't drop the heels",
      "Maintain core engagement throughout"
    ],
    commonMistakes: [
      "Shifting weight too far back",
      "Dropping heels too quickly",
      "Losing the hip pike position"
    ],
    modifications: {
      easier: ["Smaller range of motion", "More springs"],
      harder: ["Single leg variation", "Remove hands from bar"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Those with Achilles tendon issues should proceed carefully.",
    primaryMuscles: ["gastrocnemius", "soleus"],
    secondaryMuscles: ["tibialis_anterior", "rectus_abdominis"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 4,
    springSuggestion: "2 springs (medium)",
    instructorNotes: null
  },
  {
    slug: "front-splits",
    name: "Front Splits",
    description: "Standing lunge exercise with one foot on the platform and one on the carriage, creating a deep hip flexor and hamstring stretch.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["mobility", "legs", "core"],
    setupSteps: [
      "Stand with one foot on platform, one on carriage",
      "Front foot on platform, back foot on carriage",
      "Hands on footbar for stability",
      "Square hips forward"
    ],
    executionSteps: [
      "Inhale, allow carriage to slide back",
      "Lower into a lunge, stretching hip flexor of back leg",
      "Keep torso upright",
      "Exhale, press through front heel to return",
      "Draw carriage in using inner thigh and glute"
    ],
    cues: [
      "Keep front knee over ankle, not past toes",
      "Square hips forward throughout",
      "Lengthen through the spine"
    ],
    commonMistakes: [
      "Front knee collapsing inward",
      "Leaning torso forward",
      "Hips rotating open"
    ],
    modifications: {
      easier: ["Smaller range", "Hold footbar throughout"],
      harder: ["Arms reaching overhead", "Deeper split"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Front knee should not extend past toes. Go only as deep as flexibility allows.",
    primaryMuscles: ["hip_flexors", "quadriceps", "gluteus_maximus"],
    secondaryMuscles: ["hamstrings", "adductors", "core_stabilizers"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: "6 reps each leg per set"
  },
  {
    slug: "kneeling-arm-press",
    name: "Kneeling Arm Press",
    description: "Kneeling on the carriage facing footbar, pressing arms down and back to strengthen the back and improve posture.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["arms", "posture", "core"],
    setupSteps: [
      "Kneel on carriage facing footbar",
      "Hold straps with arms extended forward at shoulder height",
      "Tall kneeling position, core engaged",
      "Shoulders down and back"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, press arms straight down toward hips",
      "Keep torso still, only arms move",
      "Inhale, return arms to shoulder height with control"
    ],
    cues: [
      "Keep chest lifted and open",
      "Don't let ribcage flare",
      "Press from the back, not just the arms"
    ],
    commonMistakes: [
      "Leaning back as arms press down",
      "Shrugging shoulders",
      "Letting ribcage thrust forward"
    ],
    modifications: {
      easier: ["Lighter springs", "Smaller range"],
      harder: ["Single arm variation", "Tempo changes"]
    },
    contraindications: ["knee_sensitive", "shoulder_sensitive"],
    safetyNotes: "Use padding under knees. Keep movement controlled.",
    primaryMuscles: ["latissimus_dorsi", "triceps"],
    secondaryMuscles: ["posterior_deltoids", "rhomboids", "core_stabilizers"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 4,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "kneeling-arm-circles-bilateral",
    name: "Kneeling Arm Circles",
    description: "Kneeling position with bilateral arm circles, improving shoulder mobility and stability while maintaining core engagement.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["arms", "posture", "mobility"],
    setupSteps: [
      "Kneel on carriage facing footbar",
      "Hold straps with arms at sides",
      "Tall kneeling position, core engaged",
      "Shoulders relaxed away from ears"
    ],
    executionSteps: [
      "Lift arms forward and up toward ceiling",
      "Open arms out to sides (T position)",
      "Lower arms down to sides",
      "Circle arms forward to complete the circle",
      "Reverse direction after completing reps"
    ],
    cues: [
      "Keep torso still - movement is only in shoulders",
      "Maintain even tension on both straps",
      "Draw circles smoothly without jerking"
    ],
    commonMistakes: [
      "Arching back when arms go overhead",
      "Rushing the movement",
      "Uneven arm movement"
    ],
    modifications: {
      easier: ["Smaller circles", "Lighter springs"],
      harder: ["Larger circles", "Add wrist weights"]
    },
    contraindications: ["shoulder_sensitive"],
    safetyNotes: "Keep circles within pain-free range. Modify range if shoulder impingement symptoms occur.",
    primaryMuscles: ["deltoids", "trapezius"],
    secondaryMuscles: ["rotator_cuff", "pectoralis_major", "latissimus_dorsi"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "3-0-0",
    rpeTarget: 3,
    springSuggestion: "1 spring (light)",
    instructorNotes: "8 circles each direction per set"
  },
  {
    slug: "backstroke",
    name: "Backstroke",
    description: "Supine arm and leg coordination exercise mimicking a backstroke swimming motion, challenging core stability.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "arms", "legs"],
    setupSteps: [
      "Lie supine with head on headrest",
      "Hold straps with arms reaching toward ceiling",
      "Legs in tabletop position",
      "Head and shoulders curled up (Pilates curl)"
    ],
    executionSteps: [
      "Extend arms overhead and legs out at 45 degrees simultaneously",
      "Circle arms out to sides while holding legs extended",
      "Arms sweep down toward hips",
      "Bend knees to tabletop as arms return to ceiling"
    ],
    cues: [
      "Keep lower back connected to carriage",
      "Move arms and legs together",
      "Maintain the curl throughout"
    ],
    commonMistakes: [
      "Lower back arching off carriage",
      "Dropping the head between reps",
      "Arms and legs moving at different speeds"
    ],
    modifications: {
      easier: ["Keep feet on footbar", "Head down"],
      harder: ["Lower leg angle", "Slower tempo"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Only lower legs as far as core can maintain connection to carriage.",
    primaryMuscles: ["rectus_abdominis", "hip_flexors"],
    secondaryMuscles: ["deltoids", "pectoralis_major", "transverse_abdominis"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 6,
    springSuggestion: "1 spring (light)",
    instructorNotes: null
  },
  {
    slug: "teaser-prep",
    name: "Teaser Prep",
    description: "Preparatory exercise for the full Teaser, building the core strength and control needed for this challenging movement.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core"],
    setupSteps: [
      "Lie supine with feet in straps or on footbar",
      "Arms extended along sides or holding straps",
      "Legs at tabletop or extended at 45 degrees"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, curl head, neck, and shoulders off carriage",
      "Reach arms toward feet",
      "Continue rolling up to seated V position",
      "Inhale at top",
      "Exhale, roll down with control"
    ],
    cues: [
      "Peel spine off carriage one vertebra at a time",
      "Reach toward feet, not up to ceiling",
      "Control the descent - don't fall back"
    ],
    commonMistakes: [
      "Using momentum to roll up",
      "Holding breath",
      "Legs moving during the roll up"
    ],
    modifications: {
      easier: ["Feet on footbar", "Hands hold straps for assistance"],
      harder: ["Legs lower", "Arms overhead"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "This is a challenging exercise. Build up gradually.",
    primaryMuscles: ["rectus_abdominis", "hip_flexors"],
    secondaryMuscles: ["transverse_abdominis", "obliques", "quadriceps"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 7,
    springSuggestion: "1 spring (light) for assistance or no springs",
    instructorNotes: "TODO: Many Teaser variations exist - this is the basic prep"
  },
  {
    slug: "breaststroke",
    name: "Breaststroke",
    description: "Prone back extension exercise on the long box with arm movements mimicking a breaststroke swimming motion.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["back", "arms", "posture"],
    setupSteps: [
      "Place long box on carriage",
      "Lie prone with chest at front edge of box",
      "Hold straps with arms extended forward",
      "Legs together and engaged"
    ],
    executionSteps: [
      "Inhale, pull straps and lift chest into extension",
      "Circle arms out to sides and back toward hips",
      "Squeeze shoulder blades together at the peak",
      "Exhale, reach arms forward as you lower chest"
    ],
    cues: [
      "Lead with the chest, not the head",
      "Keep the movement smooth and continuous",
      "Engage glutes to support lower back"
    ],
    commonMistakes: [
      "Overextending through the neck",
      "Lifting from lower back instead of mid-back",
      "Rushing the arm circles"
    ],
    modifications: {
      easier: ["Smaller arm circles", "Less extension"],
      harder: ["Hold at peak extension", "Lower to hover and repeat"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Extension should be through thoracic spine. Support lower back with engaged glutes.",
    primaryMuscles: ["erector_spinae", "rhomboids", "posterior_deltoids"],
    secondaryMuscles: ["latissimus_dorsi", "trapezius", "gluteus_maximus"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "3-0-3",
    rpeTarget: 5,
    springSuggestion: "1 spring (light)",
    instructorNotes: null
  },
  {
    slug: "thigh-stretch",
    name: "Thigh Stretch",
    description: "Kneeling exercise that stretches the quadriceps and hip flexors while strengthening the back and core.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["legs", "core", "mobility"],
    setupSteps: [
      "Kneel on carriage with feet against shoulder rests",
      "Knees hip-width apart",
      "Hold straps or place hands on thighs",
      "Tall kneeling position with core engaged"
    ],
    executionSteps: [
      "Inhale, hinge back from the knees as one unit",
      "Keep body in straight line from knees to head",
      "Lean back as far as control allows",
      "Exhale, engage glutes and thighs to return to upright"
    ],
    cues: [
      "Don't break at the hips - stay in one line",
      "Feel the stretch in the front of thighs",
      "Keep core braced throughout"
    ],
    commonMistakes: [
      "Breaking at the hips (sitting back)",
      "Arching lower back",
      "Going too far back and losing control"
    ],
    modifications: {
      easier: ["Smaller range", "Hold footbar for support"],
      harder: ["Arms overhead", "Hold at furthest point"]
    },
    contraindications: ["knee_sensitive", "lower_back_sensitive"],
    safetyNotes: "Keep a straight line from knee to head. Do not sit back toward heels.",
    primaryMuscles: ["quadriceps", "hip_flexors"],
    secondaryMuscles: ["gluteus_maximus", "rectus_abdominis", "erector_spinae"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 5,
    springSuggestion: "No springs or 1 spring (light) for assistance",
    instructorNotes: null
  },
  {
    slug: "kneeling-side-arm",
    name: "Kneeling Side Arms",
    description: "Side-kneeling position with lateral arm movements to target the side body and improve lateral stability.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["arms", "core", "posture"],
    setupSteps: [
      "Kneel sideways on carriage, one knee down",
      "Outside foot on headrest or platform for stability",
      "Hold strap with outside hand",
      "Inside hand can rest on hip or carriage"
    ],
    executionSteps: [
      "Start with arm at side holding strap",
      "Exhale, lift arm out to side and up toward ceiling",
      "Inhale, lower arm with control",
      "Maintain stable torso throughout"
    ],
    cues: [
      "Keep hips stacked and stable",
      "Lift from the shoulder, not by leaning",
      "Control the return - don't let strap pull you"
    ],
    commonMistakes: [
      "Leaning toward or away from strap",
      "Rotating torso",
      "Shrugging shoulder"
    ],
    modifications: {
      easier: ["Lighter spring", "Smaller range"],
      harder: ["Add pulses at top", "Both arms with straps"]
    },
    contraindications: ["knee_sensitive", "shoulder_sensitive"],
    safetyNotes: "Ensure knee is properly padded. Keep shoulder in socket.",
    primaryMuscles: ["deltoids", "obliques"],
    secondaryMuscles: ["trapezius", "quadratus_lumborum", "rotator_cuff"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 4,
    springSuggestion: "1 spring (light)",
    instructorNotes: "10 reps each side"
  },
  {
    slug: "snake-twist",
    name: "Snake/Twist",
    description: "Advanced exercise combining lateral flexion and rotation, performed from a side plank-like position on the reformer.",
    equipment: "reformer",
    difficulty: "advanced",
    focusAreas: ["core", "arms", "mobility"],
    setupSteps: [
      "Place hand on footbar, stand on platform side-facing",
      "Step inside foot onto carriage, outside foot crossed in front",
      "Lift into side plank position",
      "Top arm reaches toward ceiling or rests on hip"
    ],
    executionSteps: [
      "Press carriage out while maintaining side plank",
      "Thread top arm under body, rotating torso",
      "Return to side plank position",
      "Pull carriage in with control"
    ],
    cues: [
      "Keep hips lifted throughout",
      "Rotate from the thoracic spine",
      "Move with control, not momentum"
    ],
    commonMistakes: [
      "Dropping hips toward carriage",
      "Collapsing in supporting shoulder",
      "Rotating from lower back instead of mid-back"
    ],
    modifications: {
      easier: ["Knee down on carriage", "Omit the rotation"],
      harder: ["Hold rotation", "Add more reps"]
    },
    contraindications: ["wrist_sensitive", "shoulder_sensitive", "lower_back_sensitive"],
    safetyNotes: "Advanced exercise requiring significant upper body and core strength. Master side plank first.",
    primaryMuscles: ["obliques", "deltoids", "serratus_anterior"],
    secondaryMuscles: ["rectus_abdominis", "quadratus_lumborum", "rotator_cuff"],
    defaultReps: 4,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 8,
    springSuggestion: "1 spring (light)",
    instructorNotes: "TODO: Multiple variations exist - confirm form with instructor"
  },
  {
    slug: "corkscrew",
    name: "Corkscrew",
    description: "Supine rotational core exercise with legs in straps, circling the legs while keeping the torso stable.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "mobility"],
    setupSteps: [
      "Lie supine with both legs in straps",
      "Arms by sides pressing into carriage",
      "Extend legs toward ceiling",
      "Neutral pelvis to start"
    ],
    executionSteps: [
      "Circle legs to the right, down, around to the left, and back to center",
      "Keep shoulders and upper back anchored",
      "Control the movement with the obliques",
      "Reverse direction after completing reps"
    ],
    cues: [
      "Keep upper body completely still",
      "Circle from the hips, not the knees",
      "Make circles even on both sides"
    ],
    commonMistakes: [
      "Upper body rocking side to side",
      "Circles too large for stability",
      "Rushing the movement"
    ],
    modifications: {
      easier: ["Smaller circles", "Bent knees"],
      harder: ["Larger circles", "Lift hips at bottom of circle"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Only circle as large as torso can stay stable. Reduce range if lower back lifts.",
    primaryMuscles: ["obliques", "rectus_abdominis"],
    secondaryMuscles: ["hip_flexors", "transverse_abdominis", "adductors"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "4-0-0",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light)",
    instructorNotes: "5 circles each direction per set"
  },
  {
    slug: "balance-control-front",
    name: "Balance Control Front",
    description: "Advanced balance exercise standing on the footbar facing the carriage, lifting one leg behind while maintaining stability.",
    equipment: "reformer",
    difficulty: "advanced",
    focusAreas: ["core", "legs", "posture"],
    setupSteps: [
      "Stand on footbar facing carriage",
      "Hands on carriage for initial support",
      "Find balance on one leg",
      "Engage core and standing leg"
    ],
    executionSteps: [
      "Release hands from carriage when balanced",
      "Extend free leg behind, reaching toward headrest",
      "Push carriage away slightly with extended foot",
      "Pull carriage in by drawing leg toward standing leg",
      "Maintain balance throughout"
    ],
    cues: [
      "Focus on a fixed point for balance",
      "Keep standing leg strong but not locked",
      "Move slowly and with control"
    ],
    commonMistakes: [
      "Rushing the movement",
      "Gripping with toes of standing foot",
      "Losing core engagement"
    ],
    modifications: {
      easier: ["Keep hands on carriage", "Smaller range"],
      harder: ["Arms reaching overhead", "Eyes closed briefly"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Advanced balance exercise. Ensure carriage is stable and springs are appropriate.",
    primaryMuscles: ["gluteus_maximus", "quadriceps", "core_stabilizers"],
    secondaryMuscles: ["hamstrings", "hip_flexors", "gastrocnemius"],
    defaultReps: 5,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 7,
    springSuggestion: "1 spring (light)",
    instructorNotes: "5 reps each leg. TODO: Verify spring tension for different reformers"
  },
  {
    slug: "skating",
    name: "Skating",
    description: "Standing exercise with lateral pushing movement, mimicking ice skating motion to strengthen legs and improve balance.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["legs", "glutes", "core"],
    setupSteps: [
      "Stand on platform facing footbar",
      "One foot on carriage, one on platform",
      "Hands on footbar for light support",
      "Slight forward lean from ankles"
    ],
    executionSteps: [
      "Push carriage out to side with carriage foot",
      "Keep platform leg stable and strong",
      "Draw carriage back using inner thigh",
      "Maintain upright torso throughout"
    ],
    cues: [
      "Push through the whole foot",
      "Initiate return from inner thigh",
      "Keep hips level and square"
    ],
    commonMistakes: [
      "Leaning away from carriage",
      "Letting hips rotate open",
      "Pushing too far and losing control"
    ],
    modifications: {
      easier: ["Smaller range", "More springs"],
      harder: ["Hands off footbar", "Deeper range"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Keep platform knee tracking over toes. Do not over-extend range.",
    primaryMuscles: ["adductors", "gluteus_medius", "quadriceps"],
    secondaryMuscles: ["core_stabilizers", "gastrocnemius", "hamstrings"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: "10 reps each leg"
  },
  {
    slug: "tree",
    name: "Tree",
    description: "Seated leg stretch and core exercise, extending one leg while maintaining seated balance.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["mobility", "core", "legs"],
    setupSteps: [
      "Sit on carriage facing footbar",
      "Bend one knee, hold behind thigh or at calf",
      "Other leg extended on carriage or footbar",
      "Sit tall with lifted spine"
    ],
    executionSteps: [
      "Extend bent leg toward ceiling (or as far as flexibility allows)",
      "Walk hands up the leg toward ankle",
      "Lower leg and round spine back slightly",
      "Walk hands back down leg as you roll up",
      "Repeat the walking motion"
    ],
    cues: [
      "Keep the lifted leg as straight as possible",
      "Articulate through the spine as you round and lift",
      "Move with the breath"
    ],
    commonMistakes: [
      "Gripping with hip flexors",
      "Holding breath",
      "Forcing leg straight beyond flexibility"
    ],
    modifications: {
      easier: ["Keep knee bent", "Hold behind thigh only"],
      harder: ["Add ankle circles at top", "Release hands from leg"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Work within your hamstring flexibility. Don't force the stretch.",
    primaryMuscles: ["hamstrings", "rectus_abdominis"],
    secondaryMuscles: ["hip_flexors", "erector_spinae"],
    defaultReps: 3,
    defaultSets: 2,
    defaultTempo: "slow and controlled",
    rpeTarget: 3,
    springSuggestion: "No springs needed or 1 spring for carriage stability",
    instructorNotes: "3 walking cycles each leg"
  },
  {
    slug: "footwork-heels",
    name: "Footwork - Heels",
    description: "Footwork variation with heels on the footbar, targeting the hamstrings and glutes more than the toe variations.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "glutes"],
    setupSteps: [
      "Lie supine on the carriage with head on headrest",
      "Place heels on footbar, hip-width apart, toes pointing up",
      "Arms rest by sides, palms down",
      "Neutral spine with natural lumbar curve"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale and press through heels to extend legs",
      "Keep pelvis stable and core engaged throughout",
      "Flex feet strongly, pulling toes toward shins",
      "Inhale at full extension",
      "Exhale and control the return"
    ],
    cues: [
      "Press evenly through both heels",
      "Keep toes pulled up throughout",
      "Maintain neutral pelvis"
    ],
    commonMistakes: [
      "Letting feet point forward (losing dorsiflexion)",
      "Arching lower back",
      "Pushing unevenly through legs"
    ],
    modifications: {
      easier: ["Reduce spring tension", "Smaller range of motion"],
      harder: ["Single leg variation", "Add pulse at extension"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Maintain flexed feet throughout. Stop if hamstring cramping occurs.",
    primaryMuscles: ["hamstrings", "gluteus_maximus"],
    secondaryMuscles: ["quadriceps", "gastrocnemius", "transverse_abdominis"],
    defaultReps: 10,
    defaultSets: 1,
    defaultTempo: "2-0-2",
    rpeTarget: 4,
    springSuggestion: "3-4 springs (heavy)",
    instructorNotes: null
  },
  {
    slug: "footwork-wide-v",
    name: "Footwork - Wide V",
    description: "Footwork variation with feet in a wide turned-out position, targeting the inner thighs and external hip rotators.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["legs", "glutes"],
    setupSteps: [
      "Lie supine on the carriage with head on headrest",
      "Place feet wide on footbar in turned-out position",
      "Heels lifted, balls of feet on bar",
      "Arms rest by sides, palms down"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale and press through feet to extend legs",
      "Maintain turnout from hips throughout",
      "Keep pelvis stable and core engaged",
      "Inhale at full extension",
      "Exhale and control the return"
    ],
    cues: [
      "Rotate from the hips, not the knees",
      "Keep knees tracking over toes",
      "Maintain connection through inner thighs"
    ],
    commonMistakes: [
      "Knees rolling inward",
      "Losing the turnout at full extension",
      "Gripping with hip flexors"
    ],
    modifications: {
      easier: ["Smaller turnout angle", "Lighter springs"],
      harder: ["Deeper turnout", "Single leg variation"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Turnout should come from hips, not forced through knees.",
    primaryMuscles: ["quadriceps", "adductors"],
    secondaryMuscles: ["external_hip_rotators", "gluteus_maximus", "gastrocnemius"],
    defaultReps: 10,
    defaultSets: 1,
    defaultTempo: "2-0-2",
    rpeTarget: 3,
    springSuggestion: "3-4 springs (heavy)",
    instructorNotes: null
  },
  {
    slug: "pelvic-lift",
    name: "Pelvic Lift",
    description: "Supine exercise with feet in straps, lifting the pelvis and lower back off the carriage using core and glute strength.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "glutes"],
    setupSteps: [
      "Lie supine with feet in straps",
      "Legs extended at 45-60 degree angle",
      "Arms by sides pressing into carriage",
      "Headrest flat"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, engage core and lift pelvis off carriage",
      "Continue lifting until weight is on shoulder blades",
      "Hold briefly",
      "Inhale, roll down through spine one vertebra at a time"
    ],
    cues: [
      "Lift from the core, not momentum",
      "Keep legs at consistent angle",
      "Roll down with control"
    ],
    commonMistakes: [
      "Lifting too high onto neck",
      "Using momentum to lift",
      "Legs changing angle during lift"
    ],
    modifications: {
      easier: ["Smaller lift", "Legs higher (60 degrees)"],
      harder: ["Lower leg angle", "Hold longer at top"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Weight should stay on shoulder blades, not neck. Headrest must be flat.",
    primaryMuscles: ["rectus_abdominis", "gluteus_maximus"],
    secondaryMuscles: ["hamstrings", "transverse_abdominis", "erector_spinae"],
    defaultReps: 6,
    defaultSets: 2,
    defaultTempo: "3-1-3",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "side-lying-circles",
    name: "Side-Lying Circles",
    description: "Side-lying leg circles targeting the hip stabilizers and improving hip mobility.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["glutes", "mobility", "legs"],
    setupSteps: [
      "Lie on side with bottom shoulder against shoulder rest",
      "Bottom leg bent for stability",
      "Top leg in strap, extended",
      "Top arm can rest on hip or support head"
    ],
    executionSteps: [
      "Extend top leg slightly above hip height",
      "Draw small circles with the leg",
      "Keep hip stacked and stable",
      "Complete circles in one direction, then reverse"
    ],
    cues: [
      "Circle from the hip socket",
      "Keep the circle controlled and even",
      "Don't let top hip roll forward or back"
    ],
    commonMistakes: [
      "Circles too large",
      "Hip rolling during circles",
      "Losing neutral spine"
    ],
    modifications: {
      easier: ["Smaller circles", "Leg lower"],
      harder: ["Larger circles", "Leg higher"]
    },
    contraindications: ["shoulder_sensitive", "lower_back_sensitive"],
    safetyNotes: "Only circle as large as hip can stay stable.",
    primaryMuscles: ["gluteus_medius", "hip_flexors"],
    secondaryMuscles: ["tensor_fasciae_latae", "gluteus_minimus", "core_stabilizers"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-0-0",
    rpeTarget: 4,
    springSuggestion: "1 spring (light)",
    instructorNotes: "8 circles each direction, each side"
  },
  {
    slug: "kneeling-lunge",
    name: "Kneeling Lunge",
    description: "Deep hip flexor stretch in a kneeling lunge position, with the back foot against the shoulder rest.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["mobility", "legs"],
    setupSteps: [
      "Kneel on carriage with one foot on platform in lunge",
      "Back knee on carriage, foot against shoulder rest",
      "Hands on footbar for balance",
      "Torso upright"
    ],
    executionSteps: [
      "Allow carriage to slide back, deepening the lunge",
      "Feel stretch in hip flexor of back leg",
      "Keep torso upright and core engaged",
      "Hold stretch, breathing deeply",
      "Press through front foot to return"
    ],
    cues: [
      "Tuck pelvis slightly to increase hip flexor stretch",
      "Keep front knee over ankle",
      "Breathe into the stretch"
    ],
    commonMistakes: [
      "Letting lower back arch excessively",
      "Front knee going past toes",
      "Rushing through the stretch"
    ],
    modifications: {
      easier: ["Smaller range", "More padding under knee"],
      harder: ["Arms reaching overhead", "Add side bend"]
    },
    contraindications: ["knee_sensitive"],
    safetyNotes: "Use padding under back knee. Go only as deep as comfortable.",
    primaryMuscles: ["hip_flexors", "quadriceps"],
    secondaryMuscles: ["psoas", "rectus_femoris", "gluteus_maximus"],
    defaultDuration: 30,
    defaultSets: 2,
    defaultTempo: "hold",
    rpeTarget: 2,
    springSuggestion: "1 spring (light) for stability",
    instructorNotes: "30 seconds each side"
  },
  {
    slug: "reverse-abdominals",
    name: "Reverse Abdominals",
    description: "Kneeling core exercise focusing on lower abdominal control while moving the carriage with the legs.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core"],
    setupSteps: [
      "Kneel on carriage with hands on footbar",
      "Shoulders over wrists",
      "Knees hip-width apart",
      "Spine in neutral or slight C-curve"
    ],
    executionSteps: [
      "Inhale to prepare",
      "Exhale, use lower abdominals to draw knees toward hands",
      "Carriage moves forward under you",
      "Inhale, extend back with control"
    ],
    cues: [
      "Initiate movement from deep core",
      "Keep shoulders stable over wrists",
      "Don't let lower back sag or pike up"
    ],
    commonMistakes: [
      "Using hip flexors instead of core",
      "Shoulders moving forward and back",
      "Holding breath"
    ],
    modifications: {
      easier: ["Smaller range", "More springs"],
      harder: ["Lighter springs", "Pause in flexed position"]
    },
    contraindications: ["wrist_sensitive", "knee_sensitive"],
    safetyNotes: "Keep movement controlled. This targets deep core, not hip flexors.",
    primaryMuscles: ["transverse_abdominis", "rectus_abdominis"],
    secondaryMuscles: ["hip_flexors", "obliques"],
    defaultReps: 10,
    defaultSets: 2,
    defaultTempo: "2-0-2",
    rpeTarget: 5,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },
  {
    slug: "double-leg-kick",
    name: "Double Leg Kick",
    description: "Prone exercise on the long box combining hamstring curls with back extension, based on the classical mat exercise.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["back", "glutes", "legs"],
    setupSteps: [
      "Lie prone on long box with chest at front edge",
      "Clasp hands behind back",
      "Turn head to one side, cheek on box",
      "Legs extended, feet together"
    ],
    executionSteps: [
      "Bend both knees, kicking heels toward glutes 3 times",
      "Extend legs and lift chest into back extension",
      "Reach clasped hands toward feet, arms straight",
      "Lower chest and turn head to other side",
      "Repeat sequence"
    ],
    cues: [
      "Three quick kicks toward glutes",
      "Extension comes from mid-back, not lower back",
      "Reach arms long toward heels"
    ],
    commonMistakes: [
      "Compressing lower back in extension",
      "Kicking too aggressively",
      "Not alternating head position"
    ],
    modifications: {
      easier: ["Skip the kicks", "Smaller extension"],
      harder: ["Longer hold in extension", "Add more kicks"]
    },
    contraindications: ["lower_back_sensitive", "shoulder_sensitive"],
    safetyNotes: "Keep extension in mid-back. Support lower back by engaging glutes.",
    primaryMuscles: ["erector_spinae", "hamstrings", "gluteus_maximus"],
    secondaryMuscles: ["rhomboids", "posterior_deltoids"],
    defaultReps: 6,
    defaultSets: 1,
    defaultTempo: "quick-quick-quick-slow",
    rpeTarget: 5,
    springSuggestion: "No springs needed or 1 spring for stability",
    instructorNotes: "3 kicks per rep, alternate head position each rep"
  },
  {
    slug: "horseback",
    name: "Horseback",
    description: "Seated straddling exercise on the long box, building hip flexibility and core stability while working the arms.",
    equipment: "reformer",
    difficulty: "intermediate",
    focusAreas: ["core", "arms", "mobility"],
    setupSteps: [
      "Sit straddling the long box, facing the straps",
      "Hold straps with arms extended forward",
      "Legs hanging on either side of box",
      "Sit tall with lifted spine"
    ],
    executionSteps: [
      "Pull straps toward hips, bending elbows",
      "Lift through spine, opening chest",
      "Extend arms back to start with control",
      "Maintain tall seated posture throughout"
    ],
    cues: [
      "Sit tall through the crown of the head",
      "Pull shoulder blades together as arms pull",
      "Keep legs relaxed and heavy"
    ],
    commonMistakes: [
      "Rounding forward",
      "Shrugging shoulders",
      "Leaning back instead of sitting tall"
    ],
    modifications: {
      easier: ["Lighter springs", "Smaller arm range"],
      harder: ["Heavier springs", "Add leg lifts"]
    },
    contraindications: ["lower_back_sensitive"],
    safetyNotes: "Ensure box is stable. Hip flexibility needed for straddle position.",
    primaryMuscles: ["rhomboids", "latissimus_dorsi", "biceps"],
    secondaryMuscles: ["posterior_deltoids", "core_stabilizers", "hip_adductors"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "2-1-2",
    rpeTarget: 4,
    springSuggestion: "1-2 springs (light to medium)",
    instructorNotes: null
  },

  // ============================================
  // ARM/UPPER BODY EXERCISES
  // ============================================
  {
    slug: "arm-circles",
    name: "Arm Circles",
    description: "Upper body exercise using straps to create circular arm movements, targeting shoulder mobility and stability while lying supine on the reformer.",
    equipment: "reformer",
    difficulty: "beginner",
    focusAreas: ["shoulders", "arms", "core"],
    setupSteps: [
      "Lie supine on the carriage with head on headrest",
      "Hold one strap handle in each hand",
      "Arms extended toward ceiling, shoulder-width apart",
      "Knees bent with feet flat on carriage or in tabletop position",
      "Neutral spine with core engaged"
    ],
    executionSteps: [
      "Inhale to prepare with arms reaching to ceiling",
      "Exhale, open arms out to sides and down toward hips in a circular motion",
      "Continue the circle, bringing arms down by sides",
      "Inhale, sweep arms back up toward ceiling to complete the circle",
      "Maintain tension on the straps throughout",
      "Reverse direction after completing reps"
    ],
    cues: [
      "Keep ribs anchored to carriage",
      "Shoulder blades stay stable on carriage",
      "Move from the shoulder joint, not just the arms",
      "Control the movement, don't let straps pull you"
    ],
    commonMistakes: [
      "Arching back as arms lower",
      "Losing strap tension at top of circle",
      "Shrugging shoulders toward ears",
      "Moving too quickly without control"
    ],
    modifications: {
      easier: ["Smaller circles", "Lighter springs", "Keep knees bent with feet on carriage"],
      harder: ["Larger circles", "Legs in tabletop", "Single arm variation"]
    },
    contraindications: ["shoulder_injury", "rotator_cuff_issues"],
    safetyNotes: "Keep movements controlled. Stop if any shoulder pain. Maintain neutral spine throughout.",
    primaryMuscles: ["deltoids", "pectoralis_major"],
    secondaryMuscles: ["latissimus_dorsi", "biceps", "triceps", "core_stabilizers"],
    defaultReps: 8,
    defaultSets: 2,
    defaultTempo: "3-0-3",
    rpeTarget: 4,
    springSuggestion: "1 spring (light)",
    instructorNotes: null
  },
];

// Export exercise count for verification
export const EXERCISE_COUNT = reformerExercises.length;

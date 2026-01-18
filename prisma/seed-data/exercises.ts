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
];

// Export exercise count for verification
export const EXERCISE_COUNT = reformerExercises.length;

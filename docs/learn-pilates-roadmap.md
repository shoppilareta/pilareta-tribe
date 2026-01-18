# Learn Pilates - Feature Roadmap

## Current Implementation (Phase 1)

### Completed Features

1. **Session Builder** (`/learn/builder`)
   - Goal selection (core stability, glutes, legs, posture, mobility, full body)
   - Duration selection (15, 20, 30, 45, 60 minutes)
   - Level selection (beginner, intermediate, advanced)
   - Physical constraints/considerations (knee, wrist, shoulder, lower back)
   - Algorithm-based exercise selection
   - Automatic warmup → activation → main → cooldown structure

2. **Sequence Player** (`/learn/session/[id]`)
   - Exercise-by-exercise progression
   - Set and rep tracking
   - Rest timer between sets
   - Key cues display
   - Expandable exercise details (setup, execution, mistakes)
   - Spring/equipment settings
   - Section indicators (warmup, activation, main, cooldown)
   - Session completion tracking

3. **Exercise Library** (`/learn/exercises`)
   - 25 reformer exercises seeded
   - Search functionality
   - Filter by difficulty level
   - Filter by focus area
   - Exercise detail pages with full instructions

4. **Programs** (`/learn/programs`)
   - 2 sample 4-week programs
   - Weekly breakdown with sessions
   - Exercise lists per session
   - Progression notes (reps multiplier per week)

### Database Schema
- `Exercise` - Full exercise definitions
- `PilatesSession` - User-generated sessions
- `PilatesSessionItem` - Exercises within sessions
- `Program` - Multi-week training programs
- `ProgramWeek` - Weekly structure
- `ProgramSession` - Daily sessions within weeks
- `SessionTemplate` / `SessionTemplateItem` - Reusable session templates
- `UserSessionCompletion` - Track completed sessions
- `UserExerciseCompletion` - Track completed exercises
- `UserProgramProgress` - Track program enrollment and progress

---

## Phase 2: Video & Media (Scaffold Ready)

### Schema Support Already Added
```prisma
// In Exercise model:
imageUrl          String?
videoUrl          String?
videoTimestamps   Json?    // { cues: [{ time: number, text: string }] }
multiAngleVideos  Json?    // { front: url, side: url, top: url }
animation3dId     String?  // Reference to 3D animation asset
```

### Implementation Tasks

1. **Video Demo Integration**
   - Host videos on CDN (Cloudflare R2, AWS S3, or Bunny.net)
   - Update seed data with video URLs
   - Add video player component to exercise detail page
   - Add video player to sequence player

2. **Timestamped Cues**
   - Overlay cues on video at specific timestamps
   - Sync cue highlighting with video playback
   - Schema: `{ cues: [{ time: 5.2, text: "Engage core" }] }`

3. **Multi-Angle Support**
   - Front, side, and top-down views
   - Toggle buttons during playback
   - Picture-in-picture secondary angle

4. **Skeleton Overlay Toggle**
   - Use pose estimation or pre-rendered overlays
   - Toggle button to show/hide anatomical guides
   - Highlight active muscle groups

### Estimated Effort
- Video hosting setup: 1-2 days
- Video player component: 2-3 days
- Timestamped cues: 2-3 days
- Multi-angle support: 3-4 days
- Skeleton overlay: 5-7 days

---

## Phase 3: 3D Animated Coach (Future Architecture)

### Vision
A real-time 3D animated instructor that demonstrates exercises from any angle, with:
- Smooth transitions between movements
- Anatomical muscle highlighting
- User camera control for viewing angles
- Optional AR mode for device camera overlay

### Technology Stack Recommendation

1. **3D Rendering**: Three.js with React Three Fiber
2. **Character Model**: Mixamo or custom rigged humanoid (GLTF/GLB format)
3. **Animation System**:
   - Pre-captured motion data (BVH files)
   - Procedural animation for transitions
4. **Muscle Visualization**: Shader-based highlighting or texture swapping

### Architecture Components

```
┌─────────────────────────────────────────────────────┐
│                 Animation System                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Motion Data  │  │  Character   │  │  Camera   │ │
│  │   Library    │→ │    Model     │← │  Controls │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                 │                │        │
│         ▼                 ▼                ▼        │
│  ┌──────────────────────────────────────────────┐  │
│  │            Three.js / R3F Renderer           │  │
│  └──────────────────────────────────────────────┘  │
│                        │                            │
│                        ▼                            │
│  ┌──────────────────────────────────────────────┐  │
│  │              WebGL Canvas                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Data Model Extensions

```typescript
interface Animation3DAsset {
  id: string;
  exerciseSlug: string;

  // Motion capture data
  bvhUrl: string;           // BVH motion capture file
  fbxUrl?: string;          // Alternative FBX format

  // Timing
  durationSeconds: number;
  loopable: boolean;
  loopStartTime?: number;
  loopEndTime?: number;

  // Cue points
  keyframes: {
    time: number;
    cueText: string;
    muscleHighlight?: string[];
    cameraPosition?: { x: number; y: number; z: number };
  }[];

  // Transitions
  entryAnimation?: string;  // Animation to play when starting
  exitAnimation?: string;   // Animation to play when ending
}
```

### Implementation Phases

**Phase 3.1: Basic 3D Viewer**
- Set up Three.js / React Three Fiber
- Load and display static humanoid model
- Basic camera controls (orbit, zoom)
- Lighting setup

**Phase 3.2: Animation Playback**
- Load BVH/FBX motion data
- Animation mixer and timeline
- Play/pause/scrub controls
- Loop handling

**Phase 3.3: Exercise Integration**
- Map exercises to animations
- Transition system between exercises
- Session playback mode

**Phase 3.4: Enhanced Visualization**
- Muscle highlighting shaders
- Anatomical labels
- Camera automation for key moments

**Phase 3.5: AR Mode (Optional)**
- WebXR integration
- Camera passthrough
- Scale and positioning

### Resource Requirements

1. **3D Character Model**
   - Option A: Purchase from Mixamo/Turbosquid (~$50-200)
   - Option B: Commission custom model (~$500-2000)
   - Requirements: Humanoid rig, blend shapes for muscle definition

2. **Motion Capture Data**
   - Option A: Record with motion capture suit
   - Option B: Use pose estimation from video (MediaPipe/OpenCV)
   - Option C: Manual animation in Blender

3. **Development Time**
   - Basic 3D viewer: 1-2 weeks
   - Animation system: 2-3 weeks
   - Full integration: 3-4 weeks
   - Polish & optimization: 2-3 weeks

### Performance Considerations

- Target 60 FPS on mid-range devices
- Progressive loading (skeleton → low-poly → full detail)
- LOD (Level of Detail) for distant views
- Memory management for animation data
- Mobile optimization (reduced polygon count, simpler shaders)

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Video demos | High | Medium | P1 |
| Timestamped cues | High | Low | P1 |
| Multi-angle views | Medium | Medium | P2 |
| Skeleton overlay | Medium | High | P2 |
| 3D basic viewer | High | High | P3 |
| 3D animations | Very High | Very High | P3 |
| AR mode | Medium | Very High | P4 |

---

## Notes

- Phase 2 can begin as soon as video content is available
- Phase 3 requires significant upfront investment in 3D assets
- Consider starting with a single "hero" exercise for 3D proof-of-concept
- AR mode requires WebXR-compatible devices (limited mobile support currently)

'use client';

/**
 * Pilates Reformer 3D Model
 *
 * Structure (viewed from side, person lying with head at left):
 *
 *   [HEADREST]                              [FOOTBAR]
 *      |                                        |
 *   ===|========================================|===  <- Rails
 *      | [SHOULDER] [----CARRIAGE----]    [STANDING]
 *      |  RESTS                            PLATFORM
 *   ---+----------------------------------------+---  <- Frame base
 *      |                                        |
 *   [LEG]                                    [LEG]
 *
 * Coordinates:
 * - X axis: length of reformer (negative = headrest, positive = footbar)
 * - Y axis: up
 * - Z axis: width
 */

interface ReformerProps {
  carriagePosition?: number; // 0 = home (near headrest), 1 = extended (near footbar)
}

// Dimensions (in meters, scaled for ~1.7m human)
const FRAME_LENGTH = 2.2;
const FRAME_WIDTH = 0.6;
const FRAME_HEIGHT = 0.25; // Height of frame base from ground
const RAIL_HEIGHT = 0.04;
const CARRIAGE_LENGTH = 0.9;
const CARRIAGE_WIDTH = 0.5;
const CARRIAGE_PADDING = 0.04;

// Colors
const FRAME_COLOR = '#2d2d2d';
const RAIL_COLOR = '#4a4a4a';
const CARRIAGE_COLOR = '#1a1a1a';
const PAD_COLOR = '#333333';
const METAL_COLOR = '#555555';

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  // Carriage slides from near headrest to near footbar
  const carriageX = -0.45 + carriagePosition * 0.8;

  return (
    <group position={[0, 0, 0]}>
      {/* === FRAME BASE === */}
      <mesh position={[0, FRAME_HEIGHT / 2, 0]}>
        <boxGeometry args={[FRAME_LENGTH, 0.04, FRAME_WIDTH + 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Frame side rails (left and right) */}
      <mesh position={[0, FRAME_HEIGHT, -FRAME_WIDTH / 2]}>
        <boxGeometry args={[FRAME_LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
      <mesh position={[0, FRAME_HEIGHT, FRAME_WIDTH / 2]}>
        <boxGeometry args={[FRAME_LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* === LEGS (4 corners) === */}
      {[
        [-FRAME_LENGTH / 2 + 0.1, -FRAME_WIDTH / 2 + 0.05],
        [-FRAME_LENGTH / 2 + 0.1, FRAME_WIDTH / 2 - 0.05],
        [FRAME_LENGTH / 2 - 0.1, -FRAME_WIDTH / 2 + 0.05],
        [FRAME_LENGTH / 2 - 0.1, FRAME_WIDTH / 2 - 0.05],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, FRAME_HEIGHT / 2, z]}>
          <boxGeometry args={[0.06, FRAME_HEIGHT, 0.06]} />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
      ))}

      {/* === RAILS (for carriage to slide on) === */}
      <mesh position={[0, FRAME_HEIGHT + RAIL_HEIGHT / 2 + 0.025, -FRAME_WIDTH / 2 + 0.08]}>
        <boxGeometry args={[FRAME_LENGTH - 0.3, RAIL_HEIGHT, 0.04]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, FRAME_HEIGHT + RAIL_HEIGHT / 2 + 0.025, FRAME_WIDTH / 2 - 0.08]}>
        <boxGeometry args={[FRAME_LENGTH - 0.3, RAIL_HEIGHT, 0.04]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === CARRIAGE (sliding platform) === */}
      <group position={[carriageX, FRAME_HEIGHT + RAIL_HEIGHT + 0.05, 0]}>
        {/* Carriage base */}
        <mesh>
          <boxGeometry args={[CARRIAGE_LENGTH, 0.05, CARRIAGE_WIDTH]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Carriage padding (where person lies) */}
        <mesh position={[0, 0.025 + CARRIAGE_PADDING / 2, 0]}>
          <boxGeometry args={[CARRIAGE_LENGTH - 0.04, CARRIAGE_PADDING, CARRIAGE_WIDTH - 0.04]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === SHOULDER RESTS (two blocks at headrest end) === */}
      <mesh position={[carriageX - CARRIAGE_LENGTH / 2 + 0.06, FRAME_HEIGHT + RAIL_HEIGHT + 0.14, -0.14]}>
        <boxGeometry args={[0.06, 0.12, 0.05]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>
      <mesh position={[carriageX - CARRIAGE_LENGTH / 2 + 0.06, FRAME_HEIGHT + RAIL_HEIGHT + 0.14, 0.14]}>
        <boxGeometry args={[0.06, 0.12, 0.05]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>

      {/* === HEADREST (at far left/back end) === */}
      <group position={[-FRAME_LENGTH / 2 + 0.15, FRAME_HEIGHT + RAIL_HEIGHT + 0.08, 0]}>
        {/* Headrest base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.24]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Headrest padding */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.22]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === FOOTBAR (vertical bar at front end) === */}
      <group position={[FRAME_LENGTH / 2 - 0.12, FRAME_HEIGHT, 0]}>
        {/* Footbar vertical supports */}
        <mesh position={[0, 0.18, -FRAME_WIDTH / 2 + 0.1]}>
          <boxGeometry args={[0.04, 0.35, 0.04]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.18, FRAME_WIDTH / 2 - 0.1]}>
          <boxGeometry args={[0.04, 0.35, 0.04]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.5} />
        </mesh>
        {/* Footbar horizontal bar (what feet push against) */}
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, FRAME_WIDTH - 0.15, 16]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* === STANDING PLATFORM (at footbar end) === */}
      <mesh position={[FRAME_LENGTH / 2 - 0.08, FRAME_HEIGHT + 0.025, 0]}>
        <boxGeometry args={[0.12, 0.05, FRAME_WIDTH - 0.1]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>

      {/* === SPRINGS (visual representation) === */}
      <group position={[FRAME_LENGTH / 2 - 0.35, FRAME_HEIGHT + 0.02, 0]}>
        {[-0.12, -0.04, 0.04, 0.12].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.25, 8]} />
            <meshStandardMaterial
              color={i < 2 ? '#cc4444' : '#4444cc'}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>

      {/* === ROPE/STRAP HOLDERS (pulleys at headrest end) === */}
      <group position={[-FRAME_LENGTH / 2 + 0.05, FRAME_HEIGHT + 0.15, 0]}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.03, 0.08, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.03, 0.08, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} />
        </mesh>
      </group>
    </group>
  );
}

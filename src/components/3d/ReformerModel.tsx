'use client';

/**
 * Pilates Reformer 3D Model
 *
 * Compact design where footbar is within reach of person lying on carriage
 */

interface ReformerProps {
  carriagePosition?: number;
}

const FRAME_COLOR = '#2d2d2d';
const RAIL_COLOR = '#4a4a4a';
const CARRIAGE_COLOR = '#1a1a1a';
const PAD_COLOR = '#333333';
const METAL_COLOR = '#555555';

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  // Compact dimensions - person can reach footbar
  const LENGTH = 1.6;
  const WIDTH = 0.55;
  const HEIGHT = 0.25;

  const carriageX = -0.35 + carriagePosition * 0.4;

  return (
    <group>
      {/* === FRAME BASE === */}
      <mesh position={[0, HEIGHT / 2, 0]}>
        <boxGeometry args={[LENGTH, 0.04, WIDTH + 0.08]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Side rails */}
      <mesh position={[0, HEIGHT, -WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.04, 0.04]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
      <mesh position={[0, HEIGHT, WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.04, 0.04]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>

      {/* Legs */}
      {[
        [-LENGTH / 2 + 0.08, -WIDTH / 2 + 0.04],
        [-LENGTH / 2 + 0.08, WIDTH / 2 - 0.04],
        [LENGTH / 2 - 0.08, -WIDTH / 2 + 0.04],
        [LENGTH / 2 - 0.08, WIDTH / 2 - 0.04],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, HEIGHT / 2, z]}>
          <boxGeometry args={[0.05, HEIGHT, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
      ))}

      {/* === SLIDING RAILS === */}
      <mesh position={[0, HEIGHT + 0.035, -WIDTH / 2 + 0.07]}>
        <boxGeometry args={[LENGTH - 0.2, 0.03, 0.03]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, HEIGHT + 0.035, WIDTH / 2 - 0.07]}>
        <boxGeometry args={[LENGTH - 0.2, 0.03, 0.03]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* === CARRIAGE === */}
      <group position={[carriageX, HEIGHT + 0.07, 0]}>
        <mesh>
          <boxGeometry args={[0.75, 0.04, WIDTH - 0.12]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.72, 0.03, WIDTH - 0.15]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === SHOULDER RESTS === */}
      <mesh position={[carriageX - 0.32, HEIGHT + 0.12, -0.12]}>
        <boxGeometry args={[0.05, 0.10, 0.04]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>
      <mesh position={[carriageX - 0.32, HEIGHT + 0.12, 0.12]}>
        <boxGeometry args={[0.05, 0.10, 0.04]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>

      {/* === HEADREST === */}
      <group position={[-LENGTH / 2 + 0.12, HEIGHT + 0.085, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.03, 0.20]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.12, 0.02, 0.18]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === FOOTBAR === */}
      <group position={[LENGTH / 2 - 0.10, HEIGHT, 0]}>
        {/* Vertical supports */}
        <mesh position={[0, 0.15, -WIDTH / 2 + 0.08]}>
          <boxGeometry args={[0.03, 0.30, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, WIDTH / 2 - 0.08]}>
          <boxGeometry args={[0.03, 0.30, 0.03]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.4} />
        </mesh>
        {/* Horizontal bar (where feet press) */}
        <mesh position={[0, 0.30, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, WIDTH - 0.12, 12]} />
          <meshStandardMaterial color={METAL_COLOR} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* === STANDING PLATFORM === */}
      <mesh position={[LENGTH / 2 - 0.06, HEIGHT + 0.02, 0]}>
        <boxGeometry args={[0.10, 0.04, WIDTH - 0.08]} />
        <meshStandardMaterial color={PAD_COLOR} />
      </mesh>

      {/* === SPRINGS === */}
      <group position={[LENGTH / 2 - 0.28, HEIGHT + 0.01, 0]}>
        {[-0.10, -0.03, 0.03, 0.10].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.18, 6]} />
            <meshStandardMaterial
              color={i < 2 ? '#cc4444' : '#4466cc'}
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

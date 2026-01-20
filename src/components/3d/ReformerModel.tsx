'use client';

/**
 * Pilates Reformer 3D Model
 *
 * SHARED COORDINATE CONSTANTS (must match HumanModel.tsx):
 * - FRAME_HEIGHT = 0.28 (top of frame rails)
 * - CARRIAGE_TOP = 0.37 (where person lies)
 * - FOOTBAR_X = 0.55 (X position of footbar)
 * - FOOTBAR_Y = 0.52 (Y position of footbar bar)
 */

interface ReformerProps {
  carriagePosition?: number;
}

// === SHARED CONSTANTS (keep in sync with HumanModel) ===
const FRAME_HEIGHT = 0.28;
const CARRIAGE_TOP = 0.37;  // Where person lies
const FOOTBAR_X = 0.55;     // Footbar horizontal position
const FOOTBAR_Y = 0.52;     // Footbar bar height

// Colors
const WOOD_FRAME = '#3d3022';
const WOOD_LIGHT = '#5a4a3a';
const RAIL_COLOR = '#6a6a6a';
const CARRIAGE_COLOR = '#1a1a1a';
const PAD_COLOR = '#2a2a2a';
const METAL_CHROME = '#888888';
const METAL_DARK = '#444444';

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  const LENGTH = 1.4;  // Shorter reformer
  const WIDTH = 0.48;

  // Carriage extends from head-end toward footbar
  // Front edge of carriage should be near footbar
  const CARRIAGE_LENGTH = 0.75;
  const carriageX = (FOOTBAR_X - CARRIAGE_LENGTH / 2 - 0.08) + carriagePosition * 0.15;

  return (
    <group>
      {/* === FRAME === */}
      {/* Side rails */}
      <mesh position={[0, FRAME_HEIGHT / 2, -WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, FRAME_HEIGHT / 2, WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* Cross braces */}
      {[-LENGTH / 2 + 0.10, 0, LENGTH / 2 - 0.10].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, FRAME_HEIGHT / 2 - 0.01, 0]}>
          <boxGeometry args={[0.04, 0.03, WIDTH - 0.05]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Legs */}
      {[
        [-LENGTH / 2 + 0.06, -WIDTH / 2 + 0.04],
        [-LENGTH / 2 + 0.06, WIDTH / 2 - 0.04],
        [LENGTH / 2 - 0.06, -WIDTH / 2 + 0.04],
        [LENGTH / 2 - 0.06, WIDTH / 2 - 0.04],
      ].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, FRAME_HEIGHT / 4, z]}>
          <boxGeometry args={[0.04, FRAME_HEIGHT / 2, 0.04]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Upper rails */}
      <mesh position={[0, FRAME_HEIGHT, -WIDTH / 2 + 0.025]}>
        <boxGeometry args={[LENGTH - 0.05, 0.035, 0.035]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, FRAME_HEIGHT, WIDTH / 2 - 0.025]}>
        <boxGeometry args={[LENGTH - 0.05, 0.035, 0.035]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* Sliding rails */}
      <mesh position={[0, FRAME_HEIGHT + 0.03, -WIDTH / 2 + 0.055]}>
        <boxGeometry args={[LENGTH - 0.08, 0.018, 0.018]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, FRAME_HEIGHT + 0.03, WIDTH / 2 - 0.055]}>
        <boxGeometry args={[LENGTH - 0.08, 0.018, 0.018]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === CARRIAGE === */}
      <group position={[carriageX, FRAME_HEIGHT + 0.045, 0]}>
        {/* Base */}
        <mesh>
          <boxGeometry args={[CARRIAGE_LENGTH, 0.03, WIDTH - 0.08]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Padded top - this is CARRIAGE_TOP */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[CARRIAGE_LENGTH - 0.02, 0.02, WIDTH - 0.10]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === SHOULDER RESTS === */}
      {[-0.10, 0.10].map((z, i) => (
        <group key={`shoulder-${i}`} position={[carriageX - CARRIAGE_LENGTH / 2 + 0.06, CARRIAGE_TOP, z]}>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.025, 0.08, 0.025]} />
            <meshStandardMaterial color={METAL_DARK} />
          </mesh>
          <mesh position={[0, 0.085, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.05]} />
            <meshStandardMaterial color={PAD_COLOR} />
          </mesh>
        </group>
      ))}

      {/* === HEADREST (pillow style) === */}
      <group position={[carriageX - CARRIAGE_LENGTH / 2 - 0.05, CARRIAGE_TOP, 0]}>
        {/* Base platform */}
        <mesh>
          <boxGeometry args={[0.10, 0.02, 0.14]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Cushion - rounded shape using capsule */}
        <mesh position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.04, 0.06, 4, 8]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === FOOTBAR === */}
      <group position={[FOOTBAR_X, FRAME_HEIGHT, 0]}>
        {/* Posts */}
        {[-WIDTH / 2 + 0.04, WIDTH / 2 - 0.04].map((z, i) => (
          <mesh key={`post-${i}`} position={[0, (FOOTBAR_Y - FRAME_HEIGHT) / 2, z]}>
            <boxGeometry args={[0.025, FOOTBAR_Y - FRAME_HEIGHT, 0.025]} />
            <meshStandardMaterial color={METAL_DARK} />
          </mesh>
        ))}
        {/* Bar */}
        <mesh position={[0, FOOTBAR_Y - FRAME_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, WIDTH - 0.06, 12]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === SPRINGS === */}
      <group position={[FOOTBAR_X - 0.12, FRAME_HEIGHT + 0.02, 0]}>
        {[
          { z: -0.06, color: '#dd3333' },
          { z: -0.02, color: '#dd3333' },
          { z: 0.02, color: '#3366dd' },
          { z: 0.06, color: '#33aa33' },
        ].map(({ z, color }, i) => (
          <mesh key={`spring-${i}`} position={[-0.04, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.08, 6]} />
            <meshStandardMaterial color={color} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* === END BOARDS === */}
      <mesh position={[-LENGTH / 2 + 0.02, FRAME_HEIGHT + 0.04, 0]}>
        <boxGeometry args={[0.03, 0.08, WIDTH - 0.04]} />
        <meshStandardMaterial color={WOOD_LIGHT} />
      </mesh>
      <mesh position={[LENGTH / 2 - 0.02, FRAME_HEIGHT + 0.04, 0]}>
        <boxGeometry args={[0.03, 0.08, WIDTH - 0.04]} />
        <meshStandardMaterial color={WOOD_LIGHT} />
      </mesh>

      {/* === STRAPS/ROPES === */}
      {/* Strap pulleys at the end of the reformer */}
      {[-0.12, 0.12].map((z, i) => (
        <group key={`strap-system-${i}`} position={[-LENGTH / 2 + 0.08, FRAME_HEIGHT + 0.06, z]}>
          {/* Pulley wheel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.015, 12]} />
            <meshStandardMaterial color={METAL_DARK} />
          </mesh>

          {/* Rope from pulley going down and back toward carriage */}
          <mesh position={[0.15, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.004, 0.004, 0.30, 6]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>

          {/* Strap loop/handle */}
          <group position={[0.32, -0.02, 0]}>
            {/* Handle grip */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.06, 8]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            {/* Strap fabric connecting to handle */}
            <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[0.003, 0.04, 0.05]} />
              <meshStandardMaterial color="#3d3d3d" />
            </mesh>
          </group>
        </group>
      ))}

      {/* === PULLEY POSTS (tall posts for strap pulleys) === */}
      {[-0.14, 0.14].map((z, i) => (
        <group key={`pulley-post-${i}`} position={[-LENGTH / 2 + 0.06, FRAME_HEIGHT, z]}>
          {/* Vertical post */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.30, 8]} />
            <meshStandardMaterial color={METAL_DARK} />
          </mesh>
          {/* Pulley wheel at top */}
          <mesh position={[0, 0.27, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.025, 0.008, 8, 16]} />
            <meshStandardMaterial color={METAL_CHROME} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

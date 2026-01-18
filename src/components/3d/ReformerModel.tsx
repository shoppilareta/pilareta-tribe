'use client';

/**
 * Scalable Pilates Reformer 3D Model
 *
 * Key components positioned for bridging exercise:
 * - Carriage: Extended length, positioned so person's knees are bent with feet on footbar
 * - Headrest: Directly under where head rests
 * - Footbar: At correct height for feet to press against
 * - Springs: Connect carriage to foot-end
 *
 * Coordinate system:
 * - X: length (negative = head end, positive = foot end)
 * - Y: height (up)
 * - Z: width (left/right)
 */

interface ReformerProps {
  carriagePosition?: number;
}

// Color palette
const WOOD_FRAME = '#3d3022';
const WOOD_LIGHT = '#5a4a3a';
const RAIL_COLOR = '#6a6a6a';
const CARRIAGE_COLOR = '#1a1a1a';
const PAD_COLOR = '#2a2a2a';
const METAL_CHROME = '#888888';
const METAL_DARK = '#444444';
const LEATHER_COLOR = '#1f1a15';

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  // Frame dimensions
  const LENGTH = 1.6;
  const WIDTH = 0.52;
  const HEIGHT = 0.28;

  // Carriage is long enough for person to lie with knees bent
  const CARRIAGE_LENGTH = 0.90;

  // Carriage position - centered so feet reach footbar
  // Person's head will be at head-end, feet at footbar
  const carriageX = -0.15 + carriagePosition * 0.2;

  // Footbar X position (relative to center)
  const FOOTBAR_X = LENGTH / 2 - 0.12;

  return (
    <group>
      {/* === MAIN FRAME === */}
      {/* Side rails */}
      <mesh position={[0, HEIGHT / 2, -WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* Cross braces */}
      {[-LENGTH / 2 + 0.12, 0, LENGTH / 2 - 0.12].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, HEIGHT / 2 - 0.015, 0]}>
          <boxGeometry args={[0.04, 0.03, WIDTH - 0.05]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Legs */}
      {[
        [-LENGTH / 2 + 0.08, -WIDTH / 2 + 0.04],
        [-LENGTH / 2 + 0.08, WIDTH / 2 - 0.04],
        [LENGTH / 2 - 0.08, -WIDTH / 2 + 0.04],
        [LENGTH / 2 - 0.08, WIDTH / 2 - 0.04],
      ].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, HEIGHT / 4, z]}>
          <boxGeometry args={[0.04, HEIGHT / 2, 0.04]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Upper frame rails */}
      <mesh position={[0, HEIGHT, -WIDTH / 2 + 0.025]}>
        <boxGeometry args={[LENGTH - 0.06, 0.04, 0.04]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, HEIGHT, WIDTH / 2 - 0.025]}>
        <boxGeometry args={[LENGTH - 0.06, 0.04, 0.04]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* Metal sliding rails */}
      <mesh position={[0, HEIGHT + 0.035, -WIDTH / 2 + 0.06]}>
        <boxGeometry args={[LENGTH - 0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, HEIGHT + 0.035, WIDTH / 2 - 0.06]}>
        <boxGeometry args={[LENGTH - 0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === HEAD END === */}
      <group position={[-LENGTH / 2 + 0.03, HEIGHT, 0]}>
        {/* End board */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.05, 0.12, WIDTH - 0.04]} />
          <meshStandardMaterial color={WOOD_LIGHT} />
        </mesh>
        {/* Gear box */}
        <mesh position={[0.05, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.16]} />
          <meshStandardMaterial color={METAL_DARK} metalness={0.5} />
        </mesh>
      </group>

      {/* === CARRIAGE (Extended for lying person) === */}
      <group position={[carriageX, HEIGHT + 0.055, 0]}>
        {/* Carriage base - EXTENDED */}
        <mesh>
          <boxGeometry args={[CARRIAGE_LENGTH, 0.035, WIDTH - 0.10]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Padded surface */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[CARRIAGE_LENGTH - 0.02, 0.025, WIDTH - 0.12]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
        {/* Wheels */}
        {[-CARRIAGE_LENGTH / 2 + 0.08, 0, CARRIAGE_LENGTH / 2 - 0.08].map((x) =>
          [-WIDTH / 2 + 0.08, WIDTH / 2 - 0.08].map((z, zi) => (
            <mesh key={`wheel-${x}-${zi}`} position={[x, -0.022, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.015, 8]} />
              <meshStandardMaterial color={METAL_CHROME} metalness={0.6} />
            </mesh>
          ))
        )}
      </group>

      {/* === SHOULDER RESTS (on carriage) === */}
      {[-0.12, 0.12].map((z, i) => (
        <group key={`shoulder-${i}`} position={[carriageX - CARRIAGE_LENGTH / 2 + 0.08, HEIGHT + 0.055, z]}>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.03, 0.10, 0.03]} />
            <meshStandardMaterial color={METAL_DARK} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[0.045, 0.035, 0.055]} />
            <meshStandardMaterial color={PAD_COLOR} />
          </mesh>
        </group>
      ))}

      {/* === HEADREST (positioned under head) === */}
      {/* Head position from HumanModel: SHOULDER_X - 0.12, which puts head around x = -0.62 */}
      <group position={[carriageX - CARRIAGE_LENGTH / 2 - 0.02, HEIGHT + 0.055, 0]}>
        {/* Base */}
        <mesh>
          <boxGeometry args={[0.10, 0.02, 0.14]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Padded surface */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.09, 0.02, 0.13]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === FOOTBAR === */}
      <group position={[FOOTBAR_X, HEIGHT, 0]}>
        {/* Vertical posts */}
        {[-WIDTH / 2 + 0.05, WIDTH / 2 - 0.05].map((z, i) => (
          <mesh key={`post-${i}`} position={[0, 0.13, z]}>
            <boxGeometry args={[0.03, 0.26, 0.03]} />
            <meshStandardMaterial color={METAL_DARK} metalness={0.5} />
          </mesh>
        ))}
        {/* Horizontal bar (padded) - this is where feet press */}
        <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, WIDTH - 0.08, 16]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === STANDING PLATFORM === */}
      <mesh position={[LENGTH / 2 - 0.04, HEIGHT + 0.02, 0]}>
        <boxGeometry args={[0.06, 0.04, WIDTH - 0.05]} />
        <meshStandardMaterial color={WOOD_LIGHT} />
      </mesh>

      {/* === SPRING SYSTEM === */}
      <group position={[FOOTBAR_X - 0.18, HEIGHT + 0.02, 0]}>
        {/* Spring bar */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.24, 8]} />
          <meshStandardMaterial color={METAL_CHROME} metalness={0.7} />
        </mesh>
        {/* Springs */}
        {[
          { z: -0.08, color: '#dd3333' },
          { z: -0.025, color: '#dd3333' },
          { z: 0.025, color: '#3366dd' },
          { z: 0.08, color: '#33aa33' },
        ].map(({ z, color }, i) => (
          <mesh key={`spring-${i}`} position={[-0.06, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.12, 6]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* === ROPES/STRAPS === */}
      <group position={[-LENGTH / 2 + 0.12, HEIGHT + 0.06, 0]}>
        {[-0.10, 0.10].map((z, i) => (
          <group key={`rope-${i}`} position={[0, 0.03, z]}>
            <mesh position={[0.20, 0, 0]}>
              <boxGeometry args={[0.40, 0.012, 0.02]} />
              <meshStandardMaterial color={LEATHER_COLOR} />
            </mesh>
            <mesh position={[0.42, 0, 0]}>
              <torusGeometry args={[0.02, 0.005, 8, 12]} />
              <meshStandardMaterial color={LEATHER_COLOR} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === FOOT END BOARD === */}
      <mesh position={[LENGTH / 2 - 0.02, HEIGHT + 0.05, 0]}>
        <boxGeometry args={[0.03, 0.10, WIDTH - 0.04]} />
        <meshStandardMaterial color={WOOD_LIGHT} />
      </mesh>
    </group>
  );
}

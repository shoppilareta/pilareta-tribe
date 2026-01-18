'use client';

/**
 * Pilates Reformer 3D Model
 *
 * Realistic reformer with all major components:
 * - Frame with legs and end boards
 * - Sliding carriage with padded surface
 * - Metal rails for carriage movement
 * - Footbar with multiple height positions
 * - Shoulder rests
 * - Spring system with colored springs
 * - Headrest with adjustable positions
 * - Rope/strap attachment points
 * - Gear box / risers at head end
 */

interface ReformerProps {
  carriagePosition?: number;
}

// Color palette for realistic look
const WOOD_FRAME = '#3d3022'; // Dark wood frame
const WOOD_LIGHT = '#5a4a3a'; // Lighter wood accents
const RAIL_COLOR = '#6a6a6a'; // Brushed metal rails
const CARRIAGE_COLOR = '#1a1a1a'; // Black carriage base
const PAD_COLOR = '#2a2a2a'; // Dark gray padding
const METAL_CHROME = '#888888'; // Chrome/steel elements
const METAL_DARK = '#444444'; // Dark metal
const LEATHER_COLOR = '#1f1a15'; // Leather straps

export function ReformerModel({ carriagePosition = 0 }: ReformerProps) {
  // Realistic dimensions (scaled for 3D scene)
  const LENGTH = 1.8;
  const WIDTH = 0.58;
  const HEIGHT = 0.28;

  const carriageX = -0.30 + carriagePosition * 0.4;

  return (
    <group>
      {/* === MAIN FRAME === */}
      {/* Side frame rails - wood construction */}
      <mesh position={[0, HEIGHT / 2, -WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.06, 0.06]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, HEIGHT / 2, WIDTH / 2]}>
        <boxGeometry args={[LENGTH, 0.06, 0.06]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* Cross braces for frame stability */}
      {[-LENGTH / 2 + 0.15, 0, LENGTH / 2 - 0.15].map((x, i) => (
        <mesh key={`brace-${i}`} position={[x, HEIGHT / 2 - 0.02, 0]}>
          <boxGeometry args={[0.04, 0.04, WIDTH - 0.06]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Frame legs - angled for stability */}
      {[
        [-LENGTH / 2 + 0.10, -WIDTH / 2 + 0.05],
        [-LENGTH / 2 + 0.10, WIDTH / 2 - 0.05],
        [LENGTH / 2 - 0.10, -WIDTH / 2 + 0.05],
        [LENGTH / 2 - 0.10, WIDTH / 2 - 0.05],
      ].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, HEIGHT / 4, z]}>
          <boxGeometry args={[0.05, HEIGHT / 2, 0.05]} />
          <meshStandardMaterial color={WOOD_FRAME} />
        </mesh>
      ))}

      {/* Upper frame rails (where carriage slides) */}
      <mesh position={[0, HEIGHT, -WIDTH / 2 + 0.03]}>
        <boxGeometry args={[LENGTH - 0.08, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>
      <mesh position={[0, HEIGHT, WIDTH / 2 - 0.03]}>
        <boxGeometry args={[LENGTH - 0.08, 0.05, 0.05]} />
        <meshStandardMaterial color={WOOD_FRAME} />
      </mesh>

      {/* === METAL SLIDING RAILS === */}
      <mesh position={[0, HEIGHT + 0.04, -WIDTH / 2 + 0.08]}>
        <boxGeometry args={[LENGTH - 0.16, 0.025, 0.025]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, HEIGHT + 0.04, WIDTH / 2 - 0.08]}>
        <boxGeometry args={[LENGTH - 0.16, 0.025, 0.025]} />
        <meshStandardMaterial color={RAIL_COLOR} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === HEAD END BOARD / GEAR BOX === */}
      <group position={[-LENGTH / 2 + 0.04, HEIGHT, 0]}>
        {/* End board */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.06, 0.16, WIDTH - 0.04]} />
          <meshStandardMaterial color={WOOD_LIGHT} />
        </mesh>
        {/* Gear box housing */}
        <mesh position={[0.06, 0.02, 0]}>
          <boxGeometry args={[0.10, 0.08, 0.20]} />
          <meshStandardMaterial color={METAL_DARK} metalness={0.5} />
        </mesh>
        {/* Pulley wheels */}
        {[-0.06, 0.06].map((z, i) => (
          <mesh key={`pulley-${i}`} position={[0.02, 0.10, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
            <meshStandardMaterial color={METAL_CHROME} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* === CARRIAGE === */}
      <group position={[carriageX, HEIGHT + 0.065, 0]}>
        {/* Carriage base */}
        <mesh>
          <boxGeometry args={[0.70, 0.04, WIDTH - 0.14]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Carriage wheels/rollers (underneath) */}
        {[-0.28, 0, 0.28].map((x) =>
          [-WIDTH / 2 + 0.12, WIDTH / 2 - 0.12].map((z, zi) => (
            <mesh key={`wheel-${x}-${zi}`} position={[x, -0.025, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.02, 8]} />
              <meshStandardMaterial color={METAL_CHROME} metalness={0.6} />
            </mesh>
          ))
        )}
        {/* Padded surface */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.68, 0.03, WIDTH - 0.16]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
        {/* Strap attachment loops on sides */}
        {[-0.15, 0.15].map((x) =>
          [-WIDTH / 2 + 0.06, WIDTH / 2 - 0.06].map((z, zi) => (
            <mesh key={`loop-${x}-${zi}`} position={[x, 0, z]}>
              <torusGeometry args={[0.015, 0.004, 8, 12]} />
              <meshStandardMaterial color={METAL_CHROME} metalness={0.7} />
            </mesh>
          ))
        )}
      </group>

      {/* === SHOULDER RESTS === */}
      {[-0.14, 0.14].map((z, i) => (
        <group key={`shoulder-${i}`} position={[carriageX - 0.30, HEIGHT + 0.065, z]}>
          {/* Post */}
          <mesh position={[0, 0.055, 0]}>
            <boxGeometry args={[0.035, 0.11, 0.035]} />
            <meshStandardMaterial color={METAL_DARK} metalness={0.4} />
          </mesh>
          {/* Padded top */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.05, 0.04, 0.06]} />
            <meshStandardMaterial color={PAD_COLOR} />
          </mesh>
        </group>
      ))}

      {/* === HEADREST === */}
      <group position={[-LENGTH / 2 + 0.18, HEIGHT + 0.08, 0]}>
        {/* Base plate */}
        <mesh>
          <boxGeometry args={[0.12, 0.025, 0.18]} />
          <meshStandardMaterial color={CARRIAGE_COLOR} />
        </mesh>
        {/* Adjustable support */}
        <mesh position={[-0.02, 0.02, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshStandardMaterial color={METAL_DARK} />
        </mesh>
        {/* Padded headrest surface */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.10, 0.025, 0.16]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === FOOTBAR ASSEMBLY === */}
      <group position={[LENGTH / 2 - 0.12, HEIGHT, 0]}>
        {/* Footbar mounting brackets */}
        {[-WIDTH / 2 + 0.06, WIDTH / 2 - 0.06].map((z, i) => (
          <group key={`bracket-${i}`} position={[0, 0, z]}>
            {/* Vertical post */}
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.035, 0.28, 0.035]} />
              <meshStandardMaterial color={METAL_DARK} metalness={0.5} />
            </mesh>
            {/* Height adjustment notches */}
            {[0.08, 0.14, 0.20].map((y, yi) => (
              <mesh key={`notch-${yi}`} position={[0.02, y, 0]}>
                <boxGeometry args={[0.01, 0.015, 0.02]} />
                <meshStandardMaterial color={METAL_CHROME} metalness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Main footbar (padded) */}
        <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, WIDTH - 0.10, 16]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
        {/* Inner metal core visible at ends */}
        <mesh position={[0, 0.26, -WIDTH / 2 + 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
          <meshStandardMaterial color={METAL_CHROME} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.26, WIDTH / 2 - 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 8]} />
          <meshStandardMaterial color={METAL_CHROME} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* === STANDING PLATFORM === */}
      <group position={[LENGTH / 2 - 0.05, HEIGHT, 0]}>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.08, 0.05, WIDTH - 0.06]} />
          <meshStandardMaterial color={WOOD_LIGHT} />
        </mesh>
        {/* Non-slip surface texture */}
        <mesh position={[0, 0.055, 0]}>
          <boxGeometry args={[0.075, 0.01, WIDTH - 0.08]} />
          <meshStandardMaterial color={PAD_COLOR} />
        </mesh>
      </group>

      {/* === SPRING SYSTEM === */}
      <group position={[LENGTH / 2 - 0.32, HEIGHT + 0.02, 0]}>
        {/* Spring bar (where springs attach) */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
          <meshStandardMaterial color={METAL_CHROME} metalness={0.7} />
        </mesh>
        {/* Individual springs with hooks */}
        {[
          { z: -0.10, color: '#dd3333' }, // Red - heavy
          { z: -0.035, color: '#dd3333' }, // Red - heavy
          { z: 0.035, color: '#3366dd' }, // Blue - medium
          { z: 0.10, color: '#33aa33' }, // Green - light
        ].map(({ z, color }, i) => (
          <group key={`spring-${i}`} position={[0, 0, z]}>
            {/* Spring coil */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Hook at carriage end */}
            <mesh position={[-0.09, 0, 0]}>
              <sphereGeometry args={[0.006, 6, 6]} />
              <meshStandardMaterial color={METAL_CHROME} metalness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === ROPE/STRAP SYSTEM === */}
      <group position={[-LENGTH / 2 + 0.15, HEIGHT + 0.08, 0]}>
        {/* Rope pulleys at head end */}
        {[-0.12, 0.12].map((z, i) => (
          <group key={`rope-${i}`} position={[0, 0.04, z]}>
            {/* Strap/rope (simplified) */}
            <mesh position={[0.25, -0.02, 0]}>
              <boxGeometry args={[0.50, 0.015, 0.025]} />
              <meshStandardMaterial color={LEATHER_COLOR} />
            </mesh>
            {/* Handle loop */}
            <mesh position={[0.52, -0.02, 0]}>
              <torusGeometry args={[0.025, 0.006, 8, 16]} />
              <meshStandardMaterial color={LEATHER_COLOR} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === FOOT END BOARD === */}
      <mesh position={[LENGTH / 2 - 0.02, HEIGHT + 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, WIDTH - 0.04]} />
        <meshStandardMaterial color={WOOD_LIGHT} />
      </mesh>
    </group>
  );
}

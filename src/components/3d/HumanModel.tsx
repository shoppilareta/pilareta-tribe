'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human figure for Pilates reformer exercises
 *
 * For bridging exercise:
 * - Person lies supine (on back) on carriage
 * - Head on headrest, shoulders against shoulder rests
 * - Feet press against footbar (elevated above carriage)
 * - During bridge: pelvis lifts UP while feet push against footbar
 *
 * Coordinate system matches ReformerModel:
 * - X: length (negative = head, positive = feet)
 * - Y: up
 * - Z: width (side to side)
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

// Colors
const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Reformer reference points (from ReformerModel)
const CARRIAGE_Y = 0.38; // Carriage surface height
const FOOTBAR_Y = 0.60;  // Footbar height
const FOOTBAR_X = 0.95;  // Footbar X position

// Body segment lengths
const HEAD_RADIUS = 0.085;
const TORSO_LENGTH = 0.50;
const THIGH_LENGTH = 0.42;
const SHIN_LENGTH = 0.40;

// Animation cycle
const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Refs for animated body parts
  const pelvisGroupRef = useRef<THREE.Group>(null);
  const lowerSpineRef = useRef<THREE.Group>(null);
  const midSpineRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);

  // Starting position calculations
  // Person lying with head at X = -0.85, pelvis around X = -0.35
  const headX = -0.85;
  const shouldersX = -0.72;
  const pelvisRestX = -0.25;
  const pelvisRestY = CARRIAGE_Y + 0.06; // Slightly above carriage

  // Calculate initial leg angles to reach footbar
  // Thigh goes from pelvis toward footbar, shin bends back to footbar
  const hipToFootX = FOOTBAR_X - pelvisRestX;
  const hipToFootY = FOOTBAR_Y - pelvisRestY;

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress: 0 at rest, 1 at peak bridge
    let progress = 0;
    if (t < 2) {
      progress = easeInOut(t / 2); // Rise over 2 seconds
    } else if (t < 3) {
      progress = 1; // Hold for 1 second
    } else {
      progress = 1 - easeInOut((t - 3) / 2); // Lower over 2 seconds
    }

    // === PELVIS LIFT ===
    // Pelvis rises UP off the carriage
    const pelvisLift = progress * 0.22;

    if (pelvisGroupRef.current) {
      pelvisGroupRef.current.position.y = pelvisLift;
    }

    // === SPINE ARTICULATION ===
    // Sequential wave: lower spine leads, then mid spine
    const lowerSpineAngle = easeInOut(Math.min(1, progress * 1.2)) * 0.30;
    const midSpineAngle = easeInOut(Math.max(0, (progress - 0.15) * 1.2)) * 0.20;

    if (lowerSpineRef.current) {
      // Rotate around Z to curve spine upward (lift pelvis end)
      lowerSpineRef.current.rotation.z = lowerSpineAngle;
    }
    if (midSpineRef.current) {
      midSpineRef.current.rotation.z = midSpineAngle;
    }

    // === LEG ANGLES ===
    // As pelvis rises, thighs become more vertical and shins extend
    // This keeps feet pressed against footbar
    const thighBaseAngle = -0.65; // Starting angle (pointing toward footbar)
    const thighLiftAngle = progress * 0.25; // Thighs rotate more upright
    const thighAngle = thighBaseAngle + thighLiftAngle;

    const shinBaseAngle = 1.3; // Starting knee bend
    const shinExtendAngle = -progress * 0.15; // Shins extend slightly
    const shinAngle = shinBaseAngle + shinExtendAngle;

    if (leftThighRef.current) leftThighRef.current.rotation.z = thighAngle;
    if (rightThighRef.current) rightThighRef.current.rotation.z = thighAngle;
    if (leftShinRef.current) leftShinRef.current.rotation.z = shinAngle;
    if (rightShinRef.current) rightShinRef.current.rotation.z = shinAngle;

    // Carriage stays mostly still during bridging
    if (onCarriageMove) {
      onCarriageMove(0.05 + progress * 0.02);
    }
  });

  function easeInOut(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped < 0.5
      ? 2 * clamped * clamped
      : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
  }

  return (
    <group>
      {/* === HEAD (on headrest, fixed) === */}
      <mesh position={[headX, CARRIAGE_Y + 0.12, 0]}>
        <sphereGeometry args={[HEAD_RADIUS, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[headX + 0.10, CARRIAGE_Y + 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.028, 0.06, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS/UPPER BACK (fixed on carriage) === */}
      <group position={[shouldersX, CARRIAGE_Y + 0.05, 0]}>
        {/* Shoulder block */}
        <mesh>
          <boxGeometry args={[0.12, 0.07, 0.34]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms lying at sides */}
        <Arm side="left" />
        <Arm side="right" />

        {/* === MID SPINE (slight articulation) === */}
        <group ref={midSpineRef} position={[0.10, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.065, 0.10, 4, 12]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* === LOWER SPINE (main articulation point) === */}
          <group ref={lowerSpineRef} position={[0.12, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.060, 0.10, 4, 12]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* === PELVIS GROUP (lifts during bridge) === */}
            <group ref={pelvisGroupRef} position={[0.12, 0, 0]}>
              {/* Pelvis/hips */}
              <mesh scale={[0.85, 0.65, 1.0]}>
                <sphereGeometry args={[0.10, 16, 12]} />
                <meshStandardMaterial color={CLOTHING} />
              </mesh>

              {/* === LEFT LEG === */}
              <group position={[0.04, -0.02, -0.10]}>
                {/* Hip joint */}
                <mesh>
                  <sphereGeometry args={[0.035, 10, 10]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Thigh */}
                <group ref={leftThighRef} rotation={[0, 0, -0.65]}>
                  <mesh position={[THIGH_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.050, THIGH_LENGTH - 0.06, 4, 12]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Knee */}
                  <group position={[THIGH_LENGTH, 0, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.042, 10, 10]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Shin */}
                    <group ref={leftShinRef} rotation={[0, 0, 1.3]}>
                      <mesh position={[SHIN_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.040, SHIN_LENGTH - 0.06, 4, 12]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>

                      {/* Foot (pressing against footbar) */}
                      <mesh position={[SHIN_LENGTH - 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                        <boxGeometry args={[0.06, 0.04, 0.10]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>

              {/* === RIGHT LEG === */}
              <group position={[0.04, -0.02, 0.10]}>
                {/* Hip joint */}
                <mesh>
                  <sphereGeometry args={[0.035, 10, 10]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Thigh */}
                <group ref={rightThighRef} rotation={[0, 0, -0.65]}>
                  <mesh position={[THIGH_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <capsuleGeometry args={[0.050, THIGH_LENGTH - 0.06, 4, 12]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Knee */}
                  <group position={[THIGH_LENGTH, 0, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.042, 10, 10]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Shin */}
                    <group ref={rightShinRef} rotation={[0, 0, 1.3]}>
                      <mesh position={[SHIN_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <capsuleGeometry args={[0.040, SHIN_LENGTH - 0.06, 4, 12]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>

                      {/* Foot */}
                      <mesh position={[SHIN_LENGTH - 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                        <boxGeometry args={[0.06, 0.04, 0.10]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

// Arm component - lying alongside body on carriage
function Arm({ side }: { side: 'left' | 'right' }) {
  const zPos = side === 'left' ? -0.20 : 0.20;

  return (
    <group position={[0.08, -0.01, zPos]}>
      {/* Upper arm */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.028, 0.20, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* Forearm */}
      <mesh position={[0.30, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.024, 0.18, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* Hand */}
      <mesh position={[0.42, 0.02, 0]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
    </group>
  );
}

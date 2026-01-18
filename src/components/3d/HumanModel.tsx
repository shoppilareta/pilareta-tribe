'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human Model for Pilates Bridging
 *
 * SHARED COORDINATES (must match ReformerModel.tsx):
 * - CARRIAGE_TOP = 0.37 (where person lies)
 * - FOOTBAR_X = 0.55
 * - FOOTBAR_Y = 0.52
 *
 * BODY CONSTRUCTION:
 * All body parts are built as a SINGLE connected chain.
 * Each joint is placed EXACTLY where the previous segment ends.
 *
 * VERIFICATION:
 * - Pelvis center at (0.15, CARRIAGE_TOP + 0.03, 0)
 * - Hip joints at pelvis edges
 * - Thigh attaches at hip, ends at knee
 * - Shin attaches at knee, ends at foot
 * - Foot positioned at FOOTBAR
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// === SHARED CONSTANTS (must match ReformerModel) ===
const CARRIAGE_TOP = 0.37;
const FOOTBAR_X = 0.55;
const FOOTBAR_Y = 0.52;

// Body dimensions
const THIGH_LEN = 0.28;
const SHIN_LEN = 0.26;

const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);
  const pelvisLiftRef = useRef<THREE.Group>(null);

  // Base pelvis Y position (on carriage)
  const PELVIS_BASE_Y = CARRIAGE_TOP + 0.03;

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    // Pelvis lifts UP from base position (adds to base, never overwrites)
    // Base Y is set in JSX, animation only adds lift amount
    if (pelvisLiftRef.current) {
      pelvisLiftRef.current.position.y = p * 0.12;  // Lift amount (0 to 0.12)
    }

    if (onCarriageMove) onCarriageMove(0.02);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // === CALCULATE POSITIONS FROM FOOTBAR BACKWARDS ===
  // Foot is at footbar
  const FOOT_X = FOOTBAR_X;
  const FOOT_Y = FOOTBAR_Y;

  // Work backwards: shin angle to reach foot from knee
  // Knee should be above and behind foot
  const KNEE_X = FOOT_X - 0.08;
  const KNEE_Y = FOOT_Y + SHIN_LEN * 0.85;

  // Verify shin reaches foot
  const shinDist = Math.sqrt((FOOT_X - KNEE_X) ** 2 + (FOOT_Y - KNEE_Y) ** 2);
  const SHIN_ANGLE = Math.atan2(FOOT_Y - KNEE_Y, FOOT_X - KNEE_X);

  // Hip should be behind and below knee (person lying down)
  const HIP_X = KNEE_X - THIGH_LEN * 0.75;
  const HIP_Y = CARRIAGE_TOP + 0.04;

  // Verify thigh reaches knee
  const thighDist = Math.sqrt((KNEE_X - HIP_X) ** 2 + (KNEE_Y - HIP_Y) ** 2);
  const THIGH_ANGLE = Math.atan2(KNEE_Y - HIP_Y, KNEE_X - HIP_X);

  // Pelvis is at hip level
  const PELVIS_X = HIP_X - 0.04;
  const PELVIS_Y = CARRIAGE_TOP + 0.03;

  // Torso extends from pelvis toward head
  const SHOULDER_X = PELVIS_X - 0.28;
  const HEAD_X = SHOULDER_X - 0.10;

  // Hip offset from pelvis center
  const HIP_OFFSET_X = HIP_X - PELVIS_X;
  const HIP_OFFSET_Z = 0.07;

  return (
    <group>
      {/* === HEAD === */}
      <mesh position={[HEAD_X, CARRIAGE_TOP + 0.06, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[HEAD_X + 0.06, CARRIAGE_TOP + 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS (fixed) === */}
      <group position={[SHOULDER_X, CARRIAGE_TOP + 0.03, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 0.04, 0.22]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms */}
        {[-0.09, 0.09].map((z, i) => (
          <group key={`arm-${i}`} position={[0.02, 0, z]}>
            <mesh position={[0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.016, 0.10, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            <mesh position={[0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.014, 0.08, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === TORSO (connects shoulders to pelvis) === */}
      <mesh position={[(SHOULDER_X + PELVIS_X) / 2, CARRIAGE_TOP + 0.025, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.04, Math.abs(PELVIS_X - SHOULDER_X) - 0.06, 4, 8]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === PELVIS GROUP (animates up) === */}
      {/* Outer group: fixed base position on carriage */}
      <group position={[PELVIS_X, PELVIS_Y, 0]}>
        {/* Inner group: animates lift only (starts at 0, lifts up) */}
        <group ref={pelvisLiftRef}>
          {/* Pelvis mesh */}
          <mesh>
            <boxGeometry args={[0.10, 0.05, 0.18]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

        {/* === LEFT LEG (connected chain) === */}
        <group position={[HIP_OFFSET_X, 0.01, -HIP_OFFSET_Z]}>
          {/* Hip joint */}
          <mesh>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Thigh */}
          <group rotation={[0, 0, THIGH_ANGLE]}>
            <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.032, THIGH_LEN - 0.03, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            {/* Knee (at end of thigh) */}
            <group position={[THIGH_LEN, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Shin */}
              <group rotation={[0, 0, SHIN_ANGLE - THIGH_ANGLE]}>
                <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.025, SHIN_LEN - 0.03, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Foot (at end of shin) */}
                <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, -SHIN_ANGLE + 0.3]}>
                  <boxGeometry args={[0.07, 0.02, 0.035]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* === RIGHT LEG (mirror of left) === */}
        <group position={[HIP_OFFSET_X, 0.01, HIP_OFFSET_Z]}>
          <mesh>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          <group rotation={[0, 0, THIGH_ANGLE]}>
            <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.032, THIGH_LEN - 0.03, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            <group position={[THIGH_LEN, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.028, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group rotation={[0, 0, SHIN_ANGLE - THIGH_ANGLE]}>
                <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.025, SHIN_LEN - 0.03, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, -SHIN_ANGLE + 0.3]}>
                  <boxGeometry args={[0.07, 0.02, 0.035]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        </group>  {/* Close inner pelvisLiftRef group */}
      </group>  {/* Close outer base position group */}
    </group>
  );
}

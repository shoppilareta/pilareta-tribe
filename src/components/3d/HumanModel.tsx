'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Scalable Human Model for Pilates Exercises
 *
 * BRIDGING POSITION:
 * - Person lies supine (face up) on carriage
 * - Head on headrest at head-end of reformer
 * - Shoulders against shoulder rests
 * - Knees bent, feet flat on footbar
 * - During bridge: ONLY the pelvis/lower back lifts up
 * - Feet remain STATIONARY on footbar throughout
 *
 * COORDINATE SYSTEM:
 * - X axis: along reformer length (negative = head end, positive = foot end)
 * - Y axis: up
 * - Z axis: width (left/right)
 *
 * SCALABLE DESIGN:
 * - Body parts defined relative to joints
 * - Poses configured via props
 * - Animation system separate from body structure
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

// Colors
const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Body segment lengths (realistic proportions, scaled)
const HEAD_RADIUS = 0.065;
const NECK_LEN = 0.04;
const SHOULDER_WIDTH = 0.26;
const TORSO_LEN = 0.32;
const UPPER_ARM_LEN = 0.18;
const FOREARM_LEN = 0.16;
const PELVIS_WIDTH = 0.22;
const THIGH_LEN = 0.34;
const SHIN_LEN = 0.32;
const FOOT_LEN = 0.10;

// Animation
const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Refs for animated parts
  const lowerBackRef = useRef<THREE.Group>(null);
  const pelvisRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation phases: lift (0-1.5s), hold (1.5-3s), lower (3-4.5s), rest (4.5-5s)
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    // Lower back arches up (rotates around shoulder area)
    if (lowerBackRef.current) {
      lowerBackRef.current.rotation.z = -p * 0.35; // Negative = arch upward
    }

    // Pelvis lifts (child of lower back, so inherits rotation + adds Y offset)
    if (pelvisRef.current) {
      pelvisRef.current.position.y = p * 0.12;
    }

    if (onCarriageMove) onCarriageMove(0.02);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Position: Person lying on carriage with head at head-end
  // Carriage surface is approximately Y = 0.38
  const CARRIAGE_Y = 0.38;

  // Feet position (on footbar) - this is our FIXED point
  const FOOTBAR_X = 0.68;  // X position of footbar
  const FOOTBAR_Y = 0.54;  // Height of footbar

  // Calculate body positions backwards from feet
  // With knees bent ~90°, the knee is roughly above the foot
  const KNEE_X = FOOTBAR_X - 0.05;
  const KNEE_Y = FOOTBAR_Y + SHIN_LEN * 0.7; // Shin angled back

  // Hip is behind knee with thigh angled
  const HIP_X = KNEE_X - THIGH_LEN * 0.85;
  const HIP_Y = CARRIAGE_Y + 0.06;

  // Calculate angles
  // Thigh angle: from hip to knee
  const thighDX = KNEE_X - HIP_X;
  const thighDY = KNEE_Y - HIP_Y;
  const THIGH_ANGLE = Math.atan2(thighDY, thighDX);

  // Shin angle: from knee down to foot
  const shinDX = FOOTBAR_X - KNEE_X;
  const shinDY = FOOTBAR_Y - KNEE_Y;
  const SHIN_ANGLE = Math.atan2(shinDY, shinDX);

  // Shoulders/head position
  const SHOULDER_X = HIP_X - TORSO_LEN;

  return (
    <group>
      {/* === HEAD === */}
      <mesh position={[SHOULDER_X - 0.12, CARRIAGE_Y + 0.08, 0]}>
        <sphereGeometry args={[HEAD_RADIUS, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[SHOULDER_X - 0.05, CARRIAGE_Y + 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.022, NECK_LEN, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === UPPER BODY (FIXED - shoulders on carriage) === */}
      <group position={[SHOULDER_X, CARRIAGE_Y + 0.04, 0]}>
        {/* Shoulders */}
        <mesh>
          <boxGeometry args={[0.10, 0.05, SHOULDER_WIDTH]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms resting at sides */}
        {[-SHOULDER_WIDTH / 2 + 0.02, SHOULDER_WIDTH / 2 - 0.02].map((z, i) => (
          <group key={`arm-${i}`} position={[0.02, -0.01, z]}>
            <mesh position={[UPPER_ARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.020, UPPER_ARM_LEN - 0.03, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            <mesh position={[UPPER_ARM_LEN + FOREARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.018, FOREARM_LEN - 0.03, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        ))}

        {/* === LOWER BACK (ANIMATES - pivots at shoulders) === */}
        <group ref={lowerBackRef}>
          {/* Mid torso */}
          <mesh position={[TORSO_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.05, TORSO_LEN - 0.08, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* === PELVIS (ANIMATES - lifts up) === */}
          <group ref={pelvisRef} position={[TORSO_LEN, -0.01, 0]}>
            {/* Pelvis/hips */}
            <mesh>
              <boxGeometry args={[0.10, 0.06, PELVIS_WIDTH]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>
          </group>
        </group>
      </group>

      {/* === LEGS (STATIC POSE - feet on footbar) === */}
      {/* Left leg */}
      <group position={[HIP_X, HIP_Y, -PELVIS_WIDTH / 2 + 0.03]}>
        {/* Hip joint */}
        <mesh>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        {/* Thigh */}
        <group rotation={[0, 0, THIGH_ANGLE]}>
          <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.038, THIGH_LEN - 0.05, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      </group>

      {/* Left knee + shin */}
      <group position={[KNEE_X, KNEE_Y, -PELVIS_WIDTH / 2 + 0.03]}>
        <mesh>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <group rotation={[0, 0, SHIN_ANGLE]}>
          <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.030, SHIN_LEN - 0.05, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      </group>

      {/* Left foot (on footbar) */}
      <mesh position={[FOOTBAR_X, FOOTBAR_Y, -PELVIS_WIDTH / 2 + 0.03]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[FOOT_LEN, 0.025, 0.045]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* Right leg */}
      <group position={[HIP_X, HIP_Y, PELVIS_WIDTH / 2 - 0.03]}>
        <mesh>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <group rotation={[0, 0, THIGH_ANGLE]}>
          <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.038, THIGH_LEN - 0.05, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      </group>

      {/* Right knee + shin */}
      <group position={[KNEE_X, KNEE_Y, PELVIS_WIDTH / 2 - 0.03]}>
        <mesh>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshStandardMaterial color={SKIN} />
        </mesh>
        <group rotation={[0, 0, SHIN_ANGLE]}>
          <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.030, SHIN_LEN - 0.05, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      </group>

      {/* Right foot (on footbar) */}
      <mesh position={[FOOTBAR_X, FOOTBAR_Y, PELVIS_WIDTH / 2 - 0.03]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[FOOT_LEN, 0.025, 0.045]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
    </group>
  );
}

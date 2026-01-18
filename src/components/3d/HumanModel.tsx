'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human figure for Pilates bridging exercise
 *
 * FIXED HIERARCHY - Each body part connects directly to its parent with zero offset at joint
 *
 * Structure:
 * - Root at shoulders (fixed on carriage)
 *   - Torso (from shoulders down to hips)
 *     - Pelvis pivot (at hip level, animates Y position for bridge)
 *       - Left leg chain: Hip → Thigh → Knee → Shin → Foot
 *       - Right leg chain: Hip → Thigh → Knee → Shin → Foot
 *
 * Key insight: Each limb segment's mesh is offset from the group origin,
 * but the GROUP itself is at zero offset from parent, creating seamless joints.
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Body dimensions
const THIGH_LEN = 0.32;
const SHIN_LEN = 0.30;
const TORSO_LEN = 0.35;

const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Animation refs
  const pelvisRef = useRef<THREE.Group>(null);
  const leftHipRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress: 0->1 lift, hold, 1->0 lower
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 2.5) p = 1;
    else if (t < 4) p = 1 - ease((t - 2.5) / 1.5);
    else p = 0;

    // BRIDGE: Pelvis lifts UP (Y axis)
    if (pelvisRef.current) {
      pelvisRef.current.position.y = p * 0.18;
    }

    // Hip rotation: as pelvis rises, hips rotate to keep feet in place
    // More negative = thigh rotates down toward feet
    const hipAngle = 0.3 - p * 0.25;
    if (leftHipRef.current) leftHipRef.current.rotation.z = hipAngle;
    if (rightHipRef.current) rightHipRef.current.rotation.z = hipAngle;

    // Knee bend: adjusts to maintain foot position
    const kneeAngle = -1.8 + p * 0.3;
    if (leftKneeRef.current) leftKneeRef.current.rotation.z = kneeAngle;
    if (rightKneeRef.current) rightKneeRef.current.rotation.z = kneeAngle;

    if (onCarriageMove) onCarriageMove(0.05);
  });

  function ease(t: number) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Position human on carriage - X is along reformer length
  // Shoulders near head end, feet toward foot end
  const ROOT_X = -0.15; // Centered more toward footbar
  const ROOT_Y = 0.42;  // Carriage surface height

  return (
    <group position={[ROOT_X, ROOT_Y, 0]}>
      {/* === HEAD === */}
      <mesh position={[-0.22, 0.06, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[-0.14, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS (ROOT - fixed on carriage) === */}
      <mesh position={[-0.08, 0.03, 0]}>
        <boxGeometry args={[0.10, 0.05, 0.28]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === ARMS (resting at sides) === */}
      {[-0.16, 0.16].map((z, i) => (
        <group key={`arm-${i}`} position={[-0.02, 0.02, z]}>
          {/* Upper arm */}
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.14, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.018, 0.12, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
      ))}

      {/* === TORSO (connects shoulders to pelvis) === */}
      <mesh position={[0.08, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.055, TORSO_LEN - 0.10, 4, 8]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === PELVIS GROUP (animates up for bridge) === */}
      {/* Origin is at the hip joint level */}
      <group ref={pelvisRef} position={[TORSO_LEN - 0.05, 0, 0]}>
        {/* Pelvis mesh - centered at the pelvis position */}
        <mesh>
          <boxGeometry args={[0.12, 0.07, 0.24]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* === LEFT LEG === */}
        {/* Hip joint group - origin at hip, mesh extends down the thigh */}
        <group ref={leftHipRef} position={[0.04, -0.02, -0.09]} rotation={[0, 0, 0.3]}>
          {/* Thigh - mesh center is half-thigh distance from hip */}
          <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.04, THIGH_LEN - 0.06, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Knee joint group - at end of thigh */}
          <group ref={leftKneeRef} position={[THIGH_LEN, 0, 0]} rotation={[0, 0, -1.8]}>
            {/* Knee cap */}
            <mesh>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            {/* Shin - mesh center is half-shin distance from knee */}
            <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.032, SHIN_LEN - 0.05, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            {/* Foot at end of shin */}
            <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, 0.8]}>
              <boxGeometry args={[0.08, 0.025, 0.045]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        </group>

        {/* === RIGHT LEG === */}
        <group ref={rightHipRef} position={[0.04, -0.02, 0.09]} rotation={[0, 0, 0.3]}>
          <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.04, THIGH_LEN - 0.06, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          <group ref={rightKneeRef} position={[THIGH_LEN, 0, 0]} rotation={[0, 0, -1.8]}>
            <mesh>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.032, SHIN_LEN - 0.05, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, 0.8]}>
              <boxGeometry args={[0.08, 0.025, 0.045]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

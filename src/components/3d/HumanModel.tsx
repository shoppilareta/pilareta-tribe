'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human Model for Pilates Bridging Exercise
 *
 * BRIDGING:
 * - Person lies on carriage, knees bent, feet on footbar
 * - Bridge: pelvis lifts UP (never goes below carriage!)
 * - Shoulders stay on carriage, feet stay on footbar
 *
 * CONSTRAINTS:
 * - Minimum Y position = carriage surface (body can't go through carriage)
 * - Legs form connected chain: hip → thigh → knee → shin → foot
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
const TORSO_LEN = 0.30;

const CYCLE = 5.0;

// CARRIAGE SURFACE - hard constraint, body cannot go below this
const CARRIAGE_SURFACE_Y = 0.40;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);
  const pelvisRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation: 0-1.5s lift, 1.5-3s hold, 3-4.5s lower, 4.5-5s rest
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    // Pelvis ONLY lifts UP - never below 0 (which is carriage surface in local coords)
    // Maximum lift is 0.15 units above carriage
    if (pelvisRef.current) {
      pelvisRef.current.position.y = Math.max(0, p * 0.15);
    }

    if (onCarriageMove) onCarriageMove(0.02);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Fixed positions based on reformer layout
  // Head at x=-0.55, shoulders at x=-0.45, pelvis at x=-0.15
  // Footbar at x=0.68, y=0.54

  return (
    <group position={[0, CARRIAGE_SURFACE_Y, 0]}>
      {/* === HEAD (on headrest) === */}
      <mesh position={[-0.58, 0.07, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[-0.50, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS (fixed on carriage) === */}
      <group position={[-0.42, 0.04, 0]}>
        <mesh>
          <boxGeometry args={[0.10, 0.05, 0.26]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms at sides */}
        {[-0.11, 0.11].map((z, i) => (
          <group key={`arm-${i}`} position={[0.02, 0, z]}>
            <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.018, 0.12, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
            <mesh position={[0.20, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.016, 0.10, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === TORSO (connects shoulders to pelvis) === */}
      <mesh position={[-0.28, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.045, TORSO_LEN - 0.06, 4, 8]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === PELVIS GROUP (animates UP for bridge) === */}
      {/* Position Y=0 means at carriage surface, animation only adds positive Y */}
      <group ref={pelvisRef} position={[-0.10, 0, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.12, 0.06, 0.22]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* === LEFT LEG (connected chain) === */}
        <group position={[0.04, 0.01, -0.08]}>
          {/* Hip joint sphere */}
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          {/* Thigh - angled up toward knee */}
          <group rotation={[0, 0, 0.75]}>
            <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            {/* Knee joint (at end of thigh) */}
            <group position={[THIGH_LEN, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.032, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Shin - angled down toward footbar */}
              <group rotation={[0, 0, -2.0]}>
                <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Foot (at end of shin, on footbar) */}
                <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, 0.7]}>
                  <boxGeometry args={[0.08, 0.025, 0.04]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* === RIGHT LEG (connected chain) === */}
        <group position={[0.04, 0.01, 0.08]}>
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>

          <group rotation={[0, 0, 0.75]}>
            <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            <group position={[THIGH_LEN, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.032, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group rotation={[0, 0, -2.0]}>
                <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <mesh position={[SHIN_LEN, 0, 0]} rotation={[0, 0, 0.7]}>
                  <boxGeometry args={[0.08, 0.025, 0.04]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

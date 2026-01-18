'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human figure for Pilates bridging exercise
 *
 * CORRECT BRIDGING POSITION:
 * - Person lies on carriage with knees bent
 * - FEET are ON the FOOTBAR (pressing against it)
 * - Thighs angle toward footbar, knees point to ceiling
 * - Shins go from knees DOWN to footbar
 * - During bridge: hips lift UP, feet stay pressed on footbar
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

const THIGH = 0.36;
const SHIN = 0.34;
const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  const pelvisRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    let p = 0;
    if (t < 2) p = ease(t / 2);
    else if (t < 3) p = 1;
    else p = 1 - ease((t - 3) / 2);

    // Pelvis lifts UP
    if (pelvisRef.current) {
      pelvisRef.current.position.y = p * 0.15;
    }

    // Spine curves
    if (spineRef.current) {
      spineRef.current.rotation.z = p * 0.2;
    }

    // Thigh angle: starts at ~30° from horizontal, goes more upright at peak
    // Positive Z rotation = counterclockwise = thigh pointing more up-and-forward
    const thighAngle = 0.5 + p * 0.25;
    if (leftThighRef.current) leftThighRef.current.rotation.z = thighAngle;
    if (rightThighRef.current) rightThighRef.current.rotation.z = thighAngle;

    // Shin angle relative to thigh (knee bend)
    // Negative = shin bends back toward footbar
    const shinAngle = -2.0 + p * 0.15;
    if (leftShinRef.current) leftShinRef.current.rotation.z = shinAngle;
    if (rightShinRef.current) rightShinRef.current.rotation.z = shinAngle;

    if (onCarriageMove) onCarriageMove(0.05);
  });

  function ease(t: number) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  const Y = 0.40; // Carriage surface (HEIGHT 0.28 + carriage offset 0.065 + padding ~0.05)

  return (
    <group>
      {/* HEAD */}
      <mesh position={[-0.75, Y + 0.10, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* NECK */}
      <mesh position={[-0.65, Y + 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.022, 0.05, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* UPPER BODY - fixed on carriage */}
      <group position={[-0.52, Y + 0.04, 0]}>
        {/* Shoulders */}
        <mesh>
          <boxGeometry args={[0.12, 0.055, 0.30]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Left arm */}
        <group position={[0.04, 0, -0.18]}>
          <mesh position={[0.10, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.020, 0.14, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>

        {/* Right arm */}
        <group position={[0.04, 0, 0.18]}>
          <mesh position={[0.10, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.020, 0.14, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>

        {/* SPINE */}
        <group ref={spineRef} position={[0.10, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.050, 0.14, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* PELVIS - extends to connect with legs */}
          <group ref={pelvisRef} position={[0.12, 0, 0]}>
            {/* Main pelvis body - elongated to reach hip joints */}
            <mesh position={[0.02, -0.01, 0]}>
              <boxGeometry args={[0.14, 0.08, 0.22]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>
            {/* Lower back connection to spine */}
            <mesh position={[-0.03, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.045, 0.06, 4, 8]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>
            {/* Hip bones - visible connectors to legs */}
            <mesh position={[0.05, -0.02, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.032, 0.04, 4, 8]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>
            <mesh position={[0.05, -0.02, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.032, 0.04, 4, 8]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* === LEFT LEG === */}
            <group position={[0.05, -0.04, -0.08]}>
              {/* Hip joint - directly attached to pelvis */}
              <mesh>
                <sphereGeometry args={[0.032, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Thigh - angles TOWARD footbar (positive X) and UP */}
              <group ref={leftThighRef} rotation={[0, 0, 0.5]}>
                <mesh position={[THIGH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.042, THIGH - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Knee */}
                <group position={[THIGH, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Shin - bends DOWN toward footbar */}
                  <group ref={leftShinRef} rotation={[0, 0, -2.0]}>
                    <mesh position={[SHIN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.035, SHIN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Foot - flat against footbar */}
                    <mesh position={[SHIN - 0.01, 0, 0]} rotation={[0, 0, 0.5]}>
                      <boxGeometry args={[0.09, 0.03, 0.05]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* === RIGHT LEG === */}
            <group position={[0.05, -0.04, 0.08]}>
              {/* Hip joint - directly attached to pelvis */}
              <mesh>
                <sphereGeometry args={[0.032, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={rightThighRef} rotation={[0, 0, 0.5]}>
                <mesh position={[THIGH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.042, THIGH - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={rightShinRef} rotation={[0, 0, -2.0]}>
                    <mesh position={[SHIN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.035, SHIN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    <mesh position={[SHIN - 0.01, 0, 0]} rotation={[0, 0, 0.5]}>
                      <boxGeometry args={[0.09, 0.03, 0.05]} />
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
  );
}

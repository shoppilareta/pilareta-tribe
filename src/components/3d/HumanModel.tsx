'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Human figure for Pilates bridging exercise
 *
 * Position: Lying on back on carriage
 * - Head at headrest (left/negative X)
 * - Feet on footbar (right/positive X)
 * - Knees bent, pointing UP
 * - During bridge: hips lift UP while feet stay on footbar
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Body measurements
const THIGH = 0.38;
const SHIN = 0.36;

// Animation
const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Animation refs
  const pelvisRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Progress: 0=rest, 1=peak
    let p = 0;
    if (t < 2) p = ease(t / 2);
    else if (t < 3) p = 1;
    else p = 1 - ease((t - 3) / 2);

    // Pelvis lifts UP
    if (pelvisRef.current) {
      pelvisRef.current.position.y = p * 0.18;
    }

    // Spine curves upward
    if (spineRef.current) {
      spineRef.current.rotation.z = p * 0.25;
    }

    // Thighs become more vertical as hips rise
    const thighAngle = 0.7 + p * 0.3; // More upright at peak
    if (leftLegRef.current) leftLegRef.current.rotation.z = thighAngle;
    if (rightLegRef.current) rightLegRef.current.rotation.z = thighAngle;

    // Knees extend slightly
    const kneeAngle = -1.8 + p * 0.2;
    if (leftKneeRef.current) leftKneeRef.current.rotation.z = kneeAngle;
    if (rightKneeRef.current) rightKneeRef.current.rotation.z = kneeAngle;

    if (onCarriageMove) onCarriageMove(0.05);
  });

  function ease(t: number) {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  // Carriage surface Y position
  const Y = 0.38;

  return (
    <group>
      {/* HEAD on headrest */}
      <mesh position={[-0.82, Y + 0.10, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* NECK */}
      <mesh position={[-0.72, Y + 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* UPPER BODY - fixed on carriage */}
      <group position={[-0.58, Y + 0.04, 0]}>
        {/* Shoulders */}
        <mesh>
          <boxGeometry args={[0.14, 0.06, 0.32]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms at sides */}
        <group position={[0.05, 0, -0.19]}>
          <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.025, 0.18, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>
        <group position={[0.05, 0, 0.19]}>
          <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.025, 0.18, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
            <meshStandardMaterial color={SKIN} />
          </mesh>
        </group>

        {/* SPINE - articulates during bridge */}
        <group ref={spineRef} position={[0.12, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* PELVIS - lifts during bridge */}
          <group ref={pelvisRef} position={[0.14, 0, 0]}>
            <mesh scale={[0.9, 0.6, 1]}>
              <sphereGeometry args={[0.09, 12, 10]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* LEFT LEG - attached to pelvis */}
            <group position={[0.03, -0.02, -0.09]}>
              {/* Hip joint */}
              <mesh>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Thigh - rotates at hip, pointing UP toward knees */}
              <group ref={leftLegRef} rotation={[0, 0, 0.7]}>
                <mesh position={[THIGH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.045, THIGH - 0.05, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Knee joint */}
                <group position={[THIGH, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.038, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Shin - bends back toward footbar */}
                  <group ref={leftKneeRef} rotation={[0, 0, -1.8]}>
                    <mesh position={[SHIN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.038, SHIN - 0.05, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Foot on footbar */}
                    <mesh position={[SHIN, 0, 0]}>
                      <boxGeometry args={[0.09, 0.035, 0.055]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* RIGHT LEG - mirror of left */}
            <group position={[0.03, -0.02, 0.09]}>
              <mesh>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={rightLegRef} rotation={[0, 0, 0.7]}>
                <mesh position={[THIGH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.045, THIGH - 0.05, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.038, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={rightKneeRef} rotation={[0, 0, -1.8]}>
                    <mesh position={[SHIN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.038, SHIN - 0.05, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    <mesh position={[SHIN, 0, 0]}>
                      <boxGeometry args={[0.09, 0.035, 0.055]} />
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

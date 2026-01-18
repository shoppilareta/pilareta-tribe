'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

// Colors
const SKIN = '#e8c4a0';
const CLOTHING = '#2a3d4f';

// Body dimensions
const TORSO_LENGTH = 0.55;
const THIGH_LENGTH = 0.40;
const SHIN_LENGTH = 0.38;

// Animation: 5-second cycle
const CYCLE = 5.0;

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Refs for animated body parts
  const pelvisRef = useRef<THREE.Group>(null);
  const spineRefs = {
    lower: useRef<THREE.Group>(null),
    mid: useRef<THREE.Group>(null),
    upper: useRef<THREE.Group>(null),
  };
  const legRefs = {
    leftThigh: useRef<THREE.Group>(null),
    leftShin: useRef<THREE.Group>(null),
    rightThigh: useRef<THREE.Group>(null),
    rightShin: useRef<THREE.Group>(null),
  };

  useFrame((_, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress: 0 at rest, 1 at peak bridge
    // 0-2s: rise, 2-3s: hold, 3-5s: lower
    let progress = 0;
    if (t < 2) {
      progress = easeInOut(t / 2);
    } else if (t < 3) {
      progress = 1;
    } else {
      progress = 1 - easeInOut((t - 3) / 2);
    }

    // Pelvis lift (Y position)
    const pelvisLift = progress * 0.25;
    if (pelvisRef.current) {
      pelvisRef.current.position.y = pelvisLift;
    }

    // Spine articulation - sequential wave from lower to upper
    const lowerSpine = easeInOut(Math.min(1, progress * 1.3)) * 0.35;
    const midSpine = easeInOut(Math.max(0, Math.min(1, (progress - 0.1) * 1.3))) * 0.25;
    const upperSpine = easeInOut(Math.max(0, Math.min(1, (progress - 0.2) * 1.3))) * 0.15;

    if (spineRefs.lower.current) spineRefs.lower.current.rotation.z = -lowerSpine;
    if (spineRefs.mid.current) spineRefs.mid.current.rotation.z = -midSpine;
    if (spineRefs.upper.current) spineRefs.upper.current.rotation.z = -upperSpine;

    // Leg angles - as pelvis rises, thighs rotate more upright, shins extend
    // Starting angles (lying flat, knees bent): thigh ~45°, shin ~-90° relative
    // Peak bridge: thigh more vertical, shin straighter
    const thighAngle = -0.8 + progress * 0.35; // -0.8 to -0.45 radians
    const shinAngle = 1.6 - progress * 0.4;    // 1.6 to 1.2 radians (knee angle)

    if (legRefs.leftThigh.current) legRefs.leftThigh.current.rotation.z = thighAngle;
    if (legRefs.rightThigh.current) legRefs.rightThigh.current.rotation.z = thighAngle;
    if (legRefs.leftShin.current) legRefs.leftShin.current.rotation.z = shinAngle;
    if (legRefs.rightShin.current) legRefs.rightShin.current.rotation.z = shinAngle;

    // Carriage moves slightly
    if (onCarriageMove) {
      onCarriageMove(0.1 + progress * 0.05);
    }
  });

  // Easing function
  function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  return (
    <group ref={groupRef} position={[-0.4, 0.56, 0]}>
      {/*
        Person lying supine on reformer:
        - Head at -X (toward headrest)
        - Feet at +X (toward footbar)
        - Lying on back (face up toward +Y)
      */}

      {/* === HEAD (fixed position on headrest) === */}
      <mesh position={[-TORSO_LENGTH - 0.12, 0.08, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* Neck */}
      <mesh position={[-TORSO_LENGTH - 0.02, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.03, 0.08, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === UPPER BODY (shoulders fixed on carriage) === */}
      <group position={[-TORSO_LENGTH + 0.12, 0.04, 0]}>
        {/* Shoulders */}
        <mesh>
          <boxGeometry args={[0.14, 0.08, 0.36]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* Arms at sides */}
        <Arm position={[0.1, -0.02, -0.22]} />
        <Arm position={[0.1, -0.02, 0.22]} />

        {/* Upper spine segment */}
        <group ref={spineRefs.upper} position={[0.10, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.08, 0.08, 4, 12]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* Mid spine segment */}
          <group ref={spineRefs.mid} position={[0.10, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.075, 0.08, 4, 12]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* Lower spine segment */}
            <group ref={spineRefs.lower} position={[0.10, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.07, 0.08, 4, 12]} />
                <meshStandardMaterial color={CLOTHING} />
              </mesh>

              {/* === PELVIS (animated - lifts during bridge) === */}
              <group ref={pelvisRef} position={[0.12, 0, 0]}>
                {/* Pelvis/hips */}
                <mesh scale={[0.9, 0.7, 1.1]}>
                  <sphereGeometry args={[0.11, 16, 12]} />
                  <meshStandardMaterial color={CLOTHING} />
                </mesh>

                {/* === LEGS === */}
                {/* Left leg */}
                <group position={[0.02, -0.04, -0.10]}>
                  {/* Hip joint */}
                  <mesh>
                    <sphereGeometry args={[0.04, 10, 10]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Thigh - rotates from hip */}
                  <group ref={legRefs.leftThigh} rotation={[0, 0, -0.8]}>
                    <mesh position={[THIGH_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.055, THIGH_LENGTH - 0.06, 4, 12]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Knee */}
                    <group position={[THIGH_LENGTH, 0, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.045, 10, 10]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>

                      {/* Shin - rotates from knee */}
                      <group ref={legRefs.leftShin} rotation={[0, 0, 1.6]}>
                        <mesh position={[SHIN_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                          <capsuleGeometry args={[0.045, SHIN_LENGTH - 0.06, 4, 12]} />
                          <meshStandardMaterial color={SKIN} />
                        </mesh>

                        {/* Foot */}
                        <mesh position={[SHIN_LENGTH, 0, 0]}>
                          <boxGeometry args={[0.10, 0.04, 0.06]} />
                          <meshStandardMaterial color={SKIN} />
                        </mesh>
                      </group>
                    </group>
                  </group>
                </group>

                {/* Right leg */}
                <group position={[0.02, -0.04, 0.10]}>
                  {/* Hip joint */}
                  <mesh>
                    <sphereGeometry args={[0.04, 10, 10]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  {/* Thigh */}
                  <group ref={legRefs.rightThigh} rotation={[0, 0, -0.8]}>
                    <mesh position={[THIGH_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.055, THIGH_LENGTH - 0.06, 4, 12]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    {/* Knee */}
                    <group position={[THIGH_LENGTH, 0, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.045, 10, 10]} />
                        <meshStandardMaterial color={SKIN} />
                      </mesh>

                      {/* Shin */}
                      <group ref={legRefs.rightShin} rotation={[0, 0, 1.6]}>
                        <mesh position={[SHIN_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                          <capsuleGeometry args={[0.045, SHIN_LENGTH - 0.06, 4, 12]} />
                          <meshStandardMaterial color={SKIN} />
                        </mesh>

                        {/* Foot */}
                        <mesh position={[SHIN_LENGTH, 0, 0]}>
                          <boxGeometry args={[0.10, 0.04, 0.06]} />
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
    </group>
  );
}

// Simple arm component
function Arm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Upper arm - lying alongside body */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.03, 0.22, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* Forearm */}
      <mesh position={[0.32, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.025, 0.20, 4, 12]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
      {/* Hand */}
      <mesh position={[0.44, 0.02, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>
    </group>
  );
}

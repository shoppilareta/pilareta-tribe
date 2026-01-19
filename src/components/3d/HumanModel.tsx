'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Human Model for Pilates Exercises
 *
 * SCALABLE ARCHITECTURE:
 * - Supports multiple exercise animations
 * - Uses inverse kinematics for realistic joint movement
 * - Feet stay fixed during bridging (IK calculated)
 * - Arms animate for arm circles
 */

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

const SKIN = '#d4a574';
const CLOTHING = '#2a3d4f';

// Shared constants (must match ReformerModel)
const CARRIAGE_TOP = 0.37;
const FOOTBAR_X = 0.55;
const FOOTBAR_Y = 0.52;

// Body segment lengths
const UPPER_TORSO_LEN = 0.18;
const LOWER_TORSO_LEN = 0.16;
const UPPER_ARM_LEN = 0.18;
const FOREARM_LEN = 0.16;
const THIGH_LEN = 0.26;
const SHIN_LEN = 0.24;

const CYCLE = 5.0;

// Inverse kinematics for 2-segment limb
function solveIK(
  originX: number, originY: number,
  targetX: number, targetY: number,
  len1: number, len2: number
): { angle1: number; angle2: number } {
  const dx = targetX - originX;
  const dy = targetY - originY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Clamp distance to valid range
  const maxDist = len1 + len2 - 0.01;
  const minDist = Math.abs(len1 - len2) + 0.01;
  const clampedDist = Math.max(minDist, Math.min(maxDist, dist));

  // Law of cosines for knee angle
  const cosKnee = (len1 * len1 + len2 * len2 - clampedDist * clampedDist) / (2 * len1 * len2);
  const kneeAngle = Math.acos(Math.max(-1, Math.min(1, cosKnee)));

  // Angle from origin to target
  const angleToTarget = Math.atan2(dy, dx);

  // Offset angle for first segment
  const cosOffset = (len1 * len1 + clampedDist * clampedDist - len2 * len2) / (2 * len1 * clampedDist);
  const offsetAngle = Math.acos(Math.max(-1, Math.min(1, cosOffset)));

  // Hip angle (thigh)
  const angle1 = angleToTarget + offsetAngle;

  // Knee bend (relative to thigh) - bend inward
  const angle2 = -(Math.PI - kneeAngle);

  return { angle1, angle2 };
}

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Refs for animated parts
  const lowerTorsoRef = useRef<THREE.Group>(null);
  const leftThighRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Body positioning
  const SHOULDER_X = -0.22;
  const SHOULDER_Y = CARRIAGE_TOP + 0.04;
  const HIP_WIDTH = 0.08;

  // Fixed foot target (on footbar) - NEVER changes
  const FOOT_TARGET_X = FOOTBAR_X - 0.02;
  const FOOT_TARGET_Y = FOOTBAR_Y + 0.02;

  // Calculate hip position when pelvis is at rest
  const restHipX = SHOULDER_X + 0.04 + UPPER_TORSO_LEN + LOWER_TORSO_LEN + 0.04;
  const restHipY = SHOULDER_Y;

  // Initial IK solution for rest position
  const restIK = useMemo(() => {
    return solveIK(restHipX, restHipY, FOOT_TARGET_X, FOOT_TARGET_Y, THIGH_LEN, SHIN_LEN);
  }, [restHipX, restHipY]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current % CYCLE;

    // Animation progress (0 to 1 and back)
    let p = 0;
    if (t < 1.5) p = ease(t / 1.5);
    else if (t < 3) p = 1;
    else if (t < 4.5) p = 1 - ease((t - 3) / 1.5);

    if (animation === 'bridging') {
      animateBridging(p);
    } else if (animation === 'arm-circles') {
      animateArmCircles(t);
    }

    if (onCarriageMove) onCarriageMove(0.02);
  });

  function ease(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function animateBridging(p: number) {
    const maxLift = 0.45;
    const liftRotation = p * maxLift;

    // Lower torso lifts (creates the bridge)
    if (lowerTorsoRef.current) {
      lowerTorsoRef.current.rotation.z = liftRotation;
    }

    // Calculate current hip position based on torso rotation
    // Hip moves in an arc as lower torso rotates
    const pelvisOffset = LOWER_TORSO_LEN;
    const currentHipX = restHipX + pelvisOffset * (Math.cos(liftRotation) - 1);
    const currentHipY = restHipY + pelvisOffset * Math.sin(liftRotation);

    // Solve IK for legs to keep feet on footbar
    const ik = solveIK(currentHipX, currentHipY, FOOT_TARGET_X, FOOT_TARGET_Y, THIGH_LEN, SHIN_LEN);

    // The thigh rotation needs to account for the pelvis rotation
    const thighWorldAngle = ik.angle1;
    const thighLocalAngle = thighWorldAngle - liftRotation;

    if (leftThighRef.current) {
      leftThighRef.current.rotation.z = thighLocalAngle;
    }
    if (rightThighRef.current) {
      rightThighRef.current.rotation.z = thighLocalAngle;
    }

    if (leftShinRef.current) {
      leftShinRef.current.rotation.z = ik.angle2;
    }
    if (rightShinRef.current) {
      rightShinRef.current.rotation.z = ik.angle2;
    }
  }

  function animateArmCircles(t: number) {
    // Arms make circles ABOVE the body - never going below/through reformer
    const angle = (t / CYCLE) * Math.PI * 2;

    // Arm circle animation:
    // Arms start pointing UP toward ceiling (negative Z in local space = toward head)
    // Circle: UP → OUT TO SIDES → TOWARD HIPS (but staying ABOVE body) → back UP
    //
    // Z rotation (in arm's local space after initial PI/2):
    //   Negative = toward head, Positive = toward feet
    // X rotation: spreads arms out to sides
    //
    // We want arms to stay ABOVE the carriage, so limit Z rotation
    // to only go toward head (negative) or neutral, never positive (toward feet)

    // Arms sweep from pointing up, out to sides, toward hips (but above body)
    // Range: -0.8 (toward head) to 0.3 (slightly toward hips, but above body)
    const armSwingZ = -0.3 + Math.sin(angle) * 0.5;  // Keeps arms above body

    // Arms spread out to sides during the circle
    const armSpreadX = Math.abs(Math.sin(angle)) * 0.8;  // Maximum spread at sides

    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.rotation.z = armSwingZ;
      leftUpperArmRef.current.rotation.x = armSpreadX;
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.rotation.z = armSwingZ;
      rightUpperArmRef.current.rotation.x = -armSpreadX;  // Mirror for right arm
    }

    // Forearms follow with slight bend
    const forearmBend = 0.15;
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.z = forearmBend;
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.z = forearmBend;
    }

    // Legs bent with feet flat on carriage (hook-lying position)
    // Thighs nearly vertical, shins pointing down to place feet on carriage
    // This creates the classic "tabletop" position for arm exercises
    const thighAngle = 1.35;  // Thighs nearly vertical (~77 degrees)
    const shinAngle = -2.7;   // Shins pointing down and slightly back

    if (leftThighRef.current) leftThighRef.current.rotation.z = thighAngle;
    if (rightThighRef.current) rightThighRef.current.rotation.z = thighAngle;
    if (leftShinRef.current) leftShinRef.current.rotation.z = shinAngle;
    if (rightShinRef.current) rightShinRef.current.rotation.z = shinAngle;
  }

  // Initial angles for static pose
  const initialThighAngle = restIK.angle1;
  const initialKneeAngle = restIK.angle2;

  return (
    <group position={[SHOULDER_X, SHOULDER_Y, 0]}>
      {/* === HEAD === */}
      <mesh position={[-0.14, 0.02, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === NECK === */}
      <mesh position={[-0.07, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.018, 0.05, 4, 8]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* === SHOULDERS === */}
      <mesh>
        <boxGeometry args={[0.08, 0.05, 0.24]} />
        <meshStandardMaterial color={CLOTHING} />
      </mesh>

      {/* === ARMS === */}
      {[
        { z: -0.10, ref: leftUpperArmRef, forearmRef: leftForearmRef },
        { z: 0.10, ref: rightUpperArmRef, forearmRef: rightForearmRef }
      ].map(({ z, ref, forearmRef }, i) => (
        <group key={`arm-${i}`} position={[0.02, 0, z]}>
          {/* Upper arm */}
          <group ref={ref} rotation={[0, 0, Math.PI / 2]}>
            <mesh position={[UPPER_ARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.020, UPPER_ARM_LEN - 0.02, 4, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>

            {/* Elbow */}
            <group position={[UPPER_ARM_LEN, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              {/* Forearm */}
              <group ref={forearmRef} rotation={[0, 0, 0]}>
                <mesh position={[FOREARM_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.016, FOREARM_LEN - 0.02, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                {/* Hand */}
                <mesh position={[FOREARM_LEN, 0, 0]}>
                  <sphereGeometry args={[0.022, 8, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      ))}

      {/* === UPPER TORSO === */}
      <group position={[0.04, 0, 0]}>
        <mesh position={[UPPER_TORSO_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.045, UPPER_TORSO_LEN - 0.02, 4, 8]} />
          <meshStandardMaterial color={CLOTHING} />
        </mesh>

        {/* === LOWER TORSO (animates for bridging) === */}
        <group ref={lowerTorsoRef} position={[UPPER_TORSO_LEN, 0, 0]}>
          <mesh position={[LOWER_TORSO_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.048, LOWER_TORSO_LEN - 0.02, 4, 8]} />
            <meshStandardMaterial color={CLOTHING} />
          </mesh>

          {/* === PELVIS === */}
          <group position={[LOWER_TORSO_LEN, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.08, 0.05, 0.18]} />
              <meshStandardMaterial color={CLOTHING} />
            </mesh>

            {/* === LEFT LEG === */}
            <group position={[0.04, 0, -HIP_WIDTH]}>
              <mesh>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={leftThighRef} rotation={[0, 0, initialThighAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.028, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={leftShinRef} rotation={[0, 0, initialKneeAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    <mesh position={[SHIN_LEN, 0, 0]}>
                      <boxGeometry args={[0.08, 0.025, 0.04]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>

            {/* === RIGHT LEG === */}
            <group position={[0.04, 0, HIP_WIDTH]}>
              <mesh>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={SKIN} />
              </mesh>

              <group ref={rightThighRef} rotation={[0, 0, initialThighAngle]}>
                <mesh position={[THIGH_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.035, THIGH_LEN - 0.04, 4, 8]} />
                  <meshStandardMaterial color={SKIN} />
                </mesh>

                <group position={[THIGH_LEN, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.028, 8, 8]} />
                    <meshStandardMaterial color={SKIN} />
                  </mesh>

                  <group ref={rightShinRef} rotation={[0, 0, initialKneeAngle]}>
                    <mesh position={[SHIN_LEN / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                      <capsuleGeometry args={[0.028, SHIN_LEN - 0.04, 4, 8]} />
                      <meshStandardMaterial color={SKIN} />
                    </mesh>

                    <mesh position={[SHIN_LEN, 0, 0]}>
                      <boxGeometry args={[0.08, 0.025, 0.04]} />
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

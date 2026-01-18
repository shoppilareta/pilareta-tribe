'use client';

import { useFrame } from '@react-three/fiber';
import { Capsule, RoundedBox } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

interface HumanModelProps {
  animation: string;
  onCarriageMove?: (position: number) => void;
}

// Reformer reference points (from ReformerModel)
const FOOTBAR_X = 1.05;
const FOOTBAR_Y = 0.72;
const CARRIAGE_SURFACE_Y = 0.52;

// Body dimensions
const THIGH_LENGTH = 0.38;
const SHIN_LENGTH = 0.36;
const HIP_WIDTH = 0.12;
const MAX_PELVIS_LIFT = 0.28;

// Animation keyframes (5-second cycle)
const BRIDGING_KEYFRAMES = [
  { time: 0.0, pelvisLift: 0, bridgeProgress: 0 },
  { time: 0.4, pelvisLift: 0.03, bridgeProgress: 0.1 },
  { time: 1.2, pelvisLift: 0.14, bridgeProgress: 0.45 },
  { time: 2.0, pelvisLift: 0.24, bridgeProgress: 0.85 },
  { time: 2.4, pelvisLift: MAX_PELVIS_LIFT, bridgeProgress: 1.0 },
  { time: 3.2, pelvisLift: MAX_PELVIS_LIFT, bridgeProgress: 1.0 },
  { time: 3.8, pelvisLift: 0.20, bridgeProgress: 0.75 },
  { time: 4.4, pelvisLift: 0.08, bridgeProgress: 0.35 },
  { time: 5.0, pelvisLift: 0, bridgeProgress: 0 },
];

const CYCLE_DURATION = 5.0;

// Interpolate between keyframes
function interpolateKeyframes(time: number) {
  const t = time % CYCLE_DURATION;

  let prev = BRIDGING_KEYFRAMES[0];
  let next = BRIDGING_KEYFRAMES[1];

  for (let i = 0; i < BRIDGING_KEYFRAMES.length - 1; i++) {
    if (t >= BRIDGING_KEYFRAMES[i].time && t <= BRIDGING_KEYFRAMES[i + 1].time) {
      prev = BRIDGING_KEYFRAMES[i];
      next = BRIDGING_KEYFRAMES[i + 1];
      break;
    }
  }

  const segmentDuration = next.time - prev.time;
  const segmentProgress = segmentDuration > 0 ? (t - prev.time) / segmentDuration : 0;

  // Smooth easing
  const eased = segmentProgress < 0.5
    ? 2 * segmentProgress * segmentProgress
    : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;

  return {
    pelvisLift: prev.pelvisLift + (next.pelvisLift - prev.pelvisLift) * eased,
    bridgeProgress: prev.bridgeProgress + (next.bridgeProgress - prev.bridgeProgress) * eased,
  };
}

// Calculate spine segment rotations with sequential timing
function calculateSpineArticulation(bridgeProgress: number) {
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // Staggered timing for vertebra-by-vertebra effect
  const lowerDelay = 0;
  const midDelay = 0.15;
  const upperDelay = 0.30;

  const lowerProgress = easeInOut(Math.max(0, Math.min(1, (bridgeProgress - lowerDelay) / (1 - lowerDelay))));
  const midProgress = easeInOut(Math.max(0, Math.min(1, (bridgeProgress - midDelay) / (1 - midDelay))));
  const upperProgress = easeInOut(Math.max(0, Math.min(1, (bridgeProgress - upperDelay) / (1 - upperDelay))));

  // Maximum rotation angles
  const maxLowerRotation = 0.40;
  const maxMidRotation = 0.28;
  const maxUpperRotation = 0.18;

  return {
    lowerSpine: lowerProgress * maxLowerRotation,
    midSpine: midProgress * maxMidRotation,
    upperSpine: upperProgress * maxUpperRotation,
  };
}

// Inverse kinematics for leg positioning
function calculateLegAngles(
  hipX: number,
  hipY: number,
  footX: number,
  footY: number
): { thighAngle: number; kneeAngle: number } {
  const dx = footX - hipX;
  const dy = footY - hipY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Clamp to reachable range
  const maxReach = THIGH_LENGTH + SHIN_LENGTH - 0.02;
  const minReach = Math.abs(THIGH_LENGTH - SHIN_LENGTH) + 0.02;
  const d = Math.max(minReach, Math.min(maxReach, distance));

  // Angle from hip to foot
  const angleToFoot = Math.atan2(dy, dx);

  // Law of cosines for knee angle
  const cosKnee = (THIGH_LENGTH * THIGH_LENGTH + SHIN_LENGTH * SHIN_LENGTH - d * d)
                  / (2 * THIGH_LENGTH * SHIN_LENGTH);
  const kneeAngle = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosKnee)));

  // Angle offset for thigh
  const cosThighOffset = (THIGH_LENGTH * THIGH_LENGTH + d * d - SHIN_LENGTH * SHIN_LENGTH)
                         / (2 * THIGH_LENGTH * d);
  const thighOffset = Math.acos(Math.max(-1, Math.min(1, cosThighOffset)));

  const thighAngle = angleToFoot + thighOffset;

  return { thighAngle, kneeAngle };
}

// Body part colors
const skinColor = '#e8c4a0';
const clothingColor = '#2a3d4f';

// Arm component for reuse
function Arm({ side }: { side: 'left' | 'right' }) {
  const zOffset = side === 'left' ? -0.18 : 0.18;

  return (
    <group position={[0.12, -0.02, zOffset]}>
      {/* Upper arm */}
      <Capsule args={[0.032, 0.20, 4, 12]} position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2 + 0.2]}>
        <meshStandardMaterial color={skinColor} />
      </Capsule>
      {/* Forearm */}
      <Capsule args={[0.028, 0.18, 4, 12]} position={[0.32, 0.02, 0]} rotation={[0, 0, Math.PI / 2 + 0.1]}>
        <meshStandardMaterial color={skinColor} />
      </Capsule>
      {/* Hand */}
      <mesh position={[0.44, 0.03, 0]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
    </group>
  );
}

// Leg component
function Leg({
  side,
  thighAngle,
  kneeAngle
}: {
  side: 'left' | 'right';
  thighAngle: number;
  kneeAngle: number;
}) {
  const zOffset = side === 'left' ? -HIP_WIDTH : HIP_WIDTH;

  return (
    <group position={[0, 0, zOffset]}>
      {/* Thigh - rotates from hip */}
      <group rotation={[0, 0, thighAngle - Math.PI / 2]}>
        <Capsule
          args={[0.058, THIGH_LENGTH - 0.08, 4, 12]}
          position={[0, -THIGH_LENGTH / 2, 0]}
        >
          <meshStandardMaterial color={skinColor} />
        </Capsule>

        {/* Knee joint */}
        <group position={[0, -THIGH_LENGTH, 0]}>
          <mesh>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>

          {/* Shin - rotates from knee */}
          <group rotation={[0, 0, -(Math.PI - kneeAngle)]}>
            <Capsule
              args={[0.045, SHIN_LENGTH - 0.08, 4, 12]}
              position={[0, -SHIN_LENGTH / 2, 0]}
            >
              <meshStandardMaterial color={skinColor} />
            </Capsule>

            {/* Foot */}
            <RoundedBox
              args={[0.10, 0.04, 0.06]}
              radius={0.01}
              position={[0.02, -SHIN_LENGTH, 0]}
              rotation={[-thighAngle + Math.PI / 2 + (Math.PI - kneeAngle), 0, 0]}
            >
              <meshStandardMaterial color={skinColor} />
            </RoundedBox>
          </group>
        </group>
      </group>
    </group>
  );
}

export function HumanModel({ animation, onCarriageMove }: HumanModelProps) {
  const timeRef = useRef(0);

  // Refs for animated parts
  const pelvisRef = useRef<THREE.Group>(null);
  const lowerSpineRef = useRef<THREE.Group>(null);
  const midSpineRef = useRef<THREE.Group>(null);
  const upperSpineRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Current animation state
  const animState = useRef({
    thighAngle: 0,
    kneeAngle: Math.PI * 0.6,
  });

  // Fixed positions
  const positions = useMemo(() => {
    // Figure positioned lying on carriage
    const shouldersX = -0.55;
    const shouldersY = CARRIAGE_SURFACE_Y + 0.08;

    // Pelvis position relative to shoulders (when lying flat)
    const pelvisOffsetX = 0.52;

    return {
      shouldersX,
      shouldersY,
      pelvisOffsetX,
      footTargetX: FOOTBAR_X,
      footTargetY: FOOTBAR_Y,
    };
  }, []);

  useFrame((state, delta) => {
    if (animation !== 'bridging') return;

    timeRef.current += delta;

    const { pelvisLift, bridgeProgress } = interpolateKeyframes(timeRef.current);
    const spineRotations = calculateSpineArticulation(bridgeProgress);

    // Apply spine rotations (create the wave effect)
    if (upperSpineRef.current) {
      upperSpineRef.current.rotation.z = spineRotations.upperSpine;
    }
    if (midSpineRef.current) {
      midSpineRef.current.rotation.z = spineRotations.midSpine;
    }
    if (lowerSpineRef.current) {
      lowerSpineRef.current.rotation.z = spineRotations.lowerSpine;
    }

    // Calculate pelvis world position for IK
    // As spine segments rotate, pelvis rises
    const pelvisWorldX = positions.shouldersX + positions.pelvisOffsetX + pelvisLift * 0.3;
    const pelvisWorldY = positions.shouldersY + pelvisLift;

    // Apply pelvis lift
    if (pelvisRef.current) {
      pelvisRef.current.position.y = pelvisLift * 0.4;
      pelvisRef.current.position.x = pelvisLift * 0.15;
    }

    // Calculate IK for legs to keep feet on footbar
    const hipX = pelvisWorldX + 0.08;
    const hipY = pelvisWorldY;

    const legAngles = calculateLegAngles(
      hipX, hipY,
      positions.footTargetX, positions.footTargetY
    );

    animState.current = legAngles;

    // Apply leg rotations
    if (leftLegRef.current) {
      leftLegRef.current.rotation.z = legAngles.thighAngle - Math.PI / 2;
      const shinGroup = leftLegRef.current.children[1]?.children[1] as THREE.Group;
      if (shinGroup) {
        shinGroup.rotation.z = -(Math.PI - legAngles.kneeAngle);
      }
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.z = legAngles.thighAngle - Math.PI / 2;
      const shinGroup = rightLegRef.current.children[1]?.children[1] as THREE.Group;
      if (shinGroup) {
        shinGroup.rotation.z = -(Math.PI - legAngles.kneeAngle);
      }
    }

    // Notify carriage position
    if (onCarriageMove) {
      onCarriageMove(0.1 + bridgeProgress * 0.08);
    }
  });

  // Initial leg angles for static render
  const initialLegAngles = useMemo(() => {
    const hipX = positions.shouldersX + positions.pelvisOffsetX + 0.08;
    const hipY = positions.shouldersY;
    return calculateLegAngles(hipX, hipY, positions.footTargetX, positions.footTargetY);
  }, [positions]);

  return (
    <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      {/* Root positioned at shoulders (fixed on carriage) */}
      <group position={[positions.shouldersX, positions.shouldersY, 0]}>

        {/* Head */}
        <mesh position={[-0.20, 0.02, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Neck */}
        <Capsule args={[0.035, 0.06, 4, 12]} position={[-0.10, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={skinColor} />
        </Capsule>

        {/* Shoulders */}
        <RoundedBox args={[0.12, 0.08, 0.38]} radius={0.02} position={[0, 0, 0]}>
          <meshStandardMaterial color={clothingColor} />
        </RoundedBox>

        {/* Arms at sides */}
        <Arm side="left" />
        <Arm side="right" />

        {/* Upper Spine - slight rotation during bridge */}
        <group ref={upperSpineRef} position={[0.08, 0, 0]}>
          <Capsule args={[0.09, 0.10, 4, 12]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={clothingColor} />
          </Capsule>

          {/* Mid Spine */}
          <group ref={midSpineRef} position={[0.12, 0, 0]}>
            <Capsule args={[0.085, 0.08, 4, 12]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color={clothingColor} />
            </Capsule>

            {/* Lower Spine */}
            <group ref={lowerSpineRef} position={[0.10, 0, 0]}>
              <Capsule args={[0.08, 0.08, 4, 12]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color={clothingColor} />
              </Capsule>

              {/* Pelvis - main animated element */}
              <group ref={pelvisRef} position={[0.12, 0, 0]}>
                {/* Pelvis mass */}
                <mesh scale={[1, 0.7, 1.1]}>
                  <sphereGeometry args={[0.12, 16, 12]} />
                  <meshStandardMaterial color={clothingColor} />
                </mesh>

                {/* Hip joints visible */}
                <mesh position={[0, -0.02, -HIP_WIDTH]}>
                  <sphereGeometry args={[0.045, 10, 10]} />
                  <meshStandardMaterial color={skinColor} />
                </mesh>
                <mesh position={[0, -0.02, HIP_WIDTH]}>
                  <sphereGeometry args={[0.045, 10, 10]} />
                  <meshStandardMaterial color={skinColor} />
                </mesh>

                {/* Left Leg */}
                <group ref={leftLegRef} position={[0, -0.02, -HIP_WIDTH]}>
                  {/* Thigh */}
                  <group rotation={[0, 0, initialLegAngles.thighAngle - Math.PI / 2]}>
                    <Capsule
                      args={[0.058, THIGH_LENGTH - 0.08, 4, 12]}
                      position={[0, -THIGH_LENGTH / 2, 0]}
                    >
                      <meshStandardMaterial color={skinColor} />
                    </Capsule>

                    {/* Knee */}
                    <group position={[0, -THIGH_LENGTH, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.048, 12, 12]} />
                        <meshStandardMaterial color={skinColor} />
                      </mesh>

                      {/* Shin */}
                      <group rotation={[0, 0, -(Math.PI - initialLegAngles.kneeAngle)]}>
                        <Capsule
                          args={[0.042, SHIN_LENGTH - 0.08, 4, 12]}
                          position={[0, -SHIN_LENGTH / 2, 0]}
                        >
                          <meshStandardMaterial color={skinColor} />
                        </Capsule>

                        {/* Foot */}
                        <RoundedBox
                          args={[0.10, 0.04, 0.06]}
                          radius={0.01}
                          position={[0.02, -SHIN_LENGTH + 0.02, 0]}
                        >
                          <meshStandardMaterial color={skinColor} />
                        </RoundedBox>
                      </group>
                    </group>
                  </group>
                </group>

                {/* Right Leg */}
                <group ref={rightLegRef} position={[0, -0.02, HIP_WIDTH]}>
                  {/* Thigh */}
                  <group rotation={[0, 0, initialLegAngles.thighAngle - Math.PI / 2]}>
                    <Capsule
                      args={[0.058, THIGH_LENGTH - 0.08, 4, 12]}
                      position={[0, -THIGH_LENGTH / 2, 0]}
                    >
                      <meshStandardMaterial color={skinColor} />
                    </Capsule>

                    {/* Knee */}
                    <group position={[0, -THIGH_LENGTH, 0]}>
                      <mesh>
                        <sphereGeometry args={[0.048, 12, 12]} />
                        <meshStandardMaterial color={skinColor} />
                      </mesh>

                      {/* Shin */}
                      <group rotation={[0, 0, -(Math.PI - initialLegAngles.kneeAngle)]}>
                        <Capsule
                          args={[0.042, SHIN_LENGTH - 0.08, 4, 12]}
                          position={[0, -SHIN_LENGTH / 2, 0]}
                        >
                          <meshStandardMaterial color={skinColor} />
                        </Capsule>

                        {/* Foot */}
                        <RoundedBox
                          args={[0.10, 0.04, 0.06]}
                          radius={0.01}
                          position={[0.02, -SHIN_LENGTH + 0.02, 0]}
                        >
                          <meshStandardMaterial color={skinColor} />
                        </RoundedBox>
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

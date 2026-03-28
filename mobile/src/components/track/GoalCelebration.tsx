import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_PARTICLES = 24;

interface GoalCelebrationProps {
  visible: boolean;
  message?: string;
  onDismiss: () => void;
}

function Particle({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  // Stable random values (computed once per mount)
  const randomsRef = useRef({
    startX: Math.random() * SCREEN_WIDTH,
    driftX: (Math.random() - 0.5) * 200,
    endY: -(SCREEN_HEIGHT * 0.4 + Math.random() * SCREEN_HEIGHT * 0.3),
    size: 6 + Math.random() * 8,
  });
  const { startX, driftX, endY, size } = randomsRef.current;

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: endY, duration: 2000, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: driftX, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.delay(1200),
          Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(1000),
          Animated.timing(scale, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    ]);
    sequence.start();
    return () => sequence.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.3,
        left: startX,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
      }}
    />
  );
}

const PARTICLE_COLORS = [
  '#f59e0b', '#fbbf24', '#f6eddd', '#22c55e',
  '#ef4444', '#a78bfa', '#fb923c', '#34d399',
];

export function GoalCelebration({ visible, message, onDismiss }: GoalCelebrationProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) {
      // Reset animated values so next show starts fresh
      overlayOpacity.setValue(0);
      textScale.setValue(0.5);
      textOpacity.setValue(0);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Reset before animating to ensure clean start
    overlayOpacity.setValue(0);
    textScale.setValue(0.5);
    textOpacity.setValue(0);

    const entryAnimation = Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(textScale, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]);

    entryAnimation.start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) onDismissRef.current();
      });
    }, 3000);

    return () => {
      clearTimeout(timer);
      entryAnimation.stop();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="auto">
      {/* Particles */}
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle
          key={i}
          delay={i * 80}
          color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]}
        />
      ))}

      {/* Message */}
      <Animated.View style={[styles.messageContainer, { opacity: textOpacity, transform: [{ scale: textScale }] }]}>
        <Text style={styles.emoji}>&#127881;</Text>
        <Text style={styles.title}>Goal Achieved!</Text>
        <Text style={styles.subtitle}>
          {message || 'You hit your daily calorie target!'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(32, 34, 25, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  messageContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.accent.gold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

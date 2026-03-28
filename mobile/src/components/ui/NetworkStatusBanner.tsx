import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

/**
 * A banner that slides down below the status bar when the device goes offline,
 * and slides away when connectivity returns.
 */
export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const translateY = useRef(new Animated.Value(-60)).current;
  const insets = useSafeAreaInsets();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });

    return () => {
      unsubscribe();
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (wasOffline) {
      // Show "Back online" briefly, then hide
      hideTimerRef.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setWasOffline(false);
        });
      }, 2000);
    }
  }, [isOffline, wasOffline, translateY]);

  if (!isOffline && !wasOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 4,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.banner, isOffline ? styles.offlineBg : styles.onlineBg]}>
        <Text style={styles.icon}>{isOffline ? '\u26A0' : '\u2713'}</Text>
        <Text style={styles.text}>
          {isOffline ? 'No internet connection' : 'Back online'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: spacing.xs,
    width: '100%',
  },
  offlineBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  onlineBg: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  icon: {
    fontSize: 14,
    color: '#fff',
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
});

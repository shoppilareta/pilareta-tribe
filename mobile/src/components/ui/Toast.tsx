import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Keyboard, Platform } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'info' | 'error';

interface ToastMessage {
  text: string;
  type: ToastType;
  id: number;
}

interface ToastContextValue {
  showToast: (text: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();

  // Track keyboard height to position toast above keyboard
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const id = ++idRef.current;
    setToast({ text, type, id });

    translateY.setValue(100);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 2500);
  }, [translateY, opacity]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'rgba(34, 197, 94, 0.9)';
      case 'error': return 'rgba(239, 68, 68, 0.9)';
      default: return colors.fg.secondary;
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '\u2713';
      case 'error': return '\u2715';
      default: return '\u2139';
    }
  };

  // Position above keyboard when visible, otherwise above bottom safe area
  const bottomOffset = keyboardHeight > 0
    ? keyboardHeight + 16
    : insets.bottom + 16;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            { bottom: bottomOffset, transform: [{ translateY }], opacity },
          ]}
          pointerEvents="none"
        >
          <View style={styles.toast}>
            <Text style={[styles.icon, { color: getIconColor(toast.type) }]}>{getIcon(toast.type)}</Text>
            <Text style={styles.toastText}>{toast.text}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 54, 42, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
    maxWidth: Dimensions.get('window').width - spacing.lg * 2,
  },
  icon: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  toastText: {
    color: colors.fg.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    flexShrink: 1,
  },
});

import { Alert } from 'react-native';

export function handleApiError(
  error: unknown,
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void
): void {
  const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  if (showToast) {
    showToast(message, 'error');
  } else {
    Alert.alert('Error', message);
  }
}

import { Alert } from 'react-native';

export function handleApiError(
  error: unknown,
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void
): void {
  let message: string;

  if (error && typeof error === 'object' && 'name' in error) {
    const err = error as { name: string; message: string; status?: number; data?: any };

    if (err.name === 'NetworkError') {
      message = 'No internet connection. Please check your network and try again.';
    } else if (err.name === 'AuthError') {
      message = 'Please sign in to continue.';
    } else if (err.name === 'ApiError' && err.data) {
      const apiData = err.data as Record<string, unknown>;
      message = (apiData.error as string) || (apiData.message as string) || 'Something went wrong. Please try again.';
    } else {
      message = err.message || 'Something went wrong. Please try again.';
    }
  } else {
    message = 'Something went wrong. Please try again.';
  }

  if (showToast) {
    showToast(message, 'error');
  } else {
    Alert.alert('Error', message);
  }
}

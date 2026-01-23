'use client';

import { useState, useCallback } from 'react';
import { validateFile } from '@/lib/ugc/validation';

export interface UploadData {
  file?: File;
  instagramUrl?: string;
  caption?: string;
  studioId?: string;
  tagIds?: string[];
  consentGiven: boolean;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateUpload = useCallback((file: File) => {
    return validateFile(file);
  }, []);

  const validateInstagramUrl = useCallback((url: string): { valid: boolean; error?: string } => {
    if (!url.trim()) {
      return { valid: false, error: 'Instagram URL is required' };
    }
    // Simple validation - check if it looks like an Instagram URL
    const patterns = [
      /instagram\.com\/p\/[A-Za-z0-9_-]+/,
      /instagram\.com\/reel\/[A-Za-z0-9_-]+/,
    ];
    const isValid = patterns.some(pattern => pattern.test(url));
    if (!isValid) {
      return { valid: false, error: 'Please enter a valid Instagram post or reel URL' };
    }
    return { valid: true };
  }, []);

  const uploadPost = useCallback(async (data: UploadData) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      if (!data.consentGiven) {
        throw new Error('You must agree to the community guidelines');
      }

      // Validate - must have either file or Instagram URL
      if (!data.file && !data.instagramUrl) {
        throw new Error('Please upload a file or provide an Instagram URL');
      }

      // Validate file if provided
      if (data.file) {
        const validation = validateFile(data.file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Validate Instagram URL if provided
      if (data.instagramUrl) {
        const validation = validateInstagramUrl(data.instagramUrl);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append('consentGiven', 'true');
      if (data.file) formData.append('file', data.file);
      if (data.instagramUrl) formData.append('instagramUrl', data.instagramUrl);
      if (data.caption) formData.append('caption', data.caption);
      if (data.studioId) formData.append('studioId', data.studioId);
      if (data.tagIds && data.tagIds.length > 0) {
        formData.append('tagIds', JSON.stringify(data.tagIds));
      }

      setProgress(10);

      // Upload
      const response = await fetch('/api/ugc/posts', {
        method: 'POST',
        body: formData,
      });

      setProgress(90);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload');
      }

      setProgress(100);

      return {
        success: true,
        post: result.post,
        message: result.message,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setUploading(false);
    }
  }, [validateInstagramUrl]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    validateUpload,
    uploadPost,
    clearError,
  };
}

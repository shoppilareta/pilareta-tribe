'use client';

import { useState, useCallback } from 'react';
import { validateFile } from '@/lib/ugc/validation';

export interface UploadData {
  file: File;
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

  const uploadPost = useCallback(async (data: UploadData) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      // Validate file
      const validation = validateFile(data.file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!data.consentGiven) {
        throw new Error('You must agree to the community guidelines');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('consentGiven', 'true');
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
  }, []);

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

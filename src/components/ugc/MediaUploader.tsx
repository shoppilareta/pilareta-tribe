'use client';

import { useCallback, useRef, useState } from 'react';
import {
  validateFile,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_VIDEO_EXTENSIONS,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from '@/lib/ugc/validation';

interface MediaUploaderProps {
  file: File | null;
  preview: string | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function MediaUploader({ file, preview, onFileSelect, disabled }: MediaUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (selectedFile: File) => {
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      setError(null);
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [disabled, handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [onFileSelect]);

  const acceptedFormats = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_VIDEO_EXTENSIONS].join(',');

  return (
    <div>
      {file && preview ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '2px',
            overflow: 'hidden',
            background: 'rgba(246, 237, 221, 0.05)',
          }}
        >
          {file.type.startsWith('video/') ? (
            <video
              src={preview}
              controls
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '300px',
                objectFit: 'contain',
              }}
            />
          )}

          {/* Remove button */}
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#f6eddd',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* File info */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid rgba(246, 237, 221, 0.1)',
              fontSize: '0.75rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            padding: '2rem',
            border: `2px dashed ${isDragging ? '#f59e0b' : 'rgba(246, 237, 221, 0.2)'}`,
            borderRadius: '4px',
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s ease',
            background: isDragging ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />

          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(246, 237, 221, 0.4)"
            strokeWidth="1.5"
            style={{ margin: '0 auto 1rem' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <p
            style={{
              margin: '0 0 0.5rem',
              color: '#f6eddd',
              fontSize: '0.875rem',
            }}
          >
            Drag & drop or click to upload
          </p>
          <p
            style={{
              margin: 0,
              color: 'rgba(246, 237, 221, 0.5)',
              fontSize: '0.75rem',
            }}
          >
            Images: JPG, PNG, WebP (max {MAX_IMAGE_SIZE_MB}MB)
            <br />
            Videos: MP4, MOV, WebM (max {MAX_VIDEO_SIZE_MB}MB)
          </p>
        </div>
      )}

      {error && (
        <p
          style={{
            margin: '8px 0 0',
            color: '#ef4444',
            fontSize: '0.8rem',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

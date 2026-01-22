'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUpload } from './hooks/useUpload';
import { MediaUploader } from './MediaUploader';
import { ConsentCheckbox } from './ConsentCheckbox';
import { StudioSelector } from './StudioSelector';
import { TagSelector } from './TagSelector';
import type { UgcTag } from './hooks/useFeed';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [studioId, setStudioId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<UgcTag[]>([]);
  const [consentGiven, setConsentGiven] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { uploading, error, uploadPost, clearError } = useUpload();

  // Generate preview URL
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !uploading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, uploading]);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !consentGiven || uploading) return;

    const result = await uploadPost({
      file,
      caption: caption.trim() || undefined,
      studioId: studioId || undefined,
      tagIds: selectedTags.map((t) => t.id),
      consentGiven,
    });

    if (result.success) {
      setSuccessMessage(result.message || 'Your post has been submitted for review');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  const isFormValid = file && consentGiven && !uploading;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => !uploading && onClose()}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: '#1a1a1a',
          borderRadius: '4px',
          maxWidth: '500px',
          maxHeight: '90vh',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 500,
              color: '#f6eddd',
            }}
          >
            Share Your Pilates Journey
          </h2>
          <button
            type="button"
            onClick={() => !uploading && onClose()}
            disabled={uploading}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(246, 237, 221, 0.6)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              padding: '4px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Success message */}
        {successMessage ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              style={{ margin: '0 auto 1rem' }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p style={{ margin: 0, color: '#f6eddd' }}>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1rem' }}>
              {/* Media uploader */}
              <MediaUploader
                file={file}
                preview={preview}
                onFileSelect={handleFileSelect}
                disabled={uploading}
              />

              {/* Caption */}
              <div style={{ marginTop: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '0.875rem',
                    color: 'rgba(246, 237, 221, 0.8)',
                  }}
                >
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your thoughts..."
                  maxLength={500}
                  disabled={uploading}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px 12px',
                    background: 'rgba(246, 237, 221, 0.05)',
                    border: '1px solid rgba(246, 237, 221, 0.1)',
                    borderRadius: '2px',
                    color: '#f6eddd',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.75rem',
                    color: 'rgba(246, 237, 221, 0.4)',
                    textAlign: 'right',
                  }}
                >
                  {caption.length}/500
                </p>
              </div>

              {/* Studio selector */}
              <StudioSelector
                selectedStudioId={studioId}
                onSelect={setStudioId}
                disabled={uploading}
              />

              {/* Tag selector */}
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                disabled={uploading}
              />

              {/* Consent */}
              <ConsentCheckbox
                checked={consentGiven}
                onChange={setConsentGiven}
                disabled={uploading}
              />

              {/* Error */}
              {error && (
                <p
                  style={{
                    margin: '1rem 0 0',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '2px',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid rgba(246, 237, 221, 0.1)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(246, 237, 221, 0.1)',
                  border: 'none',
                  borderRadius: '2px',
                  color: '#f6eddd',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                style={{
                  padding: '10px 20px',
                  background: isFormValid ? '#f6eddd' : 'rgba(246, 237, 221, 0.2)',
                  border: 'none',
                  borderRadius: '2px',
                  color: isFormValid ? '#1a1a1a' : 'rgba(246, 237, 221, 0.4)',
                  fontWeight: 500,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
              >
                {uploading ? 'Uploading...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

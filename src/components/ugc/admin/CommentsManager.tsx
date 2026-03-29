'use client';

import { useState, useEffect, useCallback } from 'react';

interface Comment {
  id: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null };
  post: { id: string; caption: string | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function CommentsManager() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/comments?page=${page}&limit=50`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComments(data.comments);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (commentId: string) => {
    setDeleting(commentId);
    setError(null);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete comment');
      }
      setDeleteConfirm(null);
      await fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
        Loading comments...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: 'rgba(239, 68, 68, 0.9)',
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(239, 68, 68, 0.7)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0 0.25rem',
            }}
          >
            x
          </button>
        </div>
      )}

      {comments.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'rgba(246, 237, 221, 0.4)',
            fontSize: '0.875rem',
            background: 'rgba(70, 74, 60, 0.1)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(246, 237, 221, 0.05)',
          }}
        >
          No comments found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: 'rgba(70, 74, 60, 0.15)',
                border: '1px solid rgba(246, 237, 221, 0.08)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
              }}
            >
              {/* Header: user and post info */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span
                    style={{
                      color: '#f6eddd',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {comment.user.firstName || comment.user.email}
                  </span>
                  {comment.user.firstName && (
                    <span
                      style={{
                        color: 'rgba(246, 237, 221, 0.4)',
                        fontSize: '0.75rem',
                        marginLeft: '0.5rem',
                      }}
                    >
                      {comment.user.email}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    color: 'rgba(246, 237, 221, 0.35)',
                    fontSize: '0.75rem',
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Comment content */}
              <p
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.875rem',
                  color: 'rgba(246, 237, 221, 0.8)',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                {comment.content}
              </p>

              {/* Post reference */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(246, 237, 221, 0.4)',
                  }}
                >
                  On post:{' '}
                  <a
                    href={`/community/${comment.post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'rgba(59, 130, 246, 0.8)',
                      textDecoration: 'underline',
                    }}
                  >
                    {comment.post.caption
                      ? comment.post.caption.substring(0, 50) + (comment.post.caption.length > 50 ? '...' : '')
                      : comment.post.id}
                  </a>
                </span>

                {/* Delete button */}
                {deleteConfirm === comment.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(239, 68, 68, 0.8)',
                      }}
                    >
                      Delete this comment?
                    </span>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleting === comment.id}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: deleting === comment.id ? 'not-allowed' : 'pointer',
                        opacity: deleting === comment.id ? 0.6 : 1,
                        minHeight: '32px',
                      }}
                    >
                      {deleting === comment.id ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(246, 237, 221, 0.2)',
                        background: 'transparent',
                        color: 'rgba(246, 237, 221, 0.5)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        minHeight: '32px',
                      }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(comment.id)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'transparent',
                      color: 'rgba(239, 68, 68, 0.7)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      minHeight: '32px',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(246, 237, 221, 0.2)',
              background: 'transparent',
              color: page <= 1 ? 'rgba(246, 237, 221, 0.3)' : 'rgba(246, 237, 221, 0.7)',
              fontSize: '0.8125rem',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
          >
            Previous
          </button>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} comments)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              border: '1px solid rgba(246, 237, 221, 0.2)',
              background: 'transparent',
              color: page >= pagination.totalPages ? 'rgba(246, 237, 221, 0.3)' : 'rgba(246, 237, 221, 0.7)',
              fontSize: '0.8125rem',
              cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
              minHeight: '44px',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

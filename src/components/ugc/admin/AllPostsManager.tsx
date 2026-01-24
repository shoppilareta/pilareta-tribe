'use client';

import { useState, useEffect, useCallback } from 'react';

interface AdminPost {
  id: string;
  caption: string | null;
  mediaUrl: string | null;
  mediaType: string;
  thumbnailUrl: string | null;
  instagramUrl: string | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  moderatedAt: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  studio: {
    id: string;
    name: string;
    city: string;
  } | null;
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface Counts {
  all: number;
  approved: number;
  pending: number;
  rejected: number;
  featured: number;
}

export function AllPostsManager() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts>({ all: 0, approved: 0, pending: 0, rejected: 0, featured: 0 });
  const [filter, setFilter] = useState<string>('approved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter && filter !== 'all') {
        if (filter === 'featured') {
          params.set('featured', 'true');
          params.set('status', 'approved');
        } else {
          params.set('status', filter);
        }
      }

      const response = await fetch(`/api/ugc/admin/posts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(data.posts);
      setCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ugc/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete post');
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setCounts((prev) => ({
        ...prev,
        all: prev.all - 1,
        [posts.find((p) => p.id === postId)?.status || 'approved']:
          prev[posts.find((p) => p.id === postId)?.status as keyof Counts || 'approved'] - 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleToggleFeatured = async (postId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/ugc/admin/moderate/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update featured status');
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isFeatured: !currentFeatured } : p
        )
      );
      setCounts((prev) => ({
        ...prev,
        featured: currentFeatured ? prev.featured - 1 : prev.featured + 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update featured status');
    }
  };

  const handleEditCaption = (post: AdminPost) => {
    setEditingId(post.id);
    setEditCaption(post.caption || '');
  };

  const handleSaveCaption = async (postId: string) => {
    try {
      const response = await fetch(`/api/ugc/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editCaption }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update caption');
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, caption: editCaption.trim() || null } : p
        )
      );
      setEditingId(null);
      setEditCaption('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update caption');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCaption('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return 'rgba(246, 237, 221, 0.6)';
    }
  };

  const getUserName = (user: AdminPost['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || 'Anonymous';
  };

  if (loading && posts.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '2px solid rgba(246, 237, 221, 0.2)',
            borderTopColor: '#f6eddd',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'pending', label: 'Pending', count: counts.pending },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
          { key: 'featured', label: 'Featured', count: counts.featured },
          { key: 'all', label: 'All', count: counts.all },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px',
              background: filter === tab.key ? 'rgba(246, 237, 221, 0.15)' : 'rgba(246, 237, 221, 0.05)',
              border: filter === tab.key ? '1px solid rgba(246, 237, 221, 0.3)' : '1px solid rgba(246, 237, 221, 0.1)',
              borderRadius: '2px',
              color: filter === tab.key ? '#f6eddd' : 'rgba(246, 237, 221, 0.7)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
        <button
          type="button"
          onClick={fetchPosts}
          style={{
            padding: '8px 16px',
            background: 'rgba(246, 237, 221, 0.1)',
            border: 'none',
            borderRadius: '2px',
            color: '#f6eddd',
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px',
            color: '#ef4444',
            marginBottom: '1.5rem',
          }}
        >
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              marginLeft: '12px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(246, 237, 221, 0.03)',
            borderRadius: '4px',
          }}
        >
          <p style={{ margin: 0, color: 'rgba(246, 237, 221, 0.6)' }}>
            No posts found with the current filter
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: 'rgba(246, 237, 221, 0.03)',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(246, 237, 221, 0.1)',
              }}
            >
              {/* Media */}
              <div
                style={{
                  position: 'relative',
                  height: '200px',
                  overflow: 'hidden',
                  background: '#000',
                }}
              >
                {post.mediaType === 'video' ? (
                  <video
                    src={post.mediaUrl || undefined}
                    poster={post.thumbnailUrl || undefined}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : post.mediaType === 'instagram' ? (
                  <a
                    href={post.instagramUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={post.thumbnailUrl || '/placeholder-instagram.png'}
                      alt="Instagram post"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    >
                      Instagram
                    </div>
                  </a>
                ) : (
                  <img
                    src={post.mediaUrl || post.thumbnailUrl || ''}
                    alt="Post media"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                {/* Status badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    padding: '4px 8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '2px',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    color: getStatusColor(post.status),
                    textTransform: 'uppercase',
                  }}
                >
                  {post.status}
                </div>
                {/* Featured badge */}
                {post.isFeatured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      background: 'rgba(245, 158, 11, 0.9)',
                      borderRadius: '2px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    FEATURED
                  </div>
                )}
                {/* Stats overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    display: 'flex',
                    gap: '12px',
                    fontSize: '0.75rem',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  <span>{post._count.likes} likes</span>
                  <span>{post._count.comments} comments</span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1rem' }}>
                {/* User and date */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <p style={{ margin: 0, color: '#f6eddd', fontWeight: 500, fontSize: '0.875rem' }}>
                    {getUserName(post.user)}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.7rem',
                      color: 'rgba(246, 237, 221, 0.4)',
                    }}
                  >
                    {formatDate(post.createdAt)}
                  </p>
                </div>

                {/* Caption - editable */}
                {editingId === post.id ? (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: '60px',
                        padding: '8px',
                        background: 'rgba(246, 237, 221, 0.05)',
                        border: '1px solid rgba(246, 237, 221, 0.2)',
                        borderRadius: '2px',
                        color: '#f6eddd',
                        fontSize: '0.8rem',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          background: 'rgba(246, 237, 221, 0.1)',
                          border: 'none',
                          borderRadius: '2px',
                          color: '#f6eddd',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCaption(post.id)}
                        style={{
                          flex: 1,
                          padding: '6px 12px',
                          background: '#22c55e',
                          border: 'none',
                          borderRadius: '2px',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      margin: '0 0 0.75rem',
                      color: 'rgba(246, 237, 221, 0.7)',
                      fontSize: '0.8rem',
                      minHeight: '20px',
                    }}
                  >
                    {post.caption || <em style={{ color: 'rgba(246, 237, 221, 0.4)' }}>No caption</em>}
                  </p>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {post.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(246, 237, 221, 0.5)',
                          background: 'rgba(246, 237, 221, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '2px',
                        }}
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(246, 237, 221, 0.1)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEditCaption(post)}
                    disabled={editingId !== null}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(246, 237, 221, 0.1)',
                      border: 'none',
                      borderRadius: '2px',
                      color: '#f6eddd',
                      cursor: editingId !== null ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                      opacity: editingId !== null ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                  {post.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(post.id, post.isFeatured)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: post.isFeatured ? 'rgba(245, 158, 11, 0.2)' : 'rgba(246, 237, 221, 0.1)',
                        border: post.isFeatured ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                        borderRadius: '2px',
                        color: post.isFeatured ? '#f59e0b' : '#f6eddd',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      {post.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '2px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

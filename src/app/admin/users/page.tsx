'use client';

import { useEffect, useState, useCallback } from 'react';

interface UserListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    ugcPosts: number;
    workoutLogs: number;
  };
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  shopifyId: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    fitnessGoal: string | null;
  } | null;
  _count: {
    ugcPosts: number;
    ugcComments: number;
    ugcLikes: number;
    workoutLogs: number;
    followers: number;
    following: number;
    sessions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingAdmin, setTogglingAdmin] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page: number, searchQuery: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (searchQuery) params.set('search', searchQuery);
        const res = await fetch(`/api/admin/users?${params}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchUsers(1, searchInput);
  };

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage, search);
  };

  const viewUserDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setSelectedUser(data.user);
    } catch {
      // Silently handle error
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setTogglingAdmin(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
        return;
      }
      const data = await res.json();
      // Update list
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isAdmin: data.user.isAdmin } : u))
      );
      // Update detail if open
      if (selectedUser?.id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, isAdmin: data.user.isAdmin } : prev));
      }
    } catch {
      alert('Failed to update user');
    } finally {
      setTogglingAdmin(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(246, 237, 221, 0.03)',
    border: '1px solid rgba(246, 237, 221, 0.08)',
    borderRadius: '12px',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a href="/admin" style={{ color: 'rgba(246, 237, 221, 0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>Users</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#f6eddd', letterSpacing: '-0.02em' }}>
          User Management
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.5)' }}>
          {pagination.total} total users
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: '0.625rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(246, 237, 221, 0.12)',
            background: 'rgba(246, 237, 221, 0.04)',
            color: '#f6eddd',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            border: '1px solid rgba(246, 237, 221, 0.15)',
            background: 'rgba(246, 237, 221, 0.08)',
            color: '#f6eddd',
            fontSize: '0.85rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => {
              setSearchInput('');
              setSearch('');
              fetchUsers(1, '');
            }}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(246, 237, 221, 0.1)',
              background: 'transparent',
              color: 'rgba(246, 237, 221, 0.5)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Two column layout for detail view */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* User List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={cardStyle}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
                No users found
              </div>
            ) : (
              <>
                {/* Table header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px 60px 100px',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.08)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'rgba(246, 237, 221, 0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <div>User</div>
                  <div style={{ textAlign: 'center' }}>Posts</div>
                  <div style={{ textAlign: 'center' }}>Workouts</div>
                  <div style={{ textAlign: 'center' }}>Admin</div>
                  <div style={{ textAlign: 'right' }}>Joined</div>
                </div>

                {/* User rows */}
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => viewUserDetail(u.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 80px 60px 100px',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                      background: selectedUser?.id === u.id ? 'rgba(246, 237, 221, 0.06)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'rgba(246, 237, 221, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUser?.id !== u.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#f6eddd',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.firstName || u.lastName
                          ? `${u.firstName || ''} ${u.lastName || ''}`.trim()
                          : u.email}
                      </div>
                      {(u.firstName || u.lastName) && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgba(246, 237, 221, 0.4)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {u.email}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(246, 237, 221, 0.7)' }}>
                      {u._count.ugcPosts}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(246, 237, 221, 0.7)' }}>
                      {u._count.workoutLogs}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {u.isAdmin && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(129, 199, 132, 0.15)',
                            color: '#81c784',
                          }}
                        >
                          YES
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.45)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(246, 237, 221, 0.1)',
                  background: 'transparent',
                  color: pagination.page <= 1 ? 'rgba(246, 237, 221, 0.2)' : 'rgba(246, 237, 221, 0.7)',
                  fontSize: '0.8rem',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(246, 237, 221, 0.1)',
                  background: 'transparent',
                  color: pagination.page >= pagination.totalPages ? 'rgba(246, 237, 221, 0.2)' : 'rgba(246, 237, 221, 0.7)',
                  fontSize: '0.8rem',
                  cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* User Detail Panel */}
        {(selectedUser || detailLoading) && (
          <div
            style={{
              width: '340px',
              flexShrink: 0,
              ...cardStyle,
              padding: '1.25rem',
              position: 'sticky',
              top: '1.5rem',
            }}
          >
            {detailLoading ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
                Loading...
              </div>
            ) : selectedUser ? (
              <>
                {/* Close */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#f6eddd' }}>
                    User Details
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(246, 237, 221, 0.4)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    x
                  </button>
                </div>

                {/* Name & Email */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 400, color: '#f6eddd', marginBottom: '0.25rem' }}>
                    {selectedUser.firstName || selectedUser.lastName
                      ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim()
                      : 'No name'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                    {selectedUser.email}
                  </div>
                  {selectedUser.profile?.displayName && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.4)', marginTop: '0.125rem' }}>
                      Display: {selectedUser.profile.displayName}
                    </div>
                  )}
                </div>

                {/* Stats grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  {[
                    { label: 'Posts', value: selectedUser._count.ugcPosts },
                    { label: 'Comments', value: selectedUser._count.ugcComments },
                    { label: 'Likes given', value: selectedUser._count.ugcLikes },
                    { label: 'Workouts', value: selectedUser._count.workoutLogs },
                    { label: 'Followers', value: selectedUser._count.followers },
                    { label: 'Following', value: selectedUser._count.following },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        background: 'rgba(246, 237, 221, 0.03)',
                        border: '1px solid rgba(246, 237, 221, 0.06)',
                      }}
                    >
                      <div style={{ fontSize: '0.65rem', color: 'rgba(246, 237, 221, 0.45)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 300, color: '#f6eddd' }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    Sessions: {selectedUser._count.sessions}
                  </div>
                  {selectedUser.profile?.fitnessGoal && (
                    <div style={{ marginBottom: '0.25rem' }}>
                      Goal: {selectedUser.profile.fitnessGoal.replace(/_/g, ' ')}
                    </div>
                  )}
                  {selectedUser.profile?.bio && (
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'rgba(246, 237, 221, 0.4)' }}>
                      &quot;{selectedUser.profile.bio}&quot;
                    </div>
                  )}
                </div>

                {/* Admin toggle */}
                <button
                  onClick={() => toggleAdmin(selectedUser.id, selectedUser.isAdmin)}
                  disabled={togglingAdmin === selectedUser.id}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedUser.isAdmin ? 'rgba(229, 115, 115, 0.3)' : 'rgba(129, 199, 132, 0.3)'}`,
                    background: selectedUser.isAdmin ? 'rgba(229, 115, 115, 0.08)' : 'rgba(129, 199, 132, 0.08)',
                    color: selectedUser.isAdmin ? '#e57373' : '#81c784',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: togglingAdmin === selectedUser.id ? 'not-allowed' : 'pointer',
                    opacity: togglingAdmin === selectedUser.id ? 0.5 : 1,
                  }}
                >
                  {togglingAdmin === selectedUser.id
                    ? 'Updating...'
                    : selectedUser.isAdmin
                      ? 'Remove Admin Access'
                      : 'Grant Admin Access'}
                </button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

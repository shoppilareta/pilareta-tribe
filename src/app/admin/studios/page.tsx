'use client';

import { useEffect, useState, useCallback } from 'react';

interface Studio {
  id: string;
  name: string;
  city: string;
  address: string | null;
  formattedAddress: string | null;
  phoneNumber: string | null;
  website: string | null;
  rating: number | null;
  ratingCount: number | null;
  verified: boolean;
  googlePlaceId: string | null;
  createdAt: string;
  _count: {
    claims: number;
    editSuggestions: number;
    ugcPosts: number;
  };
}

interface StudioClaim {
  id: string;
  studioId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string | null;
  businessRole: string;
  proofDescription: string | null;
  status: string;
  createdAt: string;
  studio: { name: string; city: string };
}

interface StudioEditSuggestion {
  id: string;
  studioId: string;
  submitterEmail: string | null;
  suggestedChanges: Record<string, unknown>;
  reason: string | null;
  status: string;
  createdAt: string;
  studio: { name: string; city: string };
}

type Tab = 'studios' | 'claims' | 'edits';

export default function AdminStudiosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('studios');
  const [studios, setStudios] = useState<Studio[]>([]);
  const [claims, setClaims] = useState<StudioClaim[]>([]);
  const [editSuggestions, setEditSuggestions] = useState<StudioEditSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchStudios = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const res = await fetch(`/api/admin/studios?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudios(data.studios);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studios/claims');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setClaims(data.claims);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEditSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studios/edit-suggestions');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setEditSuggestions(data.suggestions);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'studios') fetchStudios('');
    else if (activeTab === 'claims') fetchClaims();
    else fetchEditSuggestions();
  }, [activeTab, fetchStudios, fetchClaims, fetchEditSuggestions]);

  const handleSearch = () => {
    setSearch(searchInput);
    fetchStudios(searchInput);
  };

  const updateClaimStatus = async (claimId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/studios/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      fetchClaims();
    } catch {
      alert('Failed to update claim');
    }
  };

  const updateEditSuggestionStatus = async (suggestionId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/studios/edit-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      fetchEditSuggestions();
    } catch {
      alert('Failed to update suggestion');
    }
  };

  const toggleVerified = async (studioId: string, currentVerified: boolean) => {
    try {
      const res = await fetch(`/api/admin/studios/${studioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified }),
      });
      if (!res.ok) throw new Error('Failed');
      fetchStudios(search);
    } catch {
      alert('Failed to update studio');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(246, 237, 221, 0.03)',
    border: '1px solid rgba(246, 237, 221, 0.08)',
    borderRadius: '12px',
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'studios', label: 'All Studios' },
    { key: 'claims', label: 'Pending Claims' },
    { key: 'edits', label: 'Edit Suggestions' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <a href="/admin" style={{ color: 'rgba(246, 237, 221, 0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
            Admin
          </a>
          <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
          <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>Studios</span>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#f6eddd', letterSpacing: '-0.02em' }}>
          Studios Management
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.5)' }}>
          Manage studios, review claims and edit suggestions
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(246, 237, 221, 0.08)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? 'rgba(246, 237, 221, 0.6)' : 'transparent'}`,
              color: activeTab === tab.key ? '#f6eddd' : 'rgba(246, 237, 221, 0.45)',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Studios Tab */}
      {activeTab === 'studios' && (
        <>
          {/* Search */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search studios by name or city..."
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
              }}
            >
              Search
            </button>
          </div>

          <div style={cardStyle}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
                Loading studios...
              </div>
            ) : studios.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
                No studios found
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 60px 60px 60px 90px',
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
                  <div>Studio</div>
                  <div>City</div>
                  <div style={{ textAlign: 'center' }}>Rating</div>
                  <div style={{ textAlign: 'center' }}>Posts</div>
                  <div style={{ textAlign: 'center' }}>Claims</div>
                  <div style={{ textAlign: 'center' }}>Verified</div>
                </div>

                {studios.map((studio) => (
                  <div
                    key={studio.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 60px 60px 60px 90px',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: '#f6eddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {studio.name}
                      </div>
                      {studio.formattedAddress && (
                        <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {studio.formattedAddress}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                      {studio.city}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                      {studio.rating ? `${studio.rating.toFixed(1)}` : '-'}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                      {studio._count.ugcPosts}
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.6)' }}>
                      {studio._count.claims}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleVerified(studio.id, studio.verified)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          ...(studio.verified
                            ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                            : { background: 'rgba(246, 237, 221, 0.06)', color: 'rgba(246, 237, 221, 0.45)' }),
                        }}
                      >
                        {studio.verified ? 'Verified' : 'Unverified'}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div style={cardStyle}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
              Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
              No pending claims
            </div>
          ) : (
            claims.map((claim, idx) => (
              <div
                key={claim.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: idx < claims.length - 1 ? '1px solid rgba(246, 237, 221, 0.06)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f6eddd' }}>
                      {claim.studio.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.45)' }}>
                      {claim.studio.city}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      ...(claim.status === 'approved'
                        ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                        : claim.status === 'rejected'
                          ? { background: 'rgba(229, 115, 115, 0.15)', color: '#e57373' }
                          : { background: 'rgba(255, 183, 77, 0.15)', color: '#ffb74d' }),
                    }}
                  >
                    {claim.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.6)', marginBottom: '0.25rem' }}>
                  <strong style={{ fontWeight: 500 }}>Claimant:</strong> {claim.claimantName} ({claim.claimantEmail})
                  {claim.claimantPhone && ` - ${claim.claimantPhone}`}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '0.25rem' }}>
                  <strong style={{ fontWeight: 500 }}>Role:</strong> {claim.businessRole}
                </div>
                {claim.proofDescription && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '0.5rem' }}>
                    <strong style={{ fontWeight: 500 }}>Proof:</strong> {claim.proofDescription}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', marginBottom: '0.75rem' }}>
                  Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                </div>
                {claim.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateClaimStatus(claim.id, 'approved')}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(129, 199, 132, 0.3)',
                        background: 'rgba(129, 199, 132, 0.08)',
                        color: '#81c784',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateClaimStatus(claim.id, 'rejected')}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(229, 115, 115, 0.3)',
                        background: 'rgba(229, 115, 115, 0.08)',
                        color: '#e57373',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Suggestions Tab */}
      {activeTab === 'edits' && (
        <div style={cardStyle}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
              Loading suggestions...
            </div>
          ) : editSuggestions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
              No pending edit suggestions
            </div>
          ) : (
            editSuggestions.map((suggestion, idx) => (
              <div
                key={suggestion.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: idx < editSuggestions.length - 1 ? '1px solid rgba(246, 237, 221, 0.06)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#f6eddd' }}>
                      {suggestion.studio.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.45)' }}>
                      {suggestion.studio.city}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      ...(suggestion.status === 'approved'
                        ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                        : suggestion.status === 'rejected'
                          ? { background: 'rgba(229, 115, 115, 0.15)', color: '#e57373' }
                          : { background: 'rgba(255, 183, 77, 0.15)', color: '#ffb74d' }),
                    }}
                  >
                    {suggestion.status}
                  </span>
                </div>
                {suggestion.submitterEmail && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '0.25rem' }}>
                    Submitted by: {suggestion.submitterEmail}
                  </div>
                )}
                {suggestion.reason && (
                  <div style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', marginBottom: '0.5rem' }}>
                    <strong style={{ fontWeight: 500 }}>Reason:</strong> {suggestion.reason}
                  </div>
                )}
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: 'rgba(246, 237, 221, 0.03)',
                    border: '1px solid rgba(246, 237, 221, 0.06)',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(246, 237, 221, 0.45)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.375rem' }}>
                    Suggested Changes
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: 'rgba(246, 237, 221, 0.6)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                    }}
                  >
                    {JSON.stringify(suggestion.suggestedChanges, null, 2)}
                  </pre>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', marginBottom: '0.75rem' }}>
                  Submitted: {new Date(suggestion.createdAt).toLocaleDateString()}
                </div>
                {suggestion.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateEditSuggestionStatus(suggestion.id, 'approved')}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(129, 199, 132, 0.3)',
                        background: 'rgba(129, 199, 132, 0.08)',
                        color: '#81c784',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateEditSuggestionStatus(suggestion.id, 'rejected')}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(229, 115, 115, 0.3)',
                        background: 'rgba(229, 115, 115, 0.08)',
                        color: '#e57373',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

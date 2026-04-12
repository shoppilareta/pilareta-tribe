'use client';

import { adminFetch } from '@/lib/admin-fetch';
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

interface StudioDetail {
  id: string;
  name: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string | null;
  website: string | null;
  amenities: string[];
  openingHours: unknown;
  rating: number | null;
  verified: boolean;
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
  studio: { id: string; name: string; city: string; address?: string | null; phoneNumber?: string | null; website?: string | null; amenities?: string[] };
}

interface StudioFormData {
  name: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  website: string;
  amenities: string;
  rating: string;
}

type Tab = 'studios' | 'claims' | 'edits';

const emptyStudioForm: StudioFormData = {
  name: '',
  city: '',
  address: '',
  latitude: '',
  longitude: '',
  phoneNumber: '',
  website: '',
  amenities: '',
  rating: '',
};

export default function AdminStudiosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('studios');
  const [studios, setStudios] = useState<Studio[]>([]);
  const [claims, setClaims] = useState<StudioClaim[]>([]);
  const [editSuggestions, setEditSuggestions] = useState<StudioEditSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingStudioId, setEditingStudioId] = useState<string | null>(null);
  const [studioForm, setStudioForm] = useState<StudioFormData>(emptyStudioForm);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Actionable states
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const toggleSelectStudio = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllStudios = () => {
    if (selectedIds.size === studios.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(studios.map((s) => s.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Are you sure you want to ${action} ${ids.length} studio(s)?`)) return;
    setBulkLoading(true);
    try {
      const res = await adminFetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, entityType: 'studios', ids }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Bulk operation failed');
        return;
      }
      const data = await res.json();
      alert(`${data.count} studio(s) affected`);
      setSelectedIds(new Set());
      fetchStudios(search);
    } catch {
      alert('Bulk operation failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/admin/exports?type=studios', '_blank');
  };

  const fetchStudios = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      const res = await adminFetch(`/api/admin/studios?${params}`);
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
      const res = await adminFetch('/api/admin/studios/claims');
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
      const res = await adminFetch('/api/admin/studios/edit-suggestions');
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
    if (status === 'rejected' && !window.confirm('Are you sure you want to reject this claim?')) return;
    setActionLoading(claimId);
    try {
      const res = await adminFetch(`/api/admin/studios/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      alert(`Claim ${status} successfully`);
      fetchClaims();
    } catch {
      alert('Failed to update claim');
    } finally {
      setActionLoading(null);
    }
  };

  const updateEditSuggestionStatus = async (suggestionId: string, status: string) => {
    if (status === 'rejected' && !window.confirm('Are you sure you want to reject this suggestion?')) return;
    setActionLoading(suggestionId);
    try {
      const res = await adminFetch(`/api/admin/studios/edit-suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      alert(`Suggestion ${status} successfully`);
      fetchEditSuggestions();
    } catch {
      alert('Failed to update suggestion');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVerified = async (studioId: string, currentVerified: boolean) => {
    setActionLoading(studioId);
    try {
      const res = await adminFetch(`/api/admin/studios/${studioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified }),
      });
      if (!res.ok) throw new Error('Failed');
      fetchStudios(search);
    } catch {
      alert('Failed to update studio');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStudio = async (studioId: string, studioName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${studioName}"? This cannot be undone.`)) return;
    setActionLoading(studioId);
    try {
      const res = await adminFetch(`/api/admin/studios/${studioId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Studio deleted successfully');
        fetchStudios(search);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete studio');
      }
    } catch {
      alert('Failed to delete studio');
    } finally {
      setActionLoading(null);
    }
  };

  function openCreateModal() {
    setEditingStudioId(null);
    setStudioForm(emptyStudioForm);
    setModalMessage('');
    setShowModal(true);
  }

  async function openEditModal(studio: Studio) {
    setModalMessage('');
    setEditingStudioId(studio.id);
    // Fetch full details for the studio
    try {
      const res = await adminFetch(`/api/admin/studios/${studio.id}`, { method: 'GET' });
      // The studio [id] route doesn't have a GET handler yet, so use what we have from the list
      // and set additional fields
      setStudioForm({
        name: studio.name,
        city: studio.city,
        address: studio.address || '',
        latitude: '',
        longitude: '',
        phoneNumber: studio.phoneNumber || '',
        website: studio.website || '',
        amenities: '',
        rating: studio.rating != null ? String(studio.rating) : '',
      });
    } catch {
      setStudioForm({
        name: studio.name,
        city: studio.city,
        address: studio.address || '',
        latitude: '',
        longitude: '',
        phoneNumber: studio.phoneNumber || '',
        website: studio.website || '',
        amenities: '',
        rating: studio.rating != null ? String(studio.rating) : '',
      });
    }
    setShowModal(true);
  }

  async function handleModalSave() {
    if (!studioForm.name || !studioForm.city) {
      setModalMessage('Name and city are required');
      return;
    }

    setModalSaving(true);
    setModalMessage('');

    const payload: Record<string, unknown> = {
      name: studioForm.name,
      city: studioForm.city,
      address: studioForm.address || null,
      phoneNumber: studioForm.phoneNumber || null,
      website: studioForm.website || null,
    };
    if (studioForm.latitude) payload.latitude = parseFloat(studioForm.latitude);
    if (studioForm.longitude) payload.longitude = parseFloat(studioForm.longitude);
    if (studioForm.amenities) payload.amenities = studioForm.amenities.split(',').map((s) => s.trim()).filter(Boolean);
    if (studioForm.rating) payload.rating = parseFloat(studioForm.rating);

    try {
      const url = editingStudioId ? `/api/admin/studios/${editingStudioId}` : '/api/admin/studios';
      const method = editingStudioId ? 'PATCH' : 'POST';
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert(editingStudioId ? 'Studio updated successfully' : 'Studio created successfully');
        setShowModal(false);
        fetchStudios(search);
      } else {
        const data = await res.json();
        setModalMessage(data.error || 'Failed to save');
      }
    } catch {
      setModalMessage('Failed to save');
    } finally {
      setModalSaving(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(246, 237, 221, 0.03)',
    border: '1px solid rgba(246, 237, 221, 0.08)',
    borderRadius: '12px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(246, 237, 221, 0.08)',
    background: 'rgba(246, 237, 221, 0.02)',
    color: '#f6eddd',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    color: 'rgba(246,237,221,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'studios', label: 'All Studios' },
    { key: 'claims', label: 'Pending Claims' },
    { key: 'edits', label: 'Edit Suggestions' },
  ];

  // Diff view helper for edit suggestions
  function renderDiffView(suggestion: StudioEditSuggestion) {
    const changes = suggestion.suggestedChanges;
    const fieldLabels: Record<string, string> = {
      name: 'Name',
      city: 'City',
      address: 'Address',
      phoneNumber: 'Phone',
      website: 'Website',
      amenities: 'Amenities',
    };

    const studioData = suggestion.studio as Record<string, unknown>;
    const changeEntries = Object.entries(changes);

    if (changeEntries.length === 0) {
      return (
        <pre style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.6)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          No changes specified
        </pre>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {changeEntries.map(([key, newValue]) => {
          const currentValue = studioData[key];
          const label = fieldLabels[key] || key;
          const currentStr = currentValue != null ? String(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue) : '(empty)';
          const newStr = newValue != null ? String(Array.isArray(newValue) ? (newValue as string[]).join(', ') : newValue) : '(empty)';
          const changed = currentStr !== newStr;

          return (
            <div key={key} style={{ fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 500, color: 'rgba(246, 237, 221, 0.6)', marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: changed ? 'rgba(229, 115, 115, 0.08)' : 'rgba(246, 237, 221, 0.03)',
                  border: `1px solid ${changed ? 'rgba(229, 115, 115, 0.2)' : 'rgba(246, 237, 221, 0.06)'}`,
                  color: changed ? '#e57373' : 'rgba(246, 237, 221, 0.5)',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                }}>
                  {currentStr}
                </div>
                <div style={{ color: 'rgba(246, 237, 221, 0.3)', alignSelf: 'center', fontSize: '0.75rem' }}>
                  {'->'}
                </div>
                <div style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: changed ? 'rgba(129, 199, 132, 0.08)' : 'rgba(246, 237, 221, 0.03)',
                  border: `1px solid ${changed ? 'rgba(129, 199, 132, 0.2)' : 'rgba(246, 237, 221, 0.06)'}`,
                  color: changed ? '#81c784' : 'rgba(246, 237, 221, 0.5)',
                  fontSize: '0.75rem',
                  wordBreak: 'break-all',
                }}>
                  {newStr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 400, color: '#f6eddd', letterSpacing: '-0.02em' }}>
              Studios Management
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.5)' }}>
              Manage studios, review claims and edit suggestions
            </p>
          </div>
          {activeTab === 'studios' && (
            <button
              onClick={openCreateModal}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#f6eddd',
                color: '#1a1a1a',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Studio
            </button>
          )}
        </div>
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
            <button
              onClick={handleExportCsv}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(246, 237, 221, 0.15)',
                background: 'rgba(246, 237, 221, 0.08)',
                color: '#f6eddd',
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginLeft: 'auto',
              }}
            >
              Export CSV
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
                    gridTemplateColumns: '32px 1fr 120px 60px 60px 60px 90px 110px',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.08)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'rgba(246, 237, 221, 0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={studios.length > 0 && selectedIds.size === studios.length}
                      onChange={toggleSelectAllStudios}
                      style={{ accentColor: '#81c784', cursor: 'pointer' }}
                    />
                  </div>
                  <div>Studio</div>
                  <div>City</div>
                  <div style={{ textAlign: 'center' }}>Rating</div>
                  <div style={{ textAlign: 'center' }}>Posts</div>
                  <div style={{ textAlign: 'center' }}>Claims</div>
                  <div style={{ textAlign: 'center' }}>Verified</div>
                  <div style={{ textAlign: 'center' }}>Actions</div>
                </div>

                {studios.map((studio) => (
                  <div
                    key={studio.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 120px 60px 60px 60px 90px 110px',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(246, 237, 221, 0.04)',
                      alignItems: 'center',
                      background: selectedIds.has(studio.id) ? 'rgba(129, 199, 132, 0.06)' : 'transparent',
                    }}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(studio.id)}
                        onChange={() => toggleSelectStudio(studio.id)}
                        style={{ accentColor: '#81c784', cursor: 'pointer' }}
                      />
                    </div>
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
                        disabled={actionLoading === studio.id}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          cursor: actionLoading === studio.id ? 'not-allowed' : 'pointer',
                          opacity: actionLoading === studio.id ? 0.5 : 1,
                          ...(studio.verified
                            ? { background: 'rgba(76, 175, 80, 0.15)', color: '#81c784' }
                            : { background: 'rgba(246, 237, 221, 0.06)', color: 'rgba(246, 237, 221, 0.45)' }),
                        }}
                      >
                        {studio.verified ? 'Verified' : 'Unverified'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(studio)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid rgba(246, 237, 221, 0.08)',
                          background: 'transparent',
                          color: 'rgba(246, 237, 221, 0.5)',
                          fontSize: '0.7rem',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudio(studio.id, studio.name)}
                        disabled={actionLoading === studio.id}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: '1px solid rgba(229, 115, 115, 0.3)',
                          background: 'transparent',
                          color: '#e57373',
                          fontSize: '0.7rem',
                          cursor: actionLoading === studio.id ? 'not-allowed' : 'pointer',
                          opacity: actionLoading === studio.id ? 0.5 : 1,
                        }}
                      >
                        Delete
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
                      disabled={actionLoading === claim.id}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(129, 199, 132, 0.3)',
                        background: 'rgba(129, 199, 132, 0.08)',
                        color: '#81c784',
                        fontSize: '0.8rem',
                        cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === claim.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === claim.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateClaimStatus(claim.id, 'rejected')}
                      disabled={actionLoading === claim.id}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(229, 115, 115, 0.3)',
                        background: 'rgba(229, 115, 115, 0.08)',
                        color: '#e57373',
                        fontSize: '0.8rem',
                        cursor: actionLoading === claim.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === claim.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === claim.id ? 'Saving...' : 'Reject'}
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
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(246, 237, 221, 0.45)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.5rem' }}>
                    Suggested Changes (Current vs Proposed)
                  </div>
                  {renderDiffView(suggestion)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(246, 237, 221, 0.35)', marginBottom: '0.75rem' }}>
                  Submitted: {new Date(suggestion.createdAt).toLocaleDateString()}
                </div>
                {suggestion.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateEditSuggestionStatus(suggestion.id, 'approved')}
                      disabled={actionLoading === suggestion.id}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(129, 199, 132, 0.3)',
                        background: 'rgba(129, 199, 132, 0.08)',
                        color: '#81c784',
                        fontSize: '0.8rem',
                        cursor: actionLoading === suggestion.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === suggestion.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === suggestion.id ? 'Saving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateEditSuggestionStatus(suggestion.id, 'rejected')}
                      disabled={actionLoading === suggestion.id}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(229, 115, 115, 0.3)',
                        background: 'rgba(229, 115, 115, 0.08)',
                        color: '#e57373',
                        fontSize: '0.8rem',
                        cursor: actionLoading === suggestion.id ? 'not-allowed' : 'pointer',
                        opacity: actionLoading === suggestion.id ? 0.5 : 1,
                      }}
                    >
                      {actionLoading === suggestion.id ? 'Saving...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Studio Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a',
              borderRadius: 16,
              border: '1px solid rgba(246, 237, 221, 0.08)',
              padding: 32,
              width: 500,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f6eddd', margin: '0 0 20px' }}>
              {editingStudioId ? 'Edit Studio' : 'Add Studio'}
            </h2>

            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={studioForm.name}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, name: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>City *</label>
            <input
              type="text"
              value={studioForm.city}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, city: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Address</label>
            <input
              type="text"
              value={studioForm.address}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, address: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input
                  type="text"
                  value={studioForm.latitude}
                  onChange={(e) => setStudioForm((prev) => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g. 19.076"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input
                  type="text"
                  value={studioForm.longitude}
                  onChange={(e) => setStudioForm((prev) => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g. 72.877"
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>Phone Number</label>
            <input
              type="text"
              value={studioForm.phoneNumber}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Website</label>
            <input
              type="text"
              value={studioForm.website}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://..."
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Amenities (comma-separated)</label>
            <input
              type="text"
              value={studioForm.amenities}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, amenities: e.target.value }))}
              placeholder="parking, showers, lockers"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            <label style={labelStyle}>Rating</label>
            <input
              type="text"
              value={studioForm.rating}
              onChange={(e) => setStudioForm((prev) => ({ ...prev, rating: e.target.value }))}
              placeholder="e.g. 4.5"
              style={{ ...inputStyle, marginBottom: 20 }}
            />

            {modalMessage && (
              <p style={{ fontSize: 13, color: '#e57373', marginBottom: 12 }}>{modalMessage}</p>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(246, 237, 221, 0.08)',
                  background: 'transparent',
                  color: 'rgba(246, 237, 221, 0.5)',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                disabled={modalSaving}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f6eddd',
                  color: '#1a1a1a',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: modalSaving ? 'not-allowed' : 'pointer',
                  opacity: modalSaving ? 0.5 : 1,
                }}
              >
                {modalSaving ? 'Saving...' : editingStudioId ? 'Update Studio' : 'Create Studio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && activeTab === 'studios' && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(246, 237, 221, 0.15)',
            borderRadius: '12px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#f6eddd', fontWeight: 500 }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => handleBulkAction('verify')}
            disabled={bulkLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(129, 199, 132, 0.3)',
              background: 'rgba(129, 199, 132, 0.1)',
              color: '#81c784',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: bulkLoading ? 'not-allowed' : 'pointer',
              opacity: bulkLoading ? 0.5 : 1,
            }}
          >
            Verify
          </button>
          <button
            onClick={() => handleBulkAction('delete')}
            disabled={bulkLoading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(229, 115, 115, 0.3)',
              background: 'rgba(229, 115, 115, 0.1)',
              color: '#e57373',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: bulkLoading ? 'not-allowed' : 'pointer',
              opacity: bulkLoading ? 0.5 : 1,
            }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid rgba(246, 237, 221, 0.1)',
              background: 'transparent',
              color: 'rgba(246, 237, 221, 0.5)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

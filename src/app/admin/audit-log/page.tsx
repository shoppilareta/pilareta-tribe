'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuditLogEntry {
  id: string;
  adminId: string;
  admin: { email: string; firstName: string | null };
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  const entityTypes = [
    '', 'exercise', 'studio', 'studio_claim', 'edit_suggestion',
    'user', 'post', 'comment', 'banner', 'notification', 'settings',
  ];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '50');
      if (actionFilter) params.set('action', actionFilter);
      if (entityTypeFilter) params.set('entityType', entityTypeFilter);

      const res = await fetch(`/api/admin/audit-log?${params}`);
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const inputStyle = {
    background: 'rgba(70, 74, 60, 0.3)',
    border: '1px solid rgba(246, 237, 221, 0.2)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    color: '#f6eddd',
    fontSize: '0.8125rem',
    minHeight: '44px',
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: '#1a1a1a',
        padding: '1.5rem 1rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <a
              href="/admin"
              style={{
                color: 'rgba(246, 237, 221, 0.5)',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Admin
            </a>
            <span style={{ color: 'rgba(246, 237, 221, 0.3)' }}>/</span>
            <span style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.875rem' }}>
              Audit Log
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 400,
              color: '#f6eddd',
              letterSpacing: '-0.02em',
            }}
          >
            Admin Audit Log
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              color: 'rgba(246, 237, 221, 0.5)',
            }}
          >
            Track all admin actions across the platform
          </p>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.5)',
              }}
            >
              Action
            </label>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="Filter by action..."
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.75rem',
                color: 'rgba(246, 237, 221, 0.5)',
              }}
            >
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                handleFilterChange();
              }}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">All types</option>
              {entityTypes.filter(Boolean).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
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
            }}
          >
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(246, 237, 221, 0.5)' }}>
            Loading audit log...
          </div>
        ) : logs.length === 0 ? (
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
            No audit log entries found.
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              borderRadius: '0.75rem',
              border: '1px solid rgba(246, 237, 221, 0.08)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8125rem',
                minWidth: '700px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'rgba(70, 74, 60, 0.3)',
                    borderBottom: '1px solid rgba(246, 237, 221, 0.1)',
                  }}
                >
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Admin</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Entity Type</th>
                  <th style={thStyle}>Entity ID</th>
                  <th style={thStyle}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(246, 237, 221, 0.05)',
                    }}
                  >
                    <td style={tdStyle}>
                      {new Date(log.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ color: '#f6eddd' }}>
                        {log.admin.firstName || ''}
                      </div>
                      <div style={{ color: 'rgba(246, 237, 221, 0.4)', fontSize: '0.75rem' }}>
                        {log.admin.email}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          background: getActionColor(log.action).bg,
                          color: getActionColor(log.action).text,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'rgba(246, 237, 221, 0.7)' }}>
                        {log.entityType}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.6875rem',
                          color: 'rgba(246, 237, 221, 0.5)',
                          wordBreak: 'break-all',
                          maxWidth: '120px',
                          display: 'inline-block',
                        }}
                        title={log.entityId}
                      >
                        {log.entityId.length > 20
                          ? log.entityId.substring(0, 20) + '...'
                          : log.entityId}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {log.details ? (
                        <pre
                          style={{
                            margin: 0,
                            fontSize: '0.6875rem',
                            color: 'rgba(246, 237, 221, 0.45)',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxWidth: '250px',
                          }}
                        >
                          {JSON.stringify(log.details, null, 1)}
                        </pre>
                      ) : (
                        <span style={{ color: 'rgba(246, 237, 221, 0.25)' }}>--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
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
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  color: 'rgba(246, 237, 221, 0.6)',
  fontWeight: 500,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  color: 'rgba(246, 237, 221, 0.7)',
  verticalAlign: 'top',
};

function getActionColor(action: string): { bg: string; text: string } {
  if (action.includes('create') || action.includes('approve') || action.includes('feature')) {
    return { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgba(34, 197, 94, 0.9)' };
  }
  if (action.includes('delete') || action.includes('reject') || action.includes('ban') || action.includes('deactivate') || action.includes('cancel')) {
    return { bg: 'rgba(239, 68, 68, 0.15)', text: 'rgba(239, 68, 68, 0.9)' };
  }
  if (action.includes('update') || action.includes('send')) {
    return { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgba(59, 130, 246, 0.9)' };
  }
  if (action.includes('schedule')) {
    return { bg: 'rgba(234, 179, 8, 0.15)', text: 'rgba(234, 179, 8, 0.9)' };
  }
  return { bg: 'rgba(246, 237, 221, 0.08)', text: 'rgba(246, 237, 221, 0.7)' };
}

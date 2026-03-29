'use client';

import { useState, useEffect, useCallback } from 'react';

interface AdminNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  segment: string;
  scheduledFor: string | null;
  status: string;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
}

interface SendResult {
  totalSent: number;
  successCount: number;
  failureCount: number;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dataJson, setDataJson] = useState('');
  const [segment, setSegment] = useState<'all' | 'active'>('all');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/';
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data.notifications);
    } catch {
      setError('Failed to load notification history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setError(null);
    setLastResult(null);

    try {
      // Validate data JSON if provided
      let parsedData: Record<string, unknown> | undefined;
      if (dataJson.trim()) {
        try {
          parsedData = JSON.parse(dataJson.trim());
        } catch {
          setError('Invalid JSON in the data field');
          setSending(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        data: parsedData,
        segment,
      };

      if (sendMode === 'schedule' && scheduledFor) {
        payload.scheduledFor = new Date(scheduledFor).toISOString();
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send notification');
      }

      const result = await res.json();
      setLastResult(result.result);

      // Reset form
      setTitle('');
      setBody('');
      setDataJson('');
      setSegment('all');
      setSendMode('now');
      setScheduledFor('');

      // Refresh history
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleScheduledAction = async (notificationId: string, action: 'send_now' | 'cancel') => {
    setActionLoading(notificationId);
    setError(null);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${action} notification`);
      }

      const result = await res.json();
      if (result.result) {
        setLastResult(result.result);
      }

      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} notification`);
    } finally {
      setActionLoading(null);
    }
  };

  const canSend = title.trim() && body.trim() && !sending && (sendMode === 'now' || scheduledFor);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)',
          color: 'rgba(234, 179, 8, 0.9)',
          label: 'Scheduled',
        };
      case 'cancelled':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'rgba(239, 68, 68, 0.3)',
          color: 'rgba(239, 68, 68, 0.8)',
          label: 'Cancelled',
        };
      default:
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          border: 'rgba(34, 197, 94, 0.3)',
          color: 'rgba(34, 197, 94, 0.8)',
          label: 'Sent',
        };
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: '#1a1a1a',
        padding: '1.5rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            marginBottom: '2rem',
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
              Push Notifications
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
            Push Notifications
          </h1>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.875rem',
              color: 'rgba(246, 237, 221, 0.6)',
            }}
          >
            Send or schedule push notifications to mobile app users
          </p>
        </div>

        {/* Success result banner */}
        {lastResult && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '0.75rem',
              color: 'rgba(34, 197, 94, 0.9)',
              fontSize: '0.875rem',
            }}
          >
            {lastResult.totalSent > 0
              ? `Notification sent to ${lastResult.totalSent} recipient${lastResult.totalSent !== 1 ? 's' : ''}.`
              : 'Notification scheduled successfully.'}
            {lastResult.failureCount > 0 && (
              <span style={{ color: 'rgba(239, 68, 68, 0.9)', marginLeft: '0.5rem' }}>
                {lastResult.failureCount} failed.
              </span>
            )}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
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
                lineHeight: 1,
                padding: '0 0.25rem',
              }}
            >
              x
            </button>
          </div>
        )}

        {/* Compose form */}
        <div
          style={{
            background: 'rgba(70, 74, 60, 0.2)',
            border: '1px solid rgba(246, 237, 221, 0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              margin: '0 0 1.25rem',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#f6eddd',
              letterSpacing: '-0.01em',
            }}
          >
            Compose Notification
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  fontWeight: 500,
                }}
              >
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                maxLength={100}
                style={{
                  background: 'rgba(70, 74, 60, 0.3)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#f6eddd',
                  fontSize: '0.875rem',
                  width: '100%',
                }}
              />
            </div>

            {/* Body */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  fontWeight: 500,
                }}
              >
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message"
                rows={3}
                maxLength={500}
                style={{
                  background: 'rgba(70, 74, 60, 0.3)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#f6eddd',
                  fontSize: '0.875rem',
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Data JSON (optional) */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  fontWeight: 500,
                }}
              >
                Data / Link (optional JSON)
              </label>
              <textarea
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                placeholder='e.g. {"screen": "track"} or {"url": "https://..."}'
                rows={2}
                style={{
                  background: 'rgba(70, 74, 60, 0.3)',
                  border: '1px solid rgba(246, 237, 221, 0.2)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#f6eddd',
                  fontSize: '0.8125rem',
                  width: '100%',
                  resize: 'vertical',
                  fontFamily: 'monospace',
                }}
              />
              <p
                style={{
                  margin: '0.375rem 0 0',
                  fontSize: '0.75rem',
                  color: 'rgba(246, 237, 221, 0.4)',
                }}
              >
                Optional JSON payload sent with the notification. Use {'"screen": "track"'} to deep-link.
              </p>
            </div>

            {/* Segment */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  fontWeight: 500,
                }}
              >
                Audience
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(['all', 'active'] as const).map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setSegment(seg)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '9999px',
                      border: segment === seg
                        ? '1px solid rgba(246, 237, 221, 0.6)'
                        : '1px solid rgba(246, 237, 221, 0.2)',
                      background: segment === seg
                        ? 'rgba(246, 237, 221, 0.1)'
                        : 'transparent',
                      color: segment === seg
                        ? '#f6eddd'
                        : 'rgba(246, 237, 221, 0.5)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {seg === 'all' ? 'All Users' : 'Active (last 30 days)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Mode: Now vs Schedule */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.375rem',
                  fontSize: '0.8125rem',
                  color: 'rgba(246, 237, 221, 0.7)',
                  fontWeight: 500,
                }}
              >
                When to Send
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {(['now', 'schedule'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSendMode(mode)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '9999px',
                      border: sendMode === mode
                        ? '1px solid rgba(246, 237, 221, 0.6)'
                        : '1px solid rgba(246, 237, 221, 0.2)',
                      background: sendMode === mode
                        ? 'rgba(246, 237, 221, 0.1)'
                        : 'transparent',
                      color: sendMode === mode
                        ? '#f6eddd'
                        : 'rgba(246, 237, 221, 0.5)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {mode === 'now' ? 'Send Now' : 'Schedule'}
                  </button>
                ))}
              </div>
            </div>

            {/* Datetime picker for scheduling */}
            {sendMode === 'schedule' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.375rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(246, 237, 221, 0.7)',
                    fontWeight: 500,
                  }}
                >
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{
                    background: 'rgba(70, 74, 60, 0.3)',
                    border: '1px solid rgba(246, 237, 221, 0.2)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: '#f6eddd',
                    fontSize: '0.875rem',
                    width: '100%',
                    colorScheme: 'dark',
                  }}
                />
                <p
                  style={{
                    margin: '0.375rem 0 0',
                    fontSize: '0.75rem',
                    color: 'rgba(234, 179, 8, 0.7)',
                  }}
                >
                  Note: Scheduled notifications require a cron job to auto-send. Use the &quot;Send Now&quot; button on a scheduled notification to send manually.
                </p>
              </div>
            )}

            {/* Send button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!canSend}
                  style={{
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: canSend ? '#f6eddd' : 'rgba(246, 237, 221, 0.2)',
                    color: canSend ? '#202219' : 'rgba(246, 237, 221, 0.4)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: canSend ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                  }}
                >
                  {sendMode === 'now' ? 'Send Notification' : 'Schedule Notification'}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(246, 237, 221, 0.7)',
                    }}
                  >
                    {sendMode === 'now'
                      ? `Send to ${segment === 'all' ? 'all users' : 'active users'}?`
                      : `Schedule for ${new Date(scheduledFor).toLocaleString()}?`}
                  </span>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    style={{
                      padding: '0.625rem 1.5rem',
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'rgba(34, 197, 94, 0.8)',
                      color: '#fff',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: sending ? 'not-allowed' : 'pointer',
                      opacity: sending ? 0.6 : 1,
                      minHeight: '44px',
                    }}
                  >
                    {sending ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(246, 237, 221, 0.2)',
                      background: 'transparent',
                      color: 'rgba(246, 237, 221, 0.6)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div>
          <h2
            style={{
              margin: '0 0 1rem',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#f6eddd',
              letterSpacing: '-0.01em',
            }}
          >
            Notification History
          </h2>

          {loading ? (
            <p style={{ color: 'rgba(246, 237, 221, 0.5)', fontSize: '0.875rem' }}>
              Loading history...
            </p>
          ) : notifications.length === 0 ? (
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
              No notifications yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((notif) => {
                const badge = getStatusBadge(notif.status);
                return (
                  <div
                    key={notif.id}
                    style={{
                      background: 'rgba(70, 74, 60, 0.15)',
                      border: '1px solid rgba(246, 237, 221, 0.08)',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.375rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '0.9375rem',
                          fontWeight: 500,
                          color: '#f6eddd',
                        }}
                      >
                        {notif.title}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                        {/* Status badge */}
                        <span
                          style={{
                            padding: '0.2rem 0.625rem',
                            borderRadius: '9999px',
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {badge.label}
                        </span>
                        <span
                          style={{
                            padding: '0.2rem 0.625rem',
                            borderRadius: '9999px',
                            background: 'rgba(246, 237, 221, 0.08)',
                            color: 'rgba(246, 237, 221, 0.6)',
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {notif.segment}
                        </span>
                        {notif.status === 'sent' && (
                          <span
                            style={{
                              padding: '0.2rem 0.625rem',
                              borderRadius: '9999px',
                              background: 'rgba(246, 237, 221, 0.08)',
                              color: 'rgba(246, 237, 221, 0.6)',
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                            }}
                          >
                            {notif.recipientCount} recipient{notif.recipientCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8125rem',
                        color: 'rgba(246, 237, 221, 0.6)',
                        lineHeight: 1.5,
                      }}
                    >
                      {notif.body}
                    </p>
                    {notif.data && (
                      <pre
                        style={{
                          margin: '0.5rem 0 0',
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: '0.375rem',
                          fontSize: '0.6875rem',
                          color: 'rgba(246, 237, 221, 0.5)',
                          overflow: 'auto',
                          fontFamily: 'monospace',
                        }}
                      >
                        {JSON.stringify(notif.data, null, 2)}
                      </pre>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: 'rgba(246, 237, 221, 0.35)',
                        }}
                      >
                        {notif.scheduledFor && notif.status === 'scheduled'
                          ? `Scheduled for ${new Date(notif.scheduledFor).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : new Date(notif.sentAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                      </p>
                      {/* Action buttons for scheduled notifications */}
                      {notif.status === 'scheduled' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleScheduledAction(notif.id, 'send_now')}
                            disabled={actionLoading === notif.id}
                            style={{
                              padding: '0.375rem 0.875rem',
                              borderRadius: '9999px',
                              border: 'none',
                              background: 'rgba(34, 197, 94, 0.8)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: actionLoading === notif.id ? 'not-allowed' : 'pointer',
                              opacity: actionLoading === notif.id ? 0.6 : 1,
                              minHeight: '32px',
                            }}
                          >
                            {actionLoading === notif.id ? '...' : 'Send Now'}
                          </button>
                          <button
                            onClick={() => handleScheduledAction(notif.id, 'cancel')}
                            disabled={actionLoading === notif.id}
                            style={{
                              padding: '0.375rem 0.875rem',
                              borderRadius: '9999px',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              background: 'transparent',
                              color: 'rgba(239, 68, 68, 0.8)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: actionLoading === notif.id ? 'not-allowed' : 'pointer',
                              opacity: actionLoading === notif.id ? 0.6 : 1,
                              minHeight: '32px',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderLineItem {
  title: string;
  quantity: number;
  originalTotalPrice: { amount: string; currencyCode: string };
  image?: { url: string; altText: string | null };
  variantTitle?: string;
}

interface Order {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { nodes: OrderLineItem[] };
  fulfillments: { status: string; trackingInfo: { number: string; url: string }[] }[];
  cancelledAt: string | null;
  statusPageUrl: string;
}

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(parseFloat(amount));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'paid': return 'rgba(34, 197, 94, 0.8)';
    case 'fulfilled': return 'rgba(34, 197, 94, 0.8)';
    case 'unfulfilled': return 'rgba(234, 179, 8, 0.8)';
    case 'partially_fulfilled': return 'rgba(234, 179, 8, 0.8)';
    case 'refunded': return 'rgba(239, 68, 68, 0.8)';
    case 'cancelled': return 'rgba(239, 68, 68, 0.8)';
    default: return 'rgba(246, 237, 221, 0.6)';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/account" style={{ color: 'rgba(246, 237, 221, 0.6)', textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 style={{ margin: 0 }}>Your Orders</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(246, 237, 221, 0.6)' }}>
          Loading orders...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)' }}>{error}</p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.4)', marginTop: '0.5rem' }}>
            Please sign in to view your orders.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)' }}>No orders yet</p>
          <Link href="/shop" style={{ color: '#f59e0b', textDecoration: 'none', fontSize: '0.875rem' }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card"
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#f6eddd' }}>Order {order.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)' }}>
                    {formatDate(order.processedAt)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#f6eddd' }}>
                    {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                  </p>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(246, 237, 221, 0.1)',
                    color: getStatusColor(order.fulfillmentStatus || order.financialStatus),
                    textTransform: 'capitalize',
                  }}>
                    {order.cancelledAt ? 'Cancelled' : order.fulfillmentStatus?.replace(/_/g, ' ') || order.financialStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.lineItems.nodes.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {item.image && (
                      <img
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', background: 'rgba(246,237,221,0.05)' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#f6eddd' }}>{item.title}</p>
                      {item.variantTitle && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>{item.variantTitle}</p>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.7)' }}>
                      x{item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tracking */}
              {order.fulfillments.length > 0 && order.fulfillments.some(f => f.trackingInfo.length > 0) && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(246, 237, 221, 0.1)' }}>
                  {order.fulfillments.flatMap(f => f.trackingInfo).map((tracking, idx) => (
                    <a
                      key={idx}
                      href={tracking.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: '#f59e0b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      Track shipment ({tracking.number})
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}

              {/* Status page link */}
              {order.statusPageUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a
                    href={order.statusPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.8rem', color: 'rgba(246, 237, 221, 0.5)', textDecoration: 'none' }}
                  >
                    View order details on Shopify
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

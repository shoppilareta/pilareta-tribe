import { apiFetch } from './client';

interface OrderLineItem {
  title: string;
  quantity: number;
  originalTotalPrice: { amount: string; currencyCode: string };
  image?: { url: string; altText: string | null };
  variantTitle?: string;
  variant?: { id: string } | null;
}

export interface ShopifyOrder {
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

export async function getOrders(): Promise<{ orders: ShopifyOrder[] }> {
  return apiFetch('/api/orders');
}

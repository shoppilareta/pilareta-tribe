import { prisma } from '@/lib/db';
import { SHOPIFY_CUSTOMER_API_VERSION } from '@/lib/shopify/client';

const SHOP_ID = process.env.SHOPIFY_SHOP_ID || '';

interface OrderLineItem {
  title: string;
  quantity: number;
  originalTotalPrice: { amount: string; currencyCode: string };
  image?: { url: string; altText: string | null };
  variantTitle?: string;
}

interface FulfillmentInfo {
  status: string;
  trackingInfo: { number: string; url: string }[];
  estimatedDeliveryAt?: string;
}

interface ShopifyOrder {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: { amount: string; currencyCode: string };
  subtotalPrice: { amount: string; currencyCode: string };
  totalShippingPrice: { amount: string; currencyCode: string };
  totalTax: { amount: string; currencyCode: string };
  lineItems: { nodes: OrderLineItem[] };
  fulfillments: FulfillmentInfo[];
  cancelledAt: string | null;
  statusPageUrl: string;
}

export async function getCustomerOrders(userId: string): Promise<ShopifyOrder[]> {
  if (!SHOP_ID) {
    console.error('SHOPIFY_SHOP_ID environment variable is not set');
    throw new Error('Shop configuration error');
  }

  // Get the user's active session with access token
  const session = await prisma.session.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!session?.accessToken) {
    throw new Error('No active session found');
  }

  const query = `
    query {
      customer {
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          nodes {
            id
            name
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice { amount currencyCode }
            subtotalPrice { amount currencyCode }
            totalShippingPrice { amount currencyCode }
            totalTax { amount currencyCode }
            lineItems(first: 10) {
              nodes {
                title
                quantity
                originalTotalPrice { amount currencyCode }
                image { url altText }
                variantTitle
              }
            }
            fulfillments {
              status
              trackingInfo { number url }
            }
            cancelledAt
            statusPageUrl
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://shopify.com/${SHOP_ID}/account/customer/api/${SHOPIFY_CUSTOMER_API_VERSION}/graphql`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.accessToken,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Customer API error:', response.status, text);
    throw new Error(`Customer API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('Customer API GraphQL errors:', data.errors);
    throw new Error('Failed to fetch orders');
  }

  return data.data?.customer?.orders?.nodes || [];
}

export type { ShopifyOrder, OrderLineItem, FulfillmentInfo };

import { SHOPIFY_CUSTOMER_API_VERSION, SHOPIFY_API_VERSION } from '@/lib/shopify/client';

const SHOP_ID = process.env.SHOPIFY_SHOP_ID || '';
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'pilaretatribe.myshopify.com';
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '';

interface OrderLineItem {
  title: string;
  quantity: number;
  originalTotalPrice: { amount: string; currencyCode: string };
  image?: { url: string; altText: string | null };
  variantTitle?: string;
  currentQuantity?: number;
  variant?: { id: string } | null;
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

export async function getCustomerOrders(accessToken: string): Promise<ShopifyOrder[]> {
  if (!SHOP_ID) {
    console.error('SHOPIFY_SHOP_ID environment variable is not set');
    throw new Error('Shop configuration error');
  }

  if (!accessToken) {
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
                currentQuantity
                variant {
                  id
                }
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
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Customer API error:', response.status, text);
    console.error('Customer API request details:', {
      url: `https://shopify.com/${SHOP_ID}/account/customer/api/${SHOPIFY_CUSTOMER_API_VERSION}/graphql`,
      tokenPrefix: accessToken.slice(0, 10) + '...',
      responseStatus: response.status,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    });
    throw new Error(`Customer API error: ${response.status} - ${text.slice(0, 200)}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('Customer API GraphQL errors:', JSON.stringify(data.errors, null, 2));
    throw new Error(`Customer API GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  return data.data?.customer?.orders?.nodes || [];
}

/**
 * Fetch orders via Shopify Admin API using customer email.
 * Requires SHOPIFY_ADMIN_ACCESS_TOKEN to be configured.
 * This is a fallback when the Customer Account API is unavailable (404).
 */
export async function getOrdersViaAdminApi(customerEmail: string): Promise<ShopifyOrder[]> {
  if (!SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error('Admin API not configured');
  }

  const query = `
    {
      orders(first: 20, query: "email:${customerEmail}", sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet { shopMoney { amount currencyCode } }
            displayFulfillmentStatus
            displayFinancialStatus
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant { id }
                  image { url }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error('Admin API error:', response.status, text);
    throw new Error(`Admin API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('Admin API GraphQL errors:', JSON.stringify(data.errors, null, 2));
    throw new Error(`Admin API GraphQL error: ${JSON.stringify(data.errors)}`);
  }

  // Transform Admin API response to match Customer API ShopifyOrder format
  const edges = data.data?.orders?.edges || [];
  return edges.map((edge: { node: Record<string, unknown> }) => {
    const node = edge.node as {
      id: string;
      name: string;
      createdAt: string;
      totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
      displayFulfillmentStatus: string;
      displayFinancialStatus: string;
      lineItems: { edges: { node: { title: string; quantity: number; variant: { id: string } | null; image: { url: string } | null } }[] };
    };
    const totalPrice = node.totalPriceSet?.shopMoney || { amount: '0', currencyCode: 'INR' };
    return {
      id: node.id,
      name: node.name,
      processedAt: node.createdAt,
      financialStatus: (node.displayFinancialStatus || '').toLowerCase(),
      fulfillmentStatus: (node.displayFulfillmentStatus || '').toLowerCase(),
      totalPrice,
      subtotalPrice: totalPrice,
      totalShippingPrice: { amount: '0', currencyCode: totalPrice.currencyCode },
      totalTax: { amount: '0', currencyCode: totalPrice.currencyCode },
      lineItems: {
        nodes: (node.lineItems?.edges || []).map((e: { node: { title: string; quantity: number; variant: { id: string } | null; image: { url: string } | null } }) => ({
          title: e.node.title,
          quantity: e.node.quantity,
          originalTotalPrice: { amount: '0', currencyCode: totalPrice.currencyCode },
          image: e.node.image ? { url: e.node.image.url, altText: null } : undefined,
          variant: e.node.variant,
        })),
      },
      fulfillments: [],
      cancelledAt: null,
      statusPageUrl: '',
    } as ShopifyOrder;
  });
}

export function isAdminApiConfigured(): boolean {
  return !!SHOPIFY_ADMIN_ACCESS_TOKEN;
}

export type { ShopifyOrder, OrderLineItem, FulfillmentInfo };

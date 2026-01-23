// Shopify Storefront API Cart Mutations

import { shopifyFetch } from './client';
import type { ShopifyCart, ShopifyMoney, ShopifyImage } from './types';

// Cart fragment for reuse
const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

// Create cart mutation
const CREATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Add lines to cart mutation
const ADD_TO_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Update cart lines mutation
const UPDATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Remove lines from cart mutation
const REMOVE_FROM_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Get cart query
const GET_CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

// Response types
interface RawCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: ShopifyMoney;
    image?: ShopifyImage;
    product: {
      title: string;
      handle: string;
    };
  };
}

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney;
  };
  lines: {
    edges: {
      node: RawCartLine;
    }[];
  };
}

interface CartMutationResponse {
  cart: RawCart | null;
  userErrors: {
    field: string[];
    message: string;
  }[];
}

// Transform raw cart to our format
function transformCart(raw: RawCart): ShopifyCart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map((edge) => ({
      id: edge.node.id,
      quantity: edge.node.quantity,
      merchandise: {
        id: edge.node.merchandise.id,
        title: edge.node.merchandise.title,
        price: edge.node.merchandise.priceV2,
        image: edge.node.merchandise.image,
        product: edge.node.merchandise.product,
      },
    })),
  };
}

// Create a new cart with items
export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartCreate: CartMutationResponse }>(
    CREATE_CART_MUTATION,
    { lines }
  );

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }

  if (!data.cartCreate.cart) {
    throw new Error('Failed to create cart');
  }

  return transformCart(data.cartCreate.cart);
}

// Add items to existing cart
export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesAdd: CartMutationResponse }>(
    ADD_TO_CART_MUTATION,
    { cartId, lines }
  );

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }

  if (!data.cartLinesAdd.cart) {
    throw new Error('Failed to add to cart');
  }

  return transformCart(data.cartLinesAdd.cart);
}

// Update cart line quantities
export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesUpdate: CartMutationResponse }>(
    UPDATE_CART_MUTATION,
    { cartId, lines }
  );

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }

  if (!data.cartLinesUpdate.cart) {
    throw new Error('Failed to update cart');
  }

  return transformCart(data.cartLinesUpdate.cart);
}

// Remove items from cart
export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{ cartLinesRemove: CartMutationResponse }>(
    REMOVE_FROM_CART_MUTATION,
    { cartId, lineIds }
  );

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }

  if (!data.cartLinesRemove.cart) {
    throw new Error('Failed to remove from cart');
  }

  return transformCart(data.cartLinesRemove.cart);
}

// Get existing cart
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>(GET_CART_QUERY, {
    cartId,
  });

  if (!data.cart) {
    return null;
  }

  return transformCart(data.cart);
}

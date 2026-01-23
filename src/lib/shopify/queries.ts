// Shopify Storefront API GraphQL Queries

import { shopifyFetch } from './client';
import type { ShopifyProduct, RawShopifyProduct, ProductsResponse } from './types';

// Product fragment for reuse
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          priceV2 {
            amount
            currencyCode
          }
          compareAtPriceV2 {
            amount
            currencyCode
          }
          image {
            url
            altText
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

// Get all products
const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          ...ProductFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// Get single product by handle
const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
`;

// Transform raw Shopify product to our format
function transformProduct(raw: RawShopifyProduct): ShopifyProduct {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    availableForSale: raw.availableForSale,
    tags: raw.tags,
    priceRange: raw.priceRange,
    featuredImage: raw.featuredImage,
    images: raw.images.edges.map((edge) => edge.node),
    variants: raw.variants.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      availableForSale: edge.node.availableForSale,
      price: edge.node.priceV2,
      compareAtPrice: edge.node.compareAtPriceV2,
      image: edge.node.image,
      selectedOptions: edge.node.selectedOptions,
    })),
  };
}

// Fetch all products (with pagination)
export async function getProducts(limit: number = 20): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<ProductsResponse>(GET_PRODUCTS_QUERY, {
    first: limit,
  });

  return data.products.edges.map((edge) => transformProduct(edge.node));
}

// Fetch products with pagination
export async function getProductsPaginated(
  first: number = 20,
  after?: string
): Promise<{
  products: ShopifyProduct[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  const data = await shopifyFetch<ProductsResponse>(GET_PRODUCTS_QUERY, {
    first,
    after,
  });

  return {
    products: data.products.edges.map((edge) => transformProduct(edge.node)),
    hasNextPage: data.products.pageInfo.hasNextPage,
    endCursor: data.products.pageInfo.endCursor,
  };
}

// Fetch single product by handle
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{ productByHandle: RawShopifyProduct | null }>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );

  if (!data.productByHandle) {
    return null;
  }

  return transformProduct(data.productByHandle);
}

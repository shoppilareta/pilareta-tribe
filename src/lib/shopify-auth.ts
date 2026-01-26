import crypto from 'crypto';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'pilareta.com';
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || '';
const SHOPIFY_ACCOUNTS_MODE = process.env.SHOPIFY_ACCOUNTS_MODE || 'new';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tribe.pilareta.com';

// PKCE utilities
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function sha256(buffer: string): Buffer {
  return crypto.createHash('sha256').update(buffer).digest();
}

export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  return base64URLEncode(sha256(verifier));
}

export function generateState(): string {
  return base64URLEncode(crypto.randomBytes(16));
}

// Get shop ID from domain (for new customer accounts)
export async function getShopId(): Promise<string> {
  // The shop ID can be found in the Shopify admin URL or via API
  // For now, we'll derive it from the store domain
  // In production, you'd want to configure this as an env var
  return process.env.SHOPIFY_SHOP_ID || '';
}

// OpenID Configuration discovery
interface OpenIDConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
}

let cachedConfig: OpenIDConfig | null = null;

export async function discoverEndpoints(): Promise<OpenIDConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Use the store domain to discover OpenID configuration
  const discoveryUrl = `https://${SHOPIFY_STORE_DOMAIN}/.well-known/openid-configuration`;

  const res = await fetch(discoveryUrl);
  if (!res.ok) {
    throw new Error(`Failed to discover OpenID configuration: ${res.statusText}`);
  }

  const config: OpenIDConfig = await res.json();
  cachedConfig = config;
  return config;
}

// Build authorization URL for OAuth2 + PKCE (New Customer Accounts)
export async function buildAuthorizationUrl(
  codeVerifier: string,
  state: string
): Promise<string> {
  const config = await discoverEndpoints();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const redirectUri = `${APP_URL}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'openid email customer-account-api:full',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  // Use discovered authorization endpoint
  return `${config.authorization_endpoint}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const config = await discoverEndpoints();
  const redirectUri = `${APP_URL}/api/auth/callback`;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SHOPIFY_CLIENT_ID,
    redirect_uri: redirectUri,
    code: code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(config.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return res.json();
}

// Decode JWT ID token to get customer info
export function decodeIdToken(idToken: string): {
  sub: string; // Shopify customer ID
  email: string;
  email_verified?: boolean;
  given_name?: string; // First name (OIDC standard claim)
  family_name?: string; // Last name (OIDC standard claim)
} {
  const [, payload] = idToken.split('.');
  const decoded = Buffer.from(payload, 'base64').toString();
  return JSON.parse(decoded);
}

// Classic Storefront API login (fallback)
export async function classicLogin(email: string, password: string): Promise<{
  accessToken: string;
  expiresAt: string;
} | null> {
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!storefrontAccessToken) {
    throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured');
  }

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: { email, password },
      },
    }),
  });

  if (!res.ok) {
    throw new Error('Storefront API request failed');
  }

  const data = await res.json();
  const result = data.data?.customerAccessTokenCreate;

  if (result?.customerUserErrors?.length > 0) {
    return null;
  }

  return result?.customerAccessToken || null;
}

// Get customer info from Storefront API (classic mode)
export async function getCustomerInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
} | null> {
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!storefrontAccessToken) {
    throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured');
  }

  const query = `
    query {
      customer(customerAccessToken: "${accessToken}") {
        id
        email
        firstName
        lastName
      }
    }
  `;

  const res = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data?.customer || null;
}

export function isNewAccountsMode(): boolean {
  return SHOPIFY_ACCOUNTS_MODE === 'new';
}

// Fetch customer details from Customer Account API (New Customer Accounts)
export async function fetchCustomerFromAccountApi(accessToken: string): Promise<{
  firstName?: string;
  lastName?: string;
} | null> {
  try {
    const query = `
      query {
        customer {
          firstName
          lastName
        }
      }
    `;

    const res = await fetch(`https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/2024-07/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      console.error('Customer Account API error:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.data?.customer || null;
  } catch (error) {
    console.error('Error fetching customer from Account API:', error);
    return null;
  }
}

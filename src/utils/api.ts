import { GoogleAuth } from 'google-auth-library';

// The URL of the Cloud Run function acting as the target audience for OIDC
const TARGET_AUDIENCE = 'https://api-jwiz3cw7wq-uc.a.run.app';
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:5001/worldcup26-ioextended/us-central1/api'
  : TARGET_AUDIENCE;

let auth: GoogleAuth | null = null;

async function getIdToken(): Promise<string | null> {
  if (process.env.NODE_ENV === 'development') return null;
  
  if (!auth) {
    // In production, this will automatically use the Default Compute Service Account
    auth = new GoogleAuth();
  }
  
  try {
    const client = await auth.getIdTokenClient(TARGET_AUDIENCE);
    // client.idTokenProvider is an internal mechanism, a cleaner way is:
    const token = await client.idTokenProvider.fetchIdToken(TARGET_AUDIENCE);
    return token;
  } catch (error) {
    console.error("Error fetching ID token for service-to-service auth:", error);
    return null;
  }
}

export async function fetchSecureApi(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const idToken = await getIdToken();
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store', // Disable caching for real-time sports data
  });

  if (!response.ok) {
    console.error(`API Fetch Error [${response.status}] for ${url}`);
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return response.json();
}

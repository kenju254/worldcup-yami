import { fetchSecureApi } from './api';
import { GoogleAuth } from 'google-auth-library';

// Mock google-auth-library
const mockFetchIdToken = jest.fn().mockResolvedValue('mocked-oidc-token');
const mockGetIdTokenClient = jest.fn().mockResolvedValue({
  idTokenProvider: {
    fetchIdToken: mockFetchIdToken,
  },
});

jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => {
      return {
        getIdTokenClient: mockGetIdTokenClient,
      };
    }),
  };
});

describe('fetchSecureApi utility', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock global fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'mocked-response' }),
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.fetch = originalFetch;
  });

  it('should use localhost URL in development and not fetch OIDC token', async () => {
    process.env.NODE_ENV = 'development';

    const result = await fetchSecureApi('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:5001/worldcup26-ioextended/us-central1/api/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
    );
    expect(result).toEqual({ data: 'mocked-response' });
    expect(GoogleAuth).not.toHaveBeenCalled();
  });

  it('should use target audience URL in production and attach OIDC Bearer token', async () => {
    // Force production environment
    process.env.NODE_ENV = 'production';

    const result = await fetchSecureApi('/test-endpoint');

    expect(mockGetIdTokenClient).toHaveBeenCalledWith('https://api-jwiz3cw7wq-uc.a.run.app');
    expect(mockFetchIdToken).toHaveBeenCalledWith('https://api-jwiz3cw7wq-uc.a.run.app');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api-jwiz3cw7wq-uc.a.run.app/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mocked-oidc-token',
        },
        cache: 'no-store',
      })
    );
    expect(result).toEqual({ data: 'mocked-response' });
  });

  it('should throw an error when API fetch is not ok', async () => {
    process.env.NODE_ENV = 'development';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(fetchSecureApi('/test-endpoint')).rejects.toThrow('Failed to fetch /test-endpoint');
  });
});

/**
 * @jest-environment node
 */

import { GET } from './route';
import { NextRequest } from 'next/server';
import { fetchSecureApi } from '@/utils/api';

// Mock the secure fetch utility
jest.mock('@/utils/api', () => ({
  fetchSecureApi: jest.fn(),
}));

const mockFetchSecureApi = fetchSecureApi as jest.MockedFunction<typeof fetchSecureApi>;

describe('Team API Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully fetches and proxies team data from the backend', async () => {
    const mockData = { updates: [{ id: 401, opponent: 'Mexico', status: 'Won' }] };
    mockFetchSecureApi.mockResolvedValue(mockData);

    const request = new NextRequest('http://localhost:3000/api/team/USA');
    const params = Promise.resolve({ id: 'USA' });

    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockData);
    expect(mockFetchSecureApi).toHaveBeenCalledWith('/team/USA');
  });

  it('returns 500 error when the secure API fetch throws an exception', async () => {
    mockFetchSecureApi.mockRejectedValue(new Error('Backend offline'));

    const request = new NextRequest('http://localhost:3000/api/team/Canada');
    const params = Promise.resolve({ id: 'Canada' });

    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ error: 'Failed to fetch team data' });
    expect(mockFetchSecureApi).toHaveBeenCalledWith('/team/Canada');
  });
});

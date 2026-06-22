import { render, screen } from '@testing-library/react';
import { DailySchedule } from './DailySchedule';
import { fetchSecureApi } from '@/utils/api';

// Mock the API utility
jest.mock('@/utils/api', () => ({
  fetchSecureApi: jest.fn(),
}));

const mockFetchSecureApi = fetchSecureApi as jest.MockedFunction<typeof fetchSecureApi>;

describe('DailySchedule component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders schedule list successfully when API returns data', async () => {
    const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    mockFetchSecureApi.mockResolvedValue({
      matches: [
        {
          id: 101,
          home: 'Argentina',
          away: 'Germany',
          time: futureTime,
          group: 'Group A',
          status: 'NS',
        },
      ],
    });

    const element = await DailySchedule();
    render(element);

    expect(screen.getByText("Today's Games")).toBeInTheDocument();
    expect(screen.getByText('Argentina vs Germany')).toBeInTheDocument();
    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Live Soon')).toBeInTheDocument();
  });

  it('renders fallback data when API returns empty array', async () => {
    mockFetchSecureApi.mockResolvedValue({ matches: [] });

    const element = await DailySchedule();
    render(element);

    // Fallback data home vs away
    expect(screen.getByText('USA vs England')).toBeInTheDocument();
    expect(screen.getByText('Brazil vs France')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    mockFetchSecureApi.mockRejectedValue(new Error('Network error'));

    const element = await DailySchedule();
    render(element);

    expect(screen.getByText("Could not load today's schedule.")).toBeInTheDocument();
  });
});

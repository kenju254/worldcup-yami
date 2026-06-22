import { render, screen } from '@testing-library/react';
import { MatchResults } from './MatchResults';
import { fetchSecureApi } from '@/utils/api';

jest.mock('@/utils/api', () => ({
  fetchSecureApi: jest.fn(),
}));

const mockFetchSecureApi = fetchSecureApi as jest.MockedFunction<typeof fetchSecureApi>;

describe('MatchResults component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders results successfully when API returns data', async () => {
    mockFetchSecureApi.mockResolvedValue({
      results: [
        {
          id: 201,
          home: 'France',
          away: 'Belgium',
          homeScore: 3,
          awayScore: 0,
          group: 'Group D',
        },
      ],
    });

    const element = await MatchResults();
    render(element);

    expect(screen.getByText("Yesterday's Results")).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Belgium')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Group D')).toBeInTheDocument();
  });

  it('renders fallback data when API returns empty array', async () => {
    mockFetchSecureApi.mockResolvedValue({ results: [] });

    const element = await MatchResults();
    render(element);

    // Fallbacks
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
    expect(screen.getByText('Spain')).toBeInTheDocument();
    expect(screen.getByText('Italy')).toBeInTheDocument();
  });

  it('renders error message when API call fails', async () => {
    mockFetchSecureApi.mockRejectedValue(new Error('API failure'));

    const element = await MatchResults();
    render(element);

    expect(screen.getByText("Could not load yesterday's results.")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, act } from '@testing-library/react';
import { TeamFollower } from './TeamFollower';

describe('TeamFollower component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders form to follow a team if none followed', () => {
    render(<TeamFollower />);
    expect(screen.getByPlaceholderText('Enter a team to follow (e.g., USA)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
  });

  it('submits follow request and renders API response data', async () => {
    const mockUpdates = [
      { id: 301, opponent: 'France', date: 'Tomorrow, 5 PM', status: 'Upcoming' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ updates: mockUpdates }),
    });

    render(<TeamFollower />);

    const input = screen.getByPlaceholderText('Enter a team to follow (e.g., USA)');
    fireEvent.change(input, { target: { value: 'Argentina' } });

    const form = screen.getByRole('button', { name: 'Follow' }).closest('form');
    
    await act(async () => {
      fireEvent.submit(form!);
    });

    // Wait for the final rendered state
    await screen.findByText('Argentina');
    await screen.findByText('vs France');
    await screen.findByText('Tomorrow, 5 PM • Upcoming');

    expect(localStorage.getItem('followedTeam')).toBe('Argentina');
  });

  it('automatically fetches and renders team data on mount if team exists in localStorage', async () => {
    localStorage.setItem('followedTeam', 'Brazil');

    const mockUpdates = [
      { id: 302, opponent: 'Spain', date: 'Yesterday', status: 'Won 1-0' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ updates: mockUpdates }),
    });

    render(<TeamFollower />);

    await screen.findByText('Brazil');
    await screen.findByText('vs Spain');
    await screen.findByText('Yesterday • Won 1-0');
  });

  it('handles API error by showing fallback data', async () => {
    localStorage.setItem('followedTeam', 'Canada');
    global.fetch = jest.fn().mockRejectedValue(new Error('API failed'));

    render(<TeamFollower />);

    await screen.findByText('Canada');
    await screen.findByText('vs Canada'); // fallback opponent
  });

  it('unfollows a team when unfollow button is clicked', async () => {
    localStorage.setItem('followedTeam', 'Brazil');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ updates: [] }),
    });

    render(<TeamFollower />);

    await screen.findByText('Brazil');

    const unfollowBtn = screen.getByRole('button', { name: 'Unfollow' });
    
    await act(async () => {
      fireEvent.click(unfollowBtn);
    });

    expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a team to follow (e.g., USA)')).toBeInTheDocument();
    expect(localStorage.getItem('followedTeam')).toBeNull();
  });
});

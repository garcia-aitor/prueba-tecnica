import { render, screen } from '@testing-library/react';
import { App } from './App';

jest.mock('./store/podcastsApi', () => {
  const actual = jest.requireActual('./store/podcastsApi') as typeof import('./store/podcastsApi');

  return {
    ...actual,
    useGetTopPodcastsQuery: () => ({
      data: [],
      isLoading: false,
      isError: false,
      error: undefined,
    }),
  };
});

describe('App', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /podcaster/i })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Podcast } from '../types/podcast';
import { PodcastCard } from './PodcastCard';

const podcast: Podcast = {
  id: '123',
  title: 'All Songs Considered',
  author: 'NPR',
  image: 'https://example.com/cover.jpg',
};

describe('PodcastCard', () => {
  it('renders title, author and links to the podcast detail', () => {
    render(
      <MemoryRouter>
        <PodcastCard podcast={podcast} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /all songs considered/i })).toBeInTheDocument();
    expect(screen.getByText(/author: npr/i)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/podcast/123');
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PodcastSidebar } from './PodcastSidebar';

describe('PodcastSidebar', () => {
  it('renders podcast info and description', () => {
    render(
      <MemoryRouter>
        <PodcastSidebar
          podcastId="123"
          title="Song Exploder"
          author="Song Exploder"
          image="https://example.com/cover.jpg"
          description="A podcast where musicians take apart their songs."
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /song exploder/i })).toBeInTheDocument();
    expect(screen.getByText(/description:/i)).toBeInTheDocument();
    expect(screen.getByText(/take apart their songs/i)).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/podcast/123');
    });
  });

  it('hides the description block when description is empty', () => {
    render(
      <MemoryRouter>
        <PodcastSidebar
          podcastId="123"
          title="Chris DeMakes A Podcast"
          author="Chris DeMakes"
          image="https://example.com/cover.jpg"
          description=""
        />
      </MemoryRouter>,
    );

    expect(screen.queryByText(/description:/i)).not.toBeInTheDocument();
  });
});

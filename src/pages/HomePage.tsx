import { Link } from 'react-router-dom';
import { usePodcastSearch } from '../hooks/usePodcastSearch';
import { useGetTopPodcastsQuery } from '../store/podcastsApi';

export function HomePage() {
  const { data, isLoading, isError, error } = useGetTopPodcastsQuery();
  const { query, setQuery, filteredPodcasts, filteredCount, totalCount } = usePodcastSearch(data);

  if (isLoading) {
    return <p>Cargando podcasts...</p>;
  }

  if (isError) {
    console.error(error);
    return null;
  }

  return (
    <section>
      <h2>Top podcasts</h2>
      <p>
        {filteredCount} / {totalCount}
      </p>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter by title or author"
        aria-label="Filter podcasts"
      />
      <ul>
        {filteredPodcasts.map((podcast) => (
          <li key={podcast.id}>
            <Link to={`/podcast/${podcast.id}`}>
              {podcast.title} — {podcast.author}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

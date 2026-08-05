import { useGetTopPodcastsQuery } from '../store/podcastsApi';
import { usePodcastSearch } from '../hooks/usePodcastSearch';

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
            {podcast.title} — {podcast.author}
          </li>
        ))}
      </ul>
    </section>
  );
}

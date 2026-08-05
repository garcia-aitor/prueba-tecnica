import { useGetTopPodcastsQuery } from '../store/podcastsApi';

export function HomePage() {
  const { data, isLoading, isError, error } = useGetTopPodcastsQuery();

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
      <ul>
        {data?.map((podcast) => (
          <li key={podcast.id}>
            {podcast.title} — {podcast.author}
          </li>
        ))}
      </ul>
    </section>
  );
}

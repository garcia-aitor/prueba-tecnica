import { useParams } from 'react-router-dom';
import { useGetPodcastByIdQuery } from '../store/podcastsApi';

export function PodcastDetailPage() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const { data, isLoading, isError, error } = useGetPodcastByIdQuery(podcastId!, {
    skip: !podcastId,
  });

  if (!podcastId) {
    return <p>Podcast no encontrado</p>;
  }

  if (isLoading) {
    return <p>Cargando podcast...</p>;
  }

  if (isError) {
    console.error(error);
    return <p>Error al cargar el podcast</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <section>
      <img src={data.image} alt={data.title} width={200} />
      <h2>{data.title}</h2>
      <p>{data.author}</p>
      <p>{data.description || '(sin descripción en lookup)'}</p>
      <h3>Episodes ({data.episodes.length})</h3>
      <ul>
        {data.episodes.map((episode) => (
          <li key={episode.id}>
            {episode.title} — {episode.releaseDate} — {episode.durationMs} ms
          </li>
        ))}
      </ul>
    </section>
  );
}

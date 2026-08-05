import { useParams } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import {
  podcastsApi,
  useGetPodcastByIdQuery,
  useGetPodcastDescriptionQuery,
} from '../store/podcastsApi';
import { store } from '../store/store';

export async function podcastDetailLoader({ params }: LoaderFunctionArgs) {
  const podcastId = params.podcastId;

  if (!podcastId) {
    throw new Response('Podcast not found', { status: 404 });
  }

  const podcastRequest = store.dispatch(podcastsApi.endpoints.getPodcastById.initiate(podcastId));

  try {
    const detail = await podcastRequest.unwrap();

    if (!detail.feedUrl) {
      return null;
    }

    const descriptionRequest = store.dispatch(
      podcastsApi.endpoints.getPodcastDescription.initiate(detail.feedUrl),
    );

    try {
      await descriptionRequest.unwrap();
    } catch (error) {
      console.error('Descripción no encontrada', error);
    } finally {
      descriptionRequest.unsubscribe();
    }

    return null;
  } finally {
    podcastRequest.unsubscribe();
  }
}

export function PodcastDetailPage() {
  const { podcastId } = useParams<{ podcastId: string }>();
  const { data, isLoading, isError, error } = useGetPodcastByIdQuery(podcastId!, {
    skip: !podcastId,
  });
  const {
    data: description,
    isLoading: isDescriptionLoading,
    isError: isDescriptionError,
  } = useGetPodcastDescriptionQuery(data?.feedUrl ?? '', {
    skip: !data?.feedUrl,
  });

  const isWaitingForDescription =
    Boolean(data?.feedUrl) && isDescriptionLoading && !isDescriptionError;

  if (!podcastId) {
    return <p>Podcast no encontrado</p>;
  }

  if (isLoading || isWaitingForDescription) {
    return null;
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
      <p>{description || ''}</p>
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

import { useParams } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { PodcastSidebar } from '../components/PodcastSidebar';
import {
  podcastsApi,
  useGetPodcastByIdQuery,
  useGetPodcastDescriptionQuery,
} from '../store/podcastsApi';
import { store } from '../store/store';

export async function episodeDetailLoader({ params }: LoaderFunctionArgs) {
  const podcastId = params.podcastId;
  const episodeId = params.episodeId;

  if (!podcastId || !episodeId) {
    throw new Response('Episode not found', { status: 404 });
  }

  const podcastRequest = store.dispatch(podcastsApi.endpoints.getPodcastById.initiate(podcastId));

  try {
    const detail = await podcastRequest.unwrap();
    const episode = detail.episodes.find((item) => item.id === episodeId);

    if (!episode) {
      throw new Response('Episode not found', { status: 404 });
    }

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

export function EpisodeDetailPage() {
  const { podcastId, episodeId } = useParams<{ podcastId: string; episodeId: string }>();
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

  if (!podcastId || !episodeId) {
    return <p>Episodio no encontrado</p>;
  }

  if (isLoading || isWaitingForDescription) {
    return null;
  }

  if (isError) {
    console.error(error);
    return <p>Error al cargar el episodio</p>;
  }

  if (!data) {
    return null;
  }

  const episode = data.episodes.find((item) => item.id === episodeId);

  if (!episode) {
    return <p>Episodio no encontrado</p>;
  }

  return (
    <section>
      <PodcastSidebar
        podcastId={data.id}
        title={data.title}
        author={data.author}
        image={data.image}
        description={description || ''}
      />
      <div>
        <h2>{episode.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: episode.description }} />
        {episode.episodeUrl ? (
          <audio controls src={episode.episodeUrl}>
            Tu navegador no soporta el elemento de audio.
          </audio>
        ) : (
          <p>Audio no disponible</p>
        )}      </div>
    </section>
  );
}

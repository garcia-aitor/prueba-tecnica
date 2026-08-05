import { useParams } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import styled from 'styled-components';
import { PodcastSidebar } from '../components/PodcastSidebar';
import {
  podcastsApi,
  useGetPodcastByIdQuery,
  useGetPodcastFeedQuery,
} from '../store/podcastsApi';
import { store } from '../store/store';

const Layout = styled.section`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.5rem;

  @media (max-width: 48rem) {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`;

const EpisodePanel = styled.article`
  padding: 1.25rem 1.5rem 1.5rem;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
`;

const EpisodeTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: #222;
`;

const EpisodeDescription = styled.div`
  margin-bottom: 1.5rem;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.55;

  p {
    margin: 0 0 0.85rem;
  }

  a {
    color: #1a8fb5;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Player = styled.audio`
  display: block;
  width: 100%;
`;

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
      podcastsApi.endpoints.getPodcastFeed.initiate(detail.feedUrl),
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
    data: feed,
    isLoading: isFeedLoading,
    isError: isFeedError,
  } = useGetPodcastFeedQuery(data?.feedUrl ?? '', {
    skip: !data?.feedUrl,
  });

  const isWaitingForFeed = Boolean(data?.feedUrl) && isFeedLoading && !isFeedError;

  if (!podcastId || !episodeId) {
    return <p>Episodio no encontrado</p>;
  }

  if (isLoading || isWaitingForFeed) {
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

  const episodeDescription =
    feed?.episodeDescriptions[episode.title] || episode.description;

  return (
    <Layout>
      <PodcastSidebar
        podcastId={data.id}
        title={data.title}
        author={data.author}
        image={data.image}
        description={feed?.description || ''}
      />
      <Content>
        <EpisodePanel>
          <EpisodeTitle>{episode.title}</EpisodeTitle>
          <EpisodeDescription dangerouslySetInnerHTML={{ __html: episodeDescription }} />
          {episode.episodeUrl ? (
            <Player controls src={episode.episodeUrl}>
              Tu navegador no soporta el elemento de audio.
            </Player>
          ) : (
            <p>Audio no disponible</p>
          )}
        </EpisodePanel>
      </Content>
    </Layout>
  );
}

import { Link, useParams } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import styled from 'styled-components';
import { PodcastSidebar } from '../components/PodcastSidebar';
import { formatEpisodeDate, formatEpisodeDuration } from '../hooks/formatEpisode';
import { podcastsApi, useGetPodcastByIdQuery, useGetPodcastFeedQuery } from '../store/podcastsApi';
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

const EpisodesPanel = styled.div`
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const EpisodesHeader = styled.h2`
  margin: 0;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  background: #f3f3f3;
  border-bottom: 1px solid #e6e6e6;
`;

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 28rem;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  color: #333;
  font-weight: 700;
  text-align: left;
  border-bottom: 1px solid #e6e6e6;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  vertical-align: top;

  &:nth-child(2),
  &:nth-child(3) {
    white-space: nowrap;
  }
`;

const EpisodeLink = styled(Link)`
  color: #1a8fb5;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

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
      podcastsApi.endpoints.getPodcastFeed.initiate(detail.feedUrl),
    );

    try {
      await descriptionRequest.unwrap();
    } catch (error) {
      console.error('Descripción no encontrada', error);
    } finally {
      descriptionRequest.unsubscribe();
    }
  } catch (error) {
    console.error('Podcast no cargado', error);
  } finally {
    podcastRequest.unsubscribe();
  }

  return null;
}

export function PodcastDetailPage() {
  const { podcastId } = useParams<{ podcastId: string }>();
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

  if (!podcastId) {
    return <p>Podcast no encontrado</p>;
  }

  if (isLoading || isWaitingForFeed) {
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
    <Layout>
      <PodcastSidebar
        podcastId={data.id}
        title={data.title}
        author={data.author}
        image={data.image}
        description={feed?.description || ''}
      />
      <Content>
        <EpisodesPanel>
          <EpisodesHeader>Episodes: {data.episodes.length}</EpisodesHeader>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Date</Th>
                  <Th>Duration</Th>
                </tr>
              </thead>
              <tbody>
                {data.episodes.map((episode) => (
                  <tr key={episode.id}>
                    <Td>
                      <EpisodeLink to={`/podcast/${data.id}/episode/${episode.id}`}>
                        {episode.title}
                      </EpisodeLink>
                    </Td>
                    <Td>{formatEpisodeDate(episode.releaseDate)}</Td>
                    <Td>{formatEpisodeDuration(episode.durationMs)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </EpisodesPanel>
      </Content>
    </Layout>
  );
}

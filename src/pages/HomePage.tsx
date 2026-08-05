import styled from 'styled-components';
import { PodcastCard } from '../components/PodcastCard';
import { usePodcastSearch } from '../hooks/usePodcastSearch';
import { useGetTopPodcastsQuery } from '../store/podcastsApi';

const Page = styled.section`
  padding: 1.5rem;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
`;

const CountBadge = styled.span`
  min-width: 2.5rem;
  padding: 0.35rem 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  background: #1a8fb5;
  border-radius: 0.75rem;
`;

const FilterInput = styled.input`
  width: min(100%, 16rem);
  padding: 0.55rem 0.75rem;
  font-size: 0.95rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.25rem;

  &:focus {
    outline: 2px solid #1a8fb5;
    outline-offset: 1px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: 2.75rem 1.75rem;
  align-items: start;
`;

export function HomePage() {
  const { data, isLoading, isError, error } = useGetTopPodcastsQuery();
  const { query, setQuery, filteredPodcasts, filteredCount } = usePodcastSearch(data);

  if (isLoading) {
    return <Page>Cargando podcasts...</Page>;
  }

  if (isError) {
    console.error(error);
    return null;
  }

  return (
    <Page>
      <Toolbar>
        <CountBadge>{filteredCount}</CountBadge>
        <FilterInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter podcasts..."
          aria-label="Filter podcasts"
        />
      </Toolbar>
      <Grid>
        {filteredPodcasts.map((podcast) => (
          <PodcastCard key={podcast.id} podcast={podcast} />
        ))}
      </Grid>
    </Page>
  );
}

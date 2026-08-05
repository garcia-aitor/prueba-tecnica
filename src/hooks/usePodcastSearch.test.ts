import { act, renderHook } from '@testing-library/react';
import type { Podcast } from '../types/podcast';
import { usePodcastSearch } from './usePodcastSearch';

const podcasts: Podcast[] = [
  {
    id: '1',
    title: 'The Joe Budden Podcast',
    author: 'Joe Budden Network',
    image: '',
  },
  {
    id: '2',
    title: 'Música en Español',
    author: 'José García',
    image: '',
  },
];

describe('usePodcastSearch', () => {
  it('returns all podcasts when query is empty', () => {
    const { result } = renderHook(() => usePodcastSearch(podcasts));

    expect(result.current.filteredPodcasts).toHaveLength(2);
    expect(result.current.filteredCount).toBe(2);
  });

  it('filters by title without caring about case', () => {
    const { result } = renderHook(() => usePodcastSearch(podcasts));

    act(() => {
      result.current.setQuery('joe budden');
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]?.id).toBe('1');
  });

  it('filters by author ignoring diacritics', () => {
    const { result } = renderHook(() => usePodcastSearch(podcasts));

    act(() => {
      result.current.setQuery('jose garcia');
    });

    expect(result.current.filteredPodcasts).toHaveLength(1);
    expect(result.current.filteredPodcasts[0]?.id).toBe('2');
  });

  it('returns an empty list when nothing matches', () => {
    const { result } = renderHook(() => usePodcastSearch(podcasts));

    act(() => {
      result.current.setQuery('no existe');
    });

    expect(result.current.filteredPodcasts).toHaveLength(0);
  });
});

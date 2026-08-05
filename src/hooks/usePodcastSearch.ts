import { useMemo, useState } from 'react';
import type { Podcast } from '../types/podcast';
import { normalizeText } from './normalizeText';

type SearchablePodcast = Podcast & {
  titleNorm: string;
  authorNorm: string;
};

// Filtrado reactivo sobre el listado; la normalización se calcula una vez por dataset
export function usePodcastSearch(podcasts: Podcast[] | undefined) {
  const [query, setQuery] = useState('');

  const searchablePodcasts = useMemo<SearchablePodcast[]>(() => {
    if (!podcasts) {
      return [];
    }

    return podcasts.map((podcast) => ({
      ...podcast,
      titleNorm: normalizeText(podcast.title),
      authorNorm: normalizeText(podcast.author),
    }));
  }, [podcasts]);

  const filteredPodcasts = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    if (!normalizedQuery) {
      return searchablePodcasts;
    }

    return searchablePodcasts.filter(
      (podcast) =>
        podcast.titleNorm.includes(normalizedQuery) || podcast.authorNorm.includes(normalizedQuery),
    );
  }, [query, searchablePodcasts]);

  return {
    query,
    setQuery,
    filteredPodcasts,
    totalCount: searchablePodcasts.length,
    filteredCount: filteredPodcasts.length,
  };
}

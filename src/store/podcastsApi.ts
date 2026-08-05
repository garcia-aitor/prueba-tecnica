import { createApi } from '@reduxjs/toolkit/query/react';
import type { Episode, Podcast, PodcastDetail } from '../types/podcast';
import { baseQueryWithCache } from './baseQueryWithCache';

const TOP_PODCASTS_URL = 'https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json';

function podcastLookupUrl(podcastId: string) {
  return `https://itunes.apple.com/lookup?id=${podcastId}&media=podcast&entity=podcastEpisode&limit=20`;
}

type Label = { label: string };

type ItunesTopPodcast = {
  id: { attributes: { 'im:id': string } };
  'im:name': Label;
  'im:artist': Label;
  'im:image': Label[];
};

type ItunesTopPodcastsResponse = {
  feed: { entry: ItunesTopPodcast[] };
};

type ItunesLookupPodcast = {
  wrapperType: string;
  kind?: string;
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
};

type ItunesLookupEpisode = {
  wrapperType: string;
  kind?: string;
  trackId: number;
  trackName: string;
  description?: string;
  releaseDate: string;
  trackTimeMillis?: number;
  episodeUrl?: string;
};

type ItunesLookupResponse = {
  results: Array<ItunesLookupPodcast | ItunesLookupEpisode>;
};

// Pasamos del JSON raro de iTunes a nuestro modelo limpio (id, title, author, image)
function mapTopPodcastEntry(entry: ItunesTopPodcast): Podcast {
  const images = entry['im:image'] ?? [];

  return {
    id: entry.id.attributes['im:id'],
    title: entry['im:name'].label,
    author: entry['im:artist'].label,
    image: images[images.length - 1]?.label ?? '',
  };
}

function isPodcastResult(
  result: ItunesLookupPodcast | ItunesLookupEpisode,
): result is ItunesLookupPodcast {
  return result.kind === 'podcast';
}

function isEpisodeResult(
  result: ItunesLookupPodcast | ItunesLookupEpisode,
): result is ItunesLookupEpisode {
  return result.kind === 'podcast-episode';
}

// Del episodio de iTunes a nuestro modelo limpio
function mapEpisode(result: ItunesLookupEpisode): Episode {
  return {
    id: String(result.trackId),
    title: result.trackName,
    description: result.description ?? '',
    releaseDate: result.releaseDate,
    durationMs: result.trackTimeMillis ?? 0,
    episodeUrl: result.episodeUrl ?? '',
  };
}

export function mapTopPodcasts(response: ItunesTopPodcastsResponse): Podcast[] {
  return response.feed.entry.map(mapTopPodcastEntry);
}

// El lookup mezcla el podcast y los episodios en results; aquí los separamos
// La descripción del podcast no viene en esta API (hay que ir al RSS)
export function mapPodcastLookup(response: ItunesLookupResponse): PodcastDetail {
  const podcastResult = response.results.find(isPodcastResult);

  if (!podcastResult) {
    throw new Error('Podcast not found in lookup response');
  }

  return {
    id: String(podcastResult.collectionId),
    title: podcastResult.collectionName,
    author: podcastResult.artistName,
    image: podcastResult.artworkUrl600 ?? podcastResult.artworkUrl100 ?? '',
    description: '',
    episodes: response.results.filter(isEpisodeResult).map(mapEpisode),
  };
}

export const podcastsApi = createApi({
  reducerPath: 'podcastsApi',
  baseQuery: baseQueryWithCache,
  endpoints: (build) => ({
    getTopPodcasts: build.query<Podcast[], void>({
      query: () => TOP_PODCASTS_URL,
      transformResponse: mapTopPodcasts,
    }),
    getPodcastById: build.query<PodcastDetail, string>({
      query: podcastLookupUrl,
      transformResponse: mapPodcastLookup,
    }),
  }),
});

export const { useGetTopPodcastsQuery, useGetPodcastByIdQuery } = podcastsApi;

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
  feedUrl?: string;
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
    feedUrl: podcastResult.feedUrl ?? '',
    description: '',
    episodes: response.results.filter(isEpisodeResult).map(mapEpisode),
  };
}

// Sacamos la descripción del canal RSS
export function parsePodcastFeedDescription(xml: string): string {
  const document = new DOMParser().parseFromString(xml.trim(), 'text/xml');
  const channel = document.querySelector('channel');

  if (!channel) {
    return '';
  }

  const itunesSummary = channel.getElementsByTagNameNS(
    'http://www.itunes.com/dtds/podcast-1.0.dtd',
    'summary',
  )[0]?.textContent;

  const rawDescription = itunesSummary ?? channel.querySelector('description')?.textContent ?? '';

  return (
    new DOMParser().parseFromString(rawDescription, 'text/html').body.textContent?.trim() ?? ''
  );
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
    getPodcastDescription: build.query<string, string>({
      query: (feedUrl) => ({
        url: feedUrl,
        responseHandler: 'text' as const,
      }),
      transformResponse: parsePodcastFeedDescription,
    }),
  }),
});

export const { useGetTopPodcastsQuery, useGetPodcastByIdQuery, useGetPodcastDescriptionQuery } =
  podcastsApi;

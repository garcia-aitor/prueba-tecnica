import { createApi } from '@reduxjs/toolkit/query/react';
import type { Podcast } from '../types/podcast';
import { baseQueryWithCache } from './baseQueryWithCache';

const TOP_PODCASTS_URL = 'https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json';

type Label = { label: string };

type ItunesPodcast = {
  id: { attributes: { 'im:id': string } };
  'im:name': Label;
  'im:artist': Label;
  'im:image': Label[];
};

// Pasamos del JSON de iTunes a nuestro modelo limpio (id, title, author, image)
function mapEntry(entry: ItunesPodcast): Podcast {
  const images = entry['im:image'] ?? [];

  return {
    id: entry.id.attributes['im:id'],
    title: entry['im:name'].label,
    author: entry['im:artist'].label,
    image: images[images.length - 1]?.label ?? '',
  };
}

export const podcastsApi = createApi({
  reducerPath: 'podcastsApi',
  baseQuery: baseQueryWithCache,
  endpoints: (build) => ({
    getTopPodcasts: build.query<Podcast[], void>({
      query: () => TOP_PODCASTS_URL,
      transformResponse: (response: { feed: { entry: ItunesPodcast[] } }) =>
        response.feed.entry.map(mapEntry),
    }),
  }),
});

export const { useGetTopPodcastsQuery } = podcastsApi;

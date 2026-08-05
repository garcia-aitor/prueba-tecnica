import { mapPodcastLookup, mapTopPodcasts } from './podcastsApi';

describe('mapTopPodcasts', () => {
  it('maps the top podcasts feed into podcasts', () => {
    const podcasts = mapTopPodcasts({
      feed: {
        entry: [
          {
            id: { attributes: { 'im:id': '123' } },
            'im:name': { label: 'All Songs Considered' },
            'im:artist': { label: 'NPR' },
            'im:image': [
              { label: 'https://example.com/small.jpg' },
              { label: 'https://example.com/large.jpg' },
            ],
          },
        ],
      },
    });

    expect(podcasts).toEqual([
      {
        id: '123',
        title: 'All Songs Considered',
        author: 'NPR',
        image: 'https://example.com/large.jpg',
      },
    ]);
  });
});

describe('mapPodcastLookup', () => {
  it('maps podcast metadata and episodes from the lookup response', () => {
    const detail = mapPodcastLookup({
      results: [
        {
          wrapperType: 'track',
          kind: 'podcast',
          collectionId: 1535809341,
          collectionName: 'The Joe Budden Podcast',
          artistName: 'The Joe Budden Network',
          artworkUrl600: 'https://example.com/cover.jpg',
        },
        {
          wrapperType: 'podcastEpisode',
          kind: 'podcast-episode',
          trackId: 1000780026927,
          trackName: 'Episode 952',
          description: 'Episode description',
          releaseDate: '2026-08-05T09:00:00Z',
          trackTimeMillis: 9693000,
          episodeUrl: 'https://example.com/ep.mp3',
        },
      ],
    });

    expect(detail).toEqual({
      id: '1535809341',
      title: 'The Joe Budden Podcast',
      author: 'The Joe Budden Network',
      image: 'https://example.com/cover.jpg',
      description: '',
      episodes: [
        {
          id: '1000780026927',
          title: 'Episode 952',
          description: 'Episode description',
          releaseDate: '2026-08-05T09:00:00Z',
          durationMs: 9693000,
          episodeUrl: 'https://example.com/ep.mp3',
        },
      ],
    });
  });
});

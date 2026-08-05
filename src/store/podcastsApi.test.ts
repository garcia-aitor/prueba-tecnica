import { mapPodcastLookup, mapTopPodcasts, parsePodcastFeedDescription } from './podcastsApi';

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
          feedUrl: 'https://example.com/feed.xml',
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
      feedUrl: 'https://example.com/feed.xml',
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

describe('parsePodcastFeedDescription', () => {
  it('reads itunes:summary from the channel when present', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
        <channel>
          <title>Switched on Pop</title>
          <description>Fallback description</description>
          <itunes:summary>A podcast about the making and meaning of pop music.</itunes:summary>
        </channel>
      </rss>`;

    expect(parsePodcastFeedDescription(xml)).toBe(
      'A podcast about the making and meaning of pop music.',
    );
  });

  it('falls back to channel description and strips HTML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test</title>
          <description><![CDATA[<p>Hello <strong>world</strong></p>]]></description>
        </channel>
      </rss>`;

    expect(parsePodcastFeedDescription(xml)).toBe('Hello world');
  });
});

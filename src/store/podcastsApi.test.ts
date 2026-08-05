import { mapPodcastLookup, mapTopPodcasts, parsePodcastFeed, proxiedFeedUrl } from './podcastsApi';

describe('proxiedFeedUrl', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
  });

  it('returns the feed url unchanged outside production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });

    expect(proxiedFeedUrl('https://example.com/feed.xml')).toBe('https://example.com/feed.xml');
  });

  it('wraps the feed url with allorigins in production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });

    expect(proxiedFeedUrl('https://example.com/feed.xml')).toBe(
      `https://api.allorigins.win/raw?url=${encodeURIComponent('https://example.com/feed.xml')}`,
    );
  });
});

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

describe('parsePodcastFeed', () => {
  it('reads channel description and episode HTML by title', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
           xmlns:content="http://purl.org/rss/1.0/modules/content/"
           version="2.0">
        <channel>
          <title>Song Exploder</title>
          <itunes:summary>A podcast where musicians take apart their songs.</itunes:summary>
          <item>
            <title>Wilco - Magnetized</title>
            <content:encoded><![CDATA[<p>Sponsored by <a href="https://example.com">Vinyl Me Please</a>.</p>]]></content:encoded>
          </item>
        </channel>
      </rss>`;

    expect(parsePodcastFeed(xml)).toEqual({
      description: 'A podcast where musicians take apart their songs.',
      episodeDescriptions: {
        'Wilco - Magnetized':
          '<p>Sponsored by <a href="https://example.com">Vinyl Me Please</a>.</p>',
      },
    });
  });

  it('falls back to item description when content:encoded is missing', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test</title>
          <description><![CDATA[<p>Channel</p>]]></description>
          <item>
            <title>Episode One</title>
            <description><![CDATA[<p>Hello <strong>world</strong></p>]]></description>
          </item>
        </channel>
      </rss>`;

    const feed = parsePodcastFeed(xml);

    expect(feed.description).toBe('Channel');
    expect(feed.episodeDescriptions['Episode One']).toBe('<p>Hello <strong>world</strong></p>');
  });
});

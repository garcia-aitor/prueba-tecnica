import { formatEpisodeDate, formatEpisodeDuration } from './formatEpisode';

describe('formatEpisodeDate', () => {
  it('formats an ISO date as D/M/YYYY', () => {
    expect(formatEpisodeDate('2016-03-01T12:00:00Z')).toBe('1/3/2016');
  });
});

describe('formatEpisodeDuration', () => {
  it('formats milliseconds as M:SS', () => {
    expect(formatEpisodeDuration(14 * 60 * 1000)).toBe('14:00');
  });

  it('formats long episodes with hours', () => {
    expect(formatEpisodeDuration(90 * 60 * 1000 + 5 * 1000)).toBe('1:30:05');
  });
});

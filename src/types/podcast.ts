export type Podcast = {
  id: string;
  title: string;
  author: string;
  image: string;
};

export type Episode = {
  id: string;
  title: string;
  description: string;
  releaseDate: string;
  durationMs: number;
  episodeUrl: string;
};

export type PodcastDetail = {
  id: string;
  title: string;
  author: string;
  image: string;
  feedUrl: string;
  description: string;
  episodes: Episode[];
};

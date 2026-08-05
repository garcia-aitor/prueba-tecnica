import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { Podcast } from '../types/podcast';

type PodcastCardProps = {
  podcast: Podcast;
};

const COVER_SIZE = '6.5rem';

const CardLink = styled(Link)`
  --cover-size: ${COVER_SIZE};
  display: block;
  color: inherit;
  text-decoration: none;
  padding-top: calc(var(--cover-size) / 2);
`;

const Card = styled.article`
  position: relative;
  padding: calc(var(--cover-size) / 2 + 0.75rem) 1.25rem 1rem;
  text-align: center;
  background: #fff;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.12);
`;

const CoverFrame = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: var(--cover-size);
  height: var(--cover-size);
  overflow: hidden;
  background: #e6e6e6;
  border-radius: 50%;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.15);
  transform: translate(-50%, -50%);
`;

const Cover = styled.img<{ $loaded: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const Title = styled.h3`
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.35;
  text-transform: uppercase;
`;

const Author = styled.p`
  margin: 0;
  color: #888;
  font-size: 0.8rem;
  line-height: 1.35;
`;

function PodcastCover({ src, alt }: { src: string; alt: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);

    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <CoverFrame>
      <Cover
        ref={imageRef}
        src={src}
        alt={alt}
        $loaded={loaded}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </CoverFrame>
  );
}

export function PodcastCard({ podcast }: PodcastCardProps) {
  return (
    <CardLink to={`/podcast/${podcast.id}`}>
      <Card>
        <PodcastCover src={podcast.image} alt={podcast.title} />
        <Title>{podcast.title}</Title>
        <Author>Author: {podcast.author}</Author>
      </Card>
    </CardLink>
  );
}

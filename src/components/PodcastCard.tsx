import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CoverImage } from './CoverImage';
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

const CoverWrap = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: var(--cover-size);
  height: var(--cover-size);
  transform: translate(-50%, -50%);

  & > div {
    width: 100%;
    height: 100%;
  }
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

export function PodcastCard({ podcast }: PodcastCardProps) {
  return (
    <CardLink to={`/podcast/${podcast.id}`}>
      <Card>
        <CoverWrap>
          <CoverImage src={podcast.image} alt={podcast.title} $rounded />
        </CoverWrap>
        <Title>{podcast.title}</Title>
        <Author>Author: {podcast.author}</Author>
      </Card>
    </CardLink>
  );
}

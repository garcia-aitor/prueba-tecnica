import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CoverImage } from './CoverImage';

type PodcastSidebarProps = {
  podcastId: string;
  title: string;
  author: string;
  image: string;
  description: string;
};

const Aside = styled.aside`
  width: min(100%, 18rem);
  flex-shrink: 0;

  @media (max-width: 48rem) {
    width: 100%;
  }
`;

const Card = styled.article`
  padding: 1rem;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 0.25rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
`;

const CoverLink = styled(Link)`
  display: block;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 1rem;

  & > div {
    width: 100%;
    height: 100%;
  }
`;

const Title = styled.h2`
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Author = styled.p`
  margin: 0 0 1rem;
  color: #555;
  font-size: 0.9rem;
  font-style: italic;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const DescriptionLabel = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0;
  color: #444;
  font-size: 0.9rem;
  font-style: italic;
  line-height: 1.45;
`;

export function PodcastSidebar({
  podcastId,
  title,
  author,
  image,
  description,
}: PodcastSidebarProps) {
  const podcastPath = `/podcast/${podcastId}`;

  return (
    <Aside>
      <Card>
        <CoverLink to={podcastPath}>
          <CoverImage src={image} alt={title} />
        </CoverLink>
        <Title>
          <Link to={podcastPath}>{title}</Link>
        </Title>
        <Author>
          by <Link to={podcastPath}>{author}</Link>
        </Author>
        {description ? (
          <>
            <DescriptionLabel>Description:</DescriptionLabel>
            <Description>{description}</Description>
          </>
        ) : null}
      </Card>
    </Aside>
  );
}

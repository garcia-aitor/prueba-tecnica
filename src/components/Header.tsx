import { Link, useNavigation } from 'react-router-dom';
import styled from 'styled-components';
import { Spinner } from './Spinner';

const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e5e5;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export function Header() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';

  return (
    <HeaderBar>
      <Title>
        <Link to="/">Podcaster</Link>
      </Title>
      {isNavigating ? <Spinner /> : null}
    </HeaderBar>
  );
}

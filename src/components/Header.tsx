import { Link, useNavigation } from 'react-router-dom';
import styled from 'styled-components';
import { Spinner } from './Spinner';

const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;

  a {
    color: #1a8fb5;
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

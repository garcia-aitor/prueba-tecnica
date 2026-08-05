import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div.attrs({
  role: 'status',
  'aria-label': 'Loading',
})`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #cfe8f0;
  border-top-color: #1a8fb5;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;
